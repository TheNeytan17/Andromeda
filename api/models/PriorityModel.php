<?php
class PriorityModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM Prioridad;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto
        return $vResultado;
    }
}
