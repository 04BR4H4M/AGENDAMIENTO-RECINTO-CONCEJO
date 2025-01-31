<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db_config.php';

// Validar campos vacíos
if (empty($_POST['fecha']) || empty($_POST['hora']) || empty($_POST['persona']) || empty($_POST['motivo'])) {
    die("Error: Todos los campos son obligatorios.");
}

$fecha = $_POST['fecha'];
$hora = $_POST['hora'];
$persona = $_POST['persona'];
$motivo = $_POST['motivo'];

// Validar formato de hora
if (!preg_match('/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/', $hora)) {
    die("Error: Formato de hora inválido.");
}

// Consulta preparada para evitar inyecciones SQL
$sql = "INSERT INTO agendamiento (fecha, hora, persona, motivo) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $fecha, $hora, $persona, $motivo);

if ($stmt->execute()) {
    echo "Agendamiento guardado exitosamente.";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>