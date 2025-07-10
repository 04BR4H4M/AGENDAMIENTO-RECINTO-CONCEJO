document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicación de agendamiento...');
    
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

    // Verificación exhaustiva de elementos críticos
    console.log('🔍 Verificando elementos del DOM...');
    console.log('- Contenedor calendario:', contenedorGrid ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Mes/Año:', mesAnio ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Botón anterior:', btnPrev ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Botón siguiente:', btnNext ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Formulario:', formulario ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Buscador:', campoBuscador ? '✅ Encontrado' : '❌ NO encontrado');
    console.log('- Spinner:', spinner ? '✅ Encontrado' : '❌ NO encontrado');

    // Verificar que los elementos críticos existen
    if (!contenedorGrid) {
        console.error("❌ CRÍTICO: No se encontró .calendario-grid");
        alert("Error crítico: No se puede cargar el calendario. El elemento .calendario-grid no existe.");
        return;
    }

    if (!mesAnio) {
        console.error("❌ CRÍTICO: No se encontró #mes-anio");
        alert("Error crítico: No se puede cargar el calendario. El elemento #mes-anio no existe.");
        return;
    }

    // --- FUNCIÓN PARA GENERAR CALENDARIO (INDEPENDIENTE DE DATOS) ---
    let fechaActual = new Date();
    let mes = fechaActual.getMonth();
    let anio = fechaActual.getFullYear();

    function obtenerNombreMes(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes];
    }

    function generarCalendario() {
        console.log(`📅 Generando calendario para ${obtenerNombreMes(mes)} ${anio}...`);
        
        // Limpiar contenido anterior
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
            
            const fecha = new Date(anio, mes, dia);
            const fechaFormato = fecha.toISOString().split("T")[0];
            const citasDelDia = horasDisponiblesPorDia[fechaFormato] || [];
            
            // Determinar el estado del día
            const esPasado = new Date(fechaFormato) < new Date(fechaHoy);
            const esHoy = fechaFormato === fechaHoy;
            const esFinDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
            
            if (esPasado || esFinDeSemana) {
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
            
            // Agregar evento click solo si no está deshabilitado
            if (!diaElemento.classList.contains("no-disponible-total")) {
                diaElemento.addEventListener("click", () => {
                    console.log(`📅 Día seleccionado: ${fechaFormato}`);
                    datosAgendamiento.fecha = fechaFormato;
                    mostrarHorasDisponibles(fechaFormato);
                    irAPaso(2);
                });
            }
            
            contenedorGrid.appendChild(diaElemento);
        }
        
        // Actualizar el título del mes
        mesAnio.textContent = `${obtenerNombreMes(mes)} ${anio}`;
        
        console.log(`✅ Calendario generado exitosamente: ${diasEnMes} días`);
    }

    // --- NAVEGACIÓN DEL CALENDARIO ---
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            console.log('⬅️ Navegando al mes anterior');
            mes--;
            if (mes < 0) {
                mes = 11;
                anio--;
            }
            generarCalendario();
        });
    }
    
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            console.log('➡️ Navegando al mes siguiente');
            mes++;
            if (mes > 11) {
                mes = 0;
                anio++;
            }
            generarCalendario();
        });
    }

    // --- LÓGICA DEL WIZARD ---
    window.irAPaso = function(numeroPaso) {
        console.log(`📍 Navegando al paso ${numeroPaso}`);
        
        document.querySelectorAll('.paso').forEach(paso => {
            paso.classList.remove('activo');
        });
        
        const pasoActual = document.getElementById(`paso-${numeroPaso}`);
        if (pasoActual) {
            pasoActual.classList.add('activo');
            pasoActual.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        if (numeroPaso === 3) {
            const fechaInput = document.getElementById('fecha-seleccionada');
            const horaInput = document.getElementById('hora-seleccionada');
            
            if (fechaInput && horaInput) {
                fechaInput.value = datosAgendamiento.fecha;
                horaInput.value = datosAgendamiento.hora;
            }
            
            mostrarResumenSeleccion();
        }
    };

    // --- FUNCIONES AUXILIARES ---
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
        if (!contenedorHoras) return;
        
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
        
        const horasLibres = todasLasHorasPosibles.filter(hora => !slotsBloqueados.has(horaAMinutos(hora)));
        
        if (horasLibres.length > 0) {
            horasLibres.forEach((hora) => {
                const botonHora = document.createElement('button');
                botonHora.classList.add('hora-disponible');
                
                const horaDate = new Date(`1970-01-01T${hora}`);
                botonHora.textContent = horaDate.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                
                botonHora.addEventListener('click', () => {
                    datosAgendamiento.hora = hora;
                    irAPaso(3);
                });
                
                contenedorHoras.appendChild(botonHora);
            });
        } else {
            contenedorHoras.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p>No hay horarios disponibles para este día.</p>
                </div>
            `;
        }
    }

    function mostrarListaAgendamientos(listaDeCitas) {
        const contenedorLista = document.getElementById('contenedor-lista');
        if (!contenedorLista) return;
        
        contenedorLista.innerHTML = '';

        if (listaDeCitas.length === 0) {
            contenedorLista.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>No hay reuniones programadas.</p>
                </div>
            `;
            return;
        }
        
        listaDeCitas.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

        listaDeCitas.forEach((cita) => {
            const citaCard = document.createElement('div');
            citaCard.className = 'cita-card';
            
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
                    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><strong>Hora:</strong> ${horaFormateada}</p>
                    <p><strong>Persona:</strong> ${cita.persona || 'N/A'}</p>
                    <p><strong>Motivo:</strong> ${cita.motivo || 'N/A'}</p>
                    <p><strong>Duración:</strong> ${cita.duracion_minutos || 60} minutos</p>
                </div>
                <div class="cita-acciones">
                    <button class="btn-editar" onclick="editarAgendamiento(${cita.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarAgendamiento(${cita.id})">Eliminar</button>
                </div>
            `;
            contenedorLista.appendChild(citaCard);
        });
    }

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
            
            let resumen = document.getElementById('resumen-seleccion');
            if (!resumen) {
                resumen = document.createElement('div');
                resumen.id = 'resumen-seleccion';
                resumen.style.cssText = `
                    background: #dbeafe;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    margin-bottom: 1.5rem;
                    border-left: 4px solid #2563eb;
                `;
                resumen.innerHTML = `
                    <h3 style="color: #2563eb; margin-bottom: 1rem;">Resumen de su selección:</h3>
                    <div>
                        <p><strong>Fecha:</strong> <span id="resumen-fecha"></span></p>
                        <p><strong>Hora:</strong> <span id="resumen-hora"></span></p>
                    </div>
                `;
                
                const formulario = document.getElementById('formulario-agendamiento');
                if (formulario) {
                    formulario.parentNode.insertBefore(resumen, formulario);
                }
            }
            
            const resumenFecha = document.getElementById('resumen-fecha');
            const resumenHora = document.getElementById('resumen-hora');
            
            if (resumenFecha && resumenHora) {
                resumenFecha.textContent = fechaFormateada;
                resumenHora.textContent = horaFormateada;
            }
        }
    }

    // --- FUNCIONES GLOBALES ---
    window.eliminarAgendamiento = function(id) {
        if (confirm('¿Está seguro de que desea eliminar esta reunión?')) {
            fetch(`./PHP/eliminar_agendamiento.php?id=${id}`)
                .then(response => response.text())
                .then(() => location.reload())
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al eliminar la reunión');
                });
        }
    }
    
    window.editarAgendamiento = function(id) {
        window.location.href = `./PHP/editar_agendamiento.php?id=${id}`;
    }

    // --- BÚSQUEDA ---
    if(campoBuscador) {
        let timeoutId;
        campoBuscador.addEventListener('input', function() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const terminoBusqueda = this.value.toLowerCase().trim();
                const resultadosFiltrados = todosLosAgendamientos.filter(cita => 
                    (cita.persona && cita.persona.toLowerCase().includes(terminoBusqueda)) || 
                    (cita.motivo && cita.motivo.toLowerCase().includes(terminoBusqueda))
                );
                mostrarListaAgendamientos(resultadosFiltrados);
            }, 300);
        });
    }

    // --- MANEJO DEL FORMULARIO ---
   // En fecha.js, dentro del if(formulario)
formulario.addEventListener('submit', function(e) {
    e.preventDefault(); // ¡Prevenimos el envío tradicional!

    const btnEnviar = formulario.querySelector('.btn-enviar');
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Guardando...';

    const formData = new FormData(formulario);

    fetch('./PHP/guardar_agendamiento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        Toastify({
            text: data.message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: data.success ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();

        if (data.success) {
            setTimeout(() => { location.href = 'exito.html'; }, 1500);
        } else {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Confirmar Agendamiento';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Confirmar Agendamiento';
    });
});

    // --- INICIALIZACIÓN ---
    function inicializarAplicacion() {
        console.log('🔄 Iniciando carga de datos...');
        
        // PRIMERO: Generar calendario básico inmediatamente
        console.log('📅 Generando calendario básico...');
        generarCalendario();
        irAPaso(1);
        
        // SEGUNDO: Intentar cargar datos del servidor
        if(spinner) spinner.classList.remove('oculto');

        fetch('./PHP/obtener_agendamientos.php')
            .then(response => {
                console.log(`📡 Respuesta del servidor: ${response.status}`);
                return response.text();
            })
            .then(text => {
                console.log('📄 Respuesta cruda (primeros 200 chars):', text.substring(0, 200));
                
                try {
                    const responseData = JSON.parse(text);
                    
                    if (responseData.error) {
                        throw new Error(responseData.message || 'Error del servidor');
                    }
                    
                    // Usar los datos del servidor
                    const data = responseData.data || responseData;
                    console.log('✅ Datos parseados:', Object.keys(data).length, 'fechas');
                    
                    horasDisponiblesPorDia = data;
                    todosLosAgendamientos = [];
                    
                    for (const fecha in data) {
                        data[fecha].forEach(cita => {
                            todosLosAgendamientos.push({ ...cita, fecha: fecha });
                        });
                    }
                    
                    console.log(`📊 Total agendamientos: ${todosLosAgendamientos.length}`);
                    
                    // Regenerar calendario con datos
                    generarCalendario();
                    mostrarListaAgendamientos(todosLosAgendamientos);
                    
                } catch (parseError) {
                    console.error('❌ Error al parsear JSON:', parseError);
                    console.log('Respuesta completa:', text);
                    
                    // Continuar con calendario básico
                    mostrarListaAgendamientos([]);
                }
            })
            .catch(error => {
                console.error('❌ Error al cargar datos:', error);
                
                // Continuar con calendario básico
                mostrarListaAgendamientos([]);
            })
            .finally(() => {
                if(spinner) spinner.classList.add('oculto');
                console.log('🏁 Inicialización completada');
            });
    }

    // --- INICIAR LA APLICACIÓN ---
    console.log('🎯 Iniciando aplicación...');
    inicializarAplicacion();
});