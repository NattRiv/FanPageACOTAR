// 1. Parallax suave para el fondo de estrellas
window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    // Mueve ligeramente el fondo según el mouse
    document.body.style.backgroundPosition = `${x * 20}px ${y * 20}px`;
});


// 2. Toggle menú hamburguesa
const toggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {

    nav.classList.toggle('active');

    if (nav.classList.contains('active')) {
        toggle.innerHTML = '✕';
    } else {
        toggle.innerHTML = '☰';
    }

});

// 3. Dropdowns
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(drop => {
    drop.addEventListener('click', () => {
        drop.classList.toggle('active');
    });
});


// 4. Formulario de contacto (solo contacto.html)
const form = document.getElementById('form-wrapper');

if (form) {

    form.addEventListener('submit', (e) => {

        const nombre  = document.getElementById('nombre');
        const mail    = document.getElementById('mail');
        const asunto  = document.getElementById('asunto');
        const mensaje = document.getElementById('mensaje');

        // Limpiar bordes
        [nombre, mail, asunto, mensaje].forEach(el => {
            el.style.borderColor = '';
        });

        let valido = true;

        // Campos vacíos
        [nombre, mail, asunto, mensaje].forEach(el => {

            if (!el.value.trim()) {

                el.style.borderColor = '#c05050';
                valido = false;

            }

        });

        // Validar email
        if (!mail.checkValidity()) {

            mail.style.borderColor = '#c05050';
            valido = false;

        }

        // Si algo está mal, NO enviar
        if (!valido) {

            e.preventDefault();
            return;

        }

        // Evita enviar realmente el formulario
        // (sacalo si querés que vaya a procesar.php)
        e.preventDefault();

        // Mostrar mensaje éxito
        const successOverlay = document.getElementById('success-overlay');

        form.style.transition = 'opacity 0.4s ease';
        form.style.opacity = '0';

        setTimeout(() => {

            form.style.display = 'none';
            successOverlay.style.display = 'flex';

        }, 400);

    });

}

// 5. GLIGHTBOX - Galería de personajes

// Genera el <details> en la card y el data-description para GLightbox
document.querySelectorAll('.character-card[data-char-description]').forEach(card => {
    const text = card.dataset.charDescription;
    const link = card.querySelector('a.glightbox');

    // Agrega data-description al link para GLightbox
    link.setAttribute('data-description',
        `<details><summary>Detalles</summary><p>${text}</p></details>`
    );

    // Crea el <details> en la card
    const details = document.createElement('details');
    details.innerHTML = `<summary>Detalles</summary><p>${text}</p>`;
    card.appendChild(details);
});

if (typeof GLightbox !== 'undefined') {

    const lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        zoomable: true,
        draggable: true,
        openEffect: 'zoom',
        closeEffect: 'fade',
        html: true
    });

    //cada vez que se abere el lightbox, los details vuelven a estar cerrados 
    lightbox.on('open', () => {
        document.querySelectorAll('.character-card details').forEach(d => {
            d.removeAttribute('open');
        });
    });

}

// 6. MAPA INTERACTIVO


const map = document.getElementById('map');

