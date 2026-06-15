// Source toggles / Alternadores de fuente
document.querySelectorAll('.source-toggle').forEach(toggle => {
  toggle.addEventListener('click', function() {
    this.classList.toggle('off');
  });
});
 
// Scroll animations / Animaciones al hacer scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
 
document.querySelectorAll('.step-item, .platform-card, .course-card, .beca-card, .job-card, .profile-feature, .ia-feature').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// ======================================================
// SESIÓN DE USUARIO (persistencia con localStorage)
// ======================================================

const PERFIL_KEY = "oportunia_perfil";

// Guarda el perfil del usuario en el navegador
function guardarPerfil(perfil) {
  localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
}

// Recupera el perfil guardado (o null si no hay ninguno)
function cargarPerfil() {
  const data = localStorage.getItem(PERFIL_KEY);
  return data ? JSON.parse(data) : null;
}

// Elimina el perfil guardado (cerrar sesión)
function borrarPerfil() {
  localStorage.removeItem(PERFIL_KEY);
}

// Genera un avatar circular con la inicial del nombre (sin pedir imágenes externas)
function generarAvatar(nombre) {
  const inicial = (nombre || "U").trim().charAt(0).toUpperCase() || "U";
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="68" height="68">' +
    '<rect width="100%" height="100%" rx="34" fill="#2563EB"/>' +
    '<text x="50%" y="54%" font-family="Manrope, sans-serif" font-size="30" ' +
    'fill="#ffffff" font-weight="800" text-anchor="middle" dominant-baseline="middle">' +
    inicial + '</text></svg>';
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// Muestra el header como "usuario logueado" o como "visitante"
function actualizarHeaderUsuario(perfil) {
  const navActions = document.querySelector(".nav-actions");
  const navUsuario = document.getElementById("navUsuario");

  if (perfil && perfil.datosPersonales && perfil.datosPersonales.nombre) {
    const nombreCompleto = perfil.datosPersonales.nombre.trim();
    const primerNombre = nombreCompleto.split(" ")[0];

    document.getElementById("navAvatar").src = generarAvatar(nombreCompleto);
    document.getElementById("navNombre").textContent = primerNombre;

    navActions.style.display = "none";
    navUsuario.style.display = "flex";
  } else {
    navActions.style.display = "flex";
    navUsuario.style.display = "none";
    document.getElementById("navDropdown").style.display = "none";
  }
}

// Marca un paso como "disponible" (pulso violeta)
function activarPaso(numero) {
  const paso = document.getElementById("step" + numero);
  if (!paso) return;
  paso.classList.remove("locked", "completed");
  paso.classList.add("available");
}

// Marca un paso como "completado" (animación líquida)
function completarPaso(numero) {
  const paso = document.getElementById("step" + numero);
  if (!paso) return;
  paso.classList.remove("locked", "available");
  paso.classList.add("completed");
}

// Pinta el mapa de "¿Cómo funciona?" según el progreso del usuario
function restaurarProgreso(perfil) {
  for (let n = 1; n <= 5; n++) {
    const paso = document.getElementById("step" + n);
    if (paso) paso.classList.remove("completed", "available", "locked");
  }

  if (perfil) {
    completarPaso(1);
    activarPaso(2);
    [3, 4, 5].forEach(n => {
      const paso = document.getElementById("step" + n);
      if (paso) paso.classList.add("locked");
    });
  } else {
    activarPaso(1);
    [2, 3, 4, 5].forEach(n => {
      const paso = document.getElementById("step" + n);
      if (paso) paso.classList.add("locked");
    });
  }
}

// Carga los datos guardados en el formulario de perfil (para editarlo)
function precargarFormularioPerfil(perfil) {
  if (!perfil || !perfil.datosPersonales) return;

  document.getElementById("pf-nombre").value = perfil.datosPersonales.nombre || "";
  document.getElementById("pf-edad").value = perfil.datosPersonales.edad || "";
  document.getElementById("pf-ciudad").value = perfil.datosPersonales.ciudad || "";
  document.getElementById("pf-provincia").value = perfil.datosPersonales.provincia || "";
  document.getElementById("pf-email").value = perfil.datosPersonales.email || "";
  document.getElementById("pf-red").value = perfil.datosPersonales.redProfesional || "";

  document.getElementById("pf-nivel").value = (perfil.formacion && perfil.formacion.nivelEducativo) || "";
  document.getElementById("pf-carrera").value = (perfil.formacion && perfil.formacion.carrera) || "";

  document.getElementById("pf-habilidades").value = (perfil.habilidades || []).join(", ");
  document.getElementById("pf-intereses").value = (perfil.interesesProfesionales || []).join(", ");
  document.getElementById("pf-objetivo").value = perfil.objetivoProfesional || "";
}

// ======================================================
// INICIALIZACIÓN: restaurar sesión al cargar la página
// ======================================================

let perfilUsuario = cargarPerfil() || {};

actualizarHeaderUsuario(perfilUsuario.datosPersonales ? perfilUsuario : null);
restaurarProgreso(perfilUsuario.datosPersonales ? perfilUsuario : null);

// ======================================================
// CREAR PERFIL
// ======================================================

const profileForm = document.getElementById("profileForm");

if (profileForm) {

  profileForm.addEventListener("submit", function(e) {

    e.preventDefault();

    // Validar email antes de guardar nada
    const inputEmail = document.getElementById("pf-email");
    const errorEmail = document.getElementById("errorPfEmail");

    if (!validarEmail(inputEmail, errorEmail)) return;

    const nombre = document.getElementById("pf-nombre").value;
    const edad = document.getElementById("pf-edad").value;
    const ciudad = document.getElementById("pf-ciudad").value;
    const provincia = document.getElementById("pf-provincia").value;
    const email = document.getElementById("pf-email").value;
    const redProfesional = document.getElementById("pf-red").value;

    const nivelEducativo = document.getElementById("pf-nivel").value;
    const carrera = document.getElementById("pf-carrera").value;

    const habilidades = document.getElementById("pf-habilidades").value
      .split(",")
      .map(h => h.trim())
      .filter(h => h !== "");

    const interesesProfesionales = document.getElementById("pf-intereses").value
      .split(",")
      .map(i => i.trim())
      .filter(i => i !== "");

    const objetivoProfesional = document.getElementById("pf-objetivo").value;

    perfilUsuario = {
      datosPersonales: { nombre, edad, ciudad, provincia, email, redProfesional },
      formacion: { nivelEducativo, carrera },
      habilidades,
      interesesProfesionales,
      objetivoProfesional
    };

    guardarPerfil(perfilUsuario);
    actualizarHeaderUsuario(perfilUsuario);

    document.getElementById("modalPerfil").classList.add("oculto");

    completarPaso(1);
    activarPaso(2);

  });
}

// ======================================================
// MENÚ DE USUARIO (avatar, editar perfil, cerrar sesión)
// ======================================================

// Abrir / cerrar el menú desplegable del avatar
document.getElementById("navAvatarBtn").addEventListener("click", function(e){
  e.stopPropagation();
  const dropdown = document.getElementById("navDropdown");
  dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
});

// Cerrar el menú si se hace click en cualquier otro lugar de la página
document.addEventListener("click", function(){
  document.getElementById("navDropdown").style.display = "none";
});

// Editar perfil: precarga el formulario con los datos guardados
document.getElementById("btnEditarPerfil").addEventListener("click", function(){
  document.getElementById("navDropdown").style.display = "none";
  precargarFormularioPerfil(perfilUsuario);
  document.getElementById("modalPerfil").classList.remove("oculto");
});

// Cerrar sesión: borra el perfil guardado y vuelve a la vista de visitante
document.getElementById("btnLogout").addEventListener("click", function(){
  borrarPerfil();
  perfilUsuario = {};
  actualizarHeaderUsuario(null);
  restaurarProgreso(null);
});

// ======================================================
// FLUJO DE LOGIN / REGISTRO (PASO 1)
// ======================================================

// Click en "Creá tu perfil" -> abre modal de login/registro
document.getElementById("step1").addEventListener("click", function(){
  document.getElementById("modalLogin").classList.remove("oculto");
});

// Continuar con email -> muestra el formulario manual de registro/login
document.getElementById("btnEmailContinue").addEventListener("click", function(){
  document.getElementById("socialLogin").classList.add("oculto");
  document.getElementById("loginDivider").classList.add("oculto");
  document.getElementById("manualLoginSection").classList.remove("oculto");
});

// Crear cuenta / Ingresar -> cierra login y abre el formulario de perfil
document.getElementById("btnCrearCuenta").addEventListener("click", function(e){
  e.preventDefault();
  const input = document.getElementById("emailRegistro");
  const error = document.getElementById("errorEmailRegistro");

  if (!validarEmail(input, error)) return;

  document.getElementById("modalLogin").classList.add("oculto");
  document.getElementById("modalPerfil").classList.remove("oculto");
});

// Ingresar -> valida el email; si no es válido, muestra el error y NO avanza
document.getElementById("btnIngresar").addEventListener("click", function(e){
  e.preventDefault();
  const input = document.getElementById("emailSesion");
  const error = document.getElementById("errorEmailSesion");

  if (!validarEmail(input, error)) return;
  
  document.getElementById("modalLogin").classList.add("oculto");
  document.getElementById("modalPerfil").classList.remove("oculto");
});

// Cerrar modal de perfil
document.getElementById("cerrarModalPerfil").addEventListener("click", function(){
  document.getElementById("modalPerfil").classList.add("oculto");
});


// ======================================================
// CURSOS
// ======================================================

// Links oficiales de cada plataforma (para las platform-card)
const enlacesPlataformas = {
  "Coursera": "https://www.coursera.org/search?productTypeDescription=Professional%20Certificates&sortBy=BEST_MATCH",
  "edX": "https://www.edx.org/",
  "Udemy": "https://www.udemy.com/",
  "Google Career Certificates": "https://grow.google/certificates/",
  "Cisco Networking Academy": "https://www.netacad.com/es/",
  "Fundación Carlos Slim": "https://capacitateparaelempleo.org/",
  "Santander Open Academy": "https://www.santanderopenacademy.com/",
  "LinkedIn Learning": "https://www.linkedin.com/learning/",
  "Harvard Online": "https://pll.harvard.edu/",
  "MIT OpenCourseWare": "https://ocw.mit.edu/"
};

// Catálogo de cursos disponibles.
// "tags" son las palabras clave que el asistente va a comparar
// con perfilUsuario.habilidades e interesesProfesionales.
// "categoria" debe coincidir EXACTAMENTE con el texto de un .edu-tab.
const catalogoCursos = [
  {
    id: "curso-excel-datos",
    plataforma: "Google Career Certificates",
    plataformaIcono: "🔵",
    titulo: "Excel y Análisis de Datos para el Trabajo",
    categoria: "Datos & IA",
    nivel: "Principiante",
    duracion: "40 horas",
    certificado: true,
    gratis: true,
    icono: "📊",
    colorThumb: "linear-gradient(135deg,#2563EB,#38BDF8)",
    url: "https://grow.google/intl/es/google-career-certificates/data-analytics/",
    matchScore: 96,
    tags: ["excel", "datos", "análisis de datos", "administración"]
  },
  {
    id: "curso-habilidades-empleabilidad",
    plataforma: "Santander Open Academy",
    plataformaIcono: "🏦",
    titulo: "Habilidades Profesionales y Empleabilidad",
    categoria: "Negocios",
    nivel: "Principiante",
    duracion: "20 horas",
    certificado: true,
    gratis: true,
    icono: "💼",
    colorThumb: "linear-gradient(135deg,#0EA5E9,#10B981)",
    url: "https://www.santanderopenacademy.com/",
    matchScore: 89,
    tags: ["empleabilidad", "comunicación", "organización", "atención al cliente"]
  },
  {
    id: "curso-fundamentos-ia",
    plataforma: "edX",
    plataformaIcono: "📘",
    titulo: "Fundamentos de Inteligencia Artificial",
    categoria: "Datos & IA",
    nivel: "Intermedio",
    duracion: "12 semanas",
    certificado: false,
    gratis: false,
    icono: "🤖",
    colorThumb: "linear-gradient(135deg,#1E40AF,#2563EB)",
    url: "https://www.edx.org/",
    matchScore: 82,
    tags: ["inteligencia artificial", "tecnología", "programación", "datos"]
  },
  {
    id: "curso-ciberseguridad",
    plataforma: "Cisco Networking Academy",
    plataformaIcono: "🌐",
    titulo: "Introducción a la Ciberseguridad",
    categoria: "Tecnología",
    nivel: "Principiante",
    duracion: "6 horas",
    certificado: true,
    gratis: true,
    icono: "🛡️",
    colorThumb: "linear-gradient(135deg,#0EA5E9,#1E40AF)",
    url: "https://www.netacad.com/courses/introduction-to-cybersecurity?courseLang=es-XL",
    matchScore: 78,
    tags: ["ciberseguridad", "redes", "tecnología", "seguridad informática"]
  },
  {
    id: "curso-diseno-ux",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Aspectos Básicos del Diseño de Experiencia del Usuario (UX)",
    categoria: "Diseño",
    nivel: "Principiante",
    duracion: "25 horas",
    certificado: true,
    gratis: true,
    icono: "🎨",
    colorThumb: "linear-gradient(135deg,#7C3AED,#EC4899)",
    url: "https://www.coursera.org/learn/aspectos-basicos-del-diseno-de-la-experiencia-del-usuario-ux",
    matchScore: 75,
    tags: ["diseño", "ux", "figma", "experiencia de usuario"]
  },
  {
    id: "curso-marketing-digital",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Fundamentos del Marketing Digital y Comercio Electrónico",
    categoria: "Marketing",
    nivel: "Principiante",
    duracion: "30 horas",
    certificado: true,
    gratis: true,
    icono: "📱",
    colorThumb: "linear-gradient(135deg,#F59E0B,#EF4444)",
    url: "https://www.coursera.org/learn/fundamentos-del-marketing-digital-y-comercio-electronico",
    matchScore: 80,
    tags: ["marketing", "redes sociales", "contenido", "comercio electrónico"]
  },
  {
    id: "curso-ingles-profesional",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Inglés para el Desarrollo Profesional",
    categoria: "Idiomas",
    nivel: "Intermedio",
    duracion: "40 horas",
    certificado: true,
    gratis: true,
    icono: "🗣️",
    colorThumb: "linear-gradient(135deg,#10B981,#0EA5E9)",
    url: "https://www.coursera.org/learn/careerdevelopment",
    matchScore: 70,
    tags: ["inglés", "idiomas", "entrevistas", "comunicación"]
  },
  {
    id: "curso-salud-publica",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Las Personas, el Poder y el Orgullo de la Salud Pública",
    categoria: "Salud",
    nivel: "Principiante",
    duracion: "15 horas",
    certificado: true,
    gratis: true,
    icono: "🩺",
    colorThumb: "linear-gradient(135deg,#10B981,#059669)",
    url: "https://www.coursera.org/learn/public-health",
    matchScore: 65,
    tags: ["salud", "salud pública", "comunidad", "bienestar"]
  },

  // 👉 Plantilla para agregar un curso nuevo (copiá y completá):
  // {
  //   id: "curso-xxx",                 // único, sin espacios
  //   plataforma: "...",
  //   plataformaIcono: "🔵",
  //   titulo: "...",
  //   categoria: "...",                // Tecnología / Negocios / Diseño / Datos & IA / Marketing / Idiomas / Salud
  //   nivel: "Principiante|Intermedio|Avanzado",
  //   duracion: "...",
  //   certificado: true/false,
  //   gratis: true/false,
  //   icono: "📊",
  //   colorThumb: "linear-gradient(135deg,#COLOR1,#COLOR2)",
  //   url: "https://...",              // link directo al curso/plataforma
  //   matchScore: 0,                   // 0-100, % de compatibilidad mostrado en la tarjeta
  //   tags: ["...", "...", "..."]      // 3 a 5 palabras clave en minúscula
  // },
];

// Construye el HTML de una sola course-card a partir de un objeto del catálogo
function crearCourseCard(curso) {
  const badgeRecomendado = curso.matchScore >= 90
    ? '<div class="course-ai-badge">🤖 Recomendado para tu perfil</div>'
    : "";

  const precio = curso.gratis
    ? '<span class="course-price-free">✓ Gratis</span>'
    : '<span class="course-price-paid">Certificación opcional</span>';

  const certificadoTxt = curso.certificado ? "Certificado incluido" : "Certificado opcional";

  return `
    <div class="course-card" data-curso-id="${curso.id}">

      ${badgeRecomendado}

      <div class="course-thumb" style="background:${curso.colorThumb}">
        ${curso.icono}
      </div>

      <div class="course-body">

        <div class="course-platform-badge">
          ${curso.plataformaIcono} ${curso.plataforma}
        </div>

        <div class="course-title">
          ${curso.titulo}
        </div>

        <div class="course-meta">
          <span>${curso.nivel}</span>
          <span class="dot"></span>
          <span>${curso.duracion}</span>
          <span class="dot"></span>
          <span>${certificadoTxt}</span>
        </div>

        <div class="course-footer">
          ${precio}
          <span class="course-match-score">Match: <span>${curso.matchScore}%</span></span>
        </div>

      </div>

    </div>
  `;
}

// Pinta en pantalla un listado de cursos (ya filtrado) y conecta los clicks
function renderCursos(lista) {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = '<p class="becas-empty">No encontramos cursos en esta categoría todavía. Probá con otra pestaña.</p>';
    return;
  }

  grid.innerHTML = lista.map(crearCourseCard).join("");

  // Conecta cada course-card con el link real del curso
  grid.querySelectorAll(".course-card[data-curso-id]").forEach(card => {
    const curso = catalogoCursos.find(c => c.id === card.dataset.cursoId);
    if (!curso || !curso.url) return;

    card.style.cursor = "pointer";
    card.addEventListener("click", () => window.open(curso.url, "_blank"));
  });
}

