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
			$vSql = "SELECT u.Id As Id, u.Nombre AS Nombre, e.Nombre AS Especialidad
					FROM Tecnico t
					JOIN Usuario u ON t.Id_Usuario = u.Id
					Join Especialidad e ON t.Id_Especialidad = e.Id
					WHERE u.rol = '2';";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);


			return $vResultado;
		
	}
	public function get($id)
	{
			$rolM = new RolModel();
			//Consulta sql
			$vSql = "SELECT * FROM Usuario where id=$id and Rol = '2'";
			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);
			if ($vResultado) {
				$vResultado = $vResultado[0];
				$rol = $rolM->getRolUser($id);
				$vResultado->rol = $rol;
				// Retornar el objeto
				return $vResultado;
			} else {
				return null;
			}
		
	}
}
