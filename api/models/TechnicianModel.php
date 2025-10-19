<?php

use Firebase\JWT\JWT;

class TechnicianModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		$TechM = new EspecialidadModel();
		//Consulta sql
		$vSql = "SELECT u.Id AS Id, u.Nombre AS Nombre FROM Usuario u WHERE u.Rol = '2';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if (is_array($vResultado) && count($vResultado) > 0) {
			foreach ($vResultado as $tecnico) {
				// Obtener todas las especialidades del técnico
				$especialidades = $TechM->get($tecnico->Id);
				$tecnico->Especialidades = $especialidades ? $especialidades : [];
			}
			return $vResultado;
		} else {
			return null;
		}
	}
	public function get($id)
	{
		$TechM = new EspecialidadModel();
		//Consulta sql
		$vSql = "SELECT * FROM Usuario u WHERE u.Id = '$id' and u.Rol = '2';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if ($vResultado) {
			$tecnico = $vResultado[0];
			// Obtener todas las especialidades del técnico
			$especialidades = $TechM->get($tecnico->Id);
			$tecnico->Especialidades = $especialidades ? $especialidades : [];
			return $tecnico;
		} else {
			return null;
		}
	}
}
