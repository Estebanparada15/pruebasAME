/*Código para el botón tipo hamburguesa en dispositivos moviles*/

document.addEventListener('DOMContentLoaded',() => {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});

document.addEventListener("DOMContentLoaded", cargarEmpresas);
window.onload = cargarEmpresas;

let empresas = [];
let pruebas = [];
function mostrarFormulario(seccion) {
    const contenedor = document.getElementById('contenedor');
    contenedor.innerHTML = '';

    if (seccion === 'gestionar-empresas') {

        // Crear la barra de búsqueda
        let buscador = document.createElement("input");
        buscador.type = "text";
        buscador.id = "buscador";
        buscador.placeholder = "Buscar empresa...";
        buscador.style.width = "100%";
        buscador.style.padding = "10px";
        buscador.style.marginBottom = "10px";
        buscador.style.border = "1px solid #ccc";
        buscador.style.borderRadius = "5px";
        buscador.style.fontSize = "16px";

        // Crear la tabla
        let tabla = document.createElement("table");
        tabla.classList.add("tabla-empresas");

        // Crear el encabezado de la tabla
        let thead = document.createElement("thead");
        let encabezado = `<tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>R/L</th>
                        <th>Puntos</th>`;

        // Suponiendo que todas las empresas tienen la misma cantidad de puntos
        let maxPuntos = Math.max(...empresas.map(e => e.alturas.length));

        for (let i = 0; i < maxPuntos; i++) {
            encabezado += `<th>Altura ${i + 1}</th>`;
        }

        encabezado += `</tr>`;
        thead.innerHTML = encabezado;
        tabla.appendChild(thead);

        // Crear el cuerpo de la tabla
        let tbody = document.createElement("tbody");
        empresas.forEach(empresa => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${empresa.nombre}</td>
                <td>${empresa.tipo}</td>
                <td>${empresa.radio}m</td>
                <td>${empresa.puntos}</td>`;

                // Agregar cada altura en una celda diferente
                for (let i = 0; i < maxPuntos; i++) {
                    let altura = empresa.alturas[i] !== undefined ? empresa.alturas[i] : "-"; 
                    fila.innerHTML += `<td>${altura}m</td>`;
                }

            tbody.appendChild(fila);
        });
        
        //Agregar evento de búsqueda
        buscador.addEventListener("input", function() {
            let filtro = this.value.toLowerCase();
            let filas = document.querySelectorAll("#tablaEmpresas tbody tr");

            filas.forEach(fila => {
                let nombreEmpresa = fila.querySelector("td").textContent.toLocaleLowerCase();
                fila.style.display = nombreEmpresa.includes(filtro) ? "" : "none";
            });
        });

        tabla.appendChild(tbody);
        contenedor.appendChild(buscador);
        contenedor.appendChild(tabla);

        // **FORMULARIO PARA AGREGAR EMPRESAS**
        let formHTML = `
            <h3 style="margin-top: 20px; text-align: center;">Agregar Nueva Empresa</h3>
            <form id="form-nueva-empresa" onsubmit="agregarEmpresa(event)">
                <label>Nombre: <input type="text" name="nombre" required></label>
                <label>Tipo de Reactor: 
                    <select name="tipo">
                        <option value="circular">Circular</option>
                        <option value="cuadrado">Cuadrado</option>
                    </select>
                </label>
                <label>Radio (m): <input type="number" name="radio" step="0.01"></label>
                <label>Número de Puntos: <input type="number" name="puntos" required></label>
                <label>Alturas (separadas por coma): <input type="text" name="alturas" required></label>
                <button type="submit">Agregar Empresa</button>
            </form>
        `;
        
        let formContainer = document.createElement("div");
        formContainer.innerHTML = formHTML;
        contenedor.appendChild(formContainer);

    } else if (seccion === 'nueva-prueba') {
        let empresaOptions = empresas.map((empresa, idx) => `<option value="${idx}">${empresa.nombre}</option>`).join('');
    
        contenedor.innerHTML = `
            <h2 style="text-align: center;">Agregar Nueva Prueba</h2>
            <form id="form-nueva-prueba" onsubmit="guardarPrueba(event)">
                <label for="empresa">Empresa:</label>
                <select id="empresa" name="empresa">
                    ${empresaOptions}
                </select>
    
                <label for="fechaInicio">Fecha de Inicio:</label>
                <input type="date" id="fechaInicio" name="fechaInicio">
    
                <label for="tipoPrueba">Tipo de Prueba:</label>
                <select id="tipoPrueba" name="tipo">
                    <option value="analisis">Análisis</option>
                    <option value="reporte">Reporte</option>
                </select>
    
                <label for="numPuntos">Número de Puntos:</label>
                <input type="number" id="numPuntos" min="1" required oninput="generarCampos()">
    
                <div id="camposContainer"></div>
    
                <button type="submit">Guardar Prueba</button>
            </form>
        `;
    } else if (seccion === 'historial-prueba') {
        let html = '<h2>Historial de Pruebas</h2>';
        pruebas.forEach((prueba, index) => {
            html += `
                <div class="prueba" id="prueba-${index}">
                    <p><strong>${prueba.empresa}</strong> - Tipo: ${prueba.tipo} - Fecha: ${prueba.fecha}</p>
                    <button onclick="eliminarPrueba(${index})">Eliminar</button>
                </div>
            `;
        });
        contenedor.innerHTML = html;
    }
}
async function agregarEmpresa(event) {
    event.preventDefault();
    const form = event.target;  // Guardamos la referencia al formulario
    const formData = new FormData(form);

    const nuevaEmpresa = {
        nombre: formData.get('nombre'),
        tipo: formData.get('tipo'),
        radio: parseFloat(formData.get('radio')) || null,
        puntos: parseInt(formData.get('puntos')),
        alturas: formData.get('alturas').split(',').map(a => parseFloat(a.trim()))
    };

    try {
        let response = await fetch("http://127.0.0.1:3000/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaEmpresa)
        });

        if (response.ok) {
            form.reset();  // Limpiar el formulario
            cargarEmpresas();  // Refrescar la tabla
        }
    } catch (error) {
        console.error("Error al agregar empresa:", error);
    }
}

function agregarFilaTabla(empresa, index) {
    let tbody = document.querySelector(".tabla-empresas tbody");
    let fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${empresa.nombre}</td>
        <td>${empresa.tipo}</td>
        <td>${empresa.radio}m</td>
        <td>${empresa.puntos}</td>
        ${empresa.alturas.map(altura => `<td>${altura}m</td>`).join("")}
        <td>
            <button onclick="eliminarEmpresa('${empresa.nombre}')" style="color: red; font-size: 20px; border: none; background: none;">−</button>
        </td>
    `;

    tbody.appendChild(fila);
}


async function eliminarEmpresa(nombreEmpresa) {
    if (!confirm("¿Seguro que deseas eliminar esta empresa?")) return;

    try {
        let response = await fetch(`http://127.0.0.1:5000/empresas/${nombreEmpresa}`, {
            method: "DELETE"
        });

        if (response.ok) {
            cargarEmpresas();  // Recargar la tabla después de eliminar
        }
    } catch (error) {
        console.error("Error al eliminar empresa:", error);
    }
}


function actualizarTabla() {
    let tbody = document.querySelector(".tabla-empresas tbody");
    tbody.innerHTML = ""; // Limpiar la tabla

    empresas.forEach((empresa, index) => {
        agregarFilaATabla(empresa, index);
    });
}
async function cargarEmpresas() {
    try {
        let response = await fetch("http://127.0.0.1:3000/templates/index.html");
        let datos = await response.json();

        let tbody = document.querySelector("#tabla-empresas tbody");
        tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevas filas

        empresas.forEach((empresa, index) => {
            agregarFilaTabla(empresa, index);
        });

    } catch (error) {
        console.error("Error al cargar empresas:", error);
    }
}

function guardarPrueba(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const prueba = {
        empresa: empresas[formData.get('empresa')].nombre,
        fechaInicio: formData.get('fechaInicio') || 'No especificada',
        fecha: formData.get('fecha') || 'No especificada',
        tipo: formData.get('tipo')
    };
    pruebas.push(prueba);
    mostrarFormulario('historial-pruebas');
}

function eliminarPrueba(index) {  
        pruebas.splice(index, 1);
        mostrarFormulario('historial-pruebas');

}

function generarCampos() {
    const numPuntos = document.getElementById('numPuntos').value;
    const container = document.getElementById('camposContainer');
    container.innerHTML = ''; //Limpiar campos previos

    for (let i = 1; i <= numPuntos; i++) {
        let div = document.createElement('div');
        div.className = 'container';
        div.innerHTML = `
            <h4>Punto ${i}</h4>
            <div class="inputs">
                <label>Muestra (ml):</label>
                <input type="number" step="1" placeholder="Ingrese ml">
            </div>
            <div class="inputs">
                <label>Peso en vacío:</label>
                <input type="number" step="0.0001" placeholder="Ingrese peso">
            </div>
            <div class="inputs">
                <label>Peso 110 °C:</label>
                <input type="number" step="0.0001" placeholder="Ingrese peso">
            </div>
        `;
        container.appendChild(div);
    }
}
function actualizarTablaEmpresas() {
    const tbody = document.querySelector("#tablaEmpresas tbody");
    tbody.innerHTML = ""; // Limpiar la tabla antes de actualizarla

    // Iterar sobre la lista de empresas y agregarlas a la tabla
    empresas.forEach(empresa => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><strong>${empresa.nombre}</strong></td>
            <td>${empresa.tipo}</td>
            <td>${empresa.radio}</td>
            <td>${empresa.puntos}</td>
            <td>${empresa.alturas}</td>
        `;

        tbody.appendChild(fila);
    });
}