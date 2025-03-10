<?php
include 'db_config.php';

$id = $_POST['id'];
$fecha = $_POST['fecha'];
$hora = $_POST['hora'];
$persona = $_POST['persona'];
$motivo = $_POST['motivo'];

if (empty($id) || empty($fecha) || empty($hora) || empty($persona) || empty($motivo)) {
    die("Error: Todos los campos son obligatorios.");
}

$sql = "UPDATE agendamiento SET fecha = ?, hora = ?, persona = ?, motivo = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssi", $fecha, $hora, $persona, $motivo, $id);

if ($stmt->execute()) {
    echo "Agendamiento actualizado exitosamente.";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>