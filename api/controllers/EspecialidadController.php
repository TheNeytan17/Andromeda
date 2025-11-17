<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class Especialidad
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Especialidad = new EspecialidadModel();
        $result = $Especialidad->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $Especialidad = new EspecialidadModel();
        $result = $Especialidad->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
