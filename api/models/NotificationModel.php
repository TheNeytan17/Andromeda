<?php

class NotificationModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener todas las notificaciones de un usuario
     */
    public function getByUser($userId)
    {
        $vSql = "SELECT 
                    n.Id,
                    n.Id_Usuario_Destino,
                    n.Tipo_Notificacion,
                    tn.Nombre AS Tipo,
                    n.Mensaje,
                    n.Fecha_Envio,
                    n.Estado
                FROM Notificacion n
                INNER JOIN Tipo_Notificacion tn ON n.Tipo_Notificacion = tn.Id
                WHERE n.Id_Usuario_Destino = '$userId'
                ORDER BY n.Fecha_Envio DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        // Si ExecuteSQL devuelve null o false, retornar array vacío
        if (!$vResultado) {
            return [];
        }
        
        return $vResultado;
    }

    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public function getUnreadByUser($userId)
    {
        $vSql = "SELECT 
                    n.Id,
                    n.Id_Usuario_Destino,
                    n.Tipo_Notificacion,
                    tn.Nombre AS Tipo,
                    n.Mensaje,
                    n.Fecha_Envio,
                    n.Estado
                FROM Notificacion n
                INNER JOIN Tipo_Notificacion tn ON n.Tipo_Notificacion = tn.Id
                WHERE n.Id_Usuario_Destino = '$userId' AND n.Estado = 0
                ORDER BY n.Fecha_Envio DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /**
     * Contar notificaciones no leídas de un usuario
     */
    public function countUnreadByUser($userId)
    {
        $vSql = "SELECT COUNT(*) as total
                FROM Notificacion
                WHERE Id_Usuario_Destino = '$userId' AND Estado = 0;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ? $vResultado[0]->total : 0;
    }

    /**
     * Obtener una notificación específica
     */
    public function get($id)
    {
        $vSql = "SELECT 
                    n.Id,
                    n.Id_Usuario_Destino,
                    n.Tipo_Notificacion,
                    tn.Nombre AS Tipo,
                    n.Mensaje,
                    n.Fecha_Envio,
                    n.Estado
                FROM Notificacion n
                INNER JOIN Tipo_Notificacion tn ON n.Tipo_Notificacion = tn.Id
                WHERE n.Id = '$id';";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado ? $vResultado[0] : null;
    }

    /**
     * Crear una nueva notificación
     */
    public function create($data)
    {
        try {
            $userId = $data['Id_Usuario_Destino'];
            $tipo = $data['Tipo_Notificacion'];
            $mensaje = $data['Mensaje'];
            $estado = isset($data['Estado']) ? $data['Estado'] : 0; // 0 = no leída

            $vSql = "INSERT INTO Notificacion (Id_Usuario_Destino, Tipo_Notificacion, Mensaje, Estado)
                     VALUES ('$userId', '$tipo', '$mensaje', '$estado');";

            $lastId = $this->enlace->ExecuteSQL_DML_last($vSql);

            if ($lastId) {
                return [
                    'success' => true,
                    'message' => 'Notificación creada exitosamente',
                    'id' => $lastId
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al crear la notificación'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Marcar una notificación como leída
     */
    public function markAsRead($id, $userId)
    {
        try {
            // Verificar que la notificación pertenece al usuario
            $vSqlCheck = "SELECT Id_Usuario_Destino FROM Notificacion WHERE Id = '$id';";
            $notification = $this->enlace->ExecuteSQL($vSqlCheck);

            if (!$notification || $notification[0]->Id_Usuario_Destino != $userId) {
                return [
                    'success' => false,
                    'message' => 'No tienes permiso para marcar esta notificación'
                ];
            }

            $vSql = "UPDATE Notificacion SET Estado = 1 WHERE Id = '$id';";
            $result = $this->enlace->ExecuteSQL_DML($vSql);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Notificación marcada como leída'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al actualizar la notificación'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    public function markAllAsRead($userId)
    {
        try {
            $vSql = "UPDATE Notificacion SET Estado = 1 
                     WHERE Id_Usuario_Destino = '$userId' AND Estado = 0;";
            
            $result = $this->enlace->ExecuteSQL_DML($vSql);

            if ($result !== false) {
                return [
                    'success' => true,
                    'message' => 'Todas las notificaciones marcadas como leídas'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al actualizar las notificaciones'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Eliminar una notificación
     */
    public function delete($id, $userId)
    {
        try {
            // Verificar que la notificación pertenece al usuario
            $vSqlCheck = "SELECT Id_Usuario_Destino FROM Notificacion WHERE Id = '$id';";
            $notification = $this->enlace->ExecuteSQL($vSqlCheck);

            if (!$notification || $notification[0]->Id_Usuario_Destino != $userId) {
                return [
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar esta notificación'
                ];
            }

            $vSql = "DELETE FROM Notificacion WHERE Id = '$id';";
            $result = $this->enlace->ExecuteSQL_DML($vSql);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Notificación eliminada'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al eliminar la notificación'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Crear notificación de cambio de estado de ticket
     */
    public function createTicketStateChangeNotification($ticketId, $userId, $estadoAnterior, $estadoNuevo)
    {
        $mensaje = "Tu ticket #$ticketId ha cambiado de estado: $estadoAnterior → $estadoNuevo";
        
        return $this->create([
            'Id_Usuario_Destino' => $userId,
            'Tipo_Notificacion' => 2, // Cambio de estado
            'Mensaje' => $mensaje
        ]);
    }

    /**
     * Crear notificación de asignación de ticket
     */
    public function createTicketAssignmentNotification($ticketId, $tecnicoId, $titulo)
    {
        $mensaje = "Se te ha asignado el ticket #$ticketId: $titulo";
        
        return $this->create([
            'Id_Usuario_Destino' => $tecnicoId,
            'Tipo_Notificacion' => 1, // Asignación de ticket
            'Mensaje' => $mensaje
        ]);
    }

    /**
     * Crear notificación de nueva observación
     */
    public function createTicketObservationNotification($ticketId, $userId, $observacion)
    {
        $mensajeCorto = strlen($observacion) > 50 ? substr($observacion, 0, 50) . '...' : $observacion;
        $mensaje = "Nueva observación en ticket #$ticketId: $mensajeCorto";
        
        return $this->create([
            'Id_Usuario_Destino' => $userId,
            'Tipo_Notificacion' => 3, // Nueva observación
            'Mensaje' => $mensaje
        ]);
    }

    /**
     * Crear notificación de inicio de sesión
     */
    public function createLoginNotification($userId, $ip = null)
    {
        $fecha = date('d/m/Y');
        $hora = date('H:i:s');
        $ipInfo = $ip ? " desde la IP $ip" : "";
        $mensaje = "Inicio de sesión exitoso el $fecha a las $hora$ipInfo";
        
        return $this->create([
            'Id_Usuario_Destino' => $userId,
            'Tipo_Notificacion' => 4, // Inicio de sesión
            'Mensaje' => $mensaje
        ]);
    }
}
