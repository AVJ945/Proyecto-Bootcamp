/**
 * ECOENERGY - Motor de Gestión de Datos
 * Este archivo se encarga de la descarga de datasets (CSV), el filtrado en tiempo real,
 * la gestión del almacenamiento local y la renderización dinámica de la tabla.
 */

// --- Variables Globales de Estado ---
let DATASET_MASTER = [];    // Almacena la totalidad de los datos cargados del CSV
let DATASET_FILTRADO = [];  // Almacena los resultados tras aplicar filtros de búsqueda
let LIMITE_VISTA = 50;      // Controla la cantidad de filas visibles (paginación manual)
const CSV_URL = '../docs/renewable-energy.csv'; // Ruta del archivo de datos

/**
 * Inicialización del DOM y Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos de la interfaz de usuario (UI)
    const btnCargar = document.getElementById('btn-cargar-datos');
    const inputBuscador = document.getElementById('buscador');
    const btnVerMas = document.getElementById('btn-ver-mas');
    const btnExportar = document.getElementById('btn-exportar');

    // Recuperar datos previamente guardados en el navegador (Caché)
    // Esto permite que el usuario vea datos de inmediato sin esperar la descarga del CSV
    const cached = localStorage.getItem('eco_data_cache');
    if (cached) {
        DATASET_MASTER = JSON.parse(cached);
        prepararVista(DATASET_MASTER, "Cache Local");
    }

    // Evento para iniciar la descarga y procesamiento del CSV vía PapaParse
    btnCargar.addEventListener('click', importarCSV);
    
    // Lógica del buscador: Filtra mientras el usuario escribe (Tiempo Real)
    inputBuscador.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        
        // El filtro busca coincidencias en Entidad (País), Año o Código ISO
        DATASET_FILTRADO = DATASET_MASTER.filter(r => 
            (r.Entity || "").toLowerCase().includes(q) || 
            String(r.Year).includes(q) ||
            (r.Code || "").toLowerCase().includes(q)
        );
        
        // Cada vez que se busca, reiniciamos la paginación a las primeras 50 filas
        LIMITE_VISTA = 50;
        renderizarTabla();
    });

    // Evento para cargar más registros (Paginación acumulativa)
    btnVerMas.addEventListener('click', () => {
        LIMITE_VISTA += 50;
        renderizarTabla();
    });

    // Evento para convertir los datos actuales en pantalla a un archivo CSV descargable
    btnExportar.addEventListener('click', exportarACSV);
});

/**
 * Función para descargar y parsear el archivo CSV usando la librería PapaParse
 */
function importarCSV() {
    // Mostrar el indicador visual de "Cargando..."
    document.getElementById('loader').classList.remove('d-none');
    
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        dynamicTyping: true, // Convierte automáticamente strings numéricos a tipos Number
        complete: (results) => {
            // Limpieza de datos: eliminamos registros vacíos o sin nombre de entidad
            DATASET_MASTER = results.data.filter(r => r.Entity);
            
            // Persistencia: Guardamos el JSON resultante en el navegador
            localStorage.setItem('eco_data_cache', JSON.stringify(DATASET_MASTER));
            
            // Preparamos la interfaz con los nuevos datos
            prepararVista(DATASET_MASTER, "Sincronizado");
            
            // Ocultar el indicador de carga una vez finalizado el proceso
            document.getElementById('loader').classList.add('d-none');
        }
    });
}

/**
 * Configura el estado inicial de la vista tras cargar datos (desde CSV o Caché)
 * @param {Array} datos - Lista de objetos procesados
 * @param {String} estado - Etiqueta de estado para el badge de la interfaz
 */
function prepararVista(datos, estado) {
    DATASET_FILTRADO = [...datos]; // Copiamos los datos al dataset de trabajo
    document.getElementById('stat-total').innerText = datos.length.toLocaleString();
    
    // Actualizar el distintivo visual (Badge) de estado
    const badge = document.getElementById('status-badge');
    badge.innerText = estado;
    
    // Cambiamos el color según el origen (Verde para nuevo, Azul para caché)
    badge.className = `badge ${estado === 'Sincronizado' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} d-block mt-1`;
    
    renderizarTabla();
}

/**
 * Genera el HTML de las filas de la tabla de forma dinámica
 */
function renderizarTabla() {
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = ''; // Limpiar la tabla antes de renderizar nuevos datos
    
    // Seleccionamos solo el fragmento de datos definido por LIMITE_VISTA
    const slice = DATASET_FILTRADO.slice(0, LIMITE_VISTA);

    slice.forEach(row => {
        // Extraemos el valor de la columna de porcentaje renovable
        const val = row['Renewables (% equivalent primary energy)'] || 0;
        
        const tr = document.createElement('tr');
        tr.className = "animate__animated animate__fadeInUp animate__faster";
        
        // Construcción de la fila con clases de Bootstrap y estilos personalizados
        tr.innerHTML = `
            <td class="ps-4 fw-bold text-navy">${row.Entity}</td>
            <td><span class="badge bg-light text-dark border">${row.Code || '—'}</span></td>
            <td>${row.Year}</td>
            <td class="text-end fw-bold text-success">${Number(val).toFixed(2)}%</td>
            <td class="text-center">
                <button class="btn btn-sm btn-dark rounded-pill px-3" onclick="irADashboard('${row.Entity}')">
                    Analizar <i class="bi bi-arrow-right-short"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Actualizar los textos informativos de paginación en la parte inferior
    document.getElementById('info-paginacion').innerText = `Mostrando ${slice.length} de ${DATASET_FILTRADO.length}`;
    
    // Si ya no hay más registros que mostrar, ocultamos el botón "Ver más"
    document.getElementById('btn-ver-mas').classList.toggle('d-none', LIMITE_VISTA >= DATASET_FILTRADO.length);
}

/**
 * Convierte el dataset filtrado de vuelta al formato CSV y dispara la descarga en el navegador
 */
function exportarACSV() {
    if (DATASET_FILTRADO.length === 0) return; // No exportar si no hay datos
    
    // Convertir el JSON de vuelta a texto plano CSV
    const csv = Papa.unparse(DATASET_FILTRADO);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crear un elemento invisible para forzar la descarga
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EcoEnergy_Data_${new Date().getTime()}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Guarda la entidad seleccionada y redirige al Dashboard
 * @param {String} entidad - Nombre del país o región seleccionado por el usuario
 */
function irADashboard(entidad) {
    // Guardamos un objeto simple con la entidad para que el Dashboard sepa qué filtrar
    localStorage.setItem('analisis_contexto', JSON.stringify({ Entity: entidad }));
    window.location.href = 'dashboard.html';
}