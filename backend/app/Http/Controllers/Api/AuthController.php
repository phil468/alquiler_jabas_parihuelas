<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Client;

class AuthController extends Controller
{
    /**
     * Get Guzzle client with SSL verification disabled for development
     */
    private function getGuzzleClient()
    {
        return new Client([
            'verify' => false, // Deshabilitar verificación SSL en desarrollo
        ]);
    }

    /**
     * Redirect to Microsoft OAuth
     */
    public function redirectToMicrosoft()
    {
        return Socialite::driver('microsoft')
            ->setHttpClient($this->getGuzzleClient())
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Microsoft OAuth callback
     */
    public function handleMicrosoftCallback(Request $request)
    {
        try {
            $microsoftUser = Socialite::driver('microsoft')
                ->setHttpClient($this->getGuzzleClient())
                ->stateless()
                ->user();

            // Obtener avatar de forma segura (sin hacer llamada HTTP adicional)
            $avatarUrl = null;
            try {
                // Intentar obtener avatar si está disponible en la respuesta
                $avatarUrl = $microsoftUser->avatar ?? null;
            } catch (\Exception $e) {
                // Si falla, usar null - no es crítico
                $avatarUrl = null;
            }

            // Buscar o crear usuario
            $user = User::updateOrCreate(
                ['email' => $microsoftUser->getEmail()],
                [
                    'name' => $microsoftUser->getName(),
                    'email' => $microsoftUser->getEmail(),
                    'microsoft_id' => $microsoftUser->getId(),
                    'avatar' => $avatarUrl,
                    'password' => Hash::make(uniqid()), // Password aleatorio
                ]
            );

            // Crear token de Sanctum
            $token = $user->createToken('auth-token')->plainTextToken;

            // Redirigir al frontend con el token y datos del usuario
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
            $userData = base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ]));

            return redirect()->to(
                "{$frontendUrl}/auth/callback?token={$token}&user={$userData}"
            );

        } catch (\Exception $e) {
            // En caso de error, redirigir al login con mensaje de error
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:8100');
            $errorMessage = urlencode($e->getMessage());
            return redirect()->to(
                "{$frontendUrl}/login?error={$errorMessage}"
            );
        }
    }

    /**
     * Login tradicional (email/password)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar ?? null,
                ],
                'token' => $token,
            ],
            'message' => 'Login exitoso',
        ]);
    }

    /**
     * Register (crear nuevo usuario)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
            ],
            'message' => 'Usuario creado exitosamente',
        ], 201);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar ?? null,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout exitoso',
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        
        // Revocar token actual
        $request->user()->currentAccessToken()->delete();
        
        // Crear nuevo token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
            ],
            'message' => 'Token refrescado',
        ]);
    }
}
