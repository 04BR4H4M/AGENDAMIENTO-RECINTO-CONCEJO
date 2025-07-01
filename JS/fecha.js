document.addEventListener('DOMContentLoaded', function() {
    // --- VARIABLES GLOBALES ---
    let horasDisponiblesPorDia = {};
    let todosLosAgendamientos = []; // Guardaremos todas las citas aquí para poder buscarlas
    const datosAgendamiento = { fecha: null, hora: null };

    // --- ELEMENTOS DEL DOM ---
    const contenedorGrid = document.querySelector(".calendario-grid");
    const mesAnio = document.getElementById("mes-anio");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const formulario = document.getElementById('formulario-agendamiento');
    const campoBuscador = document.getElementById('buscador');

    if (!contenedorGrid) {
        console.error("Error Crítico: No se encontró el contenedor del calendario (.calendario-grid).");
        return;
    }
    
    // --- LÓGICA DEL ASISTENTE (MOSTRAR/OCULTAR PASOS) ---
    window.irAPaso = function(numeroPaso) {
        document.querySelectorAll('.paso').forEach(paso => {
            paso.classList.remove('activo');
        });
        const pasoActual = document.getElementById(`paso-${numeroPaso}`);
        if (pasoActual) {
            pasoActual.classList.add('activo');
        }
        if (numeroPaso === 3) {
            document.getElementById('fecha-seleccionada').value = datosAgendamiento.fecha;
            document.getElementById('hora-seleccionada').value = datosAgendamiento.hora;
        }
    };

    // --- LÓGICA PARA LA LISTA DE AGENDAMIENTOS ---
    function mostrarListaAgendamientos(listaDeCitas) {
        const contenedorLista = document.getElementById('contenedor-lista');
        if (!contenedorLista) return;
        contenedorLista.innerHTML = '';

        if (listaDeCitas.length === 0) {
            contenedorLista.innerHTML = '<p class="sin-citas">No hay reuniones programadas.</p>';
            return;
        }
        
        listaDeCitas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

        listaDeCitas.forEach(cita => {
            const citaCard = document.createElement('div');
            citaCard.className = 'cita-card';
            const hora24 = parseInt(cita.hora.substring(0, 2));
            const minutos = cita.hora.substring(3, 5);
            const ampm = hora24 >= 12 ? 'PM' : 'AM';
            let hora12 = hora24 % 12;
            if (hora12 === 0) hora12 = 12;
            const horaFormateada = `${String(hora12).padStart(2, '0')}:${minutos} ${ampm}`;
            citaCard.innerHTML = `
                <div class="cita-info">
                    <p><strong>Fecha:</strong> ${cita.fecha}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <p><strong>Persona:</strong> ${cita.persona}</p>
                    <p><strong>Motivo:</strong> ${cita.motivo}</p>
                </div>
                <div class="cita-acciones">
                    <button class="btn-editar" onclick="editarAgendamiento(${cita.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarAgendamiento(${cita.id})">Eliminar</button>
                </div>`;
            contenedorLista.appendChild(citaCard);
        });
    }

    window.eliminarAgendamiento = function(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este agendamiento?')) {
            fetch(`./PHP/eliminar_agendamiento.php?id=${id}`)
                .then(response => response.text()).then(respuesta => {
                    alert(respuesta);
                    location.reload();
                }).catch(error => console.error('Error al eliminar:', error));
        }
    }
    
    window.editarAgendamiento = function(id) {
        window.location.href = `./PHP/editar_agendamiento.php?id=${id}`;
    }

    // --- LÓGICA DEL CALENDARIO Y HORAS ---
    let fechaActual = new Date();
    let mes = fechaActual.getMonth();
    let anio = fechaActual.getFullYear();
    
    function generarHorariosDeTrabajo(intervaloMinutos = 30) {
        const horarios = [];
        for (let h = 8; h < 17; h++) {
            for (let m = 0; m < 60; m += intervaloMinutos) {
                horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
            }
        }
        return horarios;
    }

    function horaAMinutos(horaStr) {
        const [horas, minutos] = horaStr.split(':');
        return parseInt(horas) * 60 + parseInt(minutos);
    }

    function mostrarHorasDisponibles(fecha) {
        const contenedorHoras = document.getElementById('horas-disponibles-grid');
        contenedorHoras.innerHTML = '';
        const todasLasHorasPosibles = generarHorariosDeTrabajo();
        const citasDelDia = horasDisponiblesPorDia[fecha] || [];
        let slotsBloqueados = new Set();

        citasDelDia.forEach(cita => {
            const inicioEnMinutos = horaAMinutos(cita.hora);
            const duracion = parseInt(cita.duracion_minutos);
            const finEnMinutos = inicioEnMinutos + duracion;
            for (let i = inicioEnMinutos; i < finEnMinutos; i += 30) {
                slotsBloqueados.add(i);
            }
        });

        const horasLibres = todasLasHorasPosibles.filter(hora => {
            const minutosDeEstaHora = horaAMinutos(hora);
            return !slotsBloqueados.has(minutosDeEstaHora);
        });

        if (horasLibres.length > 0) {
            horasLibres.forEach(hora => {
                const botonHora = document.createElement('button');
                botonHora.classList.add('hora-disponible');
                const hora24 = parseInt(hora.substring(0, 2));
                const minutos = hora.substring(3, 5);
                const ampm = hora24 >= 12 ? 'PM' : 'AM';
                let hora12 = hora24 % 12;
                if (hora12 === 0) hora12 = 12;
                botonHora.textContent = `${String(hora12).padStart(2, '0')}:${minutos} ${ampm}`;
                botonHora.addEventListener('click', () => {
                    datosAgendamiento.hora = hora;
                    irAPaso(3);
                });
                contenedorHoras.appendChild(botonHora);
            });
        } else {
            contenedorHoras.innerHTML = '<p style="text-align:center; font-weight: bold;">No hay más horas disponibles para este día.</p>';
        }
    }

    function generarCalendario() {
        contenedorGrid.innerHTML = '';
        const diasSemana = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
        diasSemana.forEach(dia => {
            const diaNombreEl = document.createElement('div');
            diaNombreEl.classList.add('dia-nombre');
            diaNombreEl.textContent = dia;
            contenedorGrid.appendChild(diaNombreEl);
        });
        const primerDiaMes = new Date(anio, mes, 1).getDay();
        const diasEnMes = new Date(anio, mes + 1, 0).getDate();
        const ahora = new Date();
        const fechaHoy = ahora.toISOString().split("T")[0];
        const horaActual = ahora.getHours();
        const todasLasHorasPosibles = generarHorariosDeTrabajo();
        for (let i = 0; i < primerDiaMes; i++) {
            const espacio = document.createElement("div");
            espacio.classList.add("espacio-vacio");
            contenedorGrid.appendChild(espacio);
        }
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const diaElemento = document.createElement("div");
            diaElemento.classList.add("dia");
            const fecha = new Date(anio, mes, dia);
            const fechaFormato = fecha.toISOString().split("T")[0];
            const citasDelDia = horasDisponiblesPorDia[fechaFormato] || [];
            if ((new Date(fechaFormato) < new Date(fechaHoy)) || (fechaFormato === fechaHoy && horaActual >= 17) || fecha.getDay() === 0 || fecha.getDay() === 6 || (citasDelDia.length >= todasLasHorasPosibles.length && todasLasHorasPosibles.length > 0)) {
                diaElemento.classList.add("no-disponible-total");
            } else if (citasDelDia.length > 0) {
                diaElemento.classList.add("no-disponible");
            } else {
                diaElemento.classList.add("disponible");
            }
            if (fechaFormato === fechaHoy && !diaElemento.classList.contains('no-disponible-total')) {
                diaElemento.classList.add("actual");
            }
            diaElemento.textContent = dia;
            if (!diaElemento.classList.contains("no-disponible-total")) {
                diaElemento.addEventListener("click", () => {
                    datosAgendamiento.fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    mostrarHorasDisponibles(datosAgendamiento.fecha);
                    irAPaso(2);
                });
            }
            contenedorGrid.appendChild(diaElemento);
        }
        mesAnio.textContent = `${obtenerNombreMes(mes)} ${anio}`;
    }
    
    function obtenerNombreMes(mes) { const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; return meses[mes]; }
    
    // --- EVENT LISTENERS ---
    btnPrev.addEventListener("click", () => { mes--; if (mes < 0) { mes = 11; anio--; } generarCalendario(); });
    btnNext.addEventListener("click", () => { mes++; if (mes > 11) { mes = 0; anio++; } generarCalendario(); });
    
    if(campoBuscador) {
        campoBuscador.addEventListener('input', function() {
            const terminoBusqueda = campoBuscador.value.toLowerCase();
            const resultadosFiltrados = todosLosAgendamientos.filter(cita => {
                return cita.persona.toLowerCase().includes(terminoBusqueda) || 
                       cita.motivo.toLowerCase().includes(terminoBusqueda);
            });
            mostrarListaAgendamientos(resultadosFiltrados);
        });
    }

    if (formulario) {
        formulario.addEventListener('submit', function() {
            const btnEnviar = formulario.querySelector('.btn-enviar');
            btnEnviar.disabled = true;
            btnEnviar.textContent = 'Enviando...';
        });
    }

    // --- FETCH INICIAL DE DATOS ---
    fetch('./PHP/obtener_agendamientos.php')
        .then(response => response.json())
        .then(data => {
            horasDisponiblesPorDia = data;
            // Convertimos el objeto a un array plano para poder buscar y filtrar
            for (const fecha in data) {
                data[fecha].forEach(cita => {
                    todosLosAgendamientos.push({ ...cita, fecha: fecha });
                });
            }
            irAPaso(1);
            generarCalendario();
            mostrarListaAgendamientos(todosLosAgendamientos);
        })
        .catch(error => {
            console.error('Error al obtener los agendamientos:', error);
            irAPaso(1);
            generarCalendario();
        });
});