let imagenesGaleria = [];
let currentIndex = 0;

async function cargarGaleriaPublica() {
  const galeriaContenedor = document.getElementById("galeria-imagenes");
  galeriaContenedor.innerHTML = "Cargando...";
  imagenesGaleria = [];
  try {
    const url = "/.netlify/functions/listar-imagenes";
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo cargar la galería");
    const images = await res.json();
    galeriaContenedor.innerHTML = "";
    images.forEach((img, index) => {
      imagenesGaleria.push(img.url);
      const divWrapper = document.createElement("div");
      divWrapper.className =
        "relative overflow-hidden rounded-md shadow-md gallery-item";
      const imgElement = document.createElement("img");
      imgElement.src = img.url;
      imgElement.alt = img.public_id;
      imgElement.className =
        "w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer";
      imgElement.addEventListener("click", () => {
        abrirLightbox(index);
      });
      divWrapper.appendChild(imgElement);
      galeriaContenedor.appendChild(divWrapper);
    });
  } catch (e) {
    galeriaContenedor.innerHTML = "No se pudieron cargar las imágenes.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarGaleriaPublica();
  const lightboxImagen = document.getElementById("lightbox-imagen");
  const lightbox = document.getElementById("lightbox");
  const btnPrev = document.getElementById("lightbox-prev");
  const btnNext = document.getElementById("lightbox-next");
  const btnClose = document.getElementById("lightbox-close");

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
  lightbox.addEventListener("click", cerrarLightbox);
  lightboxImagen.addEventListener("click", (e) => {
    e.stopPropagation();
  });
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
});

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
