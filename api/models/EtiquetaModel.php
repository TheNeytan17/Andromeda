<?php
class EtiquetaModel
{
    public $enlace;
    public function __construct()
    {

        $this->enlace = new MySqlConnect();
    }
    public function all()
    {
        //Consulta sql
        $vSql = "SELECT * FROM Etiqueta;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        // Retornar el objeto
        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT e.Id AS Id, e.Nombre AS Nombre
        FROM Etiqueta e
        Join Categoria_Etiqueta ce ON ce.Id_Categoria = '$id'
        WHERE ce.Id_Etiqueta = e.Id;";

        //Ejecutar la consulta
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        // Retornar el objeto
        return $vResultado;
    }
}
