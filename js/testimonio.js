document.addEventListener('DOMContentLoaded', () => {

    const testimoniosContenedor = document.querySelector('.testimonios-swiper .swiper-wrapper');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9gc0iLBVHnuWopuxijsTupBn_tvZ-B7D3b4WBVZ-meyKF61a8o24Qy1FQ5fxUYL7DaabkkAgILjac/pub?gid=421205038&single=true&output=csv';

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

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(csvText => {
            const comentarios = parsearCSV(csvText);
            const comentariosAMostrar = comentarios.filter(c => c['Nombre Completo'] && c['Tu Testimonio']).slice(0, 12);
            const limiteCaracteres = 350;

            if (comentariosAMostrar.length > 0) {
                comentariosAMostrar.forEach(comentario => {
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

                    let testimonioContentHTML = '';
                    if (testimonioCompleto.length > limiteCaracteres) {
                        const textoTruncado = testimonioCompleto.substring(0, limiteCaracteres) + '...';
                        testimonioContentHTML = `
                                <span class="texto-truncado">${textoTruncado}</span>
                                <span class="texto-completo hidden">${testimonioCompleto}</span>
                                <span class="ver-mas" style="cursor:pointer; color: #627eff; font-style: normal; font-weight: bold;"> Ver más</span>
                                <span class="ver-menos hidden" style="cursor:pointer; color: #627eff; font-style: normal; font-weight: bold;"> Ver menos</span>
                            `;
                    } else {
                        testimonioContentHTML = testimonioCompleto;
                    }

                    const tarjetaHTML = `
                            <div class="swiper-slide">
                                <div class="comentario-tarjeta">
                                    <p class="testimonio">${testimonioContentHTML}</p>
                                    <p class="nombre">${nombre}</p>
                                    <div class="calificacion-fecha">
                                        <span class="calificacion">Calificación: ${calificacion}/5</span>
                                        <span class="fecha">Fecha: ${fechaFormateada}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    testimoniosContenedor.innerHTML += tarjetaHTML;
                });

                const swiper = new Swiper('.testimonios-swiper', {
                    loop: true,
                    spaceBetween: 30,
                    slidesPerView: 1,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                        },
                        1024: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                        }
                    },
                });

                testimoniosContenedor.addEventListener('click', (event) => {
                    const target = event.target;

                    if (target.classList.contains('ver-mas') || target.classList.contains('ver-menos')) {
                        const testimonioPara = target.closest('.testimonio');
                        if (testimonioPara) {
                            const textoTruncadoSpan = testimonioPara.querySelector('.texto-truncado');
                            const textoCompletoSpan = testimonioPara.querySelector('.texto-completo');
                            const verMasSpan = testimonioPara.querySelector('.ver-mas');
                            const verMenosSpan = testimonioPara.querySelector('.ver-menos');

                            if (textoTruncadoSpan && textoCompletoSpan && verMasSpan && verMenosSpan) {
                                if (target.classList.contains('ver-mas')) {
                                    textoTruncadoSpan.classList.add('hidden');
                                    textoCompletoSpan.classList.remove('hidden');
                                    verMasSpan.classList.add('hidden');
                                    verMenosSpan.classList.remove('hidden');
                                } else if (target.classList.contains('ver-menos')) {
                                    textoCompletoSpan.classList.add('hidden');
                                    textoTruncadoSpan.classList.remove('hidden');
                                    verMenosSpan.classList.add('hidden');
                                    verMasSpan.classList.remove('hidden');
                                }
                            }
                        }
                    }
                });

            } else {
                testimoniosContenedor.innerHTML = '<div class="swiper-slide"><p class="text-center text-gray-600">No hay comentarios para mostrar en este momento.</p></div>';
                document.querySelector('.testimonios-swiper .swiper-button-next').style.display = 'none';
                document.querySelector('.testimonios-swiper .swiper-button-prev').style.display = 'none';
                document.querySelector('.swiper-pagination').style.display = 'none';
            }

        })
        .catch(error => {
            console.error('Error al cargar los comentarios:', error);
            testimoniosContenedor.innerHTML = '<div class="swiper-slide"><p class="text-center text-red-500">Error al cargar los comentarios.</p></div>';
            document.querySelector('.testimonios-swiper .swiper-button-next').style.display = 'none';
            document.querySelector('.testimonios-swiper .swiper-button-prev').style.display = 'none';
            document.querySelector('.swiper-pagination').style.display = 'none';
        });

    const verTodosBtn = document.getElementById('ver-todos-testimonios-btn');
    if (verTodosBtn) {
        verTodosBtn.addEventListener('click', () => {
            // window.location.href = 'testimonios-completos.html';
            // window.open('testimonios-completos.html', '_blank');
        });
    }

});