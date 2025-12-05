<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class AutoTriage
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $AutoTriage = new AutoTriageModel();
        $result = $AutoTriage->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $AutoTriage = new AutoTriageModel();
        $result = $AutoTriage->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
