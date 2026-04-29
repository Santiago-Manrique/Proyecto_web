// Memoria del Navegador
let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
let registros = JSON.parse(localStorage.getItem('registros')) || [];

// --- NAVEGACIÓN ---
const links = document.querySelectorAll('.tab-link');
const contents = document.querySelectorAll('.tab-content');

links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        links.forEach(l => l.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(target).classList.add('active');
        if(target === 'visualizacion') mostrarHistorial();
        if(target === 'dashboard') actualizarDashboard();
    });
});

// --- LÓGICA DE REGISTRO ---

// 1. Registro de Vehículo
document.getElementById('form-vehiculo').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = {
        modelo: document.getElementById('modelo').value,
        patente: document.getElementById('patente').value,
        conductor: document.getElementById('conductor').value
    };
    vehiculos.push(v);
    localStorage.setItem('vehiculos', JSON.stringify(vehiculos));
    actualizarSelectores();
    e.target.reset();
    actualizarDashboard();
    alert("Vehículo guardado.");
});

// 2. Registro de Consumo
document.getElementById('form-consumo').addEventListener('submit', (e) => {
    e.preventDefault();
    const patente = document.getElementById('select-vehiculo-consumo').value;
    const km = parseFloat(document.getElementById('km-actual').value);
    const litros = parseFloat(document.getElementById('litros').value);

    // Cálculo de eficiencia
    const anterior = registros.filter(r => r.patente === patente && r.tipo === 'consumo').pop();
    const eficiencia = anterior ? ((km - anterior.km) / litros).toFixed(2) : "0.00";

    const reg = { patente, tipo: 'consumo', km, litros, eficiencia, fecha: new Date().toLocaleDateString() };
    registros.push(reg);
    localStorage.setItem('registros', JSON.stringify(registros));
    e.target.reset();
    actualizarDashboard();
    alert(`Carga registrada: ${eficiencia} km/l`);
});

// 3. Registro de Mantenimiento
document.getElementById('form-mantenimiento').addEventListener('submit', (e) => {
    e.preventDefault();
    const reg = {
        patente: document.getElementById('select-vehiculo-falla').value,
        tipo: document.getElementById('tipo-evento').value,
        descripcion: document.getElementById('descripcion').value,
        fecha: new Date().toLocaleDateString()
    };
    registros.push(reg);
    localStorage.setItem('registros', JSON.stringify(registros));
    e.target.reset();
    actualizarDashboard();
    alert("Evento registrado.");
});

// --- FUNCIONES AUXILIARES ---

function actualizarSelectores() {
    const selects = [document.getElementById('select-vehiculo-consumo'), document.getElementById('select-vehiculo-falla')];
    selects.forEach(s => {
        s.innerHTML = '<option value="">Seleccionar...</option>';
        vehiculos.forEach(v => {
            s.innerHTML += `<option value="${v.patente}">${v.modelo} (${v.patente})</option>`;
        });
    });
}

function mostrarHistorial() {
    const cont = document.getElementById('contenedor-datos');
    if (registros.length === 0) { cont.innerHTML = "<p>Sin registros.</p>"; return; }

    let html = `<table><thead><tr><th>Fecha</th><th>Vehículo</th><th>Tipo</th><th>Info</th><th>Resultado</th></tr></thead><tbody>`;
    [...registros].reverse().forEach(r => {
        html += `<tr>
            <td>${r.fecha}</td>
            <td><strong>${r.patente}</strong></td>
            <td><span class="badge ${r.tipo}">${r.tipo}</span></td>
            <td>${r.tipo === 'consumo' ? r.litros + ' L' : r.descripcion}</td>
            <td>${r.tipo === 'consumo' ? r.eficiencia + ' km/l' : '-'}</td>
        </tr>`;
    });
    cont.innerHTML = html + "</tbody></table>";
}

function actualizarDashboard() {
    document.getElementById('kpi-vehiculos').innerText = vehiculos.length;
    document.getElementById('kpi-registros').innerText = registros.length;
    const ultConsumo = registros.filter(r => r.tipo === 'consumo').pop();
    document.getElementById('kpi-eficiencia').innerText = ultConsumo ? ultConsumo.eficiencia + ' km/l' : '0.00 km/l';
}

// Inicialización
actualizarSelectores();
actualizarDashboard();
