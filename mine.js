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
