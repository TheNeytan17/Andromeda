<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Tech
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Tech = new TechnicianModel();
        $result = $Tech->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $Tech = new TechnicianModel();
        $result = $Tech->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