// Filtra catalogoCursos según la pestaña activa ("Todos" no filtra nada)
function aplicarFiltroCursos(categoria) {
  const filtrados = (!categoria || categoria === "Todos")
    ? catalogoCursos
    : catalogoCursos.filter(c => c.categoria === categoria);

  renderCursos(filtrados);
}

// Conecta las tarjetas de plataformas con sus links externos
function activarClicksDePlataformas() {
  document.querySelectorAll('.platform-card').forEach(card => {
    const nombre = card.querySelector('.platform-name').textContent.trim();
    const url = enlacesPlataformas[nombre];

    if (!url) return; // si la plataforma no está en el mapa, no hace nada

    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      window.open(url, '_blank');
    });
  });
}

activarClicksDePlataformas();

// Render inicial: "Todos" los cursos
aplicarFiltroCursos("Todos");

// Conectar las pestañas .edu-tab para filtrar por categoría
document.querySelectorAll('.edu-tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    aplicarFiltroCursos(this.textContent.trim());
  });
});


// ======================================================
// BECAS
// ======================================================

// Las becas viven en becas.json (las administra la persona encargada
// de esa sección). Acá solo las cargamos, las mostramos y las filtramos.

let catalogoBecas = []; // se llena con fetch() al cargar la página

// Convierte el % de compatibilidad en el stroke-dashoffset del círculo SVG
// (circunferencia = 2 * π * 27 ≈ 169.6)
function dashoffsetCompatibilidad(pct) {
  const circunferencia = 169.6;
  const valor = Math.max(0, Math.min(100, Number(pct) || 0));
  return (circunferencia - (circunferencia * valor / 100)).toFixed(1);
}

