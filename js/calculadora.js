/**
 * ECOENERGY - Motor de Cálculo Ambiental
 * gestiona la lógica de conversión de consumo eléctrico (kWh) 
 * a métricas de impacto ambiental (CO2, árboles y movilidad).
 */

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const alertBox = document.getElementById('alerta-pais');
    const paisTxt = document.getElementById('pais-detectado');
    
    // Recuperar el contexto regional guardado previamente en el navegador (desde Dashboard o Datos)
    const contexto = JSON.parse(localStorage.getItem('analisis_contexto'));

    // Si existe un contexto de país seleccionado, mostramos la alerta de configuración activa
    if (contexto) {
        alertBox.classList.remove('d-none');
        alertBox.classList.add('d-flex');
        // Priorizamos los nombres de propiedades comunes en archivos CSV (Entity o entity)
        paisTxt.innerText = contexto.entity || contexto.Entity || "Región Global";
    }
});

// Escuchador del evento 'submit' para procesar el formulario de la calculadora
document.getElementById('calc-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // Capturar el valor ingresado por el usuario y convertirlo a número decimal
    const inputConsumo = document.getElementById('consumo-usuario').value;
    const consumo = parseFloat(inputConsumo);

    // Validación básica: Si no es un número o es menor/igual a cero, detenemos la ejecución
    if (isNaN(consumo) || consumo <= 0) return;

    // --- 1. Obtención del Ratio Energético ---
    const contexto = JSON.parse(localStorage.getItem('analisis_contexto'));
    let ratioLimpio = 0.38; // Valor base: 38% (Promedio de energía renovable mundial)

    // Si hay un país seleccionado, calculamos su ratio real basado en la generación
    if (contexto) {
        // Obtenemos generación renovable y total buscando las claves estándar del dataset
        const genRenovable = parseFloat(contexto['Renewables - TWh'] || contexto.renewables_electricity || 0);
        const genTotal = parseFloat(contexto.electricity_generation || contexto['Electricity generation (TWh)'] || 0);
        
        // El ratio es la proporción de energía limpia sobre el total producido
        if (genTotal > 0) ratioLimpio = genRenovable / genTotal;
    }

    // --- 2. Cálculos Ambientales ---
    
    // Cálculo de CO2 Mensual: 
    // Aplicamos el ratio limpio al consumo y multiplicamos por 0.4 kg/kWh (Factor de emisión estándar)
    const co2Mensual = (consumo * ratioLimpio) * 0.4;
    
    // Cálculo de Árboles necesarios para compensar:
    // Se calcula la emisión anual (mensual * 12) y se divide por la absorción de un árbol maduro (~21kg/año)
    const arboles = Math.ceil((co2Mensual * 12) / 21);
    
    // Equivalencia en Movilidad:
    // Se divide el CO2 evitado por 0.12 kg/km (Emisión promedio de un coche de gasolina)
    const km = Math.floor(co2Mensual / 0.12);

    // --- 3. Renderizado de Resultados ---
    const resDiv = document.getElementById('contenedor-resultado');
    resDiv.classList.remove('d-none'); // Hacemos visible el contenedor de resultados

    // Inyección de texto dinámico explicando el impacto según el ratio del país
    document.getElementById('resultado-texto').innerHTML = `
        <div class="p-4 rounded-4 bg-success bg-opacity-10 text-center border border-success border-opacity-25">
            <h4 class="fw-bold text-success mb-2">Impacto Generado</h4>
            <p class="mb-0 text-muted">
                Basado en una matriz energética con un <strong>${(ratioLimpio * 100).toFixed(1)}%</strong> de fuentes renovables, 
                tu consumo mensual de energía está evitando la emisión de <strong>${co2Mensual.toFixed(1)} kg</strong> de CO₂.
            </p>
        </div>
    `;

    // Ejecución de animaciones de conteo para los valores numéricos
    animarNumero('val-arboles', arboles);
    animarNumero('val-km', km);
    document.getElementById('val-co2').innerText = co2Mensual.toFixed(1);

    // Lanzar efecto visual (hojas cayendo) si el ratio de energía limpia es mayor al 20%
    if (ratioLimpio > 0.2) lanzarHojas();

    // Desplazamiento suave de la pantalla hacia los resultados
    resDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/**
 * Función para crear un efecto de conteo progresivo en los números
 * @param {string} id - ID del elemento HTML donde se mostrará el número
 * @param {number} fin - Valor final al que debe llegar el conteo
 */
function animarNumero(id, fin) {
    let inicio = 0;
    const obj = document.getElementById(id);
    const duracion = 1000; // Duración total de la animación en milisegundos
    const paso = fin / (duracion / 30); // Incremento por cada frame (aprox 30ms por frame)
    
    const count = setInterval(() => {
        inicio += paso;
        if (inicio >= fin) {
            obj.innerText = Math.floor(fin).toLocaleString(); // Asegurar que termine en el número exacto
            clearInterval(count);
        } else {
            obj.innerText = Math.floor(inicio).toLocaleString();
        }
    }, 30);
}

/**
 * Función estética que crea elementos tipo "confeti" con forma de hoja
 */
function lanzarHojas() {
    for (let i = 0; i < 15; i++) {
        const hoja = document.createElement('div');
        hoja.className = 'confeti-hoja';
        hoja.innerText = '🍃';
        hoja.style.left = Math.random() * 100 + 'vw'; // Posición horizontal aleatoria
        hoja.style.fontSize = (Math.random() * 20 + 10) + 'px'; // Tamaño aleatorio
        hoja.style.animationDuration = (Math.random() * 2 + 2) + 's'; // Velocidad de caída aleatoria
        document.body.appendChild(hoja);
        
        // Eliminar el elemento del DOM una vez termine la animación para evitar sobrecargar la memoria
        setTimeout(() => hoja.remove(), 4000);
    }
}