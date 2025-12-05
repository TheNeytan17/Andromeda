<?php

use Firebase\JWT\JWT;

class AssignmentModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		//Consulta sql: incluir datos legibles del ticket y del técnico
		$vSql = "SELECT 
					 a.Id,
					 a.Id_Ticket,
					 t.Titulo,
					 a.Id_Tecnico,
					 u.Nombre AS Tecnico,
					 a.Metodo_Asignacion,
					 a.Prioridad,
					 a.Fecha_Asignacion
				FROM Asignacion a
				JOIN Ticket t ON t.Id = a.Id_Ticket
				INNER JOIN Usuario u ON u.Id = a.Id_Tecnico;";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}
	public function get($id)
	{
		$TicketM = new TicketModel();
		$CategoryM = new CategoryModel();
		//Consulta sql
		$vSql = "SELECT * FROM Asignacion where Id_Tecnico=$id";
		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if (is_array($vResultado) && count($vResultado) > 0) {
			foreach ($vResultado as $asignacion) {
				//Categoria
				$ticket = $TicketM->get($asignacion->Id_Ticket);
				$Categoria = $CategoryM->getByCategory($ticket->Id_Categoria);
				$asignacion->Categoria = $Categoria[0]->Nombre ? $Categoria[0]->Nombre : null;

				//Estado
				$Estado = $TicketM->getEstado($ticket->Estado);
				$asignacion->Estado = $Estado[0]->Nombre ? $Estado[0]->Nombre : null;

				//Tiempo Limite
				$asignacion->TiempoLimite = $ticket->Fecha_Limite_Resolucion ? $ticket->Fecha_Limite_Resolucion : null;
			}
			return $vResultado;
		} else {
			return null;
		}
	}

	public function getById($id)
	{
		$TicketM = new TicketModel();
		$CategoryM = new CategoryModel();
		$vSql = "SELECT * FROM Asignacion WHERE Id=$id LIMIT 1";
		$rows = $this->enlace->ExecuteSQL($vSql);
		if (is_array($rows) && count($rows) > 0) {
			$asignacion = $rows[0];
			$ticket = $TicketM->get($asignacion->Id_Ticket);
			if ($ticket) {
				$Categoria = $CategoryM->getByCategory($ticket->Id_Categoria);
				$asignacion->Categoria = isset($Categoria[0]->Nombre) ? $Categoria[0]->Nombre : null;
				$Estado = $TicketM->getEstado($ticket->Estado);
				$asignacion->Estado = isset($Estado[0]->Nombre) ? $Estado[0]->Nombre : null;
				$asignacion->TiempoLimite = $ticket->Fecha_Limite_Resolucion ?: null;
			}
			return $asignacion;
		}
		return null;
	}

	public function createAssignment($data)
	{
		if (($data['Id_Ticket'])) {
			//Historial Estado
			if (!empty($data['Id_Usuario_Responsable'])) {
				$vHistorial = "INSERT Into Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) 
							VALUES ({$data['Id_Ticket']}, '{$data['Fecha_Cambio']}', '{$data['Estado_Anterior']}' , '{$data['Estado_Nuevo']}', '{$data['Observaciones']}', '{$data['Id_Usuario_Responsable']}');";
			} else {
				$vHistorial = "INSERT Into Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones) 
				VALUES ({$data['Id_Ticket']}, '{$data['Fecha_Cambio']}', '{$data['Estado_Anterior']}' , '{$data['Estado_Nuevo']}', '{$data['Observaciones']}');";
			}

			$idHistorialEstado = $this->enlace->ExecuteSQL_DML_last($vHistorial);
			$this->updateStateTicket($data['Id_Ticket'], $data);

			if (!empty($data['Puntaje'])) {
				$vTickerSQL = "UPDATE Ticket SET 
				Puntaje = $data[Puntaje]
				WHERE Id = '{$data['Id_Ticket']}';";
				$this->enlace->ExecuteSQL_DML($vTickerSQL);
			}
			//Asiganación
			if (!empty($data['Id_ReglaAutobriage'])) {
				$vAsignacionSQL = "INSERT Into Asignacion (Id_Ticket, Id_Tecnico, Id_ReglaAutobriage ,  Metodo_Asignacion, Prioridad, Fecha_Asignacion) 
							VALUES ({$data['Id_Ticket']}, '{$data['Id_Tecnico']}', '{$data['Id_ReglaAutobriage']}' , '{$data['Metodo_Asignacion']}', '{$data['Prioridad']}', '{$data['Fecha_Cambio']}');";
			} else {
				$vAsignacionSQL = "INSERT Into Asignacion (Id_Ticket, Id_Tecnico ,  Metodo_Asignacion, Prioridad, Fecha_Asignacion) 
							VALUES ({$data['Id_Ticket']}, '{$data['Id_Tecnico']}', '{$data['Metodo_Asignacion']}', '{$data['Prioridad']}', '{$data['Fecha_Cambio']}');";
			}
			$this->enlace->ExecuteSQL_DML($vAsignacionSQL);
			
			// Crear notificaciones usando NotificationModel
			$notificationModel = new NotificationModel();
			
			// Obtener título del ticket
			$vSqlTicket = "SELECT Titulo FROM Ticket WHERE Id = '{$data['Id_Ticket']}';";
			$ticket = $this->enlace->ExecuteSQL($vSqlTicket);
			$titulo = $ticket ? $ticket[0]->Titulo : "Ticket #{$data['Id_Ticket']}";
			
			// Notificación al técnico asignado
			$notificationModel->createTicketAssignmentNotification(
				$data['Id_Ticket'], 
				$data['Id_Tecnico'], 
				$titulo
			);
			
			// Notificación al usuario creador del ticket
			$mensaje = "Su ticket #{$data['Id_Ticket']}: $titulo ha sido asignado a un técnico";
			$notificationModel->create([
				'Id_Usuario_Destino' => $data['Id_Usuario_Ticket'],
				'Tipo_Notificacion' => 3, // Nueva observación/actualización
				'Mensaje' => $mensaje
			]);

			//Subir Carga Trabajo al Técnico
			$UserModel = "Update Usuario SET CargaTrabajo = CargaTrabajo + 1 WHERE Id = '{$data['Id_Tecnico']}';";
			$this->enlace->ExecuteSQL_DML($UserModel);
			
			return ['success' => true, 'message' => 'Usuario creado exitosamente', 'id' => $idHistorialEstado];
		} else {
			return ['success' => false, 'message' => 'Error al crear el usuario'];
		}
	}

	public function updateStateTicket($id, $data)
	{
		//Actualizar Ticket
		$vTicketSQL = "UPDATE Ticket SET 
						Estado = '{$data['Estado_Nuevo']}' 
						WHERE Id = '$id';";

		$result = $this->enlace->ExecuteSQL_DML($vTicketSQL);

		if ($result) {
			return ['success' => true, 'message' => 'Usuario actualizado exitosamente'];
		} else {
			return ['success' => false, 'message' => 'Error al actualizar el usuario'];
		}
	}
}