// Construye el HTML de una sola beca-card a partir de un objeto del JSON
function crearBecaCard(beca) {
  const featuredClass = beca.destacada ? " featured" : "";
  const featuredBadge = beca.destacada
    ? '<div style="margin-bottom:6px"><span class="beca-featured-badge">⭐ Destacada</span></div>'
    : "";

  const tagAlcanceClass = beca.alcance === "Internacional" ? "intl" : "";
  const tagTipoClass = beca.tipo === "Completa" ? "full" : "";

  const tags = [
    `<span class="beca-tag ${tagAlcanceClass}">${beca.alcance}</span>`,
    `<span class="beca-tag ${tagTipoClass}">${beca.tipo}</span>`,
    `<span class="beca-tag">${beca.area}</span>`,
    beca.requiereIngles ? '<span class="beca-tag">Inglés requerido</span>' : ""
  ].filter(Boolean).join("\n");

  const offset = dashoffsetCompatibilidad(beca.compatibilidad);

  return `
    <div class="beca-card${featuredClass}" data-beca-id="${beca.id}">

      <div class="beca-logo-wrap">${beca.logo || "🏆"}</div>

      <div class="beca-info">
        ${featuredBadge}

        <div class="beca-title">${beca.titulo}</div>
        <div class="beca-org">${beca.organizacion}</div>

        <div class="beca-tags">${tags}</div>
      </div>

      <div class="beca-side">

        <div class="match-circle">
          <svg width="62" height="62" viewBox="0 0 62 62">
            <circle cx="31" cy="31" r="27" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="5"/>
            <circle cx="31" cy="31" r="27" fill="none" stroke="#10B981" stroke-width="5" stroke-dasharray="169.6" stroke-dashoffset="${offset}" stroke-linecap="round"/>
          </svg>

          <div class="match-circle-inner">
            <div class="match-pct">${beca.compatibilidad}%</div>
            <div class="match-lbl">compat.</div>
          </div>
        </div>

        <div class="beca-deadline">
          Cierra: ${beca.fechaCierre || "Sin fecha"}
        </div>

        <button class="btn-apply" type="button" data-url="${beca.url || ""}">Ver requisitos →</button>
        <button class="btn-save" type="button">Guardar</button>

      </div>

    </div>
  `;
}

