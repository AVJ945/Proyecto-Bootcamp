/**
 * ECOENERGY - Lógica de la Página de Inicio (Landing Page)
 * Este archivo gestiona la interactividad de la pantalla principal,
 * incluyendo las curiosidades dinámicas y las animaciones de scroll.
 */

document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    // Referencia al botón de interacción de la sección principal
    const btnInteraccion = document.getElementById('btn-interaccion');
    
    // Banco de datos con curiosidades sobre sostenibilidad y energías renovables
    const curiosidades = [
        "La energía solar es hoy la fuente de electricidad más barata en la historia de la humanidad.",
        "En un solo día, el sol entrega a la Tierra suficiente energía para abastecer al mundo por un año entero.",
        "Dinamarca genera más del 50% de su electricidad únicamente a través del viento.",
        "El hidrógeno verde podría eliminar las emisiones de carbono de la industria del acero y cemento.",
        "Las baterías de iones de litio han bajado su precio en un 97% desde 1991."
    ];

    /**
     * Muestra un componente "Toast" de Bootstrap con datos aleatorios.
     * Crea dinámicamente el HTML del mensaje y lo añade al contenedor de notificaciones.
     */
    const mostrarCuriosidad = () => {
        // Selección aleatoria del índice del array de curiosidades
        const index = Math.floor(Math.random() * curiosidades.length);
        const mensaje = curiosidades[index];

        // Generación de un ID único basado en tiempo para evitar conflictos en el DOM
        const toastId = `toast-${Date.now()}`;
        
        // Estructura HTML del Toast utilizando clases de utilidad de Bootstrap 5
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body p-3">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-lightbulb-fill text-success"></i>
                            <strong class="text-success small text-uppercase">Sabías que...</strong>
                        </div>
                        ${mensaje}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`;

        // Localizar el contenedor de Toasts o crearlo si no existe en el HTML actual
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = "1100"; // Asegurar que esté por encima de otros elementos
            document.body.appendChild(container);
        }

        // Insertar el nuevo mensaje al final del contenedor
        container.insertAdjacentHTML('beforeend', toastHTML);
        
        // Inicializar el objeto Toast de Bootstrap
        const element = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(element, { delay: 6000 }); // Duración de 6 segundos visible
        bsToast.show();

        /**
         * Gestión de memoria: Eliminamos el elemento del DOM una vez que se oculta
         * para evitar la acumulación de HTML innecesario.
         */
        element.addEventListener('hidden.bs.toast', () => {
            element.remove();
        });
    };

    // Vincular el evento de clic al botón de interacción
    btnInteraccion.addEventListener('click', mostrarCuriosidad);

    /**
     * Implementación del Intersection Observer API para animaciones.
     * Detecta cuando las tarjetas de estadísticas entran en el campo de visión del usuario.
     */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si el elemento es visible al menos un 10%, activamos la clase de animación
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, { threshold: 0.1 }); // El 10% del elemento debe ser visible

    // Seleccionar todas las tarjetas de estadísticas para aplicarles el observador
    document.querySelectorAll('.stat-card').forEach(el => observer.observe(el));
});