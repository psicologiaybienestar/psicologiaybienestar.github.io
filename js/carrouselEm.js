// Inicializar el único carrusel general de imágenes
new Splide("#general-empresarial-carousel", {
  type: "loop",
  autoplay: true,
  interval: 3000,
  pauseOnHover: true,
  perPage: 3,
  gap: "1rem",
  breakpoints: {
    768: {
      perPage: 2,
      gap: "0.75rem",
    },
    480: {
      perPage: 1,
      gap: "0.5rem",
    },
  },
}).mount();
