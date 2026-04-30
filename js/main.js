/**
 * MAIN.JS - SISTEMA DE MOVIMIENTOS LOGÍSTICOS
 * Automatización de estados y tiempos de uso[cite: 1].
 */

let flota = JSON.parse(localStorage.getItem('logbook_flota')) || [];
let registrosMovimientos = JSON.parse(localStorage.getItem('logbook_movimientos')) || [];
let registrosMantenimiento = JSON.parse(localStorage.getItem('logbook_mantenimiento')) || [];
let vehiculoSeleccionadoId = null;

// GESTIÓN DE VEHÍCULOS[cite: 1]
function guardarVehiculo() {
    const v = {
        id: Date.now(),
        marca: document.getElementById('v-marca').value,
        modelo: document.getElementById('v-modelo').value,
        patente: document.getElementById('v-patente').value,
        chasis: document.getElementById('v-chasis').value,
        dueno: document.getElementById('v-dueno').value,
        estado: document.getElementById('v-estado').value
    };
    if(!v.patente || !v.modelo) return alert("Faltan datos obligatorios.");
    flota.push(v);
    localStorage.setItem('logbook_flota', JSON.stringify(flota));
    cerrarModal();
    actualizarInterfaz();
}

function seleccionarVehiculo(id) {
    vehiculoSeleccionadoId = id;
    const v = flota.find(x => x.id === id);
    document.getElementById('current-vehicle-name').innerText = `${v.modelo} [${v.patente}]`;
    actualizarInterfaz();
}

// CONTROL DE MOVIMIENTOS Y TIEMPOS[cite: 1]
function registrarMovimiento() {
    if (!vehiculoSeleccionadoId) return alert("Selecciona un vehículo de la flota.");

    const tipo = document.getElementById('mov-tipo').value;
    const ahora = new Date();
    const vehiculo = flota.find(v => v.id === vehiculoSeleccionadoId);

    // Bloqueo de Acción: Evita dos salidas o dos entradas seguidas[cite: 1]
    const ultimoMov = registrosMovimientos.find(m => m.vehiculoId === vehiculoSeleccionadoId);
    if (ultimoMov && ultimoMov.tipo === tipo) {
        return alert(`El sistema ya registra una ${tipo} para esta unidad.`);
    }

    // Cálculo de Duración de Uso[cite: 1]
    let duracion = "-";
    if (tipo === "Entrada" && ultimoMov && ultimoMov.tipo === "Salida") {
        const diffMs = ahora - new Date(ultimoMov.timestamp);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round(((diffMs % 3600000) / 60000));
        duracion = `${diffHrs}h ${diffMins}min`;
    }

    const nuevoMov = {
        vehiculoId: vehiculoSeleccionadoId,
        fecha: ahora.toLocaleDateString(),
        hora: ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tipo,
        duracion,
        responsable: vehiculo.dueno,
        timestamp: ahora.toISOString()
    };

    // Cambio Automático de Estado Visual[cite: 1]
    vehiculo.estado = (tipo === "Salida") ? "inactivo" : "activo";
    
    registrosMovimientos.unshift(nuevoMov);
    localStorage.setItem('logbook_movimientos', JSON.stringify(registrosMovimientos));
    localStorage.setItem('logbook_flota', JSON.stringify(flota));
    actualizarInterfaz();
}

// MANTENIMIENTO[cite: 1]
function registrarMantenimiento() {
    if (!vehiculoSeleccionadoId) return alert("Selecciona un vehículo.");
    const desc = document.getElementById('mant-desc').value;
    const tipo = document.getElementById('mant-tipo').value;
    if (!desc.trim()) return;

    registrosMantenimiento.unshift({
        vehiculoId: vehiculoSeleccionadoId,
        fecha: new Date().toLocaleDateString(),
        desc, tipo
    });
    localStorage.setItem('logbook_mantenimiento', JSON.stringify(registrosMantenimiento));
    actualizarInterfaz();
    document.getElementById('mant-desc').value = "";
}

// RENDERIZADO[cite: 1]
function actualizarInterfaz() {
    renderizarFlota();
    renderizarTablas();
}

function renderizarFlota() {
    const grid = document.getElementById('grid-vehiculos');
    grid.innerHTML = flota.map(v => `
        <div class="vehicle-card ${vehiculoSeleccionadoId === v.id ? 'selected' : ''}" onclick="seleccionarVehiculo(${v.id})">
            <span class="patente-tag">${v.patente}</span>
            <h4>${v.modelo}</h4>
            <p><span class="status-dot status-${v.estado}"></span>${v.estado.toUpperCase()}</p>
            <p><small>Resp: ${v.dueno}</small></p>
        </div>
    `).join('');
}

function renderizarTablas() {
    const movFiltrados = registrosMovimientos.filter(m => m.vehiculoId === vehiculoSeleccionadoId);
    document.querySelector("#tabla-movimientos tbody").innerHTML = movFiltrados.map(m => `
        <tr>
            <td>${m.fecha}</td>
            <td>${m.hora}</td>
            <td><span class="badge" style="background:${m.tipo === 'Salida' ? 'rgba(255,51,51,0.2)' : 'rgba(0,255,136,0.2)'}">${m.tipo}</span></td>
            <td>${m.duracion}</td>
            <td>${m.responsable}</td>
        </tr>
    `).join('');

    const mantFiltrados = registrosMantenimiento.filter(m => m.vehiculoId === vehiculoSeleccionadoId);
    document.querySelector("#tabla-mantenimiento tbody").innerHTML = mantFiltrados.map(m => `
        <tr><td>${m.fecha}</td><td>${m.desc}</td><td><span class="badge">${m.tipo}</span></td></tr>
    `).join('');
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(event) event.currentTarget.classList.add('active');
}

function abrirModalVehiculo() { document.getElementById('modal-vehiculo').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modal-vehiculo').style.display = 'none'; }
window.onload = actualizarInterfaz;
