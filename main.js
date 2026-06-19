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

  irATabPerfil("datos");
}

// ======================================================
// PESTAÑAS DEL FORMULARIO DE PERFIL (estilo Bumeran)
// ======================================================

const ORDEN_TABS_PERFIL = ["datos", "formacion", "habilidades", "objetivo"];

function irATabPerfil(tab) {
  // Botones de pestaña
  document.querySelectorAll(".perfil-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });

  // Paneles
  document.querySelectorAll(".perfil-tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.tab === tab);
  });

  const indice = ORDEN_TABS_PERFIL.indexOf(tab);
  const esPrimera = indice === 0;
  const esUltima = indice === ORDEN_TABS_PERFIL.length - 1;

  document.getElementById("perfilTabPrev").classList.toggle("oculto", esPrimera);
  document.getElementById("perfilTabNext").classList.toggle("oculto", esUltima);
  document.getElementById("perfilSubmitBtn").classList.toggle("oculto", !esUltima);
}

// Click directo en cualquier pestaña
document.querySelectorAll(".perfil-tab").forEach(btn => {
  btn.addEventListener("click", () => irATabPerfil(btn.dataset.tab));
});

// Botón "Siguiente"
document.getElementById("perfilTabNext").addEventListener("click", () => {
  const actualBtn = document.querySelector(".perfil-tab.active");
  const indiceActual = ORDEN_TABS_PERFIL.indexOf(actualBtn.dataset.tab);
  const siguiente = ORDEN_TABS_PERFIL[indiceActual + 1];
  if (siguiente) irATabPerfil(siguiente);
});

// Botón "Anterior"
document.getElementById("perfilTabPrev").addEventListener("click", () => {
  const actualBtn = document.querySelector(".perfil-tab.active");
  const indiceActual = ORDEN_TABS_PERFIL.indexOf(actualBtn.dataset.tab);
  const anterior = ORDEN_TABS_PERFIL[indiceActual - 1];
  if (anterior) irATabPerfil(anterior);
});

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

    // Si el usuario saltó directo a una pestaña sin completar las anteriores,
    // los campos requeridos de las otras pestañas quedan ocultos y el navegador
    // no los valida solo. Los revisamos a mano antes de seguir.
    const camposVacios = [...profileForm.querySelectorAll("[required]")]
      .filter(campo => !campo.value || !campo.value.trim());

    if (camposVacios.length) {
      const panelConError = camposVacios[0].closest(".perfil-tab-panel");
      if (panelConError) irATabPerfil(panelConError.dataset.tab);
      camposVacios[0].focus();
      mostrarToast("⚠️ Completá todos los campos obligatorios antes de guardar.");
      return;
    }

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

    mostrarToast("✅ ¡Perfil guardado! Ahora la IA puede analizar tus oportunidades.");

    // Reordenar becas y empleos por compatibilidad con el perfil guardado
    reordenarPorPerfil(perfilUsuario);

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
  abrirModalLogin();
});

// Click en "Analizá tu perfil" -> si tiene perfil, reordena todo por compatibilidad
document.getElementById("step2").addEventListener("click", function(){
  const perfil = cargarPerfil();
  if (!perfil || !perfil.datosPersonales) return;
  reordenarPorPerfil(perfil);
  completarPaso(2);
  activarPaso(3);
  // Scroll suave a cursos
  document.getElementById("hub").scrollIntoView({ behavior: "smooth" });
});

// Continuar con email -> muestra el formulario manual de registro/login
document.getElementById("btnEmailContinue").addEventListener("click", function(){
  document.getElementById("socialLogin").classList.add("oculto");
  document.getElementById("loginDivider").classList.add("oculto");
  document.getElementById("manualLoginSection").classList.remove("oculto");
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

    const categoria = this.textContent.trim();
    filtrarPlataformasPorTab(categoria);
  });
});

function filtrarPlataformasPorTab(categoria) {
  document.querySelectorAll('.platform-card').forEach(card => {
    const areas = (card.dataset.areas || '').split(',');
    const mostrar = categoria === 'Todos' || areas.includes(categoria.toLowerCase().replace('& ', '').replace(/ /g, '-'));
    card.style.display = mostrar ? '' : 'none';
  });
}

// ======================================================
// BECAS
// ======================================================

