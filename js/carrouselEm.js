
        // Inicializar el único carrusel general de imágenes
        new Splide('#general-empresarial-carousel', {
            type: 'loop', // Carrusel continuo
            autoplay: true, // Reproducción automática
            interval: 3000, // Cambiar de diapositiva cada 3 segundos
            pauseOnHover: true, // Pausar al pasar el ratón
            perPage: 3, // Mostrar 3 imágenes a la vez en escritorio
            gap: '1rem', // Espacio entre imágenes
            breakpoints: {
                768: { // Ajustes para tablets (hasta 768px)
                    perPage: 2, // Mostrar 2 imágenes
                    gap: '0.75rem', // Espacio un poco menor
                },
                480: { // Ajustes para móviles (hasta 480px)
                    perPage: 1, // Mostrar 1 imagen
                    gap: '0.5rem', // Espacio aún menor
                },
            }
        }).mount();