// Pinta en pantalla un listado de becas (ya filtrado)
function renderBecas(lista) {
  const grid = document.getElementById("becasGrid");
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = '<p class="becas-empty">No encontramos becas que coincidan con esos filtros. Probá ajustando las opciones de la izquierda.</p>';
    return;
  }

  grid.innerHTML = lista.map(crearBecaCard).join("");

  // Conectar el botón "Ver requisitos" de cada tarjeta con su URL
  grid.querySelectorAll(".btn-apply").forEach(btn => {
    const url = btn.dataset.url;
    if (!url) return;
    btn.addEventListener("click", () => window.open(url, "_blank"));
  });
}

// Lee el estado actual de los filtros de la sidebar
function leerFiltrosBecas() {
  const tipos = Array.from(document.querySelectorAll('[data-filtro="tipo"]:checked')).map(i => i.value);
  const alcances = Array.from(document.querySelectorAll('[data-filtro="alcance"]:checked')).map(i => i.value);
  const areas = Array.from(document.querySelectorAll('[data-filtro="area"]:checked')).map(i => i.value);

  const sliderCompat = document.getElementById("filtroCompatMin");
  const compatMin = sliderCompat ? Number(sliderCompat.value) : 0;

  return { tipos, alcances, areas, compatMin };
}