const becas = [
  {
    id: 1, logo: "🌎", titulo: "Becas Hubert H. Humphrey",
    organizacion: "Fulbright Argentina", pais: "Estados Unidos",
    modalidad: "Presencial", nivel: "Posgrado", area: "Políticas Públicas",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 84,
    destacada: true, requiereIngles: true,
    descripcion: "Programa de perfeccionamiento profesional y académico en EE.UU. durante un año académico para profesionales argentinos de trayectoria intermedia.",
    url: "https://fulbright.edu.ar/course/humphrey/",
    fechaCierre: "2026-07-15"
  },
  {
    id: 2, logo: "🏦", titulo: "Alumnos de Grado Argentina 2026",
    organizacion: "Santander Open Academy", pais: "Argentina",
    modalidad: "Online", nivel: "Grado", area: "Educación",
    tipo: "Único pago", alcance: "Nacional", idioma: "Español",
    financiamiento: "100%", estado: "abierta", compatibilidad: 91,
    destacada: true, requiereIngles: false,
    descripcion: "Becas para alumnos de universidades argentinas con necesidades económicas y alto desempeño académico.",
    url: "https://app.santanderopenacademy.com/es/program/alumnos-de-grado-argentina-2026",
    fechaCierre: "2026-07-30"
  },
  {
    id: 3, logo: "🌐", titulo: "Progresar Formación Profesional 2026",
    organizacion: "ANSES", pais: "Argentina",
    modalidad: "Presencial", nivel: "Indistinto", area: "Educación",
    tipo: "Mensual", alcance: "Nacional", idioma: "Español",
    financiamiento: "100%", estado: "abierta", compatibilidad: 88,
    destacada: true, requiereIngles: false,
    descripcion: "Ayuda económica para ciudadanos que desean realizar cursos de Formación Profesional.",
    url: "https://www.argentina.gob.ar/educacion/progresar",
    fechaCierre: "2026-11-27"
  },
  {
    id: 4, logo: "🇩🇪", titulo: "Cursos universitarios de invierno en Alemania",
    organizacion: "DAAD", pais: "Alemania",
    modalidad: "Presencial", nivel: "Grado", area: "Idioma",
    tipo: "Completa", alcance: "Internacional", idioma: "Alemán",
    financiamiento: "100%", estado: "abierta", compatibilidad: 50,
    destacada: false, requiereIngles: false,
    descripcion: "Profundización en el idioma alemán y ampliación de conocimientos en estudios regionales.",
    url: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
    fechaCierre: "2026-07-31"
  },
  {
    id: 5, logo: "🇬🇧", titulo: "Chevening Scholarships",
    organizacion: "Chevening", pais: "Reino Unido",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 88,
    destacada: true, requiereIngles: true,
    descripcion: "Becas del Gobierno del Reino Unido para realizar maestrías de un año en universidades británicas.",
    url: "https://www.chevening.org",
    fechaCierre: "2026-11-05"
  },
  {
    id: 6, logo: "🇪🇺", titulo: "Erasmus Mundus Joint Master",
    organizacion: "Erasmus Mundus", pais: "Europa",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 85,
    destacada: true, requiereIngles: true,
    descripcion: "Becas para realizar maestrías conjuntas en universidades europeas.",
    url: "https://ec.europa.eu/programmes/erasmus-plus/opportunities/individuals/students/erasmus-mundus-joint-master-degrees_en",
    fechaCierre: "2026-12-31"
  },
  {
    id: 7, logo: "🇪🇸", titulo: "Fundación Carolina Posgrado",
    organizacion: "Fundación Carolina", pais: "España",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Español",
    financiamiento: "100%", estado: "abierta", compatibilidad: 89,
    destacada: true, requiereIngles: false,
    descripcion: "Becas para estudios de posgrado en universidades españolas.",
    url: "https://www.fundacioncarolina.es",
    fechaCierre: "2026-03-15"
  },
  {
    id: 8, logo: "🇯🇵", titulo: "MEXT Scholarship",
    organizacion: "Gobierno de Japón", pais: "Japón",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 86,
    destacada: true, requiereIngles: true,
    descripcion: "Programa de becas para estudiar carreras, maestrías y doctorados en Japón.",
    url: "https://www.studyinjapan.go.jp",
    fechaCierre: "2026-06-15"
  },
  {
    id: 9, logo: "🇰🇷", titulo: "Global Korea Scholarship (GKS)",
    organizacion: "Gobierno de Corea del Sur", pais: "Corea del Sur",
    modalidad: "Presencial", nivel: "Grado y Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 84,
    destacada: true, requiereIngles: true,
    descripcion: "Becas completas para grado y posgrado en universidades coreanas.",
    url: "https://www.studyinkorea.go.kr",
    fechaCierre: "2026-04-01"
  },
  {
    id: 10, logo: "🇨🇭", titulo: "Swiss Government Excellence Scholarships",
    organizacion: "Gobierno de Suiza", pais: "Suiza",
    modalidad: "Presencial", nivel: "Posgrado", area: "Investigación",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 82,
    destacada: false, requiereIngles: true,
    descripcion: "Becas para investigadores y estudiantes internacionales en Suiza.",
    url: "https://www.sbfi.admin.ch",
    fechaCierre: "2026-11-01"
  },
  {
    id: 11, logo: "🇦🇺", titulo: "Australia Awards Scholarships",
    organizacion: "Gobierno de Australia", pais: "Australia",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 87,
    destacada: true, requiereIngles: true,
    descripcion: "Becas completas para estudiantes internacionales en universidades australianas.",
    url: "https://www.australiaawards.gov.au",
    fechaCierre: "2026-04-30"
  },
  {
    id: 12, logo: "🇮🇪", titulo: "Ireland Fellows Programme",
    organizacion: "Gobierno de Irlanda", pais: "Irlanda",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 85,
    destacada: false, requiereIngles: true,
    descripcion: "Programa de maestrías financiadas para estudiantes internacionales en Irlanda.",
    url: "https://www.irishaidfellowships.ie",
    fechaCierre: "2026-08-01"
  },
  {
    id: 13, logo: "🌎", titulo: "Becas OEA Académicas",
    organizacion: "OEA", pais: "América",
    modalidad: "Mixta", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Español",
    financiamiento: "50%", estado: "abierta", compatibilidad: 78,
    destacada: false, requiereIngles: false,
    descripcion: "Programa de apoyo para estudios superiores en instituciones asociadas de América.",
    url: "https://www.oas.org",
    fechaCierre: "2026-06-01"
  },
  {
    id: 14, logo: "🇳🇱", titulo: "Orange Knowledge Programme",
    organizacion: "Gobierno de Países Bajos", pais: "Países Bajos",
    modalidad: "Presencial", nivel: "Posgrado", area: "Educación",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 81,
    destacada: false, requiereIngles: true,
    descripcion: "Programa para fortalecer capacidades profesionales mediante estudios internacionales en los Países Bajos.",
    url: "https://www.nuffic.nl",
    fechaCierre: "2026-05-15"
  },
  {
    id: 15, logo: "🏛️", titulo: "Joint Japan World Bank Scholarship",
    organizacion: "Banco Mundial", pais: "Internacional",
    modalidad: "Presencial", nivel: "Posgrado", area: "Políticas Públicas",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 90,
    destacada: true, requiereIngles: true,
    descripcion: "Becas para estudios de desarrollo económico y políticas públicas.",
    url: "https://www.worldbank.org",
    fechaCierre: "2026-05-31"
  },
  {
    id: 16, logo: "🇧🇷", titulo: "GCUB-Mob 2026",
    organizacion: "GCUB", pais: "Brasil",
    modalidad: "Presencial", nivel: "Maestría y Doctorado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Portugués",
    financiamiento: "100%", estado: "abierta", compatibilidad: 85,
    destacada: true, requiereIngles: false,
    descripcion: "Programa internacional con becas de maestría y doctorado en universidades brasileñas.",
    url: "https://www.gcub.org.br",
    fechaCierre: "2026-07-06"
  },
  {
    id: 17, logo: "🍁", titulo: "McCall MacBain Scholarships",
    organizacion: "McGill University", pais: "Canadá",
    modalidad: "Presencial", nivel: "Maestría", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 89,
    destacada: true, requiereIngles: true,
    descripcion: "Beca completa para estudios de maestría y programas profesionales en McGill University.",
    url: "https://mccallmacbainscholars.org",
    fechaCierre: "2026-08-19"
  },
  {
    id: 18, logo: "🎓", titulo: "Knight-Hennessy Scholars",
    organizacion: "Stanford University", pais: "Estados Unidos",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 92,
    destacada: true, requiereIngles: true,
    descripcion: "Programa de financiamiento completo para estudios de posgrado en Stanford University.",
    url: "https://knight-hennessy.stanford.edu",
    fechaCierre: "2026-10-06"
  },
  {
    id: 19, logo: "🇯🇵", titulo: "METI Internship Program",
    organizacion: "Ministerio de Economía de Japón", pais: "Japón",
    modalidad: "Presencial", nivel: "Universitario", area: "Tecnología",
    tipo: "Pasantía", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "abierta", compatibilidad: 83,
    destacada: false, requiereIngles: true,
    descripcion: "Programa internacional de pasantías en empresas japonesas para estudiantes y jóvenes profesionales.",
    url: "https://internshipprogram.go.jp",
    fechaCierre: "2026-06-30"
  },
  {
    id: 20, logo: "🇪🇸", titulo: "Universidad de Murcia - AIUP",
    organizacion: "Universidad de Murcia", pais: "España",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Español",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 74,
    destacada: false, requiereIngles: false,
    descripcion: "Becas para estudiantes de universidades miembro de AIUP en la Universidad de Murcia.",
    url: "https://www.um.es",
    fechaCierre: ""
  },
  {
    id: 21, logo: "🌍", titulo: "Universidad Europea - OEA",
    organizacion: "Universidad Europea", pais: "España",
    modalidad: "Online", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Español",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 78,
    destacada: false, requiereIngles: false,
    descripcion: "Programa conjunto con la OEA para estudios de posgrado online.",
    url: "https://universidadeuropea.com",
    fechaCierre: ""
  },
  {
    id: 22, logo: "🔬", titulo: "L'Oréal-UNESCO For Women in Science",
    organizacion: "L'Oréal UNESCO", pais: "Internacional",
    modalidad: "Presencial", nivel: "Investigación", area: "Ciencia",
    tipo: "Premio", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 81,
    destacada: true, requiereIngles: true,
    descripcion: "Reconocimiento y financiamiento para investigadoras destacadas a nivel mundial.",
    url: "https://www.forwomeninscience.com",
    fechaCierre: ""
  },
  {
    id: 23, logo: "👩", titulo: "AAUW International Fellowships",
    organizacion: "AAUW", pais: "Estados Unidos",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 87,
    destacada: true, requiereIngles: true,
    descripcion: "Becas para mujeres internacionales que realizan estudios de posgrado en Estados Unidos.",
    url: "https://www.aauw.org",
    fechaCierre: ""
  },
  {
    id: 24, logo: "💼", titulo: "Forté MBA Fellowship",
    organizacion: "Forté Foundation", pais: "Internacional",
    modalidad: "Presencial", nivel: "MBA", area: "Negocios",
    tipo: "Parcial", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 80,
    destacada: false, requiereIngles: true,
    descripcion: "Programa para mujeres que buscan realizar estudios MBA.",
    url: "https://www.fortefoundation.org",
    fechaCierre: ""
  },
  {
    id: 25, logo: "🇺🇸", titulo: "SUSI Program",
    organizacion: "U.S. Department of State", pais: "Estados Unidos",
    modalidad: "Presencial", nivel: "Universitario", area: "Liderazgo",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 82,
    destacada: false, requiereIngles: true,
    descripcion: "Study of the U.S. Institutes para líderes estudiantiles internacionales.",
    url: "https://exchanges.state.gov",
    fechaCierre: ""
  },
  {
    id: 26, logo: "🇸🇦", titulo: "King Abdulaziz University Scholarship",
    organizacion: "King Abdulaziz University", pais: "Arabia Saudita",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 77,
    destacada: false, requiereIngles: true,
    descripcion: "Programa de becas para estudiantes internacionales de maestría y doctorado en Arabia Saudita.",
    url: "https://graduatestudies.kau.edu.sa",
    fechaCierre: ""
  },
  {
    id: 27, logo: "🇮🇹", titulo: "MAECI Scholarships",
    organizacion: "Ministerio de Asuntos Exteriores de Italia", pais: "Italia",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Italiano",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 79,
    destacada: false, requiereIngles: false,
    descripcion: "Becas para estudiantes extranjeros que deseen cursar estudios superiores en Italia.",
    url: "https://studyinitaly.esteri.it",
    fechaCierre: ""
  },
  {
    id: 28, logo: "🇫🇷", titulo: "Eiffel Excellence Scholarship",
    organizacion: "Campus France", pais: "Francia",
    modalidad: "Presencial", nivel: "Maestría y Doctorado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Francés o Inglés",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 90,
    destacada: true, requiereIngles: true,
    descripcion: "Programa del gobierno francés para atraer estudiantes internacionales de excelencia.",
    url: "https://www.campusfrance.org",
    fechaCierre: ""
  },
  {
    id: 29, logo: "🕊️", titulo: "P.E.O. International Peace Scholarship",
    organizacion: "P.E.O. Sisterhood", pais: "Estados Unidos y Canadá",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 84,
    destacada: false, requiereIngles: true,
    descripcion: "Becas para mujeres internacionales que cursan estudios de posgrado en EE.UU. y Canadá.",
    url: "https://www.peointernational.org",
    fechaCierre: ""
  },
  {
    id: 30, logo: "👩‍🎓", titulo: "Women Scholarship for International Students",
    organizacion: "Multiple Institutions", pais: "Internacional",
    modalidad: "Presencial", nivel: "Posgrado", area: "Multidisciplinaria",
    tipo: "Parcial", alcance: "Internacional", idioma: "Inglés",
    financiamiento: "Variable", estado: "pendiente", compatibilidad: 73,
    destacada: false, requiereIngles: true,
    descripcion: "Oportunidades de financiamiento para mujeres estudiantes internacionales.",
    url: "https://www.scholarshipsforwomen.net",
    fechaCierre: ""
  },
  {
    id: 31, logo: "🎓", titulo: "Beca de Fortalecimiento Académico para Mujeres Universitarias",
    organizacion: "UNAM", pais: "México",
    modalidad: "Presencial", nivel: "Grado", area: "Educación",
    tipo: "Parcial", alcance: "Nacional", idioma: "Español",
    financiamiento: "Parcial", estado: "pendiente", compatibilidad: 86,
    destacada: false, requiereIngles: false,
    descripcion: "Programa de apoyo destinado a fortalecer la permanencia académica de mujeres universitarias.",
    url: "https://www.unam.mx",
    fechaCierre: ""
  },
  {
    id: 32, logo: "🇲🇽", titulo: "CONAHCYT Posgrados México",
    organizacion: "CONAHCYT", pais: "México",
    modalidad: "Presencial", nivel: "Maestría y Doctorado", area: "Investigación",
    tipo: "Completa", alcance: "Nacional", idioma: "Español",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 82,
    destacada: false, requiereIngles: false,
    descripcion: "Programa de apoyo para estudios de posgrado en instituciones mexicanas.",
    url: "https://conahcyt.mx",
    fechaCierre: ""
  },
  {
    id: 33, logo: "🌎", titulo: "AMEXCID Becas para Extranjeros",
    organizacion: "AMEXCID", pais: "México",
    modalidad: "Presencial", nivel: "Grado y Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Español",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 88,
    destacada: true, requiereIngles: false,
    descripcion: "Programa del Gobierno de México para estudiantes internacionales.",
    url: "https://www.gob.mx/amexcid",
    fechaCierre: ""
  },
  {
    id: 34, logo: "🌍", titulo: "Programa Líderes Latinoamericanos",
    organizacion: "Fundación FAES", pais: "España",
    modalidad: "Presencial", nivel: "Profesional", area: "Liderazgo",
    tipo: "Completa", alcance: "Internacional", idioma: "Español",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 81,
    destacada: false, requiereIngles: false,
    descripcion: "Programa de formación y liderazgo dirigido a jóvenes de América Latina.",
    url: "https://fundacionfaes.org",
    fechaCierre: ""
  },
  {
    id: 35, logo: "🇧🇷", titulo: "UNILA",
    organizacion: "Universidad Federal de Integración Latinoamericana", pais: "Brasil",
    modalidad: "Presencial", nivel: "Grado y Posgrado", area: "Multidisciplinaria",
    tipo: "Completa", alcance: "Internacional", idioma: "Portugués",
    financiamiento: "100%", estado: "pendiente", compatibilidad: 80,
    destacada: false, requiereIngles: false,
    descripcion: "Programas de formación universitaria para estudiantes de América Latina en Brasil.",
    url: "https://portal.unila.edu.br",
    fechaCierre: ""
  }
];

