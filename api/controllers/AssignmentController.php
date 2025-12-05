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

    // Obtener una sola asignación por Id de asignación
    public function single($param)
    {
        $response = new Response();
        $AssignmentM = new AssignmentModel();
        $result = $AssignmentM->getById($param);
        $response->toJSON($result);
    }

    public function create()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        $AssignmentM = new AssignmentModel();
        $result = $AssignmentM->createAssignment($data);

        if ($result['success']) {
            $response->status(201);
        } else {
            $response->status(400);
        }
        $response->toJSON($result);
    }
}