// Aplica los filtros actuales sobre catalogoBecas y vuelve a renderizar
function aplicarFiltrosBecas() {
  const { tipos, alcances, areas, compatMin } = leerFiltrosBecas();

  const filtradas = catalogoBecas.filter(beca => {
    // Si no hay ningún checkbox tildado en un grupo, ese grupo no filtra (deja pasar todo)
    const pasaTipo = tipos.length === 0 || tipos.includes(beca.tipo);
    const pasaAlcance = alcances.length === 0 || alcances.includes(beca.alcance);
    const pasaArea = areas.length === 0 || areas.includes(beca.area);
    const pasaCompat = (beca.compatibilidad || 0) >= compatMin;

    return pasaTipo && pasaAlcance && pasaArea && pasaCompat;
  });

  renderBecas(filtradas);
}

// Vista inicial: solo unas pocas becas (destacadas primero), antes de filtrar
function renderBecasIniciales() {
  const destacadas = catalogoBecas.filter(b => b.destacada);
  const resto = catalogoBecas.filter(b => !b.destacada);

  const vistaInicial = [...destacadas, ...resto].slice(0, 3);
  renderBecas(vistaInicial);
}

// Carga becas.json y deja todo listo para filtrar
function inicializarBecas() {
  fetch("becas.json")
    .then(resp => {
      if (!resp.ok) throw new Error("No se pudo cargar becas.json");
      return resp.json();
    })
    .then(data => {
      catalogoBecas = data;
      renderBecasIniciales(); // primer render: solo un puñado de becas, como antes
    })
    .catch(err => {
      console.error("Error cargando becas.json:", err);
      const grid = document.getElementById("becasGrid");
      if (grid) {
        grid.innerHTML = '<p class="becas-empty">No pudimos cargar las becas en este momento. Intentá de nuevo más tarde.</p>';
      }
    });
}

