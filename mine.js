// Estructuras de datos iniciales
let vehiculos = JSON.parse(localStorage.getItem('vehiculos')) || [];
let registros = JSON.parse(localStorage.getItem('registros')) || [];

// 1. Referencias a los formularios
const formVehiculo = document.getElementById('form-vehiculo');
const selectConsumo = document.getElementById('select-vehiculo-consumo');
const selectFalla = document.getElementById('select-vehiculo-falla');

// 2. Función para actualizar los selectores dinámicamente
function actualizarSelectores() {
    // Limpiamos los selectores dejando solo la opción por defecto
    const opcionesBase = '<option value="">Seleccionar Vehículo</option>';
    selectConsumo.innerHTML = opcionesBase;
    selectFalla.innerHTML = opcionesBase;

    vehiculos.forEach(v => {
        const html = `<option value="${v.patente}">${v.modelo} (${v.patente})</option>`;
        selectConsumo.innerHTML += html;
        selectFalla.innerHTML += html;
    });
}

// 3. Registrar Nuevo Vehículo
formVehiculo.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevoVehiculo = {
        modelo: document.getElementById('modelo').value,
        patente: document.getElementById('patente').value,
        conductor: document.getElementById('conductor').value
    };

    vehiculos.push(nuevoVehiculo);
    localStorage.setItem('vehiculos', JSON.stringify(vehiculos));
    
    actualizarSelectores();
    formVehiculo.reset();
    alert("Vehículo registrado con éxito");
});

// Inicializar la app cargando lo que haya en memoria
actualizarSelectores();
const formConsumo = document.getElementById('form-consumo');

formConsumo.addEventListener('submit', (e) => {
    e.preventDefault();

    const patente = document.getElementById('select-vehiculo-consumo').value;
    const kmActual = parseFloat(document.getElementById('km-actual').value);
    const litros = parseFloat(document.getElementById('litros').value);

    // Buscar el último registro de este vehículo para calcular la diferencia
    const registrosVehiculo = registros.filter(r => r.patente === patente && r.tipo === 'consumo');
    let consumoCalculado = 0;
    let kmRecorridos = 0;

    if (registrosVehiculo.length > 0) {
        const ultimoRegistro = registrosVehiculo[registrosVehiculo.length - 1];
        kmRecorridos = kmActual - ultimoRegistro.km;
        consumoCalculado = kmRecorridos / litros; // km por litro
    }

    const nuevoRegistroConsumo = {
        patente,
        tipo: 'consumo',
        km: kmActual,
        litros: litros,
        eficiencia: consumoCalculado.toFixed(2), // Guardamos el cálculo
        fecha: new Date().toLocaleDateString()
    };

    registros.push(nuevoRegistroConsumo);
    localStorage.setItem('registros', JSON.stringify(registros));
    
    formConsumo.reset();
    alert(kmRecorridos > 0 
        ? `Carga guardada. Hiciste ${kmRecorridos}km con un consumo de ${consumoCalculado.toFixed(2)} km/l.` 
        : "Carga guardada (Primer registro para este vehículo).");
    
    // Aquí podrías llamar a una función para refrescar la tabla de historial
    mostrarHistorial(); 
});

// Función para mostrar los datos en pantalla
function mostrarHistorial() {
    const contenedor = document.getElementById('contenedor-datos');
    
    if (registros.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; padding:20px;">No hay registros cargados aún.</p>';
        return;
    }

    // Creamos una tabla profesional
    let tablaHTML = `
        <table class="tabla-log">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Vehículo</th>
                    <th>Tipo</th>
                    <th>Detalles</th>
                    <th>Resultado</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Recorremos los registros de atrás para adelante (el más nuevo primero)
    registros.reverse().forEach(reg => {
        const esConsumo = reg.tipo === 'consumo';
        tablaHTML += `
            <tr>
                <td>${reg.fecha}</td>
                <td><strong>${reg.patente}</strong></td>
                <td><span class="badge ${reg.tipo}">${reg.tipo.toUpperCase()}</span></td>
                <td>${esConsumo ? `Carga: ${reg.litros}L` : reg.descripcion}</td>
                <td>${esConsumo ? `<strong>${reg.eficiencia} km/l</strong>` : '-'}</td>
            </tr>
        `;
    });

    tablaHTML += `</tbody></table>`;
    contenedor.innerHTML = tablaHTML;
    
    // Invertimos de nuevo para no romper la lógica de búsqueda posterior
    registros.reverse();
}

// Llamar a la función al iniciar la página para ver datos previos
mostrarHistorial();

// IMPORTANTE: Agregá "mostrarHistorial();" dentro de los eventos 'submit' 
// después de los alerts para que la tabla se actualice sola.
