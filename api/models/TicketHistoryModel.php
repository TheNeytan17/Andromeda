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
		//Consulta sql con JOIN para obtener el nombre del usuario responsable
		$vSql = "SELECT 
					H.*,
					U.Nombre AS Usuario_Responsable
				FROM Historial_Estado H
				LEFT JOIN Usuario U ON H.Id_Usuario_Responsable = U.Id
				WHERE H.Id_Ticket = '$id'
				ORDER BY H.Fecha_Cambio ASC;";
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
