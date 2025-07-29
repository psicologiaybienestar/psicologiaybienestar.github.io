// === JavaScript para cargar y mostrar TODOS los testimonios ===
document.addEventListener('DOMContentLoaded', () => {

    const gridTestimoniosContenedor = document.getElementById('grid-testimonios');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9gc0iLBVHnuWopuxijsTupBn_tvZ-B7D3b4WBVZ-meyKF61a8o24Qy1FQ5fxUYL7DaabkkAgILjac/pub?gid=421205038&single=true&output=csv';

    // --- FUNCIÓN PARA PARSEAR CSV ---
    function parsearCSV(csvText) {
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        if (rows.length === 0) return [];

        const headers = rows[0].split(',').map(header => header.trim().replace(/[\ufeff\r]/g, ''));
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            let currentRow = rows[i];
            let rowData = {};
            let inQuotes = false;
            let field = '';
            let headerIndex = 0;
            let char;

            for (let j = 0; j < currentRow.length; j++) {
                char = currentRow[j];

                if (char === '"') {
                    if (inQuotes && j + 1 < currentRow.length && currentRow[j + 1] === '"') {
                        field += '"';
                        j++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    if (headers[headerIndex]) {
                        rowData[headers[headerIndex]] = field.trim();
                    }
                    field = '';
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

        return data.filter(item => item['Nombre Completo'] && item['Tu Testimonio'] && item['Calificación'] && item['Fecha']);
    }
    // --- FIN FUNCIÓN PARA PARSEAR CSV ---


    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const comentarios = parsearCSV(csvText);

            if (comentarios.length > 0) {
                // Iterar sobre *todos* los comentarios y crear sus tarjetas
                comentarios.forEach(comentario => {
                    const nombre = comentario['Nombre Completo'] || 'Anónimo';
                    const testimonioCompleto = comentario['Tu Testimonio'] || 'Sin testimonio';
                    const calificacion = comentario['Calificación'] || 'N/A';
                    const fecha = comentario['Fecha'] || '';

                    let fechaFormateada = fecha;
                    try {
                        const partesFecha = fecha.split('/');
                        if (partesFecha.length === 3) {
                            const año = partesFecha[2].length === 2 ? `20${partesFecha[2]}` : partesFecha[2];
                            const fechaObj = new Date(año, partesFecha[1] - 1, partesFecha[0]);
                            const dia = fechaObj.getDate().toString().padStart(2, '0');
                            const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
                            const añoCompleto = fechaObj.getFullYear();
                            fechaFormateada = `${dia}/${mes}/${añoCompleto}`;
                        } else {
                            fechaFormateada = fecha.split(' ')[0] || '';
                        }
                    } catch (e) {
                        console.error("Error parseando fecha:", fecha, e);
                        fechaFormateada = fecha.split(' ')[0] || '';
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
                    // Añadir la tarjeta al contenedor del grid
                    gridTestimoniosContenedor.innerHTML += tarjetaHTML;
                });

            } else {
                // Si no se cargaron comentarios
                gridTestimoniosContenedor.innerHTML = '<p class="text-center text-gray-600">No hay testimonios para mostrar en este momento.</p>';
            }

        })
        .catch(error => {
            console.error('Error al cargar los testimonios:', error);
            gridTestimoniosContenedor.innerHTML = '<p class="text-center text-red-500">Error al cargar los testimonios.</p>';
        });
});
// === Fin JavaScript para Testimonios Completos ===

// === JavaScript para recargar links a index ===
const indexLinks = document.querySelectorAll('a[href^="/index.html#"]'); 
indexLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        // Opcional: Evitar el comportamiento predeterminado y forzar recarga
        // event.preventDefault();
        // window.location.href = link.href; // Navega y luego recarga
        // window.location.reload(true);
    });
});
