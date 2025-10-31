<?php

use Firebase\JWT\JWT;

class CategoryModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
		// Incluir la descripción del SLA asociado en el listado
		$vSql = "SELECT c.Id, c.Nombre, c.Id_SLA, s.Tiempo_Respuesta, s.Tiempo_Resolucion, s.Descripcion AS SLA_Descripcion
				 FROM Categoria c
				 INNER JOIN SLA s ON s.Id = c.Id_SLA";

		// Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}
	public function get($id)
	{
		$EtiquetaM = new EtiquetaModel();
		$SlaM = new SLAModel();
		$EspecialidadM = new EspecialidadModel();
		//Consulta sql
		$vSql = "SELECT *
				FROM Categoria c
				WHERE Id = '$id';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		if ($vResultado) {
			$categoria = $vResultado[0];
			// Obtener todas las especialidades de la categoría
			$especialidades = $EspecialidadM->getCategory($categoria->Id);
			$categoria->Especialidades = $especialidades ? $especialidades : [];

			$Etiquetas = $EtiquetaM->get($categoria->Id);
			$categoria->Etiquetas = $Etiquetas ? $Etiquetas : [];

			$Sla = $SlaM->get($categoria->Id_SLA);
			$categoria->SLA = $Sla ? $Sla : [];

			return $categoria;
		} else {
			return null;
		}
	}

	public function getByCategory($id)
	{
		$vSql = "SELECT * FROM Categoria Where Id = '$id';";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}
	
}
