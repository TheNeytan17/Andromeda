<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class User
{
    //Listar en el API
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->all();
        //Dar respuesta
        $response->toJSON($result);
    }

    public function get($param)
    {
        $response = new Response();
        $usuario = new UserModel();
        $result = $usuario->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }

    public function create()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        $User = new UserModel();
        $result = $User->create($data);

        if ($result['success']) {
            $response->status(201);
        } else {
            $response->status(400);
        }
        $response->toJSON($result);
    }
}
