<?php
class ValoracionModel
{
    public $enlace;
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Obtener valoración de un ticket específico
     */
    public function get($id)
    {
        $vSql = "SELECT v.*, u.Nombre as NombreUsuario
        FROM Valoracion v
        LEFT JOIN Usuario u ON v.Id_Usuario = u.Id
        WHERE v.Id_Ticket = '$id';";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /**
     * Crear nueva valoración
     */
    public function create($data)
    {
        $idTicket = $data['Id_Ticket'];
        $idUsuario = $data['Id_Usuario'];
        $puntaje = $data['Puntaje'];
        $comentario = isset($data['Comentario']) && $data['Comentario'] !== '' 
            ? "'" . addslashes($data['Comentario']) . "'" 
            : "NULL";

        $vSql = "INSERT INTO Valoracion (Id_Ticket, Id_Usuario, Puntaje, Comentario, Fecha_Valoracion)
        VALUES ('$idTicket', '$idUsuario', '$puntaje', $comentario, NOW());";

        $vResultado = $this->enlace->executeSQL_DML_last($vSql);
        
        if ($vResultado) {
            return $this->get($idTicket);
        }
        return false;
    }

    /**
     * Verificar si existe valoración para un ticket
     */
    public function existsForTicket($idTicket)
    {
        $vSql = "SELECT COUNT(*) as total FROM Valoracion WHERE Id_Ticket = '$idTicket';";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado) && isset($vResultado[0]['total'])) {
            return intval($vResultado[0]['total']) > 0;
        }
        return false;
    }

    /**
     * Obtener todas las valoraciones con filtros
     */
    public function getAll($filters = [])
    {
        $vSql = "SELECT v.*, t.Titulo as TituloTicket, u.Nombre as NombreUsuario,
                 tech.Nombre as NombreTecnico, a.Id_Tecnico
        FROM Valoracion v
        LEFT JOIN Ticket t ON v.Id_Ticket = t.Id
        LEFT JOIN Usuario u ON v.Id_Usuario = u.Id
        LEFT JOIN Asignacion a ON t.Id = a.Id_Ticket
        LEFT JOIN Usuario tech ON a.Id_Tecnico = tech.Id
        WHERE 1=1";

        // Aplicar filtros
        if (isset($filters['Id_Tecnico'])) {
            $vSql .= " AND a.Id_Tecnico = '" . $filters['Id_Tecnico'] . "'";
        }

        if (isset($filters['fecha_inicio'])) {
            $vSql .= " AND v.Fecha_Valoracion >= '" . $filters['fecha_inicio'] . "'";
        }

        if (isset($filters['fecha_fin'])) {
            $vSql .= " AND v.Fecha_Valoracion <= '" . $filters['fecha_fin'] . "'";
        }

        $vSql .= " ORDER BY v.Fecha_Valoracion DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /**
     * Obtener promedio de valoraciones por técnico
     */
    public function getAverageByTechnician($idTecnico)
    {
        $vSql = "SELECT AVG(v.Puntaje) as promedio, COUNT(v.Id) as total
        FROM Valoracion v
        LEFT JOIN Ticket t ON v.Id_Ticket = t.Id
        LEFT JOIN Asignacion a ON t.Id = a.Id_Ticket
        WHERE a.Id_Tecnico = '$idTecnico';";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        
        if (!empty($vResultado)) {
            return [
                'promedio' => round(floatval($vResultado[0]['promedio']), 2),
                'total' => intval($vResultado[0]['total'])
            ];
        }
        return null;
    }

    /**
     * Obtener valoraciones de un técnico específico
     */
    public function getByTechnician($idTecnico)
    {
        $vSql = "SELECT v.*, t.Titulo as TituloTicket, u.Nombre as NombreUsuario
        FROM Valoracion v
        LEFT JOIN Ticket t ON v.Id_Ticket = t.Id
        LEFT JOIN Usuario u ON v.Id_Usuario = u.Id
        LEFT JOIN Asignacion a ON t.Id = a.Id_Ticket
        WHERE a.Id_Tecnico = '$idTecnico'
        ORDER BY v.Fecha_Valoracion DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
