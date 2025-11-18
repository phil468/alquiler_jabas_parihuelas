<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DescripcionJaba;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DescripcionJabaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $descripciones = DescripcionJaba::orderBy('created_at', 'desc')->get();

        try {
            $descripciones = DescripcionJaba::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $descripciones,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener descripciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get only active descriptions.
     */
    public function activas()
    {
        try {
            $descripciones = DescripcionJaba::where('activo', true)
                ->orderBy('codigo', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $descripciones,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener descripciones activas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:20|unique:descripciones_jabas,codigo',
            'descripcion' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'material' => 'nullable|string|max:50',
            'capacidad' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $descripcion = DescripcionJaba::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $descripcion,
                'message' => 'Descripción creada exitosamente',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear descripción: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $descripcion = DescripcionJaba::find($id);

            if (!$descripcion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Descripción no encontrada',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $descripcion,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener descripción: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:20|unique:descripciones_jabas,codigo,' . $id,
            'descripcion' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'material' => 'nullable|string|max:50',
            'capacidad' => 'nullable|numeric|min:0',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $descripcion = DescripcionJaba::find($id);

            if (!$descripcion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Descripción no encontrada',
                ], 404);
            }

            $descripcion->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $descripcion,
                'message' => 'Descripción actualizada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar descripción: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $descripcion = DescripcionJaba::find($id);

            if (!$descripcion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Descripción no encontrada',
                ], 404);
            }

            // Verificar si tiene registros asociados (descripcion_jaba_1 o descripcion_jaba_2)
            $registrosComoJaba1 = $descripcion->registrosComoJaba1()->count();
            $registrosComoJaba2 = $descripcion->registrosComoJaba2()->count();

            if ($registrosComoJaba1 > 0 || $registrosComoJaba2 > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la descripción porque tiene registros asociados',
                ], 409);
            }

            $descripcion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Descripción eliminada exitosamente',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar descripción: ' . $e->getMessage(),
            ], 500);
        }
    }
}
