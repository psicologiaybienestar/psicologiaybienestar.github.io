document.addEventListener("DOMContentLoaded", () => {
  const gridTestimoniosContenedor = document.getElementById("grid-testimonios");
  // URL segura a través de Netlify Functions
  const csvUrl = "/.netlify/functions/obtener-testimonios";

  // --- FUNCIÓN PARA PARSEAR CSV---
  function parsearCSV(csvText) {
    const rows = csvText.split("\n").filter((row) => row.trim() !== "");
    if (rows.length === 0) return [];

    const headers = rows[0]
      .split(",")
      .map((header) => header.trim().replace(/[\ufeff\r]/g, ""));
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      let currentRow = rows[i];
      let rowData = {};
      let inQuotes = false;
      let field = "";
      let headerIndex = 0;
      let char;

      for (let j = 0; j < currentRow.length; j++) {
        char = currentRow[j];

        if (char === '"') {
          if (
            inQuotes &&
            j + 1 < currentRow.length &&
            currentRow[j + 1] === '"'
          ) {
            field += '"';
            j++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          if (headers[headerIndex]) {
            rowData[headers[headerIndex]] = field.trim();
          }
          field = "";
          headerIndex++;
        } else {
          field += char;
        }
      }
      if (headers[headerIndex]) {
        rowData[headers[headerIndex]] = field.trim();
      }
      data.push(rowData);
    }

    return data.filter(
      (item) =>
        item["Nombre Completo"] &&
        item["Tu Testimonio"] &&
        item["Calificación"] &&
        item["Fecha"]
    );
  }

  fetch(csvUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((csvText) => {
      const comentarios = parsearCSV(csvText);

      if (comentarios.length > 0) {
        comentarios.forEach((comentario) => {
          const nombre = comentario["Nombre Completo"] || "Anónimo";
          const testimonioCompleto =
            comentario["Tu Testimonio"] || "Sin testimonio";
          const calificacion = comentario["Calificación"] || "N/A";
          const fecha = comentario["Fecha"] || "";

          let fechaFormateada = fecha;
          try {
            const partesFecha = fecha.split("/");
            if (partesFecha.length === 3) {
              const año =
                partesFecha[2].length === 2
                  ? `20${partesFecha[2]}`
                  : partesFecha[2];
              const fechaObj = new Date(
                año,
                partesFecha[1] - 1,
                partesFecha[0]
              );
              const dia = fechaObj.getDate().toString().padStart(2, "0");
              const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
              const añoCompleto = fechaObj.getFullYear();
              fechaFormateada = `${dia}/${mes}/${añoCompleto}`;
            } else {
              fechaFormateada = fecha.split(" ")[0] || "";
            }
          } catch (e) {
            console.error("Error parseando fecha:", fecha, e);
            fechaFormateada = fecha.split(" ")[0] || "";
          }

          const tarjetaHTML = `
                                 <div class="comentario-tarjeta">
                                     <p class="testimonio">"${testimonioCompleto}"</p>
                                     <p class="nombre">${nombre}</p>
                                     <div class="calificacion-fecha">
                                         <span class="calificacion">Calificación: ${calificacion}/5</span>
                                         <span class="fecha">Fecha: ${fechaFormateada}</span>
                                     </div>
                                 </div>
                             `;
          gridTestimoniosContenedor.innerHTML += tarjetaHTML;
        });
      } else {
        gridTestimoniosContenedor.innerHTML =
          '<p class="text-center text-gray-600">No hay testimonios para mostrar en este momento.</p>';
      }
    })
    .catch((error) => {
      console.error("Error al cargar los testimonios:", error);
      gridTestimoniosContenedor.innerHTML = `
        <div class="col-span-full text-center">
          <div class="bg-white rounded-lg p-8 shadow-lg border border-gray-200 max-w-md mx-auto">
            <p class="text-red-500 mb-4 text-lg font-semibold">Error al cargar los testimonios.</p>
            <p class="text-gray-600 mb-6">Si el problema persiste, puedes ver los testimonios en nuestra versión principal:</p>
            <a href="https://psicologiaybienestar.netlify.app/pages/testimonios" 
               target="_blank" 
               class="inline-block bg-[#627eff] text-white px-6 py-3 rounded-lg hover:bg-[#53c6e4] transition-colors duration-300 font-semibold">
              Ver en versión principal
            </a>
          </div>
        </div>
      `;
    });
});

// === JavaScript para recargar  ===
const indexLinks = document.querySelectorAll('a[href^="/index.html#"]'); // Links a /index.html#...
indexLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    // Opcional: Evitar el comportamiento predeterminado y forzar recarga
    // event.preventDefault();
    // window.location.href = link.href; // Navega y luego recarga
    // window.location.reload(true); // Esto recargaría SIEMPRE
    // Una mejor opción es solo navegar:
  });
});
