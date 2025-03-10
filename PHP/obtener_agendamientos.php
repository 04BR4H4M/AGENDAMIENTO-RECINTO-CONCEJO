<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'db_config.php';

$mesActual = date('m');
$anioActual = date('Y');

// Consulta preparada
$sql = "SELECT id, fecha, hora, persona, motivo FROM agendamiento WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $mesActual, $anioActual);
$stmt->execute();
$result = $stmt->get_result();

$agendamientos = array();
while ($row = $result->fetch_assoc()) {
    $agendamientos[] = $row;
}

header('Content-Type: application/json');
echo json_encode($agendamientos);

$stmt->close();
$conn->close();

?>