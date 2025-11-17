<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class SLA
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $SLA = new SLAModel();
        $result = $SLA->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $SLA = new SLAModel();
        $result = $SLA->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
