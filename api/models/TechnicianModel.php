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
		$vSql = "SELECT u.Id, u.Nombre, u.Correo, u.Ultima_Sesion, u.Rol, u.Estado, u.CargaTrabajo  FROM Usuario u WHERE u.Id = '$id' and u.Rol = '2';";
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

	public function create($data)
	{
		$passwordHash = password_hash('Andromeda1234', PASSWORD_DEFAULT);

		$vUsuarioSQL = "INSERT INTO Usuario (Nombre, Correo, PasswordHash, Rol, Estado, CargaTrabajo) 
						VALUES ('{$data['Nombre']}', '{$data['Correo']}', '{$passwordHash}', '2', '1', '0')";
		$idUsuario = $this->enlace->ExecuteSQL_DML_last($vUsuarioSQL);

		if ($idUsuario) {
			if (!empty($data['Especialidades']) && is_array($data['Especialidades'])) {
				foreach ($data['Especialidades'] as $IdespecialidadId) {
					$vSqlEtiqueta = "INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) 
									VALUES ('$idUsuario', '$IdespecialidadId')";
					$this->enlace->ExecuteSQL_DML($vSqlEtiqueta);
				}
			}
			return ['success' => true, 'message' => 'Usuario creado exitosamente', 'id' => $idUsuario];
		} else {
			return ['success' => false, 'message' => 'Error al crear el usuario'];
		}
	}

	public function update($id, $data)
	{
		$vUsuarioSQL = "UPDATE Usuario SET Nombre = '{$data['Nombre']}', Correo = '{$data['Correo']}', Estado = '{$data['Estado']}', CargaTrabajo = '{$data['CargaTrabajo']}' WHERE Id = '$id'";
		$this->enlace->ExecuteSQL_DML($vUsuarioSQL);

		if (!empty($data['Especialidades']) && is_array($data['Especialidades'])) {
			$vSqlDelete = "DELETE FROM Tecnico WHERE Id_Usuario = '$id'";
			$this->enlace->ExecuteSQL_DML($vSqlDelete);

			foreach ($data['Especialidades'] as $IdespecialidadId) {
				$vSqlEtiqueta = "INSERT INTO Tecnico (Id_Usuario, Id_Especialidad) 
									VALUES ('$id', '$IdespecialidadId')";
				$this->enlace->ExecuteSQL_DML($vSqlEtiqueta);
			}
			return ['success' => true, 'message' => 'Usuario actualizado exitosamente', 'id' => $id];
		} else {
			return ['success' => false, 'message' => 'Error al actualizar el usuario'];
		}
	}
}
