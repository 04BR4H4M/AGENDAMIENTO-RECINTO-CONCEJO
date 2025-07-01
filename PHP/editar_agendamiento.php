<?php
// Incluimos la configuración de la base de datos
include 'db_config.php';

// Obtenemos el ID del agendamiento desde la URL (ej. editar_agendamiento.php?id=51)
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id === 0) {
    die("Error: No se proporcionó un ID válido.");
}

// Preparamos la consulta para obtener los datos del agendamiento específico
$sql = "SELECT id, fecha, hora, persona, motivo, duracion_minutos FROM agendamiento WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Error: No se encontró ningún agendamiento con ese ID.");
}

// Guardamos los datos del agendamiento en una variable
$agendamiento = $result->fetch_assoc();

$stmt->close();
// No cerramos la conexión $conn aquí porque la usaremos de nuevo si se envía el formulario
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Agendamiento</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Fecha.css">
</head>
<body>
    <header>
        <h1>AGENDAMIENTO DE REUNIONES</h1>
    </header>

    <main class="wizard-wrapper">
        <div class="paso activo">
            <h2 class="paso-titulo">EDITAR AGENDAMIENTO</h2>

            <form action="actualizar_agendamiento.php" method="POST">
                
                <input type="hidden" name="id" value="<?php echo $agendamiento['id']; ?>">

                <div class="campo-formulario">
                    <label for="fecha">Fecha:</label>
                    <input type="date" id="fecha" name="fecha" value="<?php echo htmlspecialchars($agendamiento['fecha']); ?>" required>
                </div>

                <div class="campo-formulario">
                    <label for="hora">Hora:</label>
                    <input type="time" id="hora" name="hora" value="<?php echo htmlspecialchars($agendamiento['hora']); ?>" required>
                </div>

                <div class="campo-formulario">
                    <label for="persona">Persona que agenda:</label>
                    <input type="text" id="persona" name="persona" value="<?php echo htmlspecialchars($agendamiento['persona']); ?>" required>
                </div>

                <div class="campo-formulario">
                    <label for="motivo">Motivo de agendamiento:</label>
                    <textarea id="motivo" name="motivo" rows="3" required><?php echo htmlspecialchars($agendamiento['motivo']); ?></textarea>
                </div>

                <div class="campo-formulario">
                    <label for="duracion">Duración de la reunión:</label>
                    <select id="duracion" name="duracion_minutos" required>
                        <option value="30" <?php if ($agendamiento['duracion_minutos'] == 30) echo 'selected'; ?>>30 minutos</option>
                        <option value="45" <?php if ($agendamiento['duracion_minutos'] == 45) echo 'selected'; ?>>45 minutos</option>
                        <option value="60" <?php if ($agendamiento['duracion_minutos'] == 60) echo 'selected'; ?>>1 hora</option>
                        <option value="90" <?php if ($agendamiento['duracion_minutos'] == 90) echo 'selected'; ?>>1 hora y 30 minutos</option>
                        <option value="120" <?php if ($agendamiento['duracion_minutos'] == 120) echo 'selected'; ?>>2 horas</option>
                    </select>
                </div>

                <div class="botones-formulario">
                    <a href="../Fecha.html" class="btn-nav" style="text-decoration: none;">Cancelar</a>
                    <button type="submit" class="btn-enviar">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>