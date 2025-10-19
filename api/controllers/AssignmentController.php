<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Assignment
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $AssignmentM = new AssignmentModel();
        $result = $AssignmentM->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $AssignmentM = new AssignmentModel();
        $result = $AssignmentM->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
