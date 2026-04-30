/**
 * MAIN.JS - SISTEMA DE GESTIÓN DE LOGBOOK VEHICULAR
 * Arquitectura: Lógica centralizada de persistencia y cálculos de ingeniería.
 */

// 1. CARGA INICIAL DE DATOS
let registrosConsumo = JSON.parse(localStorage.getItem('logbook_consumo')) || [];
let registrosMantenimiento = JSON.parse(localStorage.getItem('logbook_mantenimiento')) || [];

// 2. MÓDULO DE CONSUMO Y EFICIENCIA[cite: 1]
function registrarConsumo() {
    const kmActual = parseFloat(document.getElementById('km-actual').value);
    const litros = parseFloat(document.getElementById('litros-carga').value);
    const fecha = new Date().toLocaleDateString();

    if (isNaN(kmActual) || isNaN(litros) || kmActual <= 0 || litros <= 0) {
        return alert("Por favor, ingresa valores numéricos válidos[cite: 1].");
    }

    let eficiencia = 0;
    
    // Algoritmo de comparación con el registro anterior[cite: 1]
    if (registrosConsumo.length > 0) {
        const ultimoKM = registrosConsumo[0].km;
        if (kmActual > ultimoKM) {
            eficiencia = ((kmActual - ultimoKM) / litros).toFixed(2);
        } else {
            return alert("El kilometraje actual debe ser mayor al anterior.");
        }
    }

    const nuevoRegistro = { fecha, km: kmActual, litros, eficiencia };
    registrosConsumo.unshift(nuevoRegistro);
    
    localStorage.setItem('logbook_consumo', JSON.stringify(registrosConsumo));
    actualizarInterfaz();
    
    // Limpiar campos
    document.getElementById('km-actual').value = "";
    document.getElementById('litros-carga').value = "";
}

// 3. MÓDULO DE MANTENIMIENTO TÉCNICO[cite: 1]
function registrarMantenimiento() {
    const desc = document.getElementById('mant-desc').value;
    const tipo = document.getElementById('mant-tipo').value;
    const fecha = new Date().toLocaleDateString();

    if (desc.trim() === "") return alert("La descripción es obligatoria.");

    const nuevoMant = { fecha, desc, tipo };
    registrosMantenimiento.unshift(nuevoMant);
    
    localStorage.setItem('logbook_mantenimiento', JSON.stringify(registrosMantenimiento));
    actualizarInterfaz(); // Refresca ambas tablas y KPIs
    
    document.getElementById('mant-desc').value = "";
}

// 4. ACTUALIZACIÓN GLOBAL DE LA INTERFAZ (DOM)[cite: 1]
function actualizarInterfaz() {
    // Actualizar Tabla de Consumo
    const tablaConsumo = document.querySelector("#tabla-consumo tbody");
    if (tablaConsumo) {
        tablaConsumo.innerHTML = registrosConsumo.map(reg => `
            <tr>
                <td>${reg.fecha}</td>
                <td>${reg.km}</td>
                <td>${reg.litros}</td>
                <td><span class="badge">${reg.eficiencia > 0 ? reg.eficiencia + ' km/l' : 'Carga Base'}</span></td>
            </tr>
        `).join('');
    }

    // Actualizar Tabla de Mantenimiento
    const tablaMant = document.querySelector("#tabla-mantenimiento tbody");
    if (tablaMant) {
        tablaMant.innerHTML = registrosMantenimiento.map(m => `
            <tr>
                <td>${m.fecha}</td>
                <td>${m.desc}</td>
                <td><span class="badge" style="background: rgba(79, 172, 254, 0.2);">${m.tipo}</span></td>
            </tr>
        `).join('');
    }

    // Actualizar KPIs del Dashboard[cite: 1]
    actualizarKPIs();
}

function actualizarKPIs() {
    const kpiVehiculos = document.getElementById('kpi-vehiculos');
    const kpiEficiencia = document.getElementById('kpi-eficiencia');
    const kpiRegistros = document.getElementById('kpi-estado'); // Reutilizado para contador total

    if (kpiVehiculos) kpiVehiculos.innerText = "1"; // Valor estático para MVP
    
    if (kpiEficiencia && registrosConsumo.length > 0) {
        const ultimaEf = registrosConsumo[0].eficiencia;
        kpiEficiencia.innerText = ultimaEf > 0 ? `${ultimaEf} km/l` : "Base";
    }

    if (kpiRegistros) {
        const total = registrosConsumo.length + registrosMantenimiento.length;
        kpiRegistros.innerText = `${total} eventos`;
    }
}

// 5. NAVEGACIÓN SPA (Single Page Application)[cite: 1]
function showTab(tabId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    // Desactivar todos los botones
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Mostrar sección actual
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    
    // Marcar botón activo
    if (event) event.currentTarget.classList.add('active');
}

// Inicialización al cargar la ventana
window.onload = actualizarInterfaz;

let flota = JSON.parse(localStorage.getItem('logbook_flota')) || [];
let vehiculoSeleccionadoId = null;

function guardarVehiculo() {
    const vehiculo = {
        id: Date.now(),
        marca: document.getElementById('v-marca').value,
        modelo: document.getElementById('v-modelo').value,
        patente: document.getElementById('v-patente').value,
        chasis: document.getElementById('v-chasis').value,
        dueno: document.getElementById('v-dueno').value,
        estado: document.getElementById('v-estado').value // Nuevo campo: activo, mantenimiento, inactivo
    };

    if(!vehiculo.patente || !vehiculo.modelo) return alert("Faltan datos críticos.");

    flota.push(vehiculo);
    localStorage.setItem('logbook_flota', JSON.stringify(flota));
    cerrarModal();
    renderizarFlota();
}

function renderizarFlota() {
    const grid = document.getElementById('grid-vehiculos');
    if(!grid) return;

    grid.innerHTML = flota.map(v => `
        <div class="vehicle-card ${vehiculoSeleccionadoId === v.id ? 'selected' : ''}" 
             onclick="seleccionarVehiculo(${v.id})">
            <span class="patente-tag">${v.patente}</span>
            <h4>${v.modelo}</h4>
            <p><span class="status-dot status-${v.estado}"></span>${v.estado.toUpperCase()}</p>
            <p><strong>${v.marca}</strong> | ${v.dueno}</p>
        </div>
    `).join('');
}

// SELECTOR DE CONTEXTO
function seleccionarVehiculo(id) {
    vehiculoSeleccionadoId = id;
    const vehiculo = flota.find(v => v.id === id);
    
    // Feedback visual al usuario
    document.getElementById('kpi-estado').innerText = vehiculo.modelo;
    renderizarFlota();
    
    // Aquí puedes filtrar las tablas de consumo/mantenimiento para mostrar solo las de este ID
    actualizarInterfaz(); 
}
