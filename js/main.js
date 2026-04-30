// Gestión de persistencia con LocalStorage
let registrosConsumo = JSON.parse(localStorage.getItem('logbook_consumo')) || [];

function registrarConsumo() {
    const kmActual = parseFloat(document.getElementById('km-actual').value);
    const litros = parseFloat(document.getElementById('litros-carga').value);
    const fecha = new Date().toLocaleDateString();

    if (isNaN(kmActual) || isNaN(litros)) return alert("Por favor, ingresa valores válidos.");

    let eficiencia = 0;
    
    // Lógica de cálculo: Comparación con el registro anterior
    if (registrosConsumo.length > 0) {
        const ultimoKM = registrosConsumo[0].km;
        eficiencia = ((kmActual - ultimoKM) / litros).toFixed(2); // Fórmula de eficiencia
    }

    const nuevoRegistro = { fecha, km: kmActual, litros, eficiencia };
    registrosConsumo.unshift(nuevoRegistro); // Los más nuevos primero
    
    localStorage.setItem('logbook_consumo', JSON.stringify(registrosConsumo));
    actualizarInterfaz();
}

function actualizarInterfaz() {
    const tabla = document.querySelector("#tabla-consumo tbody");
    tabla.innerHTML = "";
    
    registrosConsumo.forEach(reg => {
        const row = `<tr>
            <td>${reg.fecha}</td>
            <td>${reg.km}</td>
            <td>${reg.litros}</td>
            <td>${reg.eficiencia > 0 ? reg.eficiencia + ' km/l' : 'Registro base'}</td>
        </tr>`;
        tabla.innerHTML += row;
    });

    // Actualizar KPIs del Dashboard[cite: 1]
    document.getElementById('kpi-vehiculos').innerText = "1"; // Simulación para este MVP
    if(registrosConsumo.length > 0 && registrosConsumo[0].eficiencia > 0) {
        document.getElementById('kpi-eficiencia').innerText = registrosConsumo[0].eficiencia + " km/l";
    }
}

// Navegación SPA
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Inicialización
window.onload = actualizarInterfaz;

// Cargar datos de mantenimiento desde localStorage
let registrosMantenimiento = JSON.parse(localStorage.getItem('logbook_mantenimiento')) || [];

function registrarMantenimiento() {
    const desc = document.getElementById('mant-desc').value;
    const tipo = document.getElementById('mant-tipo').value;
    const fecha = new Date().toLocaleDateString();

    if (!desc) return;

    const nuevoMant = { fecha, desc, tipo };
    registrosMantenimiento.unshift(nuevoMant);
    
    localStorage.setItem('logbook_mantenimiento', JSON.stringify(registrosMantenimiento));
    actualizarInterfazMantenimiento();
    document.getElementById('mant-desc').value = "";
}

function actualizarInterfazMantenimiento() {
    const tabla = document.querySelector("#tabla-mantenimiento tbody");
    if (!tabla) return;
    
    tabla.innerHTML = "";
    registrosMantenimiento.forEach(m => {
        tabla.innerHTML += `
            <tr>
                <td>${m.fecha}</td>
                <td>${m.desc}</td>
                <td><span class="badge">${m.tipo}</span></td>
            </tr>`;
    });
}

// Extender la función de inicialización
const originalActualizar = actualizarInterfaz;
actualizarInterfaz = function() {
    originalActualizar();
    actualizarInterfazMantenimiento();
};
