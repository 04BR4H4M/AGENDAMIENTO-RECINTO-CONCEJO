<?php
// Incluimos las clases de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Requerimos los archivos de la biblioteca
require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

// Incluimos tu archivo de configuración
include 'db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recogemos todos los datos del formulario
    $fecha = $_POST['fecha'];
    $hora = $_POST['hora'];
    $nombre = trim($_POST['nombre']);
    $email_solicitante = trim($_POST['email']);
    $motivo = trim($_POST['motivo']);
    $duracion_minutos = (int)$_POST['duracion_minutos'];
    
    // Guardamos en la base de datos
    $sql = "INSERT INTO agendamiento (fecha, hora, persona, motivo, duracion_minutos, email) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssis", $fecha, $hora, $nombre, $motivo, $duracion_minutos, $email_solicitante);

    if ($stmt->execute()) {
        $mail = new PHPMailer(true);
        try {
            // Configuración del servidor SMTP (tus datos)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
             $mail->Username   = 'jarmax112@gmail.com';
            $mail->Password   = 'adht lyni lgkt jdhv';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;

            // Remitente y Destinatario
            $mail->setFrom('jarmax112@gmail.com', 'Concejo Municipal de Nilo');
            $mail->addAddress($email_solicitante, $nombre);

            // ===== INICIO DE LA NUEVA TÉCNICA PARA EL LOGO =====
            
            // 1. Adjuntamos la imagen del logo directamente desde el archivo.
            // PHPMailer la convertirá y le asignará un ID único: 'logo_concejo'.
            // ¡Asegúrate de que la ruta '../Logo/...' sea correcta desde la carpeta PHP!
            $mail->addEmbeddedImage('../Logo/logo_concejo.png', 'logo_concejo');

            // Contenido del correo
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = 'Confirmación de Agendamiento de Reunión';
            
            $hora_formateada = date("g:i a", strtotime($hora));
            
            // 2. En el HTML, la imagen ahora hace referencia a ese ID con "cid:".
            $mail->Body    = '
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="padding: 20px 0 10px 0;">
                            <img src="cid:logo_concejo" width="80" alt="Logo Concejo Municipal de Nilo" style="display: block;">
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #5b9dff; padding: 30px 20px; color: #ffffff; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; font-size: 24px;">Confirmación de Reunión</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px; color: #555555; font-size: 16px; line-height: 1.5;">
                            <h2 style="font-size: 20px; color: #333333; margin: 0 0 20px 0;">¡Hola, ' . htmlspecialchars($nombre) . '!</h2>
                            <p style="margin: 0 0 20px 0;">Tu agendamiento ha sido confirmado con éxito. Estos son los detalles:</p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr><td style="padding: 5px 0;"><strong>Fecha:</strong></td><td style="padding: 5px 0;">' . htmlspecialchars($fecha) . '</td></tr>
                                <tr><td style="padding: 5px 0;"><strong>Hora:</strong></td><td style="padding: 5px 0;">' . htmlspecialchars($hora_formateada) . '</td></tr>
                                <tr><td style="padding: 5px 0;"><strong>Duración:</strong></td><td style="padding: 5px 0;">' . htmlspecialchars($duracion_minutos) . ' minutos</td></tr>
                                <tr><td style="padding: 5px 0;"><strong>Motivo:</strong></td><td style="padding: 5px 0;">' . htmlspecialchars($motivo) . '</td></tr>
                            </table>
                            <p style="margin: 30px 0 0 0;">Gracias por usar nuestro sistema de agendamiento.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0;">Concejo Municipal de Nilo</p>
                            <p style="margin: 5px 0 0 0;">Este es un correo generado automáticamente.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>';

            // ===== FIN DE LA NUEVA TÉCNICA =====

            $mail->send();
            
            header("Location: ../exito.html?status=correo_enviado");
            exit();

        } catch (Exception $e) {
            header("Location: ../exito.html?status=cita_guardada_pero_correo_fallo");
            exit();
        }
    } else {
        header("Location: ../Fecha.html?error=db_error");
        exit();
    }
}
?>