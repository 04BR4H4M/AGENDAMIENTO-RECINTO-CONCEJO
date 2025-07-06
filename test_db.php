<?php
// Archivo de prueba para verificar la conexión a la base de datos
echo "<h2>Prueba de Conexión a Base de Datos</h2>";

// Mostrar información de PHP
echo "<h3>Información del servidor:</h3>";
echo "PHP Version: " . phpversion() . "<br>";
echo "MySQL Extension: " . (extension_loaded('mysqli') ? 'Disponible' : 'NO disponible') . "<br>";

// Probar conexión
echo "<h3>Prueba de conexión:</h3>";
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "agendamientos";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    
    echo "✅ Conexión exitosa a la base de datos<br>";
    
    // Verificar si existe la tabla
    $result = $conn->query("SHOW TABLES LIKE 'agendamiento'");
    if ($result->num_rows > 0) {
        echo "✅ Tabla 'agendamiento' existe<br>";
        
        // Contar registros
        $count_result = $conn->query("SELECT COUNT(*) as total FROM agendamiento");
        $count = $count_result->fetch_assoc();
        echo "📊 Total de registros: " . $count['total'] . "<br>";
        
        // Mostrar estructura de la tabla
        echo "<h3>Estructura de la tabla:</h3>";
        $structure = $conn->query("DESCRIBE agendamiento");
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th></tr>";
        while ($row = $structure->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Mostrar algunos registros de ejemplo
        if ($count['total'] > 0) {
            echo "<h3>Registros de ejemplo:</h3>";
            $sample = $conn->query("SELECT * FROM agendamiento LIMIT 3");
            echo "<table border='1' style='border-collapse: collapse;'>";
            echo "<tr><th>ID</th><th>Fecha</th><th>Hora</th><th>Persona</th><th>Motivo</th><th>Duración</th></tr>";
            while ($row = $sample->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . $row['id'] . "</td>";
                echo "<td>" . $row['fecha'] . "</td>";
                echo "<td>" . $row['hora'] . "</td>";
                echo "<td>" . htmlspecialchars($row['persona']) . "</td>";
                echo "<td>" . htmlspecialchars($row['motivo']) . "</td>";
                echo "<td>" . $row['duracion_minutos'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
        
    } else {
        echo "❌ La tabla 'agendamiento' NO existe<br>";
        echo "<p>Necesitas crear la tabla con este SQL:</p>";
        echo "<pre>
CREATE TABLE agendamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    persona VARCHAR(255) NOT NULL,
    motivo TEXT NOT NULL,
    duracion_minutos INT DEFAULT 60,
    email VARCHAR(255)
);
        </pre>";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

// Probar el archivo obtener_agendamientos.php
echo "<h3>Prueba del archivo obtener_agendamientos.php:</h3>";
echo "<a href='obtener_agendamientos.php' target='_blank'>Hacer clic aquí para probar obtener_agendamientos.php</a><br>";
echo "<small>Debería mostrar un JSON con los datos o un mensaje de error</small>";
?>