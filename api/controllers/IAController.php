<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class IA
{
    public function CallIA()
    {
        $response = new Response();
        
        // Obtener el mensaje y el historial del cuerpo de la petición
        $data = json_decode(file_get_contents('php://input'), true);
        $message = $data['message'] ?? '';
        $conversationHistory = $data['conversation_history'] ?? [];
        
        if (empty($message)) {
            $response->status(400);
            $response->toJSON([
                'success' => false,
                'message' => 'El mensaje no puede estar vacío'
            ]);
            return;
        }
        
        $iaModel = new IAModel();
        $result = $iaModel->handleUserMessage($message, $conversationHistory);
        
        //Dar respuesta
        $response->toJSON($result);
    }
}
