// Configuración Cloudinary
const CLOUD_NAME = "ddj85p2fp";
const UPLOAD_PRESET = "galeriaPsico";
const FOLDER = "galeria";

// Login seguro usando Netlify Functions
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.onsubmit = async function (e) {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  try {
    const response = await fetch("/.netlify/functions/verificar-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const result = await response.json();

    if (result.success) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "flex";
      cargarGaleria();
    } else {
      mostrarToast("Usuario o contraseña incorrectos", "error");
    }
  } catch (error) {
    mostrarToast("Error de conexión", "error");
  }
};

// Subida de imágenes múltiples
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
uploadForm.onsubmit = async function (e) {
  e.preventDefault();
  const files = fileInput.files;
  if (!files.length) return;
  let subidas = 0,
    errores = 0;
  for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append("file", files[i]);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", FOLDER);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Error al subir la imagen");
      subidas++;
    } catch (err) {
      errores++;
    }
  }
  fileInput.value = "";
  if (subidas > 0)
    mostrarToast(
      `${subidas} imagen${subidas > 1 ? "es" : ""} subida${
        subidas > 1 ? "s" : ""
      } correctamente`,
      "success"
    );
  if (errores > 0)
    mostrarToast(
      `${errores} error${errores > 1 ? "es" : ""} al subir`,
      "error"
    );
  cargarGaleria();
};

let imagenesGaleria = [];
let currentIndex = 0;
let publicIdPendienteEliminar = null;

async function cargarGaleria() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "Cargando...";
  imagenesGaleria = [];
  try {
    const url = "/.netlify/functions/listar-imagenes";
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo cargar la galería");
    const images = await res.json();
    gallery.innerHTML = "";
    images.forEach((img, index) => {
      imagenesGaleria.push(img.url);
      const div = document.createElement("div");
      div.className = "gallery-item";
      div.innerHTML = `
        <img src="${img.url}" alt="${img.public_id}" />
        <button class="delete-btn" title="Eliminar" data-publicid="${img.public_id}">&times;</button>
      `;
      div
        .querySelector("img")
        .addEventListener("click", () => abrirLightbox(index));
      div.querySelector(".delete-btn").onclick = function () {
        mostrarModalEliminar(img.public_id);
      };
      gallery.appendChild(div);
    });
  } catch (e) {
    gallery.innerHTML = "No se pudieron cargar las imágenes.";
  }
}

// Utilidad para mostrar un toast/modal de alerta visual
function mostrarToast(msg, tipo = "info") {
  const toast = document.getElementById("alerta-toast");
  const icon = document.getElementById("alerta-toast-icon");
  const msgSpan = document.getElementById("alerta-toast-msg");
  let color = "#3182ce",
    iconHtml = '<i class="fa fa-info-circle"></i>';
  if (tipo === "error") {
    color = "#e53e3e";
    iconHtml = '<i class="fa fa-exclamation-triangle"></i>';
  }
  if (tipo === "success") {
    color = "#38a169";
    iconHtml = '<i class="fa fa-check-circle"></i>';
  }
  toast.style.background = "#fff";
  toast.style.border = `2px solid ${color}`;
  toast.style.color = color;
  icon.innerHTML = iconHtml;
  msgSpan.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.opacity = 1;
    toast.style.top = "32px";
  }, 10);
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.top = "0px";
    setTimeout(() => {
      toast.style.display = "none";
    }, 350);
  }, 2600);
}

