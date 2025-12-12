<?php
// Composer autoloader
require_once 'vendor/autoload.php';
/*Encabezada de las solicitudes*/
/*CORS*/
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/*--- Requerimientos Clases o librerías*/
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";
//Middleware
require_once "middleware/AuthMiddleware.php";

/***--- Agregar todos los modelos*/
require_once "models/UserModel.php";
require_once "models/RolModel.php";
require_once "models/TechnicianModel.php";
require_once "models/EspecialidadModel.php";
require_once "models/CategoryModel.php";
require_once "models/EtiquetaModel.php";
require_once "models/SLAModel.php";
require_once "models/TicketModel.php";
require_once "models/TicketHistoryModel.php";
require_once "models/ImageModel.php";
require_once "models/ValoracionModel.php";
require_once "models/AssignmentModel.php";
require_once "models/PriorityModel.php";
require_once "models/StateModel.php";
require_once "models/AutoTriageModel.php";
require_once "models/NotificationModel.php";
require_once "models/IAModel.php";

/***--- Agregar todos los controladores*/
require_once "controllers/UserController.php";
require_once "controllers/TechController.php";
require_once "controllers/CategoryController.php";
require_once "controllers/EtiquetaController.php";
require_once "controllers/EspecialidadController.php";
require_once "controllers/TicketController.php";
require_once "controllers/AssignmentController.php";
require_once "controllers/SLAController.php";
require_once "controllers/PriorityController.php";
require_once "controllers/StateController.php";
require_once "controllers/AutoTriageController.php";
require_once "controllers/NotificationController.php";
require_once "controllers/AuthController.php";
require_once "controllers/IAController.php";
require_once "controllers/ValoracionController.php";


//Enrutador
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();



