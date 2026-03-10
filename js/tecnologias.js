/**
 * ECOENERGY - TECNOLOGÍAS
 * Gestión de animaciones de scroll y visualización de fichas técnicas.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. LÓGICA DE REVELADO AL HACER SCROLL
    // ==========================================
    
    /**
     * Configuramos el Intersection Observer para detectar cuando los elementos
     * entran en el área visible del navegador (viewport).
     */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si el elemento es visible al menos en un 15%
            if (entry.isIntersecting) {
                // Añadimos la clase CSS que dispara la animación de entrada
                entry.target.classList.add('reveal-visible');
            }
        });
    }, { 
        threshold: 0.15 // El evento se activa cuando el 15% del elemento es visible
    });

    /**
     * Buscamos todos los elementos con la clase '.reveal-init' 
     * y los ponemos bajo la vigilancia del observador.
     */
    document.querySelectorAll('.reveal-init').forEach(el => observer.observe(el));


    // ==========================================
    // 2. BASE DE DATOS TÉCNICA (CONTENIDO)
    // ==========================================

    /**
     * Objeto que centraliza la información técnica de los servicios.
     * Facilita la actualización de datos sin tocar la estructura HTML principal.
     */
    const techDB = {
        solar: {
            title: "Ingeniería Fotovoltaica",
            theme: "bg-warning text-dark", // Colores de Bootstrap para la cabecera
            content: `
                <div class="p-4">
                    <h4 class="fw-bold mb-3 text-warning">Principios de Operación</h4>
                    <p>El uso de células <strong>Bifaciales</strong> y rastreadores de eje único permite incrementar la producción energética hasta un 25% comparado con instalaciones fijas.</p>
                    <div class="row g-3">
                        <div class="col-6 bg-light p-3 rounded">
                            <small class="d-block text-muted">Temp. Operativa</small>
                            <strong>-40°C a +85°C</strong>
                        </div>
                        <div class="col-6 bg-light p-3 rounded">
                            <small class="d-block text-muted">Garantía Potencia</small>
                            <strong>85% a 25 años</strong>
                        </div>
                    </div>
                </div>`
        },
        eolica: {
            title: "Sistemas de Aerogeneración",
            theme: "bg-info text-white", // Colores de Bootstrap para la cabecera
            content: `
                <div class="p-4">
                    <h4 class="fw-bold mb-3 text-info">Eficiencia Onshore/Offshore</h4>
                    <p>Las palas de fibra de carbono actuales superan los 100 metros de longitud, permitiendo barrer áreas inmensas para captar vientos de baja velocidad.</p>
                    <div class="row g-3">
                        <div class="col-6 bg-light p-3 rounded">
                            <small class="d-block text-muted text-dark">Cut-in Wind Speed</small>
                            <strong class="text-dark">3.5 m/s</strong>
                        </div>
                        <div class="col-6 bg-light p-3 rounded">
                            <small class="d-block text-muted text-dark">Material Pala</small>
                            <strong class="text-dark">FRP Compuesto</strong>
                        </div>
                    </div>
                </div>`
        }
    };


    // ==========================================
    // 3. CONTROLADOR DEL MODAL (VENTANA EMERGENTE)
    // ==========================================

    /**
     * Función global para abrir la ficha técnica.
     * @param {string} key - La clave del producto (ej: 'solar' o 'eolica').
     */
    window.abrirFicha = (key) => {
        const data = techDB[key]; // Obtenemos los datos según la clave
        const modalContainer = document.getElementById('modal-content');
        
        // Inyectamos dinámicamente el HTML dentro del contenedor del modal
        modalContainer.innerHTML = `
            <div class="modal-header ${data.theme} border-0">
                <h5 class="modal-title fw-bold">${data.title}</h5>
                <button type="button" class="btn-close ${data.theme === 'bg-info text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
                ${data.content}
            </div>
            <div class="modal-footer border-0">
                <button class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Cerrar</button>
            </div>
        `;

        // Inicializamos y mostramos el modal usando la API de Bootstrap 5
        const myModal = new bootstrap.Modal(document.getElementById('techModal'));
        myModal.show();
    };
});