// Generar las opciones para las horas
function generarHoras() {
    const horaSelect = document.getElementById('hora');
    const horasInicio = 8; // 8:00 AM
    const horasFin = 17; // 5:00 PM

    for (let hora = horasInicio; hora <= horasFin; hora++) {
        const opcion = document.createElement('option');
        opcion.value = hora;
        opcion.textContent = formatearHora(hora);
        horaSelect.appendChild(opcion);
    }
}

// Generar las opciones para los minutos
function generarMinutos() {
    const minutoSelect = document.getElementById('minuto');

    for (let minuto = 0; minuto < 60; minuto++) {
        const opcion = document.createElement('option');
        opcion.value = minuto;
        opcion.textContent = minuto < 10 ? `0${minuto}` : minuto;
        minutoSelect.appendChild(opcion);
    }
}

// Formatear la hora en formato 12 horas
function formatearHora(hora) {
    const sufijo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora > 12 ? hora - 12 : hora;
    return `${hora12} ${sufijo}`;
}

// Llamar a las funciones al cargar la página
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fecha = urlParams.get('fecha');
    document.getElementById('fecha').value = fecha;
    generarHoras();
    generarMinutos();

    // Validar la hora seleccionada antes de redirigir
    document.querySelector('.boton-siguiente').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const fecha = urlParams.get('fecha');
        const hora = document.getElementById('hora').value;
        const minuto = document.getElementById('minuto').value.padStart(2, '0'); // Asegurar 2 dígitos
        
        window.location.href = `Datos.html?fecha=${fecha}&hora=${hora}:${minuto}`;
        });
    }