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

			if (!empty($data['Puntaje'])) {
				$vTickerSQL = "UPDATE Ticket SET 
				Puntaje = $data[Puntaje]
				WHERE Id = '{$data['Id_Ticket']}';";
				$this->enlace->ExecuteSQL_DML($vTickerSQL);
			}
			//Asiganación - INSERTAR PRIMERO antes de updateStateTicket
			if (!empty($data['Id_ReglaAutobriage'])) {
				$vAsignacionSQL = "INSERT Into Asignacion (Id_Ticket, Id_Tecnico, Id_ReglaAutobriage ,  Metodo_Asignacion, Prioridad, Fecha_Asignacion) 
							VALUES ({$data['Id_Ticket']}, '{$data['Id_Tecnico']}', '{$data['Id_ReglaAutobriage']}' , '{$data['Metodo_Asignacion']}', '{$data['Prioridad']}', '{$data['Fecha_Cambio']}');";
			} else {
				$vAsignacionSQL = "INSERT Into Asignacion (Id_Ticket, Id_Tecnico ,  Metodo_Asignacion, Prioridad, Fecha_Asignacion) 
							VALUES ({$data['Id_Ticket']}, '{$data['Id_Tecnico']}', '{$data['Metodo_Asignacion']}', '{$data['Prioridad']}', '{$data['Fecha_Cambio']}');";
			}
			$this->enlace->ExecuteSQL_DML($vAsignacionSQL);
			
			// Actualizar estado del ticket DESPUÉS de crear la asignación
			$this->updateStateTicket($data['Id_Ticket'], $data);
			
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

			//Subir Carga Trabajo al Técnico (+1 cuando se asigna)
			$UserModel = "UPDATE Usuario SET CargaTrabajo = CargaTrabajo + 1 WHERE Id = '{$data['Id_Tecnico']}';";
			$this->enlace->ExecuteSQL_DML($UserModel);
			
			// Log
			file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - ASIGNACIÓN: Técnico {$data['Id_Tecnico']} +1 por Ticket {$data['Id_Ticket']}\n", FILE_APPEND);
			
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

		// Log completo para debugging
		file_put_contents(__DIR__ . '/../Log/updateStateTicket.log', date('Y-m-d H:i:s') . "\nSQL: $vTicketSQL\nResult: " . var_export($result, true) . "\nData: " . var_export($data, true) . "\n\n", FILE_APPEND);

		// Log del estado para ver qué valor llega
		$estadoNuevo = isset($data['Estado_Nuevo']) ? $data['Estado_Nuevo'] : 'NO_DEFINIDO';
		file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: Estado_Nuevo = '$estadoNuevo' (tipo: " . gettype($estadoNuevo) . ") para Ticket $id\n", FILE_APPEND);

		// Verificar si el ticket está siendo cerrado - Verificación más amplia
		$estadoCerrado = false;
		if (isset($data['Estado_Nuevo'])) {
			$estadoStr = strtolower(trim($data['Estado_Nuevo']));
			$estadoNum = intval($data['Estado_Nuevo']);
			
			// Verificar diferentes posibles valores para "cerrado"
			if ($estadoStr === 'cerrado' || $estadoStr === '5' || $estadoNum === 5 || $estadoNum == 5) {
				$estadoCerrado = true;
			}
		}
		
		file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: ¿Está cerrado? " . ($estadoCerrado ? 'SÍ' : 'NO') . "\n", FILE_APPEND);
		
		if ($estadoCerrado) {
			// Obtener el Id_Tecnico de la asignación si no viene en $data
			$idTecnico = null;
			
			if (isset($data['Id_Tecnico']) && !empty($data['Id_Tecnico'])) {
				$idTecnico = $data['Id_Tecnico'];
				file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: Id_Tecnico tomado de data: $idTecnico\n", FILE_APPEND);
			} else {
				// Buscar el técnico asignado al ticket
				$vSqlTecnico = "SELECT Id_Tecnico FROM Asignacion WHERE Id_Ticket = '$id' ORDER BY Fecha_Asignacion DESC LIMIT 1;";
				$resultTecnico = $this->enlace->ExecuteSQL($vSqlTecnico);
				
				file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: Query técnico: $vSqlTecnico\n", FILE_APPEND);
				file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: Resultado query: " . var_export($resultTecnico, true) . "\n", FILE_APPEND);
				
				if (is_array($resultTecnico) && count($resultTecnico) > 0) {
					$idTecnico = $resultTecnico[0]->Id_Tecnico;
					file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - DEBUG: Id_Tecnico encontrado en BD: $idTecnico\n", FILE_APPEND);
				}
			}
			
			// Si encontramos un técnico, reducir su carga de trabajo
			if ($idTecnico) {
				$UserModel = "UPDATE Usuario SET CargaTrabajo = GREATEST(0, CargaTrabajo - 1) WHERE Id = '$idTecnico';";
				$resultUpdate = $this->enlace->ExecuteSQL_DML($UserModel);
				
				// Log CargaTrabajo SQL
				file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - CIERRE: Técnico $idTecnico -1 por Ticket $id (resultado: " . var_export($resultUpdate, true) . ")\n", FILE_APPEND);
				file_put_contents(__DIR__ . '/../Log/updateStateTicket.log', date('Y-m-d H:i:s') . "\nCargaTrabajo SQL: $UserModel\n\n", FILE_APPEND);
			} else {
				// Log de advertencia si no se encuentra técnico
				file_put_contents(__DIR__ . '/../Log/cargaTrabajo.log', date('Y-m-d H:i:s') . " - ADVERTENCIA: No se encontró técnico para Ticket $id al cerrar\n", FILE_APPEND);
			}
		}

		if ($result) {
			return ['success' => true, 'message' => 'Usuario actualizado exitosamente'];
		} else {
			return ['success' => false, 'message' => 'Error al actualizar el usuario'];
		}
	}
}