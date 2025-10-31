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
}
