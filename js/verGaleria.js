let imagenesGaleria = [];
let currentIndex = 0;

// Función para fetch con timeout
const fetchWithTimeout = (url, timeout) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
};

async function cargarGaleriaPublica() {
  const galeriaContenedor = document.getElementById("galeria-imagenes");
  galeriaContenedor.innerHTML = "Cargando...";
  imagenesGaleria = [];

  try {
    const url = "/.netlify/functions/listar-imagenes";
    const timeoutDuration = 5000; // 5 segundos

    const res = await fetchWithTimeout(url, timeoutDuration);
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
    console.error("Error al cargar la galería:", e);
    const errorMessage =
      e.message === "Timeout"
        ? "Tiempo de espera agotado al cargar la galería."
        : "Error al cargar la galería.";

    galeriaContenedor.innerHTML = `
      <div class="col-span-full text-center">
        <div class="bg-white rounded-lg p-8 shadow-lg border border-gray-200 max-w-md mx-auto">
          <p class="text-red-500 mb-4 text-lg font-semibold">${errorMessage}</p>
          <p class="text-gray-600 mb-6">Si el problema persiste. Puedes ver la galería en nuestra versión principal:</p>
          <a href="https://psicologiaybienestar.netlify.app/pages/verGaleria" 
             target="_blank" 
             class="inline-block bg-[#627eff] text-white px-6 py-3 rounded-lg hover:bg-[#53c6e4] transition-colors duration-300 font-semibold">
            Ver en versión principal
          </a>
        </div>
      </div>
    `;
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
