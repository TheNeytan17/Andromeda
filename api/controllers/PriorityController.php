<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Priority
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Prioridad = new PriorityModel();
        $result = $Prioridad->all();
        //Dar respuesta
        $response->toJSON($result);
    }
}
