// Configuración de animaciones con Anime.js
const Animations = {
    // Animación de entrada para las páginas
    pageEnter(selector = '.main-content') {
        anime({
            targets: selector,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: 'easeOutQuad'
        });
    },

    // Animación para cards
    cardsEnter(selector = '.card') {
        anime({
            targets: selector,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutExpo'
        });
    },

    // Animación para tablas
    tableRowsEnter(selector = 'tbody tr') {
        anime({
            targets: selector,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 600,
            delay: anime.stagger(50, {start: 200}),
            easing: 'easeOutQuad'
        });
    },

    // Animación para modales
    modalEnter(modalElement) {
        anime({
            targets: modalElement.querySelector('.modal'),
            scale: [0.7, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
    },

    // Animación de salida para modales
    modalExit(modalElement, callback) {
        anime({
            targets: modalElement.querySelector('.modal'),
            scale: [1, 0.7],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: callback
        });
    },

    // Animación para métricas numéricas
    counterUp(element, endValue, duration = 1000) {
        const obj = { value: 0 };
        anime({
            targets: obj,
            value: endValue,
            duration: duration,
            easing: 'easeOutExpo',
            round: 1,
            update: function() {
                element.textContent = obj.value.toLocaleString('es-MX');
            }
        });
    },

    // Animación para alertas
    alertEnter(selector) {
        anime({
            targets: selector,
            translateX: [100, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutQuad'
        });
    },

    // Fade in simple
    fadeIn(selector, duration = 400) {
        anime({
            targets: selector,
            opacity: [0, 1],
            duration: duration,
            easing: 'easeOutQuad'
        });
    },

    // Fade out simple
    fadeOut(selector, duration = 300, callback) {
        anime({
            targets: selector,
            opacity: [1, 0],
            duration: duration,
            easing: 'easeInQuad',
            complete: callback
        });
    }
};

// Exportar para uso global
window.Animations = Animations;
