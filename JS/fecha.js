document.addEventListener('DOMContentLoaded', function() {
    // --- VARIABLES GLOBALES ---
    let horasDisponiblesPorDia = {};
    let todosLosAgendamientos = [];
    const datosAgendamiento = { fecha: null, hora: null };

    // --- ELEMENTOS DEL DOM ---
    const contenedorGrid = document.querySelector(".calendario-grid");
    const mesAnio = document.getElementById("mes-anio");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const formulario = document.getElementById('formulario-agendamiento');
    const campoBuscador = document.getElementById('buscador');
    const spinner = document.getElementById('spinner-calendario');

    if (!contenedorGrid) {
        console.error("Error Crítico: No se encontró el contenedor del calendario.");
        if(spinner) spinner.classList.add('oculto');
        return;
    }
    
    // --- LÓGICA DEL WIZARD MEJORADA ---
    window.irAPaso = function(numeroPaso) {
        // Remover clase activo de todos los pasos
        document.querySelectorAll('.paso').forEach(paso => {
            paso.classList.remove('activo');
        });
        
        // Activar el paso solicitado
        const pasoActual = document.getElementById(`paso-${numeroPaso}`);
        if (pasoActual) {
            pasoActual.classList.add('activo');
            
            // Scroll suave al inicio del contenedor
            pasoActual.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        // Si es el paso 3, llenar los campos ocultos
        if (numeroPaso === 3) {
            document.getElementById('fecha-seleccionada').value = datosAgendamiento.fecha;
            document.getElementById('hora-seleccionada').value = datosAgendamiento.hora;
            
            // Mostrar resumen de la selección
            mostrarResumenSeleccion();
        }
    };

    // --- FUNCIÓN PARA MOSTRAR RESUMEN ---
    function mostrarResumenSeleccion() {
        if (datosAgendamiento.fecha && datosAgendamiento.hora) {
            const fechaFormateada = new Date(datosAgendamiento.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const horaFormateada = new Date(`1970-01-01T${datosAgendamiento.hora}`).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            // Crear o actualizar el resumen
            let resumen = document.getElementById('resumen-seleccion');
            if (!resumen) {
                resumen = document.createElement('div');
                resumen.id = 'resumen-seleccion';
                resumen.className = 'resumen-seleccion';
                resumen.innerHTML = `
                    <h3>Resumen de su selección:</h3>
                    <div class="resumen-contenido">
                        <p><strong>Fecha:</strong> <span id="resumen-fecha"></span></p>
                        <p><strong>Hora:</strong> <span id="resumen-hora"></span></p>
                    </div>
                `;
                
                // Insertar antes del formulario
                const formulario = document.getElementById('formulario-agendamiento');
                formulario.parentNode.insertBefore(resumen, formulario);
                
                // Agregar estilos para el resumen
                const style = document.createElement('style');
                style.textContent = `
                    .resumen-seleccion {
                        background: var(--color-primario-light);
                        padding: var(--espacio-xl);
                        border-radius: var(--radio-lg);
                        margin-bottom: var(--espacio-xl);
                        border-left: 4px solid var(--color-primario);
                    }
                    .resumen-seleccion h3 {
                        color: var(--color-primario);
                        margin-bottom: var(--espacio-md);
                        font-size: 1.125rem;
                    }
                    .resumen-contenido p {
                        margin: var(--espacio-sm) 0;
                        color: var(--color-gris-dark);
                    }
                    .resumen-contenido strong {
                        color: var(--color-negro);
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.getElementById('resumen-fecha').textContent = fechaFormateada;
            document.getElementById('resumen-hora').textContent = horaFormateada;
        }
    }

    // --- LÓGICA PARA LA LISTA DE AGENDAMIENTOS MEJORADA ---
    function mostrarListaAgendamientos(listaDeCitas) {
        const contenedorLista = document.getElementById('contenedor-lista');
        if (!contenedorLista) return;
        
        contenedorLista.innerHTML = '';

        if (listaDeCitas.length === 0) {
            contenedorLista.innerHTML = `
                <div class="sin-citas">
                    <p>No hay reuniones programadas.</p>
                    <small>Las reuniones aparecerán aquí una vez que sean agendadas.</small>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha y hora (más recientes primero)
        listaDeCitas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

        listaDeCitas.forEach((cita, index) => {
            const citaCard = document.createElement('div');
            citaCard.className = 'cita-card';
            citaCard.style.animationDelay = `${index * 0.1}s`;
            
            const fechaFormateada = new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const horaFormateada = new Date(cita.fecha + 'T' + cita.hora).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            citaCard.innerHTML = `
                <div class="cita-info">
                    <p><strong>Fecha</strong>${fechaFormateada}</p>
                    <p><strong>Hora</strong>${horaFormateada}</p>
                    <p><strong>Persona</strong>${escapeHtml(cita.persona)}</p>
                    <p><strong>Motivo</strong>${escapeHtml(cita.motivo)}</p>
                    <p><strong>Duración</strong>${cita.duracion_minutos} minutos</p>
                </div>
                <div class="cita-acciones">
                    <button class="btn-editar" onclick="editarAgendamiento(${cita.id})" aria-label="Editar reunión de ${escapeHtml(cita.persona)}">
                        Editar
                    </button>
                    <button class="btn-eliminar" onclick="eliminarAgendamiento(${cita.id})" aria-label="Eliminar reunión de ${escapeHtml(cita.persona)}">
                        Eliminar
                    </button>
                </div>
            `;
            contenedorLista.appendChild(citaCard);
        });
    }

    // --- FUNCIÓN PARA ESCAPAR HTML ---
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // --- FUNCIONES GLOBALES PARA EDITAR Y ELIMINAR ---
    window.eliminarAgendamiento = function(id) {
        if (confirm('¿Está seguro de que desea eliminar esta reunión?\n\nEsta acción no se puede deshacer.')) {
            // Mostrar indicador de carga
            const btnEliminar = event.target;
            const textoOriginal = btnEliminar.textContent;
            btnEliminar.textContent = 'Eliminando...';
            btnEliminar.disabled = true;
            
            fetch(`./PHP/eliminar_agendamiento.php?id=${id}`)
                .then(response => response.text())
                .then(respuesta => {
                    // Mostrar notificación de éxito
                    Toastify({
                        text: respuesta,
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "linear-gradient(to right, #059669, #047857)",
                        className: "toastify-success"
                    }).showToast();
                    
                    // Recargar la página después de un breve delay
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error al eliminar:', error);
                    
                    // Restaurar el botón en caso de error
                    btnEliminar.textContent = textoOriginal;
                    btnEliminar.disabled = false;
                    
                    // Mostrar notificación de error
                    Toastify({
                        text: "Error al eliminar la reunión. Inténtelo nuevamente.",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "linear-gradient(to right, #dc2626, #b91c1c)",
                        className: "toastify-error"
                    }).showToast();
                });
        }
    }
    
    window.editarAgendamiento = function(id) {
        window.location.href = `./PHP/editar_agendamiento.php?id=${id}`;
    }

    // --- LÓGICA DEL CALENDARIO Y HORAS MEJORADA ---
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
        
        // Calcular slots bloqueados
        citasDelDia.forEach(cita => {
            const inicioEnMinutos = horaAMinutos(cita.hora);
            const duracion = parseInt(cita.duracion_minutos);
            const finEnMinutos = inicioEnMinutos + duracion;
            
            for (let i = inicioEnMinutos; i < finEnMinutos; i += 30) {
                slotsBloqueados.add(i);
            }
        });
        
        const horasLibres = todasLasHorasPosibles.filter(hora => !slotsBloqueados.has(horaAMinutos(hora)));
        
        if (horasLibres.length > 0) {
            horasLibres.forEach((hora, index) => {
                const botonHora = document.createElement('button');
                botonHora.classList.add('hora-disponible');
                botonHora.style.animationDelay = `${index * 0.1}s`;
                
                const horaDate = new Date(`1970-01-01T${hora}`);
                botonHora.textContent = horaDate.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                
                botonHora.setAttribute('aria-label', `Seleccionar hora ${botonHora.textContent}`);
                
                botonHora.addEventListener('click', () => {
                    datosAgendamiento.hora = hora;
                    
                    // Efecto visual de selección
                    botonHora.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        irAPaso(3);
                    }, 150);
                });
                
                contenedorHoras.appendChild(botonHora);
            });
        } else {
            contenedorHoras.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: var(--espacio-2xl);">
                    <p style="font-size: 1.125rem; font-weight: var(--peso-semibold); color: var(--color-gris-dark); margin-bottom: var(--espacio-md);">
                        No hay horarios disponibles
                    </p>
                    <p style="color: var(--color-gris); font-size: 0.875rem;">
                        Todos los horarios para este día están ocupados. Por favor, seleccione otra fecha.
                    </p>
                </div>
            `;
        }
    }

    function generarCalendario() {
        contenedorGrid.innerHTML = '';
        
        // Días de la semana
        const diasSemana = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
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
        
        // Espacios vacíos al inicio
        for (let i = 0; i < primerDiaMes; i++) {
            const espacio = document.createElement("div");
            espacio.classList.add("espacio-vacio");
            contenedorGrid.appendChild(espacio);
        }
        
        // Días del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const diaElemento = document.createElement("div");
            diaElemento.classList.add("dia");
            diaElemento.style.animationDelay = `${dia * 0.02}s`;
            
            const fecha = new Date(anio, mes, dia);
            const fechaFormato = fecha.toISOString().split("T")[0];
            const citasDelDia = horasDisponiblesPorDia[fechaFormato] || [];
            
            // Determinar el estado del día
            const esPasado = new Date(fechaFormato) < new Date(fechaHoy);
            const esHoy = fechaFormato === fechaHoy;
            const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
            const horasPasadas = esHoy && horaActual >= 17;
            const todoOcupado = citasDelDia.length >= todasLasHorasPosibles.length && todasLasHorasPosibles.length > 0;
            
            if (esPasado || horasPasadas || esFinDeSemana || todoOcupado) {
                diaElemento.classList.add("no-disponible-total");
            } else if (citasDelDia.length > 0) {
                diaElemento.classList.add("no-disponible");
            } else {
                diaElemento.classList.add("disponible");
            }
            
            if (esHoy && !diaElemento.classList.contains('no-disponible-total')) {
                diaElemento.classList.add("actual");
            }
            
            diaElemento.textContent = dia;
            diaElemento.setAttribute('aria-label', `${dia} de ${obtenerNombreMes(mes)} de ${anio}`);
            
            if (!diaElemento.classList.contains("no-disponible-total")) {
                diaElemento.addEventListener("click", () => {
                    datosAgendamiento.fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                    
                    // Efecto visual de selección
                    diaElemento.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        mostrarHorasDisponibles(datosAgendamiento.fecha);
                        irAPaso(2);
                    }, 150);
                });
            }
            
            contenedorGrid.appendChild(diaElemento);
        }
        
        mesAnio.textContent = `${obtenerNombreMes(mes)} ${anio}`;
    }
    
    function obtenerNombreMes(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes];
    }
    
    // --- EVENT LISTENERS MEJORADOS ---
    btnPrev.addEventListener("click", () => {
        if(spinner) spinner.classList.remove('oculto');
        mes--;
        if (mes < 0) {
            mes = 11;
            anio--;
        }
        setTimeout(() => {
            generarCalendario();
            if(spinner) spinner.classList.add('oculto');
        }, 100);
    });
    
    btnNext.addEventListener("click", () => {
        if(spinner) spinner.classList.remove('oculto');
        mes++;
        if (mes > 11) {
            mes = 0;
            anio++;
        }
        setTimeout(() => {
            generarCalendario();
            if(spinner) spinner.classList.add('oculto');
        }, 100);
    });
    
    // Búsqueda mejorada con debounce
    if(campoBuscador) {
        let timeoutId;
        campoBuscador.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const terminoBusqueda = this.value.toLowerCase().trim();
                const resultadosFiltrados = todosLosAgendamientos.filter(cita => 
                    cita.persona.toLowerCase().includes(terminoBusqueda) || 
                    cita.motivo.toLowerCase().includes(terminoBusqueda)
                );
                mostrarListaAgendamientos(resultadosFiltrados);
            }, 300);
        });
    }
    
    // Manejo del formulario mejorado
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            const btnEnviar = formulario.querySelector('.btn-enviar');
            
            // Validaciones adicionales
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const motivo = document.getElementById('motivo').value.trim();
            
            if (!nombre || !email || !motivo) {
                e.preventDefault();
                Toastify({
                    text: "Por favor, complete todos los campos obligatorios.",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "linear-gradient(to right, #dc2626, #b91c1c)"
                }).showToast();
                return;
            }
            
            // Cambiar estado del botón
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></span>
                Enviando...
            `;
        });
    }

    // --- FETCH INICIAL DE DATOS MEJORADO ---
    if(spinner) spinner.classList.remove('oculto');

    fetch('./PHP/obtener_agendamientos.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            horasDisponiblesPorDia = data;
            todosLosAgendamientos = [];
            
            // Procesar datos
            for (const fecha in data) {
                data[fecha].forEach(cita => {
                    todosLosAgendamientos.push({ ...cita, fecha: fecha });
                });
            }
            
            // Inicializar interfaz
            irAPaso(1);
            generarCalendario();
            mostrarListaAgendamientos(todosLosAgendamientos);
        })
        .catch(error => {
            console.error('Error al obtener los agendamientos:', error);
            
            // Mostrar mensaje de error al usuario
            Toastify({
                text: "Error al cargar los datos. Por favor, recargue la página.",
                duration: 5000,
                gravity: "top",
                position: "right",
                backgroundColor: "linear-gradient(to right, #dc2626, #b91c1c)"
            }).showToast();
            
            // Inicializar interfaz sin datos
            irAPaso(1);
            generarCalendario();
            mostrarListaAgendamientos([]);
        })
        .finally(() => {
            if(spinner) spinner.classList.add('oculto');
        });

    // --- NAVEGACIÓN CON TECLADO ---
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Cerrar modales o volver al paso anterior
            const pasoActual = document.querySelector('.paso.activo');
            if (pasoActual && pasoActual.id !== 'paso-1') {
                const numeroActual = parseInt(pasoActual.id.split('-')[1]);
                if (numeroActual > 1) {
                    irAPaso(numeroActual - 1);
                }
            }
        }
    });
});