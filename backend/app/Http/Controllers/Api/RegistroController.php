<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Registro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\RegistrosExport;
use Maatwebsite\Excel\Facades\Excel;

class RegistroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Registro::with([
            'cliente', 
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2',
            'usuario'
        ]);

        // Filtros
        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->fechaEntre($request->fecha_inicio, $request->fecha_fin);
        }

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda general
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_registro', 'like', "%{$search}%")
                  ->orWhere('representante_cliente', 'like', "%{$search}%")
                  ->orWhere('guia_remision', 'like', "%{$search}%");
            });
        }

        $registros = $query->orderBy('fecha', 'desc')
                           ->orderBy('hora', 'desc')
                           ->paginate($request->per_page ?? 15);

        return response()->json($registros);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'representante_cliente' => 'required|string|max:255',
            'chofer_id' => 'required|exists:choferes,id',
            'placa_1_id' => 'nullable|exists:placas,id',
            'cantidad_jabas_1' => 'required|integer|min:0',
            'cantidad_parihuelas' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Generar número de registro automático
            $data['numero_registro'] = Registro::generarNumeroRegistro();
            $data['fecha'] = Carbon::now()->toDateString();
            $data['hora'] = Carbon::now()->toTimeString();
            $data['user_id'] = auth()->id();
            $data['estado'] = 'por_aprobar';

            // Guardar imagen
            if ($request->hasFile('imagen')) {
                $path = $request->file('imagen')->store('registros/imagenes', 'public');
                $data['imagen_path'] = $path;
            }

            $registro = Registro::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Registro creado exitosamente',
                'data' => $registro->load(['cliente', 'chofer', 'placa1', 'placa2'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $registro = Registro::with(['cliente', 'chofer', 'placa1', 'placa2', 'descripcionJaba1', 'descripcionJaba2', 'usuario'])->find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        return response()->json(['success' => true, 'data' => $registro]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        try {
            $data = $request->except(['numero_registro', 'fecha', 'hora', 'user_id']);

            if ($request->hasFile('imagen')) {
                if ($registro->imagen_path) {
                    Storage::disk('public')->delete($registro->imagen_path);
                }
                $data['imagen_path'] = $request->file('imagen')->store('registros/imagenes', 'public');
            }

            $registro->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado',
                'data' => $registro->fresh()->load(['cliente', 'chofer'])
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        if ($registro->imagen_path) {
            Storage::disk('public')->delete($registro->imagen_path);
        }

        $registro->delete();

        return response()->json(['success' => true, 'message' => 'Registro eliminado']);
    }

    /**
     * Cambiar estado del registro
     */
    public function cambiarEstado(Request $request, string $id)
    {
        $registro = Registro::find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $registro->update([
            'estado' => $request->estado,
            'motivo_rechazo' => $request->motivo_rechazo
        ]);

        return response()->json(['success' => true, 'message' => 'Estado actualizado', 'data' => $registro]);
    }

    /**
     * Generar PDF del registro
     */
    public function generarPdf(string $id)
    {
        $registro = Registro::with([
            'cliente', 
            'chofer', 
            'placa1', 
            'placa2', 
            'descripcionJaba1', 
            'descripcionJaba2',
            'usuario'
        ])->find($id);

        if (!$registro) {
            return response()->json(['success' => false, 'message' => 'Registro no encontrado'], 404);
        }

        $data = [
            'registro' => $registro,
            'fecha_generacion' => now()->format('d/m/Y H:i:s')
        ];

        $pdf = Pdf::loadView('pdf.registro', $data);
        $pdf->setPaper('A4', 'portrait');
        
        $nombreArchivo = 'Registro_' . $registro->numero_registro . '_' . date('Ymd_His') . '.pdf';
        
        return $pdf->download($nombreArchivo);
    }

    /**
     * Exportar registros a Excel
     */
    public function exportarExcel(Request $request)
    {
        $filtros = $request->only(['fecha_inicio', 'fecha_fin', 'cliente_id', 'estado']);
        
        $nombreArchivo = 'Registros_' . date('Ymd_His') . '.xlsx';
        
        return Excel::download(new RegistrosExport($filtros), $nombreArchivo);
    }
}
