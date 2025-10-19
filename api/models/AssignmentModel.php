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
		//Consulta sql
		$vSql = "SELECT * FROM Asignacion;";

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
}