inicializarBecas();

// Los checkboxes y el slider solo actualizan la etiqueta / estado visual;
// el filtrado real se dispara al tocar "Aplicar filtros".
const sliderCompatMin = document.getElementById("filtroCompatMin");
if (sliderCompatMin) {
  const labelCompatMin = document.getElementById("filtroCompatMinLabel");

  sliderCompatMin.addEventListener("input", function () {
    if (labelCompatMin) labelCompatMin.textContent = this.value + "%+";
  });
}

const btnAplicarFiltrosBecas = document.getElementById("btnAplicarFiltrosBecas");
if (btnAplicarFiltrosBecas) {
  btnAplicarFiltrosBecas.addEventListener("click", aplicarFiltrosBecas);
}

// ======================================================
// EMPLEABILIDAD
// ======================================================

// Catálogo de empleos disponibles.
const catalogoEmpleos = [
  {
    id: "empleo-asistente-admin",
    titulo: "Asistente Administrativo",
    empresa: "Empresa Nacional",
    icono: "📊",
    modalidad: "Híbrido",      // Remoto / Presencial / Híbrido
    tipo: "Full Time",         // Full Time / Part Time / Pasantía / Freelance
    nivel: "Junior",           // Junior / Semi Senior / Senior
    tags: ["excel", "administración", "organización"]
  },
  {
    id: "empleo-analista-datos",
    titulo: "Analista de Datos Jr.",
    empresa: "Empresa Tecnológica",
    icono: "📈",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    tags: ["excel", "power bi", "datos", "análisis de datos"]
  },
  {
    id: "empleo-atencion-cliente",
    titulo: "Atención al Cliente",
    empresa: "Empresa de Servicios",
    icono: "🎧",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    tags: ["comunicación", "crm", "atención al cliente"]
  },
  {
    id: "empleo-marketing-digital",
    titulo: "Marketing Digital Jr.",
    empresa: "Agencia de Marketing",
    icono: "📱",
    modalidad: "Híbrido",
    tipo: "Full Time",
    nivel: "Junior",
    tags: ["redes sociales", "contenido", "marketing"]
  },

  // 👉 Plantilla para agregar un empleo nuevo:
  // {
  //   id: "empleo-xxx",
  //   titulo: "...",
  //   empresa: "...",
  //   icono: "💼",
  //   modalidad: "Remoto|Presencial|Híbrido",
  //   tipo: "Full Time|Part Time|Pasantía|Freelance",
  //   nivel: "Junior|Semi Senior|Senior",
  //   tags: ["...", "...", "..."]
  // },
];

