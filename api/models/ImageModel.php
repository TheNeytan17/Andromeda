<?php

use Firebase\JWT\JWT;

class ImageModel
{
	private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif');
	public $enlace;
	public function __construct()
	
	{

		$this->enlace = new MySqlConnect();
	}
	public function get($id)
	{
		$UsuarioM = new UserModel();
		//Consulta sql
		$vSql = "SELECT *
				FROM Imagen I
				WHERE I.Id_Historial = '$id';";
		$vResultado = $this->enlace->ExecuteSQL($vSql);

		return $vResultado;
	}

	public function uploadFile($object, $idHistorial)
    {
        $file = $object['file'];
        //Obtener la información del archivo
        $fileName = $file['name'];
        $tempPath = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];

        if (!empty($fileName)) {
            //Crear un nombre único para el archivo
            $fileExt = explode('.', $fileName);
            $fileActExt = strtolower(end($fileExt));
            $fileName = "Ticket-" . uniqid() . "." . $fileActExt;
            //Validar el tipo de archivo
            if (in_array($fileActExt, $this->valid_extensions)) {
                //Validar que no exista
                if (!file_exists($this->upload_path . $fileName)) {
                    //Validar que no sobrepase el tamaño
                    if ($fileSize < 2000000 && $fileError == 0) {
                        //Moverlo a la carpeta del servidor del API
                        if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                            //Guardarlo en la BD
                            $sql = "INSERT INTO Imagen (Imagen , Id_Historial) VALUES ('$fileName', $idHistorial)";
                            $vResultado = $this->enlace->ExecuteSQL_DML($sql);
                            if ($vResultado > 0) {
                                return 'Imagen creada';
                            }
                            return false;
                        }
                    }
                }
            }
        }
    }
}
