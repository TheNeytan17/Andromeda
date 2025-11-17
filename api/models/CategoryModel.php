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

	public function create($data)
	{
		// Validaciones
		if (empty($data['Nombre'])) {
			return ['success' => false, 'message' => 'El nombre de la categoría es requerido'];
		}

		// Determinar si se usa un SLA existente o se crea uno nuevo
		$idSLA = null;
		if (!empty($data['Id_SLA'])) {
			$idSLA = $data['Id_SLA'];
		} else {
			// Validar tiempos de SLA
			if (empty($data['Tiempo_Respuesta']) || $data['Tiempo_Respuesta'] <= 0) {
				return ['success' => false, 'message' => 'El tiempo de respuesta debe ser mayor a cero'];
			}
			if (empty($data['Tiempo_Resolucion']) || $data['Tiempo_Resolucion'] <= $data['Tiempo_Respuesta']) {
				return ['success' => false, 'message' => 'El tiempo de resolución debe ser mayor que el tiempo de respuesta'];
			}

			// Crear nuevo SLA
			$descripcionSLA = "SLA para categoría " . $data['Nombre'];
			$vSqlSLA = "INSERT INTO SLA (Descripcion, Tiempo_Respuesta, Tiempo_Resolucion) 
						VALUES ('$descripcionSLA', '{$data['Tiempo_Respuesta']}', '{$data['Tiempo_Resolucion']}')";
			$idSLA = $this->enlace->ExecuteSQL_DML_last($vSqlSLA);
		}

		// Insertar categoría
		$vSql = "INSERT INTO Categoria (Nombre, Id_SLA) VALUES ('{$data['Nombre']}', '$idSLA')";
		$idCategoria = $this->enlace->ExecuteSQL_DML_last($vSql);

		if ($idCategoria) {
			// Asociar etiquetas
			if (!empty($data['Etiquetas']) && is_array($data['Etiquetas'])) {
				foreach ($data['Etiquetas'] as $idEtiqueta) {
					$vSqlEtiqueta = "INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) 
									VALUES ('$idCategoria', '$idEtiqueta')";
					$this->enlace->ExecuteSQL_DML($vSqlEtiqueta);
				}
			}

			// Asociar especialidades
			if (!empty($data['Especialidades']) && is_array($data['Especialidades'])) {
				foreach ($data['Especialidades'] as $idEspecialidad) {
					$vSqlEspecialidad = "INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) 
										VALUES ('$idCategoria', '$idEspecialidad')";
					$this->enlace->ExecuteSQL_DML($vSqlEspecialidad);
				}
			}

			return ['success' => true, 'message' => 'Categoría creada exitosamente', 'id' => $idCategoria];
		}

		return ['success' => false, 'message' => 'Error al crear la categoría'];
	}

	public function update($id, $data)
	{
		// Validaciones
		if (empty($data['Nombre'])) {
			return ['success' => false, 'message' => 'El nombre de la categoría es requerido'];
		}

		// Obtener categoría actual
		$categoriaActual = $this->getByCategory($id);
		if (!$categoriaActual || empty($categoriaActual)) {
			return ['success' => false, 'message' => 'Categoría no encontrada'];
		}

		$idSLAActual = $categoriaActual[0]->Id_SLA;

		// Determinar si se actualiza el SLA o se crea uno nuevo
		$idSLA = $idSLAActual;
		if (!empty($data['Id_SLA']) && $data['Id_SLA'] != $idSLAActual) {
			$idSLA = $data['Id_SLA'];
		} else if (!empty($data['Tiempo_Respuesta']) || !empty($data['Tiempo_Resolucion'])) {
			// Validar tiempos de SLA
			$tiempoRespuesta = !empty($data['Tiempo_Respuesta']) ? $data['Tiempo_Respuesta'] : 0;
			$tiempoResolucion = !empty($data['Tiempo_Resolucion']) ? $data['Tiempo_Resolucion'] : 0;

			if ($tiempoRespuesta <= 0) {
				return ['success' => false, 'message' => 'El tiempo de respuesta debe ser mayor a cero'];
			}
			if ($tiempoResolucion <= $tiempoRespuesta) {
				return ['success' => false, 'message' => 'El tiempo de resolución debe ser mayor que el tiempo de respuesta'];
			}

			// Actualizar SLA existente
			$vSqlUpdateSLA = "UPDATE SLA SET 
								Tiempo_Respuesta = '$tiempoRespuesta', 
								Tiempo_Resolucion = '$tiempoResolucion' 
							WHERE Id = '$idSLAActual'";
			$this->enlace->ExecuteSQL_DML($vSqlUpdateSLA);
		}

		// Actualizar categoría
		$vSql = "UPDATE Categoria SET Nombre = '{$data['Nombre']}', Id_SLA = '$idSLA' WHERE Id = '$id'";
		$resultado = $this->enlace->ExecuteSQL_DML($vSql);

		if ($resultado !== false) {
			// Eliminar etiquetas anteriores
			$vSqlDeleteEtiquetas = "DELETE FROM Categoria_Etiqueta WHERE Id_Categoria = '$id'";
			$this->enlace->ExecuteSQL_DML($vSqlDeleteEtiquetas);

			// Asociar nuevas etiquetas
			if (!empty($data['Etiquetas']) && is_array($data['Etiquetas'])) {
				foreach ($data['Etiquetas'] as $idEtiqueta) {
					$vSqlEtiqueta = "INSERT INTO Categoria_Etiqueta (Id_Categoria, Id_Etiqueta) 
									VALUES ('$id', '$idEtiqueta')";
					$this->enlace->ExecuteSQL_DML($vSqlEtiqueta);
				}
			}

			// Eliminar especialidades anteriores
			$vSqlDeleteEspecialidades = "DELETE FROM Categoria_Especialidad WHERE Id_Categoria = '$id'";
			$this->enlace->ExecuteSQL_DML($vSqlDeleteEspecialidades);

			// Asociar nuevas especialidades
			if (!empty($data['Especialidades']) && is_array($data['Especialidades'])) {
				foreach ($data['Especialidades'] as $idEspecialidad) {
					$vSqlEspecialidad = "INSERT INTO Categoria_Especialidad (Id_Categoria, Id_Especialidad) 
										VALUES ('$id', '$idEspecialidad')";
					$this->enlace->ExecuteSQL_DML($vSqlEspecialidad);
				}
			}

			return ['success' => true, 'message' => 'Categoría actualizada exitosamente'];
		}

		return ['success' => false, 'message' => 'Error al actualizar la categoría'];
	}
	
}
