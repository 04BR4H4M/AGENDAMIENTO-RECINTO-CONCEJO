<?php
// Configurar headers para JSON y manejo de errores
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Habilitar reporte de errores para debug
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en la respuesta JSON

try {
    // Incluir configuración de base de datos
    include 'db_config.php';
    
    // Verificar que la conexión existe
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . ($conn->connect_error ?? 'Conexión no establecida'));
    }
    
    // Consulta SQL con manejo de errores
    $sql = "SELECT id, fecha, hora, persona, motivo, duracion_minutos FROM agendamiento ORDER BY fecha, hora";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error en la consulta SQL: " . $conn->error);
    }
    
    $agendamientos_por_dia = array();
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $fecha = $row['fecha'];
            
            // Crear objeto con todos los datos necesarios
            $cita_info = [
                'id' => (int)$row['id'],
                'hora' => $row['hora'],
                'persona' => $row['persona'],
                'motivo' => $row['motivo'],
                'duracion_minutos' => (int)$row['duracion_minutos']
            ];
            
            // Inicializar array si no existe
            if (!isset($agendamientos_por_dia[$fecha])) {
                $agendamientos_por_dia[$fecha] = [];
            }
            
            $agendamientos_por_dia[$fecha][] = $cita_info;
        }
    }
    
    // Cerrar conexión
    $conn->close();
    
    // Enviar respuesta JSON
    echo json_encode($agendamientos_por_dia, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // En caso de error, enviar respuesta JSON vacía con mensaje de error
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'data' => []
    ], JSON_UNESCAPED_UNICODE);
}
?>