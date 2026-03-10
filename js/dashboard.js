/**
 * ECOENERGY - Dashboard Engine
 * gestiona la recuperación de datos desde el almacenamiento local,
 * realiza cálculos de KPIs ambientales y genera visualizaciones interactivas con Chart.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar contexto y base de datos desde localStorage
    // 'eco_data_cache' contiene el CSV completo procesado
    // 'analisis_contexto' contiene la fila del país seleccionado en la tabla
    const datosRaw = localStorage.getItem('eco_data_cache');
    const contexto = JSON.parse(localStorage.getItem('analisis_contexto'));

    // Verificación de seguridad: Si no hay datos, regresamos al usuario a la página de selección
    if (!contexto || !datosRaw) {
        window.location.href = 'datos.html';
        return;
    }

    const entidad = contexto.Entity;
    const db = JSON.parse(datosRaw);

    // 2. Filtrar y Ordenar Histórico por Año
    // Buscamos todas las entradas que correspondan al país (Entity) y las ordenamos cronológicamente
    const historico = db.filter(d => d.Entity === entidad)
                        .sort((a, b) => a.Year - b.Year);

    // Si el filtrado falla o no hay datos para esa entidad, redirigimos
    if (historico.length === 0) {
        alert("No se encontraron datos históricos para esta entidad.");
        window.location.href = 'datos.html';
        return;
    }

    // 3. Actualizar Interfaz Básica
    // Mostramos el nombre del país/entidad en el encabezado del Dashboard
    document.getElementById('nombre-pais').innerText = entidad;

    // 4. Ejecutar procesos de lógica y diseño
    calcularKpis(historico);
    renderizarGraficos(historico);
});

/**
 * Realiza cálculos estadísticos y proyecciones basadas en la serie histórica
 * @param {Array} historico - Array de objetos con los datos filtrados del país
 */
function calcularKpis(historico) {
    // Obtenemos los dos últimos registros para calcular tendencias
    const ultimo = historico[historico.length - 1];
    const penultimo = historico[historico.length - 2] || ultimo;
    
    // Acceso a la columna técnica del CSV sobre energía primaria equivalente
    const valorActual = ultimo['Renewables (% equivalent primary energy)'] || 0;
    const valorAnterior = penultimo['Renewables (% equivalent primary energy)'] || 0;

    // KPI 1: CO2 Evitado Estimado 
    // Simulación: A mayor % de renovables, mayor ahorro de CO2 (multiplicador base de 12500)
    const co2Base = Math.floor(valorActual * 12500);
    document.getElementById('co2-total-valor').innerText = co2Base.toLocaleString();

    // KPI 2: Proyección para el año 2027
    // Calculamos la diferencia simple y proyectamos dos periodos hacia adelante
    const tendencia = valorActual - valorAnterior;
    const proyeccion = (valorActual + (tendencia * 2)).toFixed(2);
    document.getElementById('kpi-growth').innerText = `${proyeccion}%`;

    // KPI 3: Eficiencia del Mix Energético
    // Refleja el porcentaje actual de penetración de renovables
    document.getElementById('kpi-eficiencia').innerText = `${valorActual.toFixed(1)}%`;
    
    // KPI 4: Barriles de petróleo evitados
    // Cálculo simbólico basado en el impacto del porcentaje renovable (multiplicador 850)
    const barriles = Math.floor(valorActual * 850);
    document.getElementById('fuel-avoided').innerText = barriles.toLocaleString();
}

/**
 * Genera las visualizaciones gráficas utilizando la librería Chart.js
 * @param {Array} historico - Datos para los ejes X (Year) e Y (%)
 */
function renderizarGraficos(historico) {
    // Mapeo de datos para los gráficos
    const labels = historico.map(d => d.Year);
    const valores = historico.map(d => d['Renewables (% equivalent primary energy)'] || 0);

    // --- Gráfico Principal de Línea (Evolución Histórica) ---
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cuota Renovable (%)',
                data: valores,
                borderColor: '#10b981', // Verde Eco
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 4,
                fill: true,
                tension: 0.4, // Curvatura de la línea (Suavizado)
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { callback: value => value + '%' }
                }
            }
        }
    });

    // --- Gráfico de Gauge (Indicador de Meta Actual) ---
    const ultimoValor = valores[valores.length - 1];
    document.getElementById('gaugeValue').innerText = `${ultimoValor.toFixed(1)}%`;
    
    new Chart(document.getElementById('gaugeChart'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [ultimoValor, 100 - ultimoValor], // Parte llena vs Parte vacía
                backgroundColor: ['#10b981', '#f1f5f9'],
                circumference: 180, // Crea el efecto de medio círculo (semicírculo)
                rotation: 270,      // Orienta el semicírculo hacia arriba
                borderRadius: 10
            }]
        },
        options: { 
            cutout: '80%', // Grosor del anillo
            plugins: { tooltip: { enabled: false } } 
        }
    });

    // --- Gráfico de Barras (Última Década) ---
    // Tomamos solo los últimos 10 años para no saturar la visualización
    const ultimosLabels = labels.slice(-10);
    const ultimosValores = valores.slice(-10);

    new Chart(document.getElementById('co2Chart'), {
        type: 'bar',
        data: {
            labels: ultimosLabels,
            datasets: [{
                label: '% Renovables',
                data: ultimosValores,
                backgroundColor: '#ffffff',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false }, // Ocultamos eje Y para diseño minimalista
                x: { 
                    ticks: { color: '#ffffff' }, 
                    grid: { display: false } 
                }
            }
        }
    });
}