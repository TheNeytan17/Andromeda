<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

class Etiqueta
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Etiqueta = new EtiquetaModel();
        $result = $Etiqueta->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $Etiqueta = new EtiquetaModel();
        $result = $Etiqueta->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
