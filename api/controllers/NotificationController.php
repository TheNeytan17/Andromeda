<?php
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Notification
{
    private function getUserIdFromToken()
    {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;

        if (!$authHeader) {
            error_log("NotificationController: No Authorization header found");
            return null;
        }

        $token = str_replace('Bearer ', '', $authHeader);
        
        try {
            $secretKey = Config::get('SECRET_KEY');
            $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
            $userId = $decoded->data->id;
            error_log("NotificationController: User ID from token: " . $userId);
            return $userId;
        } catch (Exception $e) {
            error_log("NotificationController: Token decode error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * GET /notification - Obtener todas las notificaciones del usuario autenticado
     */
    public function index()
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->getByUser($userId);
        
        // Asegurar que siempre devuelve un array
        if (!$result || !is_array($result)) {
            $result = [];
        }
        
        $response->toJSON($result);
    }

    /**
     * GET /notification/unread - Obtener notificaciones no leídas
     */
    public function unread()
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->getUnreadByUser($userId);
        $response->toJSON($result);
    }

    /**
     * GET /notification/count - Contar notificaciones no leídas
     */
    public function count()
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $count = $notificationModel->countUnreadByUser($userId);
        $response->toJSON(['count' => $count]);
    }

    /**
     * GET /notification/{id} - Obtener una notificación específica
     */
    public function get($id)
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->get($id);

        if ($result && $result->Id_Usuario_Destino == $userId) {
            $response->toJSON($result);
        } else {
            $response->status(404);
            $response->toJSON([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ]);
        }
    }

    /**
     * PUT /notification/read/{id} - Marcar notificación como leída
     */
    public function read($id)
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->markAsRead($id, $userId);

        if ($result['success']) {
            $response->toJSON($result);
        } else {
            $response->status(400);
            $response->toJSON($result);
        }
    }

    /**
     * PUT /notification/readall - Marcar todas como leídas
     */
    public function readall()
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->markAllAsRead($userId);

        if ($result['success']) {
            $response->toJSON($result);
        } else {
            $response->status(400);
            $response->toJSON($result);
        }
    }

    /**
     * DELETE /notification/{id} - Eliminar una notificación
     */
    public function delete($id)
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado'
            ]);
            return;
        }

        $notificationModel = new NotificationModel();
        $result = $notificationModel->delete($id, $userId);

        if ($result['success']) {
            $response->toJSON($result);
        } else {
            $response->status(400);
            $response->toJSON($result);
        }
    }

    /**
     * POST /notification - Crear notificación (solo para pruebas/admin)
     */
    public function create()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        $notificationModel = new NotificationModel();
        $result = $notificationModel->create($data);

        if ($result['success']) {
            $response->status(201);
        } else {
            $response->status(400);
        }
        $response->toJSON($result);
    }

    /**
     * GET /notification/debug - Ver qué usuario está autenticado (para debugging)
     */
    public function debug()
    {
        $response = new Response();
        $userId = $this->getUserIdFromToken();

        if (!$userId) {
            $response->status(401);
            $response->toJSON([
                'success' => false,
                'message' => 'No autorizado - Token inválido o no proporcionado'
            ]);
            return;
        }

        // Obtener información del usuario desde la BD
        $enlace = new MySqlConnect();
        $vSql = "SELECT Id, Nombre, Correo, Rol FROM Usuario WHERE Id = '$userId' LIMIT 1;";
        $user = $enlace->ExecuteSQL($vSql);

        // Contar notificaciones
        $notificationModel = new NotificationModel();
        $count = $notificationModel->countUnreadByUser($userId);
        $all = $notificationModel->getByUser($userId);

        $response->toJSON([
            'success' => true,
            'userId' => $userId,
            'userInfo' => $user ? $user[0] : null,
            'notificationCount' => $count,
            'totalNotifications' => is_array($all) ? count($all) : 0,
            'notifications' => $all
        ]);
    }
}
