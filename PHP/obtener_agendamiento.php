<?php
include 'db_config.php';

$id = $_GET['id'];

if (empty($id)) {
    echo json_encode(['error' => 'ID de agendamiento no proporcionado.']);
    exit;
}

$sql = "SELECT id, fecha, hora, persona, motivo FROM agendamiento WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Agendamiento no encontrado.']);
} else {
    echo json_encode($result->fetch_assoc());
}

$stmt->close();
$conn->close();
?>