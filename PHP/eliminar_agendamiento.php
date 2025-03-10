<?php
include 'db_config.php';

$id = $_GET['id'];

if (empty($id)) {
    die("Error: ID de agendamiento no proporcionado.");
}

$sql = "DELETE FROM agendamiento WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "Agendamiento eliminado exitosamente.";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>