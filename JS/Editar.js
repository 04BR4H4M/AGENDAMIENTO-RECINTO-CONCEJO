window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID de agendamiento no proporcionado.');
        return;
    }

    fetch(`PHP/obtener_agendamiento.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            document.getElementById('id').value = data.id;
            document.getElementById('persona').value = data.persona;
            document.getElementById('motivo').value = data.motivo;
            document.getElementById('fecha').value = data.fecha;
            document.getElementById('hora').value = data.hora;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al obtener el agendamiento.');
        });

    document.getElementById('form-editar-agendamiento').addEventListener('submit', function(event) {
        event.preventDefault();

        const id = document.getElementById('id').value;
        const persona = document.getElementById('persona').value;
        const motivo = document.getElementById('motivo').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;

        if (!id || !persona || !motivo || !fecha || !hora) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        const datos = new URLSearchParams();
        datos.append('id', id);
        datos.append('persona', persona);
        datos.append('motivo', motivo);
        datos.append('fecha', fecha);
        datos.append('hora', hora);

        fetch('PHP/actualizar_agendamiento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: datos,
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            window.location.href = 'Datos.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar el agendamiento.');
        });
    });
};