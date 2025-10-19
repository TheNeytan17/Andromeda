<?php
class ValoracionModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }

    public function get($id)
    {
        $vSql = "SELECT *
        FROM Valoracion v
        WHERE v.Id_Ticket = '$id';";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }
}
