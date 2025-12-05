<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class State
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $State = new StateModel();
        $result = $State->all();
        //Dar respuesta
        $response->toJSON($result);
    }
}
