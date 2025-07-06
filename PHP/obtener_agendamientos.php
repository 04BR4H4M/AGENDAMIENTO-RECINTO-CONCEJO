<?php
// Configurar headers para JSON y CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Función para enviar respuesta JSON
function enviarRespuesta($data, $error = false, $mensaje = '') {
    $respuesta = [
        'success' => !$error,
        'data' => $data,
        'message' => $mensaje,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($error) {
        http_response_code(500);
        $respuesta['error'] = true;
    }
    
    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Manejo de errores
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    // Verificar que el archivo de configuración existe
    if (!file_exists('db_config.php')) {
        throw new Exception("El archivo db_config.php no existe");
    }
    
    // Incluir configuración de base de datos
    include 'db_config.php';
    
    // Verificar que la conexión existe y está activa
    if (!isset($conn)) {
        throw new Exception("La variable de conexión \$conn no está definida");
    }
    
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    // Verificar que la tabla existe
    $table_check = $conn->query("SHOW TABLES LIKE 'agendamiento'");
    if ($table_check->num_rows === 0) {
        throw new Exception("La tabla 'agendamiento' no existe en la base de datos");
    }
    
    // Consulta SQL
    $sql = "SELECT id, fecha, hora, persona, motivo, duracion_minutos FROM agendamiento ORDER BY fecha, hora";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }
    
    $agendamientos_por_dia = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $fecha = $row['fecha'];
            
            // Validar que todos los campos necesarios existen
            if (!isset($row['id']) || !isset($row['hora']) || !isset($row['persona']) || 
                !isset($row['motivo']) || !isset($row['duracion_minutos'])) {
                continue; // Saltar registros incompletos
            }
            
            $cita_info = [
                'id' => (int)$row['id'],
                'hora' => $row['hora'],
                'persona' => $row['persona'] ?? '',
                'motivo' => $row['motivo'] ?? '',
                'duracion_minutos' => (int)($row['duracion_minutos'] ?? 60)
            ];
            
            if (!isset($agendamientos_por_dia[$fecha])) {
                $agendamientos_por_dia[$fecha] = [];
            }
            
            $agendamientos_por_dia[$fecha][] = $cita_info;
        }
    }
    
    // Cerrar conexión
    $conn->close();
    
    // Enviar respuesta exitosa
    enviarRespuesta($agendamientos_por_dia, false, "Datos cargados correctamente");
    
} catch (Exception $e) {
    // Log del error para debug
    error_log("Error en obtener_agendamientos.php: " . $e->getMessage());
    
    // Enviar respuesta de error
    enviarRespuesta([], true, $e->getMessage());
}
?>