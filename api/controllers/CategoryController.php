<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Category
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Category = new CategoryModel();
        $result = $Category->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $Category = new CategoryModel();
        $result = $Category->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
