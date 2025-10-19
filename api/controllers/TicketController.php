<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class Ticket
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $Ticket = new TicketModel();
        $result = $Ticket->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $Ticket = new TicketModel();
        $result = $Ticket->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
}
