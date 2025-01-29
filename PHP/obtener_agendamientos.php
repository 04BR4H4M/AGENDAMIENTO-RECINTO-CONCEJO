<?php
include 'db_config.php';

$mesActual = date('m');
$anioActual = date('Y');

$sql = "SELECT fecha, hora, persona, motivo FROM agendamiento WHERE MONTH(fecha) = '$mesActual' AND YEAR(fecha) = '$anioActual'";
$result = $conn->query($sql);

$agendamientos = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $agendamientos[] = $row;
    }
} else {
    // Agregar mensaje de depuración si no hay resultados
    error_log("No se encontraron agendamientos para el mes $mesActual y año $anioActual.");
}

header('Content-Type: application/json');
echo json_encode($agendamientos);

$conn->close();
?>