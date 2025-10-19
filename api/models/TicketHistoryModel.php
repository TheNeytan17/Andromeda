<?php

use Firebase\JWT\JWT;

class HistoryModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
			//Consulta sql
			$vSql = "SELECT * FROM Historial_Estado;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		
	}
	public function get($id)
	{
		$ImageM = new ImageModel();
		//Consulta sql
		$vSql = "SELECT *
				FROM Historial_Estado H
				WHERE H.Id_Ticket = '$id';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if (is_array($vResultado) && count($vResultado) > 0) {
			foreach ($vResultado as $history) {
				// Obtener todas las imagenes del historial
				$imagenes = $ImageM->get($history->Id);
				$history->Imagenes = $imagenes ? $imagenes : [];
			}
			return $vResultado;
		} else {
			return null;
		}
	}
}