// ── PAGINACIÓN BECAS ──────────────────────────────────────────────────────────

const BECAS_POR_PAGINA = 6;
let becasFiltradas = [...becas];
let paginaActual = 0;

function totalPaginas() {
  return Math.ceil(becasFiltradas.length / BECAS_POR_PAGINA);
}

function renderizarBecas(lista) {
  becasFiltradas = lista;
  paginaActual = 0;
  renderizarPagina();
}

function renderizarPagina() {
  const contenedor = document.getElementById('becasGrid');
  const inicio = paginaActual * BECAS_POR_PAGINA;
  const slice  = becasFiltradas.slice(inicio, inicio + BECAS_POR_PAGINA);

  if (!slice.length) {
    contenedor.innerHTML = '<p style="text-align:center;padding:2rem;color:#888;">No hay becas que coincidan con los filtros.</p>';
    actualizarNavegacion();
    return;
  }

  contenedor.innerHTML = slice.map(b => {
    const colorMatch = b.compatibilidad >= 85 ? '#22c55e' : b.compatibilidad >= 70 ? '#f59e0b' : '#ef4444';
    const estadoBadge = b.estado === 'abierta'
      ? '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:999px;font-size:.75rem;">● Abierta</span>'
      : '<span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:999px;font-size:.75rem;">○ Próximamente</span>';
    const cierre = b.fechaCierre
      ? `<div style="font-size:.8rem;color:#888;margin-top:.3rem;">Cierra: ${formatearFecha(b.fechaCierre)}</div>`
      : '';

    return `
      <div class="beca-card${b.destacada ? ' top-match' : ''}">
        <div class="beca-logo">${b.logo}</div>
        <div class="beca-info">
          <div class="beca-title">${b.titulo}</div>
          <div class="beca-org">${b.organizacion} · ${b.pais}</div>
          <div class="beca-desc">${b.descripcion}</div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.4rem;">
            ${estadoBadge}
            <span class="job-tag">${b.tipo}</span>
            <span class="job-tag">${b.idioma}</span>
            <span class="job-tag">${b.financiamiento}</span>
          </div>
          ${cierre}
        </div>
        <div class="job-right">
          <div class="job-match" style="color:${colorMatch};font-weight:700;font-size:1.1rem;">${b.compatibilidad}%</div>
          <a href="${b.url}" target="_blank" rel="noopener" class="btn-apply-job">Ver beca →</a>
        </div>
      </div>
    `;
  }).join('');

  actualizarNavegacion();
}

