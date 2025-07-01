<?php
// ===== VERSIÓN FINAL Y CORRECTA PARA actualizar_agendamiento.php =====

// Activamos el reporte de todos los errores para no tener sorpresas
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluimos TU archivo de conexión que sabemos que funciona
include 'db_config.php';

// Verificamos que se envíen datos por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recibimos y limpiamos los datos
    $id = $_POST['id'];
    $fecha = $_POST['fecha'];
    $hora = $_POST['hora'];
    $persona = trim($_POST['persona']);
    $motivo = trim($_POST['motivo']);
    $duracion_minutos = (int)$_POST['duracion_minutos'];

    // Preparamos la consulta SQL
    $sql = "UPDATE agendamiento SET fecha = ?, hora = ?, persona = ?, motivo = ?, duracion_minutos = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssii", $fecha, $hora, $persona, $motivo, $duracion_minutos, $id);

    // Ejecutamos
    if ($stmt->execute()) {
        // Si todo va bien, intentamos redirigir
        header("Location: ../Fecha.html?status=actualizado_ok");
        exit(); // Detenemos la ejecución inmediatamente después de redirigir
    } else {
        // Si falla la ejecución de la consulta
        echo "Error al actualizar el agendamiento: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>