/**
 * MAIN.JS - SISTEMA DE GESTIÓN DE FLOTA VEHICULAR PRO
 * Arquitectura: Persistencia vinculada por ID de vehículo y gestión de estados.
 */

// 1. ESTADO GLOBAL Y PERSISTENCIA
let flota = JSON.parse(localStorage.getItem('logbook_flota')) || [];
let registrosConsumo = JSON.parse(localStorage.getItem('logbook_consumo')) || [];
let registrosMantenimiento = JSON.parse(localStorage.getItem('logbook_mantenimiento')) || [];
let vehiculoSeleccionadoId = null;

// 2. GESTIÓN DE VEHÍCULOS (FLOTA)
function abrirModalVehiculo() {
    document.getElementById('modal-vehiculo').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-vehiculo').style.display = 'none';
    limpiarCamposVehiculo();
}

function guardarVehiculo() {
    const vehiculo = {
        id: Date.now(),
        marca: document.getElementById('v-marca').value,
        modelo: document.getElementById('v-modelo').value,
        patente: document.getElementById('v-patente').value,
        chasis: document.getElementById('v-chasis').value,
        dueno: document.getElementById('v-dueno').value,
        estado: document.getElementById('v-estado').value
    };

    if (!vehiculo.patente || !vehiculo.modelo) return alert("Patente y Modelo son obligatorios.");

    flota.push(vehiculo);
    localStorage.setItem('logbook_flota', JSON.stringify(flota));
    cerrarModal();
    actualizarInterfaz();
}

function seleccionarVehiculo(id) {
    vehiculoSeleccionadoId = id;
    const vehiculo = flota.find(v => v.id === id);
    
    // Actualizar indicador de contexto en el Sidebar[cite: 1]
    document.getElementById('current-vehicle-name').innerText = `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})`;
    
    actualizarInterfaz();
}

// 3. MÓDULO DE CONSUMO (LÓGICA DE INGENIERÍA)[cite: 1]
function registrarConsumo() {
    if (!vehiculoSeleccionadoId) return alert("Primero selecciona un vehículo de la flota.");

    const kmActual = parseFloat(document.getElementById('km-actual').value);
    const litros = parseFloat(document.getElementById('litros-carga').value);
    const fecha = new Date().toLocaleDateString();

    if (isNaN(kmActual) || isNaN(litros) || kmActual <= 0) return alert("Ingresa valores válidos.");

    // Filtrar consumos específicos del vehículo actual para el cálculo de eficiencia[cite: 1]
    const consumosVehiculo = registrosConsumo.filter(r => r.vehiculoId === vehiculoSeleccionadoId);
    
    let eficiencia = 0;
    if (consumosVehiculo.length > 0) {
        const ultimoKM = consumosVehiculo[0].km;
        if (kmActual > ultimoKM) {
            eficiencia = ((kmActual - ultimoKM) / litros).toFixed(2);
        } else {
            return alert("El KM actual debe ser mayor al anterior.");
        }
    }

    const nuevoRegistro = { 
        id: Date.now(), 
        vehiculoId: vehiculoSeleccionadoId, 
        fecha, 
        km: kmActual, 
        litros, 
        eficiencia 
    };

    registrosConsumo.unshift(nuevoRegistro);
    localStorage.setItem('logbook_consumo', JSON.stringify(registrosConsumo));
    actualizarInterfaz();
    
    document.getElementById('km-actual').value = "";
    document.getElementById('litros-carga').value = "";
}

// 4. MÓDULO DE MANTENIMIENTO[cite: 1]
function registrarMantenimiento() {
    if (!vehiculoSeleccionadoId) return alert("Selecciona un vehículo primero.");

    const desc = document.getElementById('mant-desc').value;
    const tipo = document.getElementById('mant-tipo').value;
    const fecha = new Date().toLocaleDateString();

    if (!desc.trim()) return alert("La descripción es obligatoria.");

    const nuevoMant = { 
        id: Date.now(), 
        vehiculoId: vehiculoSeleccionadoId, 
        fecha, 
        desc, 
        tipo 
    };

    registrosMantenimiento.unshift(nuevoMant);
    localStorage.setItem('logbook_mantenimiento', JSON.stringify(registrosMantenimiento));
    actualizarInterfaz();
    
    document.getElementById('mant-desc').value = "";
}

// 5. RENDERIZADO Y ACTUALIZACIÓN GLOBAL[cite: 1]
function actualizarInterfaz() {
    renderizarFlota();
    renderizarTablas();
    actualizarKPIs();
}

function renderizarFlota() {
    const grid = document.getElementById('grid-vehiculos');
    if (!grid) return;

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

function renderizarTablas() {
    // Filtrar datos según el vehículo seleccionado para el Selector de Contexto[cite: 1]
    const tablaConsumo = document.querySelector("#tabla-consumo tbody");
    const filtradosConsumo = registrosConsumo.filter(r => r.vehiculoId === vehiculoSeleccionadoId);
    
    if (tablaConsumo) {
        tablaConsumo.innerHTML = filtradosConsumo.map(r => `
            <tr>
                <td>${r.fecha}</td>
                <td>${r.km}</td>
                <td>${r.litros}</td>
                <td><span class="badge">${r.eficiencia > 0 ? r.eficiencia + ' km/l' : 'Base'}</span></td>
            </tr>
        `).join('');
    }

    const tablaMant = document.querySelector("#tabla-mantenimiento tbody");
    const filtradosMant = registrosMantenimiento.filter(m => m.vehiculoId === vehiculoSeleccionadoId);

    if (tablaMant) {
        tablaMant.innerHTML = filtradosMant.map(m => `
            <tr>
                <td>${m.fecha}</td>
                <td>${m.desc}</td>
                <td><span class="badge">${m.tipo}</span></td>
            </tr>
        `).join('');
    }
}

function actualizarKPIs() {
    document.getElementById('kpi-vehiculos').innerText = flota.length;
    
    if (vehiculoSeleccionadoId) {
        const filtrados = registrosConsumo.filter(r => r.vehiculoId === vehiculoSeleccionadoId && r.eficiencia > 0);
        if (filtrados.length > 0) {
            document.getElementById('kpi-eficiencia').innerText = `${filtrados[0].eficiencia} km/l`;
        } else {
            document.getElementById('kpi-eficiencia').innerText = "-- km/l";
        }
    }
}

function limpiarCamposVehiculo() {
    ['v-marca', 'v-modelo', 'v-patente', 'v-chasis', 'v-dueno'].forEach(id => {
        document.getElementById(id).value = "";
    });
}

// 6. NAVEGACIÓN SPA[cite: 1]
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
}

// Inicialización
window.onload = actualizarInterfaz;
