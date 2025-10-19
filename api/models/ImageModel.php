<?php

use Firebase\JWT\JWT;

class ImageModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function get($id)
	{
		$UsuarioM = new UserModel();
		//Consulta sql
		$vSql = "SELECT *
				FROM Imagen I
				WHERE I.Id_Historial = '$id';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		return $vResultado;
	}
}
