<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    /**
     * Obtener la versión actual de la app
     */
    public function getCurrentVersion()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'version' => '1.2.0', // Actualiza esto cada vez que publiques una nueva versión
                'versionCode' => 3, // Incrementa esto en cada release
                'downloadUrl' => env('FRONTEND_URL', 'https://apps.vanguardfresh.pe/jabas_y_parihuelas') . '/app-release.apk',
                'forceUpdate' => false, // Cambia a true si es una actualización crítica
                'releaseNotes' => [
                    'Versión inicial del sistema',
                    'Control de alquiler de jabas y parihuelas',
                    'Autenticación con Microsoft SSO',
                    'Gestión de registros, clientes, choferes',
                ],
            ],
        ]);
    }
}
