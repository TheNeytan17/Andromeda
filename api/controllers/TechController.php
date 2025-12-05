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

    public function Etiqueta($param)
    {
        $response = new Response();
        $Tech = new TechnicianModel();
        $result = $Tech->getByEtiqueta($param);
        //Dar respuesta
        $response->toJSON($result);
    }

    public function create()
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        $Tech = new TechnicianModel();
        $result = $Tech->create($data);

        if ($result['success']) {
            $response->status(201);
        } else {
            $response->status(400);
        }
        $response->toJSON($result);
    }

    public function update($id)
    {
        $response = new Response();
        $request = new Request();
        $data = (array) $request->getJSON();

        $Tech = new TechnicianModel();
        $result = $Tech->update($id, $data);

        if ($result['success']) {
            $response->status(200);
        } else {
            $response->status(400);
        }
        $response->toJSON($result);
    }
}
