// Función para convertir la hora de 24 horas a 12 horas
function formatearHora12(hora24) {
    const [hora, minuto] = hora24.split(':');
    const horaInt = parseInt(hora, 10);
    const sufijo = horaInt >= 12 ? 'PM' : 'AM';
    const hora12 = horaInt % 12 || 12; // Convertir 0 a 12 para la medianoche
    return `${hora12}:${minuto} ${sufijo}`;
}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fecha = urlParams.get('fecha');
    const hora = urlParams.get('hora');
    document.getElementById('fecha').value = fecha;
    document.getElementById('hora').value = hora;

    // Obtener y mostrar los agendamientos del mes
    fetch('PHP/obtener_agendamientos.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Agendamientos obtenidos:', data); // Agregar esta línea para depuración
            const resumenContainer = document.getElementById('resumen-agendamientos');
            if (data.length === 0) {
                resumenContainer.innerHTML = '<p>No hay agendamientos para este mes.</p>';
            } else {
                data.forEach(agendamiento => {
                    const agendamientoDiv = document.createElement('div');
                    agendamientoDiv.classList.add('agendamiento');
                    agendamientoDiv.innerHTML = `
                        <p><strong>Fecha:</strong> ${agendamiento.fecha}</p>
                        <p><strong>Hora:</strong> ${formatearHora12(agendamiento.hora)}</p>
                        <p><strong>Persona:</strong> ${agendamiento.persona}</p>
                        <p><strong>Motivo:</strong> ${agendamiento.motivo}</p>
                    `;
                    resumenContainer.appendChild(agendamientoDiv);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const resumenContainer = document.getElementById('resumen-agendamientos');
            resumenContainer.innerHTML = '<p>Error al obtener los agendamientos.</p>';
        });

    // Agregar evento de redirección al botón "Nuevo agendamiento"
    document.getElementById('nuevo-agendamiento').addEventListener('click', () => {
        window.location.href = 'Fecha.html';
    });
};

document.getElementById('form-agendamiento').addEventListener('submit', function(event) {
    event.preventDefault();
    const persona = document.getElementById('persona').value;
    const motivo = document.getElementById('motivo').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    fetch('PHP/guardar_agendamiento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `persona=${persona}&motivo=${motivo}&fecha=${fecha}&hora=${hora}`
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        window.location.href = 'Datos.html';
    })
    .catch(error => console.error('Error:', error));
});