// Animaciones para el modal
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInModal { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }
@keyframes fadeOutModal { from { opacity: 1; transform: scale(1);} to { opacity: 0; transform: scale(0.95);} }
`;
document.head.appendChild(style);

// Modal de cerrar sesión: agregar botón de ver galería
const btnVerGaleria = document.getElementById("logout-vergaleria");
if (btnVerGaleria) {
  btnVerGaleria.onclick = function () {
    window.location.href = "../pages/verGaleria.html";
  };
}

// Modal de cerrar sesión
logoutBtn.onclick = function () {
  const modal = document.getElementById("modal-logout");
  modal.style.display = "flex";
  document.getElementById("logout-confirm").onclick = function () {
    modal.style.display = "none";
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";
    loginForm.reset();
  };
  document.getElementById("logout-main").onclick = function () {
    window.location.href = "../index.html";
  };
};

const btnCancelarLogout = document.getElementById("logout-cancelar");
if (btnCancelarLogout) {
  btnCancelarLogout.onclick = function () {
    const modal = document.getElementById("modal-logout");
    modal.style.display = "none";
  };
}

async function eliminarImagen(publicId) {
  try {
    const res = await fetch("/.netlify/functions/eliminar-imagen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    });
    if (!res.ok) {
      const error = await res.json();
      mostrarToast(
        "Error al eliminar: " + (error.details || error.error),
        "error"
      );
    } else {
      mostrarToast("Imagen eliminada correctamente", "success");
    }
  } catch (e) {
    mostrarToast("Error al eliminar la imagen", "error");
  }
}

// Lightbox para previsualizar en grande
function abrirLightbox(index) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImagen = document.getElementById("lightbox-imagen");
  const btnPrev = document.getElementById("lightbox-prev");
  const btnNext = document.getElementById("lightbox-next");
  const btnClose = document.getElementById("lightbox-close");
  const btnDelete = document.getElementById("lightbox-delete");

  currentIndex = index;
  lightboxImagen.src = imagenesGaleria[currentIndex];
  lightbox.classList.remove("hidden");

  // Eliminar el botón de eliminar si existe
  if (btnDelete) btnDelete.remove();

  // Navegación
  btnPrev.onclick = (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  };
  btnNext.onclick = (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  };
  btnClose.onclick = (e) => {
    e.stopPropagation();
    cerrarLightbox();
  };
  lightbox.onclick = cerrarLightbox;
  lightboxImagen.onclick = (e) => {
    e.stopPropagation();
  };
}

function cerrarLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.classList.add("hidden");
    document.getElementById("lightbox-imagen").src = "";
    const btnDelete = document.getElementById("lightbox-delete");
    if (btnDelete) btnDelete.remove();
  }
}

function navigateLightbox(direction) {
  const lightboxImagen = document.getElementById("lightbox-imagen");
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = imagenesGaleria.length - 1;
  else if (currentIndex >= imagenesGaleria.length) currentIndex = 0;
  lightboxImagen.src = imagenesGaleria[currentIndex];
}

function obtenerPublicIdActual(idx) {
  const gallery = document.getElementById("gallery");
  const images = gallery.querySelectorAll("img");
  if (imagenesGaleria[idx]) {
    const url = imagenesGaleria[idx];
    const match = url.match(/upload\/([^\.]+)\./);
    if (match) return match[1];
  }
  return null;
}

// Mostrar modal de confirmación de eliminación
function mostrarModalEliminar(publicId) {
  publicIdPendienteEliminar = publicId;
  const modal = document.getElementById("modal-eliminar");
  modal.style.display = "flex";
}

// Eventos del modal de eliminar
const modalEliminar = document.getElementById("modal-eliminar");
if (modalEliminar) {
  modalEliminar.querySelector(".btn-cancelar").onclick = () => {
    modalEliminar.style.display = "none";
    publicIdPendienteEliminar = null;
  };
  modalEliminar.querySelector(".btn-eliminar").onclick = async () => {
    if (publicIdPendienteEliminar) {
      await eliminarImagen(publicIdPendienteEliminar);
      publicIdPendienteEliminar = null;
      modalEliminar.style.display = "none";
      cargarGaleria();
    }
  };
}

// Modal de recarga/cierre de sesión al intentar recargar la página
let reloadIntent = false;
function mostrarModalReload() {
  const modal = document.getElementById("modal-reload");
  modal.style.display = "flex";
  document.getElementById("reload-aceptar").onclick = function () {
    reloadIntent = true;
    modal.style.display = "none";
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";
    loginForm.reset();
    location.reload();
  };
  document.getElementById("reload-cancelar").onclick = function () {
    modal.style.display = "none";
  };
}

// Quitar el beforeunload y usar botón de recarga
const btnRecargar = document.getElementById("recargarBtn");
if (btnRecargar) {
  btnRecargar.onclick = function () {
    mostrarModalReload();
  };
}
