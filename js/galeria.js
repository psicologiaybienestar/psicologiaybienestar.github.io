// Array de objetos para las imágenes, cada uno con su ruta completa y un alt text
const galleryImagesData = [
  // Imágenes de ../assets/img_galeria/
  {
    src: "../assets/img_galeria/galeria_em1.jpeg",
    alt: "Psicología Empresarial 1",
  },
  {
    src: "../assets/img_galeria/galeria_em2.jpeg",
    alt: "Psicología Empresarial 2",
  },
  {
    src: "../assets/img_galeria/galeria_em3.jpeg",
    alt: "Psicología Empresarial 3",
  },
  {
    src: "../assets/img_galeria/galeria_em4.jpeg",
    alt: "Psicología Empresarial 4",
  },
  {
    src: "../assets/img_galeria/galeria_em5.jpeg",
    alt: "Psicología Empresarial 5",
  },
  {
    src: "../assets/img_galeria/galeria_em6.jpeg",
    alt: "Psicología Empresarial 6",
  },
  {
    src: "../assets/img_galeria/galeria_em7.jpeg",
    alt: "Psicología Empresarial 7",
  },
  {
    src: "../assets/img_galeria/galeria_em8.jpeg",
    alt: "Psicología Empresarial 8",
  },
  {
    src: "../assets/img_galeria/galeria_em9.jpeg",
    alt: "Psicología Empresarial 9",
  },
  {
    src: "../assets/img_galeria/galeria_em10.jpeg",
    alt: "Psicología Empresarial 10",
  },
  {
    src: "../assets/img_galeria/galeria_em11.jpeg",
    alt: "Psicología Empresarial 11",
  },
  {
    src: "../assets/img_galeria/galeria_em12.jpeg",
    alt: "Psicología Empresarial 12",
  },
  {
    src: "../assets/img_galeria/galeria_em13.jpeg",
    alt: "Psicología Empresarial 13",
  },
  {
    src: "../assets/img_galeria/galeria_em14.jpeg",
    alt: "Psicología Empresarial 14",
  },
  {
    src: "../assets/img_galeria/galeria_em15.jpeg",
    alt: "Psicología Empresarial 15",
  },
  {
    src: "../assets/img_galeria/galeria_em16.jpeg",
    alt: "Psicología Empresarial 16",
  },
  {
    src: "../assets/img_galeria/galeria_em17.jpeg",
    alt: "Psicología Empresarial 17",
  },
  {
    src: "../assets/img_galeria/galeria_em18.jpeg",
    alt: "Psicología Empresarial 18",
  },
  {
    src: "../assets/img_galeria/galeria_em19.jpeg",
    alt: "Psicología Empresarial 19",
  },
  {
    src: "../assets/img_galeria/galeria_em20.jpeg",
    alt: "Psicología Empresarial 20",
  },
  {
    src: "../assets/img_galeria/galeria_em21.jpeg",
    alt: "Psicología Empresarial 21",
  },
  {
    src: "../assets/img_galeria/galeria_em22.jpeg",
    alt: "Psicología Empresarial 22",
  },
  {
    src: "../assets/img_galeria/galeria_em23.jpeg",
    alt: "Psicología Empresarial 23",
  },

  // --- Imágenes de ../img_em/ ---
  { src: "../assets/img_em/empresarial_1.jpeg", alt: "Imagen Empresarial 1" },
  { src: "../assets/img_em/empresarial_2.jpeg", alt: "Imagen Empresarial 2" },
  { src: "../assets/img_em/empresarial_3.jpeg", alt: "Imagen Empresarial 3" },
  { src: "../assets/img_em/empresarial_4.jpeg", alt: "Imagen Empresarial 4" },
  { src: "../assets/img_em/empresarial_5.jpeg", alt: "Imagen Empresarial 5" },
  {
    src: "../assets/img_em/empresarial_6.jpeg",
    alt: "Imagen Empresarial 6",
  },
  {
    src: "../assets/img_em/empresarial_7.jpeg",
    alt: "Imagen Empresarial 7",
  },
  {
    src: "../assets/img_em/empresarial_8.jpeg",
    alt: "Imagen Empresarial 8",
  },
  {
    src: "../assets/img_em/empresarial_9.jpeg",
    alt: "Imagen Empresarial 9",
  },
  {
    src: "../assets/img_em/empresarial_10.jpeg",
    alt: "Imagen Empresarial 10",
  },

  // Si tienes otras rutas como la de tu fondo, también puedes añadirla si quieres que aparezca en la galería:
  // { src: '../assets/img_em/background-empresarial.jpeg', alt: 'Fondo de Bienestar Empresarial' },
  // { src: '../img/logo.png', alt: 'Logo de Psicología y Bienestar' }
];

let imagenesGaleria = []; // Almacenará las URLs de las imágenes para el lightbox
let currentIndex = 0; // Índice de la imagen actual en el lightbox

document.addEventListener("DOMContentLoaded", () => {
  const galeriaContenedor = document.getElementById("galeria-imagenes");
  const lightboxImagen = document.getElementById("lightbox-imagen");
  const lightbox = document.getElementById("lightbox");
  const btnPrev = document.getElementById("lightbox-prev");
  const btnNext = document.getElementById("lightbox-next");
  const btnClose = document.getElementById("lightbox-close");

  // --- Generación dinámica de la galería ---
  galleryImagesData.forEach((imageData, index) => {
    imagenesGaleria.push(imageData.src);

    const divWrapper = document.createElement("div");
    divWrapper.className =
      "relative overflow-hidden rounded-md shadow-md gallery-item";

    const imgElement = document.createElement("img");
    imgElement.src = imageData.src;
    imgElement.alt = imageData.alt;
    imgElement.className =
      "w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer";

    // Event listener para abrir el lightbox
    imgElement.addEventListener("click", () => {
      abrirLightbox(index);
    });

    divWrapper.appendChild(imgElement);
    galeriaContenedor.appendChild(divWrapper);
  });

  // --- Funcionalidad del Lightbox ---
  btnPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });
  btnNext.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });
  btnClose.addEventListener("click", (e) => {
    e.stopPropagation();
    cerrarLightbox();
  });

  // Clic en el fondo oscuro del lightbox para cerrar
  lightbox.addEventListener("click", cerrarLightbox);
  // Evita que el clic en la imagen dentro del lightbox cierre el lightbox
  lightboxImagen.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Cerrar el lightbox con la tecla ESC y navegar con flechas
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.classList.contains("hidden")) {
      cerrarLightbox();
    } else if (
      e.key === "ArrowLeft" &&
      !lightbox.classList.contains("hidden")
    ) {
      navigateLightbox(-1);
    } else if (
      e.key === "ArrowRight" &&
      !lightbox.classList.contains("hidden")
    ) {
      navigateLightbox(1);
    }
  });
}); // Fin DOMContentLoaded

function abrirLightbox(index) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImagen = document.getElementById("lightbox-imagen");

  currentIndex = index;
  lightboxImagen.src = imagenesGaleria[currentIndex];
  lightbox.classList.remove("hidden");
}

function cerrarLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.add("hidden");
  document.getElementById("lightbox-imagen").src = "";
}

function navigateLightbox(direction) {
  const lightboxImagen = document.getElementById("lightbox-imagen");
  currentIndex += direction;
  if (currentIndex < 0) {
    currentIndex = imagenesGaleria.length - 1;
  } else if (currentIndex >= imagenesGaleria.length) {
    currentIndex = 0;
  }
  lightboxImagen.src = imagenesGaleria[currentIndex];
}
