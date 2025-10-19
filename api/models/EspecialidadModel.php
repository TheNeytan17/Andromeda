<?php
class EspecialidadModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM Especialidad;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        //Consulta sql
        $vSql = "SELECT e.Id, e.Nombre, e.Descripcion 
        FROM Tecnico t 
        JOIN Especialidad e ON t.Id_Especialidad = e.Id 
        WHERE t.Id_Usuario = '$id';";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }

    public function getCategory($id)
    {
        //Consulta sql
        $vSql = "SELECT e.Id, e.Nombre, e.Descripcion 
        FROM Categoria_Especialidad c 
        JOIN Especialidad e ON c.Id_Especialidad = e.Id 
        WHERE c.Id_Categoria = '$id';";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }
}
