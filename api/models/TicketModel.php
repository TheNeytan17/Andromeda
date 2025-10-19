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
			$vSql = "SELECT * FROM Ticket;";

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
		$vSql = "SELECT *
				FROM Ticket t
				WHERE t.Id = '$id';";
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
}