function actualizarNavegacion() {
  const total = totalPaginas();

  // Flechas
  document.getElementById('becasPrev').disabled = paginaActual === 0;
  document.getElementById('becasNext').disabled = paginaActual >= total - 1;

  // Puntos
  const puntosEl = document.getElementById('becasPuntos');
  puntosEl.innerHTML = Array.from({ length: total }, (_, i) => `
    <button class="beca-punto${i === paginaActual ? ' activo' : ''}"
            onclick="irAPagina(${i})" aria-label="Página ${i + 1}"></button>
  `).join('');

  // Contador
  document.getElementById('becasContador').textContent =
    total > 0 ? `${paginaActual + 1} / ${total}` : '';
}

function irAPagina(n) {
  paginaActual = n;
  renderizarPagina();
  document.getElementById('becasGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── FILTROS BECAS ─────────────────────────────────────────────────────────────

function filtrarBecas() {
  const tipos    = [...document.querySelectorAll('[data-filtro="tipo"]:checked')].map(el => el.value);
  const alcances = [...document.querySelectorAll('[data-filtro="alcance"]:checked')].map(el => el.value);
  const areas    = [...document.querySelectorAll('[data-filtro="area"]:checked')].map(el => el.value);
  const compatMin = parseInt(document.getElementById('filtroCompatMin').value);

  const filtradas = becas.filter(b =>
    (tipos.length    === 0 || tipos.includes(b.tipo))       &&
    (alcances.length === 0 || alcances.includes(b.alcance)) &&
    (areas.length    === 0 || areas.includes(b.area))       &&
    b.compatibilidad >= compatMin
  );

  renderizarBecas(filtradas);
}

// ======================================================
// EMPLEABILIDAD
// ======================================================

// Catálogo de empleos disponibles.
// ── EMPLEOS ──────────────────────────────────────────────────────────────────

const empleos = [
  // ── PRESENCIALES / HÍBRIDOS ──
  {
    titulo: "Analista Administrativo",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Semi Senior",
    fuente: "LinkedIn",
    url: "https://www.linkedin.com/jobs/search/?keywords=analista+administrativo&location=Argentina",
    tags: ["Administración", "Excel", "Gestión"],
    compatibilidad: 91,
    emoji: "📋"
  },
  {
    titulo: "Desarrollador Web Jr.",
    modalidad: "Híbrido",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Computrabajo",
    url: "https://www.computrabajo.com.ar/trabajo-de-desarrollador-web",
    tags: ["HTML", "CSS", "JavaScript"],
    compatibilidad: 88,
    emoji: "💻"
  },
  {
    titulo: "Atención al Cliente",
    modalidad: "Presencial",
    tipo: "Part Time",
    nivel: "Junior",
    fuente: "Bumeran",
    url: "https://www.bumeran.com.ar/empleos-busqueda-atencion+al+cliente.html",
    tags: ["Comunicación", "CRM", "Ventas"],
    compatibilidad: 82,
    emoji: "🎧"
  },
  {
    titulo: "Coordinador de Marketing",
    modalidad: "Híbrido",
    tipo: "Full Time",
    nivel: "Semi Senior",
    fuente: "Indeed",
    url: "https://ar.indeed.com/jobs?q=coordinador+marketing&l=Argentina",
    tags: ["Marketing", "Redes Sociales", "Contenido"],
    compatibilidad: 85,
    emoji: "📣"
  },
  {
    titulo: "Asistente Contable",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Zona Jobs",
    url: "https://www.zonajobs.com.ar/empleos-asistente-contable.html",
    tags: ["Contabilidad", "Excel", "Facturación"],
    compatibilidad: 79,
    emoji: "🧾"
  },
  {
    titulo: "Vendedor Comercial",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Computrabajo",
    url: "https://www.computrabajo.com.ar/trabajo-de-vendedor",
    tags: ["Ventas", "Negociación", "Cartera"],
    compatibilidad: 76,
    emoji: "🤝"
  },

  // ── REMOTOS ──
  {
    titulo: "Desarrollador Full Stack",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Semi Senior",
    fuente: "Get on Board",
    url: "https://www.getonbrd.com/jobs/programming",
    tags: ["React", "Node.js", "API"],
    compatibilidad: 93,
    emoji: "🚀"
  },
  {
    titulo: "Diseñador UX/UI Freelance",
    modalidad: "Remoto",
    tipo: "Freelance",
    nivel: "Semi Senior",
    fuente: "Workana",
    url: "https://www.workana.com/jobs?category=design-multimedia&language=es",
    tags: ["Figma", "Diseño", "UX"],
    compatibilidad: 87,
    emoji: "🎨"
  },
  {
    titulo: "Data Analyst",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Torre.ai",
    url: "https://torre.ai/jobs/data-analyst",
    tags: ["SQL", "Power BI", "Datos"],
    compatibilidad: 84,
    emoji: "📊"
  },
  {
    titulo: "Backend Developer",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Senior",
    fuente: "Remote OK",
    url: "https://remoteok.com/remote-backend-jobs",
    tags: ["Python", "APIs", "Cloud"],
    compatibilidad: 80,
    emoji: "⚙️"
  },
  {
    titulo: "Frontend Developer",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "We Work Remotely",
    url: "https://weworkremotely.com/remote-jobs/search?term=frontend",
    tags: ["React", "TypeScript", "CSS"],
    compatibilidad: 86,
    emoji: "🖥️"
  },
  {
    titulo: "Product Manager",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Semi Senior",
    fuente: "Himalayas",
    url: "https://himalayas.app/jobs/product-manager",
    tags: ["Producto", "Agile", "Roadmap"],
    compatibilidad: 78,
    emoji: "🗺️"
  },
  {
    titulo: "Customer Success",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "LinkedIn",
    url: "https://www.linkedin.com/jobs/search/?keywords=customer+success&f_WT=2",
    tags: ["Inglés", "CRM", "Soporte"],
    compatibilidad: 83,
    emoji: "⭐"
  }
];

// ── RENDERIZADO ───────────────────────────────────────────────────────────────

function renderizarEmpleos(lista) {
  const contenedor = document.getElementById('jobsGrid');
  if (!lista.length) {
    contenedor.innerHTML = '<p style="text-align:center; padding:2rem; color:#888;">No hay empleos que coincidan con los filtros.</p>';
    return;
  }

  contenedor.innerHTML = lista.map(e => {
    const tags = e.tags.map(t => `<span class="job-tag">${t}</span>`).join('');
    const colorMatch = e.compatibilidad >= 85 ? '#22c55e' : e.compatibilidad >= 75 ? '#f59e0b' : '#ef4444';

    return `
      <div class="job-card"
           data-modalidad="${e.modalidad}"
           data-tipo="${e.tipo}"
           data-nivel="${e.nivel}"
           data-fuente="${e.fuente}">
        <div class="job-logo">${e.emoji}</div>
        <div class="job-info">
          <div class="job-title">${e.titulo}</div>
          <div class="job-company">${e.fuente} · ${e.modalidad}</div>
          <div class="job-tags">${tags}</div>
        </div>
        <div class="job-right">
          <div class="job-match" style="color:${colorMatch}; font-weight:700; font-size:1.1rem;">${e.compatibilidad}%</div>
          <a href="${e.url}" target="_blank" rel="noopener" class="btn-apply-job">
            Ver en ${e.fuente} →
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// ── FILTROS ───────────────────────────────────────────────────────────────────

function filtrarEmpleos() {
  const modalidad = document.getElementById('filtroModalidad').value;
  const tipo      = document.getElementById('filtroTipo').value;
  const nivel     = document.getElementById('filtroNivel').value;
  const fuente    = document.getElementById('filtroFuente').value;

  const filtrados = empleos.filter(e =>
    (!modalidad || e.modalidad === modalidad) &&
    (!tipo      || e.tipo      === tipo)      &&
    (!nivel     || e.nivel     === nivel)     &&
    (!fuente    || e.fuente    === fuente)
  );

  renderizarEmpleos(filtrados);
}

// ── INICIO ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Si hay perfil guardado, reordenar por compatibilidad al cargar
  const perfilGuardado = cargarPerfil();
  if (perfilGuardado && perfilGuardado.datosPersonales) {
    reordenarPorPerfil(perfilGuardado);
  } else {
    // Sin perfil: renderizar en orden por defecto
    renderizarBecas(becas);
  }

  const slider = document.getElementById('filtroCompatMin');
  const label  = document.getElementById('filtroCompatMinLabel');
  if (slider) slider.addEventListener('input', () => label.textContent = slider.value + '%+');

  const btnFiltros = document.getElementById('btnAplicarFiltrosBecas');
  if (btnFiltros) btnFiltros.addEventListener('click', filtrarBecas);

  const btnPrev = document.getElementById('becasPrev');
  const btnNext = document.getElementById('becasNext');
  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (paginaActual > 0) irAPagina(paginaActual - 1);
  });
  if (btnNext) btnNext.addEventListener('click', () => {
    if (paginaActual < totalPaginas() - 1) irAPagina(paginaActual + 1);
  });

  // Empleos
  renderizarEmpleos(empleos);
  ['filtroModalidad','filtroTipo','filtroNivel','filtroFuente'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', filtrarEmpleos);
  });

  // Filtros de cursos (selects de área, nivel, modalidad, etc.)
  document.querySelectorAll('.course-filters .filter-select').forEach(sel => {
    sel.addEventListener('change', aplicarFiltrosSelectCursos);
  });

});

// Aplica los filtros de los <select> de la sección cursos
function aplicarFiltrosSelectCursos() {
  const area      = document.querySelector('.course-filters .filter-select:nth-child(1)')?.value;
  const nivel     = document.querySelector('.course-filters .filter-select:nth-child(2)')?.value;
  const precio    = document.querySelector('.course-filters .filter-select:nth-child(5)')?.value;

  // Obtener la categoría activa de las pestañas
  const tabActiva = document.querySelector('.edu-tab.active')?.textContent.trim() || 'Todos';

  let lista = (!tabActiva || tabActiva === 'Todos') ? catalogoCursos : catalogoCursos.filter(c => c.categoria === tabActiva);

  if (area && area !== 'Área profesional') {
    lista = lista.filter(c => c.categoria.toLowerCase().includes(area.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(area.toLowerCase())));
  }
  if (nivel && nivel !== 'Nivel') {
    lista = lista.filter(c => c.nivel === nivel);
  }
  if (precio === 'Gratuito') {
    lista = lista.filter(c => c.gratis);
  } else if (precio === 'Pago') {
    lista = lista.filter(c => !c.gratis);
  }

  renderCursos(lista);
}


// ── Función helper para abrir el modal de login ────────────────────────────────
function abrirModalLogin() {
  // Resetear el modal al estado inicial (por si ya fue abierto antes)
  document.getElementById("vistaSocial").classList.remove("oculto");
  document.getElementById("manualLoginSection").classList.add("oculto");
  document.getElementById("socialLogin").classList.remove("oculto");
  document.getElementById("loginDivider").classList.remove("oculto");
  document.getElementById("registroForm").style.display = "block";
  document.getElementById("sesionForm").style.display = "none";
  document.getElementById("btnRegistro").classList.add("active");
  document.getElementById("btnSesion").classList.remove("active");
  document.getElementById("modalLogin").classList.remove("oculto");
}

// Abrir modal login (nav)
document.getElementById("abrirLogin").addEventListener("click", abrirModalLogin);
document.getElementById("abrirLogin2").addEventListener("click", abrirModalLogin);

// Botones del hero y CTA final
document.querySelectorAll('.btn-hero-main').forEach(btn => {
  // Solo los que NO son submit de formulario
  if (!btn.closest('form') && btn.id !== 'btnCrearCuenta' && btn.id !== 'btnIngresar') {
    btn.addEventListener('click', function() {
      const perfil = cargarPerfil();
      if (perfil && perfil.datosPersonales) {
        // Ya tiene perfil: abrir modal de edición
        precargarFormularioPerfil(perfil);
        document.getElementById("modalPerfil").classList.remove("oculto");
      } else {
        abrirModalLogin();
      }
    });
  }
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
  irATabPerfil("datos");
});

// Validar al iniciar sesión
document.getElementById("btnIngresar").addEventListener("click", function(e){
  e.preventDefault();

  const input = document.getElementById("emailSesion");
  const error = document.getElementById("errorEmailSesion");

  if (!validarEmail(input, error)) return;

  document.getElementById("modalLogin").classList.add("oculto");
  document.getElementById("modalPerfil").classList.remove("oculto");
  irATabPerfil("datos");
});

// (La validación del email de perfil ya se hace dentro del submit principal,
// más arriba, antes de guardar el perfil y cerrar el modal.)

// ======================================================
// REORDENAR POR PERFIL (compatibilidad real con la IA)
// ======================================================

function reordenarPorPerfil(perfil) {
  if (!perfil || !perfil.habilidades) return;

  const palabrasClave = [
    ...(perfil.habilidades || []),
    ...(perfil.interesesProfesionales || []),
    (perfil.formacion?.carrera || ''),
    (perfil.objetivoProfesional || '')
  ].map(p => p.toLowerCase());

  function calcularScore(tags) {
    if (!tags || !tags.length) return 0;
    const matches = tags.filter(t => palabrasClave.some(p => p.includes(t) || t.includes(p)));
    return Math.round((matches.length / tags.length) * 100);
  }

  // Actualizar scores de cursos y reordenar
  const cursosOrdenados = [...catalogoCursos].map(c => ({
    ...c,
    matchScore: Math.max(c.matchScore, calcularScore(c.tags))
  })).sort((a, b) => b.matchScore - a.matchScore);

  renderCursos(cursosOrdenados);

  // Reordenar becas
  const becasOrdenadas = [...becas].sort((a, b) => b.compatibilidad - a.compatibilidad);
  renderizarBecas(becasOrdenadas);

  // Reordenar empleos
  const empleosOrdenados = [...empleos].sort((a, b) => b.compatibilidad - a.compatibilidad);
  renderizarEmpleos(empleosOrdenados);

  mostrarToast("🤖 ¡IA activa! Reordenamos cursos, becas y empleos según tu perfil.");
}

// ======================================================
// TOAST / NOTIFICACIÓN
// ======================================================

function mostrarToast(mensaje, duracion = 3500) {
  // Eliminar toast anterior si existe
  const anterior = document.getElementById("oportunia-toast");
  if (anterior) anterior.remove();

  const toast = document.createElement("div");
  toast.id = "oportunia-toast";
  toast.textContent = mensaje;
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #0F172A;
    color: #fff;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: .93rem;
    font-weight: 500;
    font-family: Manrope, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,.25);
    z-index: 9999;
    opacity: 0;
    transition: opacity .3s ease, transform .3s ease;
    max-width: 90vw;
    text-align: center;
  `;
  document.body.appendChild(toast);

  // Animar entrada
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });
  });

  // Animar salida y remover
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 350);
  }, duracion);
}

// ======================================================
// FORMATO DE FECHA DE CIERRE (becas)
// ======================================================

function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const [anio, mes, dia] = fechaISO.split('-');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${anio}`;
}

// ======================================================
// HAMBURGUER MENU (mobile)
// ======================================================

(function() {
  const btn = document.getElementById('navHamburger');
  const ul  = document.querySelector('nav ul');
  const actions = document.querySelector('.nav-actions');
  if (!btn || !ul) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    ul.classList.toggle('open', isOpen);
    if (actions) actions.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Cerrar al clickear un link del nav
  ul.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      ul.classList.remove('open');
      if (actions) actions.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
})();

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

    mostrarToast("✅ ¡Listo! Te avisamos a " + input.value + " sobre nuevas oportunidades.");
    input.value = "";

  });

}
// Chat Agente IA
const botonChat =
document.getElementById(
  "abrirChatIA"
);

const ventanaChat =
document.getElementById(
  "chatIA"
);

botonChat.addEventListener(
  "click",
  () => {

    ventanaChat
      .classList
      .toggle("oculto");

  }
);