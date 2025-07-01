<?php
// Contenido FINAL Y CORRECTO para PHP/obtener_agendamientos.php

header('Content-Type: application/json');
include 'db_config.php';

// LA CLAVE ESTÁ EN ESTA LÍNEA: seleccionamos duracion_minutos
$sql = "SELECT id, fecha, hora, persona, motivo, duracion_minutos FROM agendamiento ORDER BY fecha, hora";
$result = $conn->query($sql);

$agendamientos_por_dia = array();

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $fecha = $row['fecha'];
        
        // Y aquí nos aseguramos de incluirlo en la respuesta
        $cita_info = [
            'id' => $row['id'],
            'hora' => $row['hora'],
            'persona' => $row['persona'],
            'motivo' => $row['motivo'],
            'duracion_minutos' => $row['duracion_minutos']
        ];

        if (!isset($agendamientos_por_dia[$fecha])) {
            $agendamientos_por_dia[$fecha] = [];
        }
        array_push($agendamientos_por_dia[$fecha], $cita_info);
    }
}

$conn->close();
echo json_encode($agendamientos_por_dia);
?>