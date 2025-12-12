<?php

use Firebase\JWT\JWT;

class UserModel
{
	public $enlace;
	public function __construct()
	{

		$this->enlace = new MySqlConnect();
	}
	public function all()
	{
			//Consulta sql
			$vSql = "SELECT * FROM Usuario;";

			//Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL($vSql);

			// Retornar el objeto
			return $vResultado;
		
	}
	public function get($id)
	{
			$rolM = new RolModel();
			//Consulta sql
			$vSql = "SELECT * FROM Usuario where id=$id";
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

	public function create($data)
	{
		try {
			// Validar datos requeridos
			if (empty($data['Nombre']) || empty($data['Correo']) || empty($data['Password']) || empty($data['Rol'])) {
				return [
					'success' => false,
					'message' => 'Todos los campos son requeridos'
				];
			}

			// Verificar si el correo ya existe
			$vSqlCheck = "SELECT Id FROM Usuario WHERE Correo = '" . $data['Correo'] . "'";
			$existing = $this->enlace->ExecuteSQL($vSqlCheck);
			if ($existing && count($existing) > 0) {
				return [
					'success' => false,
					'message' => 'El correo ya está registrado'
				];
			}

			// Hash de la contraseña
			$passwordHash = password_hash($data['Password'], PASSWORD_BCRYPT);
			$estado = isset($data['Estado']) ? $data['Estado'] : 1;

			// Insertar usuario
			$vSql = "INSERT INTO Usuario (Nombre, Correo, PasswordHash, Rol, Estado) 
					 VALUES ('" . $data['Nombre'] . "', '" . $data['Correo'] . "', '" . $passwordHash . "', " . $data['Rol'] . ", " . $estado . ")";
			
			$result = $this->enlace->ExecuteSQL_DML($vSql);

			if ($result) {
				return [
					'success' => true,
					'message' => 'Usuario creado exitosamente'
				];
			} else {
				return [
					'success' => false,
					'message' => 'Error al crear el usuario'
				];
			}
		} catch (Exception $e) {
			return [
				'success' => false,
				'message' => 'Error: ' . $e->getMessage()
			];
		}
	}

	public function update($id, $data)
	{
		try {
			// Validar que el usuario existe
			$usuario = $this->get($id);
			if (!$usuario) {
				return [
					'success' => false,
					'message' => 'Usuario no encontrado'
				];
			}

			// Construir la consulta de actualización
			$updates = [];
			
			if (isset($data['Nombre']) && !empty($data['Nombre'])) {
				$updates[] = "Nombre = '" . $data['Nombre'] . "'";
			}
			
			if (isset($data['Rol']) && !empty($data['Rol'])) {
				$updates[] = "Rol = " . $data['Rol'];
			}
			
			if (isset($data['Estado'])) {
				$updates[] = "Estado = " . $data['Estado'];
			}

			// Si se envía Password, es un reseteo de contraseña
			if (isset($data['Password']) && !empty($data['Password'])) {
				$passwordHash = password_hash($data['Password'], PASSWORD_BCRYPT);
				$updates[] = "PasswordHash = '" . $passwordHash . "'";
			}

			// Si no hay nada que actualizar
			if (empty($updates)) {
				return [
					'success' => false,
					'message' => 'No hay datos para actualizar'
				];
			}

			$vSql = "UPDATE Usuario SET " . implode(', ', $updates) . " WHERE Id = " . $id;
			$result = $this->enlace->ExecuteSQL_DML($vSql);

			if ($result) {
				return [
					'success' => true,
					'message' => 'Usuario actualizado exitosamente'
				];
			} else {
				return [
					'success' => false,
					'message' => 'Error al actualizar el usuario'
				];
			}
		} catch (Exception $e) {
			return [
				'success' => false,
				'message' => 'Error: ' . $e->getMessage()
			];
		}
	}

	public function delete($id)
	{
		try {
			$vSql = "DELETE FROM Usuario WHERE Id = " . $id;
			$result = $this->enlace->ExecuteSQL_DML($vSql);

			if ($result) {
				return [
					'success' => true,
					'message' => 'Usuario eliminado exitosamente'
				];
			} else {
				return [
					'success' => false,
					'message' => 'Error al eliminar el usuario'
				];
			}
		} catch (Exception $e) {
			return [
				'success' => false,
				'message' => 'Error: ' . $e->getMessage()
			];
		}
	}
}
