<?php
// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "agendamientos";

// Configurar charset para evitar problemas de codificación
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Crear conexión con charset UTF-8
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Establecer charset
    $conn->set_charset("utf8");
    
    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
} catch (Exception $e) {
    // Log del error (en producción, esto debería ir a un archivo de log)
    error_log("Error de conexión a la base de datos: " . $e->getMessage());
    
    // En desarrollo, mostrar el error
    if (ini_get('display_errors')) {
        die("Error de conexión a la base de datos: " . $e->getMessage());
    } else {
        die("Error de conexión a la base de datos. Contacte al administrador.");
    }
}
?>