<?php

class Valoracion {
    
    /**
     * GET /valoracion - Obtener todas las valoraciones
     */
    public function index() {
        $response = new Response();
        $valoracionModel = new ValoracionModel();
        $result = $valoracionModel->getAll([]);
        $response->toJSON($result);
    }

    /**
     * GET /valoracion/{id} - Obtener valoración por ticket
     */
    public function get($id) {
        $response = new Response();
        $valoracionModel = new ValoracionModel();
        $result = $valoracionModel->get($id);
        $response->toJSON($result);
    }

    /**
     * POST /valoracion - Crear nueva valoración
     */
    public function create() {
        $response = new Response();
        $request = new Request();
        
        try {
            $data = (array) $request->getJSON();

            // Validar datos requeridos
            if (!isset($data['Id_Ticket']) || !isset($data['Id_Usuario']) || !isset($data['Puntaje'])) {
                $response->status(400);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Faltan datos requeridos: Id_Ticket, Id_Usuario y Puntaje'
                ]);
                return;
            }

            $idTicket = intval($data['Id_Ticket']);
            $idUsuario = intval($data['Id_Usuario']);
            $puntaje = intval($data['Puntaje']);
            $comentario = isset($data['Comentario']) ? trim($data['Comentario']) : null;

            // Validar rango de puntaje (1-5)
            if ($puntaje < 1 || $puntaje > 5) {
                $response->status(400);
                $response->toJSON([
                    'success' => false,
                    'message' => 'El puntaje debe estar entre 1 y 5'
                ]);
                return;
            }

            // Validar longitud del comentario
            if ($comentario && strlen($comentario) > 250) {
                $response->status(400);
                $response->toJSON([
                    'success' => false,
                    'message' => 'El comentario no puede exceder 250 caracteres'
                ]);
                return;
            }

            // Verificar que el usuario que valora es un cliente (Rol = 3)
            $userModel = new UserModel();
            $usuario = $userModel->get($idUsuario);
            
            if (!$usuario) {
                $response->status(404);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ]);
                return;
            }

            $rolUsuario = is_array($usuario) ? intval($usuario[0]->Rol) : intval($usuario->Rol);
            
            if ($rolUsuario !== 3) {
                $response->status(403);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Solo los clientes pueden valorar tickets'
                ]);
                return;
            }

            // Verificar que el ticket existe y está cerrado
            $ticketModel = new TicketModel();
            $ticket = $ticketModel->get($idTicket);
            
            if (!$ticket || empty($ticket)) {
                $response->status(404);
                $response->toJSON([
                    'success' => false,
                    'message' => 'El ticket no existe'
                ]);
                return;
            }

            // Obtener el estado del ticket
            $ticketData = is_array($ticket) ? $ticket[0] : $ticket;
            // El campo puede ser Id_Estado o Estado según la consulta
            $estadoTicket = isset($ticketData->Id_Estado) ? intval($ticketData->Id_Estado) : 
                           (isset($ticketData->Estado) ? intval($ticketData->Estado) : 0);
            $idUsuarioTicket = isset($ticketData->Id_Usuario) ? intval($ticketData->Id_Usuario) : 0;
            
            if ($estadoTicket !== 5) {
                $response->status(403);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Solo se pueden valorar tickets cerrados (Estado actual: ' . $estadoTicket . ')'
                ]);
                return;
            }

            // Verificar que el usuario que valora es el dueño del ticket
            if ($idUsuarioTicket !== $idUsuario) {
                $response->status(403);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Solo el cliente dueño del ticket puede valorarlo'
                ]);
                return;
            }

            // Verificar que no existe valoración previa
            $valoracionModel = new ValoracionModel();
            $valoracionExistente = $valoracionModel->get($idTicket);
            
            if (!empty($valoracionExistente)) {
                $response->status(409);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Este ticket ya ha sido valorado'
                ]);
                return;
            }

            // Crear la valoración
            $valoracionData = [
                'Id_Ticket' => $idTicket,
                'Id_Usuario' => $idUsuario,
                'Puntaje' => $puntaje,
                'Comentario' => $comentario
            ];

            $result = $valoracionModel->create($valoracionData);

            if ($result) {
                $response->toJSON([
                    'success' => true,
                    'message' => 'Valoración creada exitosamente',
                    'data' => $result
                ]);
            } else {
                $response->status(500);
                $response->toJSON([
                    'success' => false,
                    'message' => 'Error al crear la valoración'
                ]);
            }

        } catch (Exception $e) {
            $response->status(500);
            $response->toJSON([
                'success' => false,
                'message' => 'Error del servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * GET /valoracion/exists/{id} - Verificar si existe valoración
     */
    public function exists($id) {
        $response = new Response();
        $valoracionModel = new ValoracionModel();
        $exists = $valoracionModel->existsForTicket($id);
        $response->toJSON([
            'success' => true,
            'data' => ['exists' => $exists]
        ]);
    }

    /**
     * GET /valoracion/average/{id} - Promedio por técnico
     */
    public function average($id) {
        $response = new Response();
        $valoracionModel = new ValoracionModel();
        $average = $valoracionModel->getAverageByTechnician($id);
        $response->toJSON([
            'success' => true,
            'data' => $average
        ]);
    }
}