// Abrir modal login
document.getElementById("abrirLogin").addEventListener("click", function(){
  document.getElementById("modalLogin").classList.remove("oculto");
});

document.getElementById("abrirLogin2").addEventListener("click", function(){
  document.getElementById("modalLogin").classList.remove("oculto");
});

// Cerrar modal login
document.getElementById("cerrarModal").addEventListener("click", function(){
  document.getElementById("modalLogin").classList.add("oculto");
});

// Cambiar a iniciar sesión
document.getElementById("btnSesion").addEventListener("click", function(){

  document.getElementById("sesionForm").style.display = "block";
  document.getElementById("registroForm").style.display = "none";

  this.classList.add("active");
  document.getElementById("btnRegistro").classList.remove("active");

});

// Cambiar a registro
document.getElementById("btnRegistro").addEventListener("click", function(){

  document.getElementById("registroForm").style.display = "block";
  document.getElementById("sesionForm").style.display = "none";

  this.classList.add("active");
  document.getElementById("btnSesion").classList.remove("active");

});

document.getElementById("backToSocial").addEventListener("click", function(){
  document.getElementById("manualLoginSection").classList.add("oculto");
  document.getElementById("vistaSocial").classList.remove("oculto");
});

document.getElementById("backToLogin").addEventListener("click", function(){
  document.getElementById("modalPerfil").classList.add("oculto");
  document.getElementById("modalLogin").classList.remove("oculto");
});

