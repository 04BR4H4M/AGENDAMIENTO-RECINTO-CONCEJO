// Variables globales para las fechas disponibles y ocupadas
let horasDisponiblesPorDia = {};

fetch('./PHP/obtener_horas.php')
    .then(response => response.json())
    .then(data => {
        horasDisponiblesPorDia = data;
        generarCalendario();
    });

const contenedorDias = document.getElementById("dias-del-mes");
const mesAnio = document.getElementById("mes-anio");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

let fechaActual = new Date();
let mes = fechaActual.getMonth();
let anio = fechaActual.getFullYear();

function generarCalendario() {
    contenedorDias.innerHTML = "";

    const primerDiaMes = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    // Rellenar los días del calendario
    for (let i = 0; i < primerDiaMes; i++) {
        const espacio = document.createElement("div");
        espacio.classList.add("espacio");
        contenedorDias.appendChild(espacio);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fecha = new Date(anio, mes, dia);
        const diaElemento = document.createElement("div");
        diaElemento.classList.add("dia");

        // Formato para comparar fechas
        const fechaFormato = fecha.toISOString().split("T")[0];

        // Verificar estado de la fecha
        if (fecha.getDay() === 0 || fecha.getDay() === 6 || horasDisponiblesPorDia[fechaFormato]?.length === 0) {
            diaElemento.classList.add("no-disponible-total");
        } else if (horasDisponiblesPorDia[fechaFormato]?.length > 0 && horasDisponiblesPorDia[fechaFormato]?.length < 3) {
            diaElemento.classList.add("no-disponible");
        } else {
            diaElemento.classList.add("disponible");
        }

        // Marcar el día actual
        if (fecha.toDateString() === new Date().toDateString()) {
            diaElemento.classList.add("actual");
        }

        diaElemento.textContent = dia;

        // Agregar funcionalidad de selección
        if (!diaElemento.classList.contains("no-disponible-total")) {
            diaElemento.addEventListener("click", () => {
                const fechaSeleccionada = `${anio}-${mes + 1}-${dia}`;
                window.location.href = `Hora.html?fecha=${fechaSeleccionada}`;
            });

            diaElemento.addEventListener("mouseover", () => {
                diaElemento.classList.add("seleccionada");
            });

            diaElemento.addEventListener("mouseout", () => {
                diaElemento.classList.remove("seleccionada");
            });
        }

        contenedorDias.appendChild(diaElemento);
    }

    // Actualizar el encabezado del mes y año
    mesAnio.textContent = `${obtenerNombreMes(mes)} ${anio}`;
}

function obtenerNombreMes(mes) {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return meses[mes];
}

// Cambiar el mes con los botones
btnPrev.addEventListener("click", () => {
    mes--;
    if (mes < 0) {
        mes = 11;
        anio--;
    }
    generarCalendario();
});

btnNext.addEventListener("click", () => {
    mes++;
    if (mes > 11) {
        mes = 0;
        anio++;
    }
    generarCalendario();
});
