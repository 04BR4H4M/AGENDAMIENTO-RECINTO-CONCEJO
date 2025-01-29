<?php
include 'db_config.php';

$fecha = $_POST['fecha'];
$hora = $_POST['hora'];
$persona = $_POST['persona'];
$motivo = $_POST['motivo'];

$sql = "INSERT INTO agendamiento (fecha, hora, persona, motivo) VALUES ('$fecha', '$hora', '$persona', '$motivo')";
if ($conn->query($sql) === TRUE) {
    echo "Agendamiento guardado exitosamente.";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
