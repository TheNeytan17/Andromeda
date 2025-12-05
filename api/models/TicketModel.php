<?php

use Firebase\JWT\JWT;

class TicketModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		//Consulta sql
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						e.Nombre AS Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id
					INNER JOIN Estado_Ticket e ON t.Estado = e.Id;";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}
	public function get($id)
	{
		$UsuarioM = new UserModel();
		$HistoryM = new HistoryModel();
		$ValoracionM = new ValoracionModel();
		//Consulta sql
		$vSql = "SELECT 
					t.Id,
					t.Id_Usuario,
					t.Titulo,
					t.Descripcion,
					t.Fecha_Creacion,
					t.Fecha_Limite_Respuesta,
					t.Fecha_Limite_Resolucion,
					t.Prioridad,
					e.Nombre AS Estado,
					t.Id_Categoria,
					c.Nombre AS Categoria,
					t.Puntaje,
					t.Fecha_Cierre,
					t.cumplimiento_respuesta,
					t.cumplimiento_resolucion
				FROM Ticket t
				INNER JOIN Categoria c ON t.Id_Categoria = c.Id
				INNER JOIN Estado_Ticket e ON t.Estado = e.Id
				WHERE t.Id = '$id';";;
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if ($vResultado) {
			$Ticket = $vResultado[0];

			$UsuarioSolicitante = $UsuarioM->get($Ticket->Id_Usuario);
			$Ticket->UsuarioSolicitante = $UsuarioSolicitante ? $UsuarioSolicitante : null;

			$HistorialEstados = $HistoryM->get($Ticket->Id);
			$Ticket->HistorialEstados = $HistorialEstados ? $HistorialEstados : null;

			$Valoracion = $ValoracionM->get($Ticket->Id);
			$Ticket->Valoracion = $Valoracion ? $Valoracion : null;

			return $Ticket;
		} else {
			return null;
		}
	}

	public function getTicketAssigment($id)
	{
		$UsuarioM = new UserModel();
		$HistoryM = new HistoryModel();
		$ValoracionM = new ValoracionModel();
		//Consulta sql
		$vSql = "SELECT 
					t.Id,
					t.Id_Usuario,
					t.Titulo,
					t.Descripcion,
					t.Fecha_Creacion,
					t.Fecha_Limite_Respuesta,
					t.Fecha_Limite_Resolucion,
					t.Prioridad,
					t.Estado,
					t.Id_Categoria,
					t.Id_Categoria,
					t.Fecha_Cierre,
					t.cumplimiento_respuesta,
					t.cumplimiento_resolucion
				FROM Ticket t
				WHERE t.Id = '$id';";;
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if ($vResultado) {
			$Ticket = $vResultado[0];

			$UsuarioSolicitante = $UsuarioM->get($Ticket->Id_Usuario);
			$Ticket->UsuarioSolicitante = $UsuarioSolicitante ? $UsuarioSolicitante : null;

			$HistorialEstados = $HistoryM->get($Ticket->Id);
			$Ticket->HistorialEstados = $HistorialEstados ? $HistorialEstados : null;

			$Valoracion = $ValoracionM->get($Ticket->Id);
			$Ticket->Valoracion = $Valoracion ? $Valoracion : null;

			return $Ticket;
		} else {
			return null;
		}
	}

	public function getEstado($id)
	{
		//Consulta sql
		$vSql = "SELECT * FROM Estado_Ticket e Where Id = '$id';";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}

	public function technician($id)
	{
		//Consulta sql
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						e.Nombre AS Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id
					INNER JOIN Estado_Ticket e ON t.Estado = e.Id
					INNER JOIN Asignacion a ON a.Id_Tecnico = '$id'
					WHERE t.Id = a.Id_Ticket;";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}

	public function client($id)
	{
		//Consulta sql
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						e.Nombre AS Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id
					INNER JOIN Estado_Ticket e ON t.Estado = e.Id
					WHERE t.Id_Usuario = '$id';";;

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}

	public function create($data)
	{
		//Insertar Ticket
		$vTicketSQL = "INSERT INTO Ticket (Id_Usuario, Titulo, Descripcion, Fecha_Creacion, Fecha_Limite_Respuesta, Fecha_Limite_Resolucion, Prioridad, Estado, Id_Categoria) 
						VALUES ('{$data['Id_Usuario']}', '{$data['Titulo']}', '{$data['Descripcion']}', '{$data['Fecha_Creacion']}', '{$data['Fecha_Limite_Respuesta']}', '{$data['Fecha_Limite_Resolucion']}', '{$data['Prioridad']}', 1 , '{$data['Categoria']}')";
		$idTicket = $this->enlace->ExecuteSQL_DML_last($vTicketSQL);
		//Insertar Historial Estado
		if ($idTicket) {
			$vHistorial = "INSERT Into Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) 
							VALUES ($idTicket, '{$data['Fecha_Creacion']}', 1 , 1, 'Ticket creado por usuario', '{$data['Id_Usuario']}');";
			$idHistorialEstado = $this->enlace->ExecuteSQL_DML_last($vHistorial);
			if (!empty($data['Archivo']) && isset($data['Archivo']['Archivo'])) {
				$ImageM = new ImageModel();
				$fileData = [
					'file' => $data['Archivo']['Archivo']
				];
				$ImageM->uploadFile($fileData, $idHistorialEstado);
			}
			return ['success' => true, 'message' => 'Usuario creado exitosamente', 'id' => $idTicket];
		} else {
			return ['success' => false, 'message' => 'Error al crear el usuario'];
		}
	}

	public function createHistory($data)
	{
		if (($data['Id_Ticket'])) {
			$vHistorial = "INSERT Into Historial_Estado (Id_Ticket, Fecha_Cambio, Estado_Anterior, Estado_Nuevo, Observaciones, Id_Usuario_Responsable) 
							VALUES ({$data['Id_Ticket']}, '{$data['Fecha_Cambio']}', '{$data['Estado_Anterior']}' , '{$data['Estado_Nuevo']}', '{$data['Observaciones']}', '{$data['Id_Usuario_Responsable']}');";
			$idHistorialEstado = $this->enlace->ExecuteSQL_DML_last($vHistorial);
			if (!empty($data['Archivo']) && isset($data['Archivo']['Archivo'])) {
				$ImageM = new ImageModel();
				$fileData = [
					'file' => $data['Archivo']['Archivo']
				];
				$ImageM->uploadFile($fileData, $idHistorialEstado);
			}

			$this->updateStateTicket($data['Id_Ticket'], $data);

			// Crear notificación de cambio de estado
			$this->createStateChangeNotification($data['Id_Ticket'], $data['Estado_Anterior'], $data['Estado_Nuevo'], $data['Observaciones']);

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

	private function createStateChangeNotification($ticketId, $estadoAnteriorId, $estadoNuevoId, $observaciones)
	{
		// Obtener el ticket para conseguir el usuario creador
		$vSqlTicket = "SELECT Id_Usuario, Titulo FROM Ticket WHERE Id = '$ticketId';";
		$ticket = $this->enlace->ExecuteSQL($vSqlTicket);

		if (!$ticket) {
			return;
		}

		$userId = $ticket[0]->Id_Usuario;
		$titulo = $ticket[0]->Titulo;

		// Obtener nombres de los estados
		$vSqlEstados = "SELECT Id, Nombre FROM Estado_Ticket WHERE Id IN ('$estadoAnteriorId', '$estadoNuevoId');";
		$estados = $this->enlace->ExecuteSQL($vSqlEstados);

		$estadoAnterior = '';
		$estadoNuevo = '';

		if ($estados && is_array($estados)) {
			foreach ($estados as $estado) {
				if ($estado->Id == $estadoAnteriorId) {
					$estadoAnterior = $estado->Nombre;
				}
				if ($estado->Id == $estadoNuevoId) {
					$estadoNuevo = $estado->Nombre;
				}
			}
		}

		// Crear notificación para el creador del ticket
		$notificationModel = new NotificationModel();
		$notificationModel->createTicketStateChangeNotification($ticketId, $userId, $estadoAnterior, $estadoNuevo);

		// Si hay observaciones, crear notificación adicional
		if (!empty($observaciones) && $observaciones != 'Ticket creado por usuario') {
			$notificationModel->createTicketObservationNotification($ticketId, $userId, $observaciones);
		}

		// Obtener técnico asignado si existe
		$vSqlTecnico = "SELECT Id_Tecnico FROM Asignacion WHERE Id_Ticket = '$ticketId' ORDER BY Fecha_Asignacion DESC LIMIT 1;";
		$asignacion = $this->enlace->ExecuteSQL($vSqlTecnico);

		if ($asignacion && $asignacion[0]->Id_Tecnico != $userId) {
			// Notificar al técnico también
			$notificationModel->createTicketStateChangeNotification($ticketId, $asignacion[0]->Id_Tecnico, $estadoAnterior, $estadoNuevo);
		}
	}
}
