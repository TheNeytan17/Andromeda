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
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						t.Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id;";

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
		$vSql = "SELECT 
					t.*,
					c.Nombre AS Categoria
				FROM Ticket t
				INNER JOIN Categoria c ON t.Id_Categoria = c.Id
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

	public function technician($id)
	{
		//Consulta sql
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						t.Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id
					INNER JOIN Asignacion a ON a.Id_Tecnico = '$id'
					WHERE t.Id = a.Id_Ticket;";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}

	public function client($id)
	{
		//Consulta sql
		$vSql = "SELECT 
						t.Id,
						t.Id_Usuario,
						u.Nombre AS Usuario,
						t.Titulo,
						t.Descripcion,
						t.Fecha_Creacion,
						t.Fecha_Limite_Respuesta,
						t.Fecha_Limite_Resolucion,
						t.Prioridad,
						t.Estado,
						t.Id_Categoria,
						c.Nombre AS Categoria,
						t.Fecha_Cierre,
						t.cumplimiento_respuesta,
						t.cumplimiento_resolucion
					FROM Ticket t
					INNER JOIN Usuario u ON t.Id_Usuario = u.Id
					INNER JOIN Categoria c ON t.Id_Categoria = c.Id
					WHERE t.Id_Usuario = '$id';";

		//Ejecutar la consulta
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		// Retornar el objeto
		return $vResultado;
	}
}