if (map) {

    // ==========================
    // PANZOOM
    // ==========================

    const panzoom = Panzoom(map, {
        maxScale: 5,
        minScale: 1
    });

    const mapWrapper = document.getElementById('map-wrapper');

    mapWrapper.addEventListener('wheel', function(e) {

        e.preventDefault();

        panzoom.zoomWithWheel(e);

    });

    // ==========================
    // BOTONES ZOOM
    // ==========================

    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');

    if (zoomInBtn) {

        zoomInBtn.addEventListener('click', () => {

            panzoom.zoomIn();

        });

    }

    if (zoomOutBtn) {

        zoomOutBtn.addEventListener('click', () => {

            panzoom.zoomOut();

        });

    }

    // ==========================
    // POPUP
    // ==========================

    const points = document.querySelectorAll('.map-point');

    const popup = document.getElementById('map-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupDescription = document.getElementById('popup-description');

    points.forEach(point => {

        point.addEventListener('click', () => {

            popupTitle.textContent = point.dataset.title;
            popupDescription.textContent = point.dataset.description;

            popup.style.display = 'block';

        });

    });

    // ==========================
    // FULLSCREEN
    // ==========================

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const mapSection = document.querySelector('.map-section');

    if (fullscreenBtn && mapSection) {

        fullscreenBtn.addEventListener('click', () => {

            if (!document.fullscreenElement) {

                mapSection.requestFullscreen();

            } else {

                document.exitFullscreen();

            }

        });

    }

    //cierra el popup al hacer click en la X
    document.getElementById('popup-close').addEventListener('click', () => {
    popup.style.display = 'none';
    });


    //cambia el tamaño de los puntos según el zoom para que no se vean gigantes o diminutos
    map.addEventListener('panzoomzoom', (e) => {
    const scale = e.detail.scale;
    document.querySelectorAll('.map-point').forEach(point => {
        const size = Math.max(6, 18 / scale); // mínimo 6px
        point.style.width  = size + 'px';
        point.style.height = size + 'px';
    });
    });


    document.addEventListener('fullscreenchange', () => {

    if (document.fullscreenElement) {

        const scaleX = window.innerWidth / 679;
        const scaleY = window.innerHeight / 458;

        const scale = Math.min(scaleX, scaleY) * 0.95;

        map.style.transform = `scale(${scale})`;

    } else {

        map.style.transform = 'scale(1)';

    }

    });

}


//7. ===== BUSCADOR DE PERSONAJES =====
(function () {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const clearBtn   = document.getElementById('clearBtn');
    const counter    = document.getElementById('resultsCount');
    const gallery    = document.querySelector('.characters-gallery');

    // Mensaje de sin resultados
    const noResults = document.createElement('p');
    noResults.className = 'no-results-msg';
    noResults.textContent = 'No se encontró ningún personaje con ese nombre.';
    gallery.appendChild(noResults);

    function filter() {
        const q     = input.value.trim().toLowerCase();
        const cards = gallery.querySelectorAll('.character-card');
        let visible = 0;

        cards.forEach(card => {
            const name    = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const matches = name.includes(q);
            card.classList.toggle('hidden-by-search', !matches);
            if (matches) visible++;
        });

        clearBtn.style.display    = q.length ? 'block' : 'none';
        noResults.style.display   = (q.length && visible === 0) ? 'block' : 'none';
        counter.textContent       = q.length
            ? (visible === 1 ? '1 personaje encontrado' : `${visible} personajes encontrados`)
            : '';
    }

    input.addEventListener('input', filter);

    clearBtn.addEventListener('click', function () {
        input.value = '';
        filter();
        input.focus();
    });
})();

//7. ===== FILTRO AUTOMÁTICO DESDE URL =====
(function () {
    const input = document.getElementById('searchInput');
    if (!input) return; // solo corre en personajes.html

    const params = new URLSearchParams(window.location.search);
    const personaje = params.get('personaje');

    if (personaje) {
        input.value = personaje;
        input.dispatchEvent(new Event('input')); // activa el filtro
    }
})();

//8. ===== BUSCADOR DE CORTES =====
(function () {
    const input = document.getElementById('searchInputCortes');
    if (!input) return;

    const clearBtn  = document.getElementById('clearBtnCortes');
    const counter   = document.getElementById('resultsCountCortes');
    const container = document.querySelector('.courts-container');

    const noResults = document.createElement('p');
    noResults.className = 'no-results-msg';
    noResults.textContent = 'No se encontró ninguna corte con ese nombre.';
    container.appendChild(noResults);

    function filter() {
        const q     = input.value.trim().toLowerCase();
        const cards = container.querySelectorAll('.court-card');
        let visible = 0;

        cards.forEach(card => {
            const name    = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const matches = name.includes(q);
            card.classList.toggle('hidden-by-search', !matches);
            if (matches) visible++;
        });

        clearBtn.style.display  = q.length ? 'block' : 'none';
        noResults.style.display = (q.length && visible === 0) ? 'block' : 'none';
        counter.textContent     = q.length
            ? (visible === 1 ? '1 corte encontrada' : `${visible} cortes encontradas`)
            : '';
    }

    input.addEventListener('input', filter);

    clearBtn.addEventListener('click', function () {
        input.value = '';
        filter();
        input.focus();
    });
})();

// HELPER TEMPORAL: click en el mapa imprime las coordenadas en consola para poder modificar los puntos fácilmente sin tener que adivinar los porcentajes
/*
const mapImg = document.querySelector('#map img');
if (mapImg) {
    mapImg.addEventListener('click', (e) => {
        const rect = mapImg.getBoundingClientRect();
        const top  = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        const left = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        console.log(`top: ${top}%, left: ${left}%`);
    });
}
*/