<?php
// Contenido ACTUALIZADO para guardar_agendamiento.php

include 'db_config.php';
header('Content-Type: application/json');

// Función para enviar respuesta
function enviarRespuesta($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // ... (tu código para recoger los datos: $fecha, $hora, etc.)

    $sql = "INSERT INTO agendamiento (fecha, hora, persona, motivo, duracion_minutos, email) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssis", $fecha, $hora, $nombre, $motivo, $duracion_minutos, $email_solicitante);

    if ($stmt->execute()) {
        // Aquí podríamos añadir la lógica de enviar el correo...
        enviarRespuesta(true, "¡Agendamiento guardado exitosamente!");
    } else {
        enviarRespuesta(false, "Error al guardar en la base de datos.");
    }
    $stmt->close();
    $conn->close();
}
?>