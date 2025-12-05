<?php
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Auth
{
    /**
     * POST /auth/login - Iniciar sesión
     */
    public function login()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        // Validar campos requeridos
        if (empty($data['Correo']) || empty($data['Password'])) {
            $response->status(400);
            $response->toJSON([
                'success' => false,
                'message' => 'Correo y contraseña son requeridos'
            ]);
            return;
        }

        try {
            $userModel = new UserModel();
            $enlace = new MySqlConnect();

            // Buscar usuario por correo
            $vSql = "SELECT Id, Nombre, Correo, PasswordHash, Rol, Estado 
                     FROM Usuario 
                     WHERE Correo = '{$data['Correo']}' 
                     LIMIT 1;";
            
            $result = $enlace->ExecuteSQL($vSql);

            if (!$result || count($result) === 0) {
                $response->status(401);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ]);
                return;
            }

            $user = $result[0];

            // Verificar si el usuario está activo
            if ($user->Estado == 0) {
                $response->status(403);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Usuario desactivado'
                ]);
                return;
            }

            // Verificar contraseña
            if (!password_verify($data['Password'], $user->PasswordHash)) {
                $response->status(401);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ]);
                return;
            }

            // Actualizar última sesión
            $now = date('Y-m-d H:i:s');
            $vSqlUpdate = "UPDATE Usuario SET Ultima_Sesion = '$now' WHERE Id = '{$user->Id}';";
            $enlace->ExecuteSQL_DML($vSqlUpdate);

            // Obtener nombre del rol
            $vSqlRol = "SELECT Nombre FROM Rol WHERE Id = '{$user->Rol}' LIMIT 1;";
            $rolResult = $enlace->ExecuteSQL($vSqlRol);
            $rolNombre = $rolResult ? $rolResult[0]->Nombre : 'Usuario';

            // Crear token JWT
            $secretKey = Config::get('SECRET_KEY');
            $issuedAt = time();
            $expirationTime = $issuedAt + (60 * 60 * 24); // 24 horas

            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'data' => [
                    'id' => $user->Id,
                    'nombre' => $user->Nombre,
                    'correo' => $user->Correo,
                    'rol' => $user->Rol,
                    'rolNombre' => $rolNombre
                ]
            ];

            $token = JWT::encode($payload, $secretKey, 'HS256');

            // Crear notificación de inicio de sesión
            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $notificationModel = new NotificationModel();
            $notificationModel->createLoginNotification($user->Id, $ip);

            // Respuesta exitosa
            $response->toJSON([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'token' => $token,
                'user' => [
                    'id' => $user->Id,
                    'nombre' => $user->Nombre,
                    'correo' => $user->Correo,
                    'rol' => $user->Rol,
                    'rolNombre' => $rolNombre
                ]
            ]);

        } catch (Exception $e) {
            $response->status(500);
            $response->toJSON([
                'success' => false,
                'message' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * POST /auth/register - Registrar nuevo usuario
     */
    public function register()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        // Validar campos requeridos
        if (empty($data['Nombre']) || empty($data['Correo']) || empty($data['Password'])) {
            $response->status(400);
            $response->toJSON([
                'success' => false,
                'message' => 'Nombre, correo y contraseña son requeridos'
            ]);
            return;
        }

        try {
            $enlace = new MySqlConnect();

            // Verificar si el correo ya existe
            $vSqlCheck = "SELECT Id FROM Usuario WHERE Correo = '{$data['Correo']}' LIMIT 1;";
            $existing = $enlace->ExecuteSQL($vSqlCheck);

            if ($existing && count($existing) > 0) {
                $response->status(409);
                $response->toJSON([
                    'success' => false,
                    'message' => 'El correo ya está registrado'
                ]);
                return;
            }

            // Hashear contraseña
            $passwordHash = password_hash($data['Password'], PASSWORD_DEFAULT);
            $rol = isset($data['Rol']) ? $data['Rol'] : 3; // Por defecto Cliente
            $estado = 1; // Activo

            // Insertar usuario
            $vSql = "INSERT INTO Usuario (Nombre, Correo, PasswordHash, Rol, Estado) 
                     VALUES ('{$data['Nombre']}', '{$data['Correo']}', '$passwordHash', '$rol', '$estado');";
            
            $userId = $enlace->ExecuteSQL_DML_last($vSql);

            if ($userId) {
                $response->status(201);
                $response->toJSON([
                    'success' => true,
                    'message' => 'Usuario registrado exitosamente',
                    'userId' => $userId
                ]);
            } else {
                $response->status(500);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Error al registrar el usuario'
                ]);
            }

        } catch (Exception $e) {
            $response->status(500);
            $response->toJSON([
                'success' => false,
                'message' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * GET /auth/verify - Verificar token
     */
    public function verify()
    {
        $response = new Response();
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

        if (!$authHeader) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'Token no proporcionado'
            ]);
            return;
        }

        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $secretKey = Config::get('SECRET_KEY');
            $decoded = JWT::decode($token, new Firebase\JWT\Key($secretKey, 'HS256'));
            
            $response->toJSON([
                'success' => true,
                'message' => 'Token válido',
                'user' => $decoded->data
            ]);

        } catch (Exception $e) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'Token inválido: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * POST /auth/logout - Cerrar sesión
     */
    public function logout()
    {
        $response = new Response();
        $response->toJSON([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }
}