function validarEmail(input, errorSpan){
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valido = regex.test(input.value.trim());

  if (!valido){
    input.classList.add("input-error");
    errorSpan.classList.remove("oculto");
  } else {
    input.classList.remove("input-error");
    errorSpan.classList.add("oculto");
  }

  return valido;
}

// Validar al crear cuenta
document.getElementById("btnCrearCuenta").addEventListener("click", function(e){
  e.preventDefault();

  const input = document.getElementById("emailRegistro");
  const error = document.getElementById("errorEmailRegistro");

  if (!validarEmail(input, error)) return;

  document.getElementById("modalLogin").classList.add("oculto");
  document.getElementById("modalPerfil").classList.remove("oculto");
});

// Validar al iniciar sesión
document.getElementById("btnIngresar").addEventListener("click", function(e){
  e.preventDefault();

  const input = document.getElementById("emailSesion");
  const error = document.getElementById("errorEmailSesion");

  if (!validarEmail(input, error)) return;

  document.getElementById("modalLogin").classList.add("oculto");
  document.getElementById("modalPerfil").classList.remove("oculto");
});

// (La validación del email de perfil ya se hace dentro del submit principal,
// más arriba, antes de guardar el perfil y cerrar el modal.)

// ======================================================
// FOOTER - SUSCRIPCIÓN POR EMAIL
// ======================================================

const footerEmailBtn = document.getElementById("footerEmailBtn");

if (footerEmailBtn) {

  footerEmailBtn.addEventListener("click", function(e){

    e.preventDefault();

    const input = document.getElementById("footerEmail");
    const error = document.getElementById("errorFooterEmail");

    if (!validarEmail(input, error)) return;

    alert("¡Listo! Vamos a avisarte a " + input.value + " sobre nuevas becas, cursos y empleos.");

    input.value = "";

  });

}