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
    const nombreCompleto = [perfil.datosPersonales.nombre, perfil.datosPersonales.apellido]
      .filter(Boolean).join(" ").trim();
    const primerNombre = perfil.datosPersonales.nombre.trim();

    document.getElementById("navAvatar").src = perfil.foto || generarAvatar(nombreCompleto);
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
  // Reseteamos listas dinámicas siempre, haya o no perfil
  estudiosTemp = (perfil && perfil.estudios) ? [...perfil.estudios] : [];
  experienciasTemp = (perfil && perfil.experiencias) ? [...perfil.experiencias] : [];
  idiomasTemp = (perfil && perfil.idiomas) ? [...perfil.idiomas] : [];
  habilidadesTemp = (perfil && perfil.habilidades) ? [...perfil.habilidades] : [];
  interesesTemp = (perfil && perfil.interesesProfesionales) ? [...perfil.interesesProfesionales] : [];

  renderEstudiosLista();
  renderExperienciasLista();
  renderIdiomasLista();
  renderTagsHabilidades();
  renderTagsIntereses();

  if (!perfil || !perfil.datosPersonales) {
    // Perfil nuevo: limpiar formulario
    document.getElementById("pf-nombre").value = "";
    document.getElementById("pf-apellido").value = "";
    document.getElementById("pf-nacionalidad").value = "";
    document.getElementById("pf-fecha-nacimiento").value = "";
    document.getElementById("pf-genero").value = "";
    document.getElementById("pf-estado-civil").value = "";
    document.getElementById("pf-dni").value = "";
    document.getElementById("pf-celular").value = "";
    document.getElementById("pf-telefono").value = "";
    document.getElementById("pf-email").value = "";
    document.getElementById("pf-canal-principal").value = "";
    document.getElementById("pf-canal-secundario").value = "";
    document.getElementById("pf-objetivo").value = "";
    document.getElementById("pf-moneda-salario").value = "ARS";
    document.getElementById("pf-pretension-salarial").value = "";
    document.getElementById("pf-discapacidad").value = "";
    mostrarFotoPerfil(null);
    document.getElementById("perfilNombrePreview").textContent = "Tu nombre";
    document.getElementById("pfUltimaModificacion").textContent = "Sin guardar todavía";
    irATabPerfil("formacion");
    actualizarCompletitudPerfil();
    return;
  }

  const dp = perfil.datosPersonales;

  document.getElementById("pf-nombre").value = dp.nombre || "";
  document.getElementById("pf-apellido").value = dp.apellido || "";
  document.getElementById("pf-nacionalidad").value = dp.nacionalidad || "";
  document.getElementById("pf-fecha-nacimiento").value = dp.fechaNacimiento || "";
  document.getElementById("pf-genero").value = dp.genero || "";
  document.getElementById("pf-estado-civil").value = dp.estadoCivil || "";
  document.getElementById("pf-dni").value = dp.dni || "";
  document.getElementById("pf-celular").value = dp.celular || "";
  document.getElementById("pf-telefono").value = dp.telefono || "";
  document.getElementById("pf-email").value = dp.email || "";
  document.getElementById("pf-canal-principal").value = dp.canalPrincipal || "";
  document.getElementById("pf-canal-secundario").value = dp.canalSecundario || "";
  document.getElementById("pf-discapacidad").value = dp.discapacidad || "";

  document.getElementById("pf-moneda-salario").value = (dp.pretensionSalarial && dp.pretensionSalarial.moneda) || "ARS";
  document.getElementById("pf-pretension-salarial").value = (dp.pretensionSalarial && dp.pretensionSalarial.monto) || "";

  document.getElementById("pf-objetivo").value = perfil.objetivoProfesional || "";

  mostrarFotoPerfil(perfil.foto || null);

  const nombreCompleto = [dp.nombre, dp.apellido].filter(Boolean).join(" ").trim();
  document.getElementById("perfilNombrePreview").textContent = nombreCompleto || "Tu nombre";

  document.getElementById("pfUltimaModificacion").textContent = perfil.ultimaModificacion
    ? formatearFechaRelativa(perfil.ultimaModificacion)
    : "Sin guardar todavía";

  irATabPerfil("formacion");
  actualizarCompletitudPerfil();
}

// Formatea una fecha ISO a algo legible tipo "hace 2 días"
function formatearFechaRelativa(isoString) {
  const fecha = new Date(isoString);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias <= 0) return "Hoy";
  if (diffDias === 1) return "Hace 1 día";
  if (diffDias < 30) return `Hace ${diffDias} días`;
  const diffMeses = Math.floor(diffDias / 30);
  if (diffMeses === 1) return "Hace 1 mes";
  return `Hace ${diffMeses} meses`;
}

// ======================================================
// PESTAÑAS DEL FORMULARIO DE PERFIL (Formación / Experiencia / Perfil)
// ======================================================

function irATabPerfil(tab) {
  document.querySelectorAll(".perfil-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".perfil-tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.tab === tab);
  });
}

// Click directo en cualquier pestaña (son libres, no hay orden obligatorio)
document.querySelectorAll(".perfil-tab").forEach(btn => {
  btn.addEventListener("click", () => irATabPerfil(btn.dataset.tab));
});

// ======================================================
// FOTO DE PERFIL
// ======================================================

function mostrarFotoPerfil(dataUrl) {
  const img = document.getElementById("perfilFotoImg");
  const iniciales = document.getElementById("perfilFotoIniciales");
  if (dataUrl) {
    img.src = dataUrl;
    img.classList.remove("oculto");
    iniciales.classList.add("oculto");
  } else {
    img.src = "";
    img.classList.add("oculto");
    iniciales.classList.remove("oculto");
  }
}

let fotoPerfilTemp = null;

const inputFotoPerfil = document.getElementById("inputFotoPerfil");
const btnSubirFoto = document.getElementById("btnSubirFoto");
const btnEliminarFoto = document.getElementById("btnEliminarFoto");

if (btnSubirFoto) btnSubirFoto.addEventListener("click", () => inputFotoPerfil.click());

if (inputFotoPerfil) inputFotoPerfil.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    mostrarToast("⚠️ La imagen no puede pesar más de 2 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    fotoPerfilTemp = ev.target.result;
    mostrarFotoPerfil(fotoPerfilTemp);
  };
  reader.readAsDataURL(file);
});

if (btnEliminarFoto) btnEliminarFoto.addEventListener("click", () => {
  fotoPerfilTemp = null;
  mostrarFotoPerfil(null);
});

// ======================================================
// LISTAS SUGERIDAS PARA AUTOCOMPLETAR (estilo Bumeran)
// ======================================================

const TIPOS_ESTUDIO = ["Secundario", "Terciario", "Universitario", "Posgrado", "Curso", "Certificación"];

const PAISES_LATAM = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "Guatemala", "Honduras", "México",
  "Nicaragua", "Panamá", "Paraguay", "Perú", "Uruguay", "Venezuela",
  "España", "Estados Unidos", "Otro"
];

const INSTITUCIONES_SUGERIDAS = [
  "UBA - Universidad de Buenos Aires", "UTN - Universidad Tecnológica Nacional",
  "UNLP - Universidad Nacional de La Plata", "UNR - Universidad Nacional de Rosario",
  "UNC - Universidad Nacional de Córdoba", "UNCuyo - Universidad Nacional de Cuyo",
  "UNLZ - Universidad Nacional de Lomas de Zamora", "UNSAM - Universidad Nacional de San Martín",
  "UNGS - Universidad Nacional de General Sarmiento", "UADE - Universidad Argentina de la Empresa",
  "UCA - Universidad Católica Argentina", "Universidad de Palermo",
  "Universidad de San Andrés", "Universidad Austral", "Universidad Siglo 21",
  "ORT Argentina", "UNQ - Universidad Nacional de Quilmes", "UNTREF - Universidad Nacional de Tres de Febrero",
  "UADER - Universidad Autónoma de Entre Ríos", "Instituto Tecnológico de Buenos Aires (ITBA)"
];

const AREAS_ESTUDIO = [
  "Administración y Negocios", "Tecnología y Sistemas", "Diseño y Comunicación",
  "Marketing y Publicidad", "Recursos Humanos", "Salud", "Educación",
  "Ingeniería", "Ciencias Sociales", "Idiomas", "Contabilidad y Finanzas", "Derecho"
];

const ACTIVIDADES_EMPRESA = [
  "Tecnología / Software", "Comercio / Retail", "Educación", "Salud",
  "Industria / Manufactura", "Servicios Financieros", "Gastronomía / Hotelería",
  "Construcción", "Logística y Transporte", "Marketing y Publicidad",
  "Telecomunicaciones", "Sector Público"
];

const AREAS_PUESTO = [
  "Abastecimiento y Logística", "Administración, Contabilidad y Finanzas",
  "Aduana y Comercio Exterior", "Atención al Cliente, Call Center y Telemarketing",
  "Comercial, Ventas y Negocios", "Diseño y Comunicación", "Educación",
  "Gastronomía y Hotelería", "Ingeniería", "Marketing y Publicidad",
  "Producción y Manufactura", "Recursos Humanos", "Salud",
  "Tecnología, Sistemas y Telecomunicaciones"
];

const SUBAREAS_PUESTO = {
  "Tecnología, Sistemas y Telecomunicaciones": ["Desarrollo de Software", "Soporte Técnico", "Redes e Infraestructura", "Ciberseguridad", "Datos / IA", "QA / Testing"],
  "Administración, Contabilidad y Finanzas": ["Contabilidad", "Tesorería", "Administración General", "Auditoría", "Análisis Financiero"],
  "Comercial, Ventas y Negocios": ["Ventas", "Desarrollo de Negocios", "Key Account Management", "Ventas Internas"],
  "Marketing y Publicidad": ["Marketing Digital", "Redes Sociales", "Branding", "SEO/SEM", "Contenidos"],
  "Recursos Humanos": ["Selección", "Capacitación", "Liquidación de Sueldos", "Relaciones Laborales"],
  "Atención al Cliente, Call Center y Telemarketing": ["Atención al Cliente", "Soporte Telefónico", "Telemarketing"],
  "Diseño y Comunicación": ["Diseño Gráfico", "UX/UI", "Comunicación Institucional", "Audiovisual"]
};

const NIVELES_EXPERIENCIA = ["Sin experiencia", "Junior", "Semi Senior", "Senior", "Jefe / Supervisor", "Gerencial"];

const HABILIDADES_SUGERIDAS = [
  "Excel", "JavaScript", "Python", "HTML", "CSS", "CRM", "Microsoft Word",
  "Microsoft PowerPoint", "Google Analytics", "Google Drive", "Atención al cliente",
  "Trabajo en equipo", "Organización", "Comunicación efectiva", "Ventas",
  "Negociación", "Photoshop", "Illustrator", "Canva", "Figma", "Liderazgo",
  "Resolución de problemas", "Inglés", "SQL", "Power BI"
];

const INTERESES_SUGERIDOS = [
  "Tecnología", "Marketing", "Administración", "Diseño", "Datos & IA",
  "Negocios", "Recursos Humanos", "Salud", "Educación", "Comercio Exterior",
  "Finanzas", "Atención al Cliente"
];

// ======================================================
// AUTOCOMPLETAR GENÉRICO (escribís 2+ letras y aparecen sugerencias)
// ======================================================

// Conecta un <input> de texto con un <div> de sugerencias.
// onSelect(valor) se llama cuando el usuario elige una opción (incluida "Otro: ...").
function initAutocomplete(inputId, suggestionsId, lista, onSelect, limpiarDespues) {
  const input = document.getElementById(inputId);
  const suggestionsBox = document.getElementById(suggestionsId);
  if (!input || !suggestionsBox) return;

  function render(filtro) {
    const texto = filtro.trim().toLowerCase();
    let opciones = texto.length
      ? lista.filter(op => op.toLowerCase().includes(texto))
      : lista.slice(0, 8);

    opciones = opciones.slice(0, 8);

    let html = opciones.map(op =>
      `<div class="pf-suggestion-item" data-valor="${op.replace(/"/g, '&quot;')}">${op}</div>`
    ).join("");

    if (texto.length) {
      html += `<div class="pf-suggestion-item pf-suggestion-otro" data-valor="${texto.replace(/"/g, '&quot;')}">Otro: "${filtro.trim()}"</div>`;
    }

    suggestionsBox.innerHTML = html;
    suggestionsBox.classList.toggle("oculto", !html);

    suggestionsBox.querySelectorAll(".pf-suggestion-item").forEach(item => {
      item.addEventListener("click", () => {
        const valor = item.dataset.valor;
        onSelect(valor);
        // Los campos "selector único" (idioma, área de estudio, etc.) mantienen
        // el valor elegido visible en el input. Los buscadores de tags
        // (habilidades/intereses) se vacían para poder buscar el siguiente.
        input.value = limpiarDespues ? "" : valor;
        suggestionsBox.classList.add("oculto");
      });
    });
  }

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => render(input.value));
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add("oculto");
    }
  });
}

// ======================================================
// HABILIDADES E INTERESES (tags removibles con autocompletar)
// ======================================================

let habilidadesTemp = [];
let interesesTemp = [];

function renderTagsHabilidades() {
  const cont = document.getElementById("pf-habilidades-tags");
  cont.innerHTML = habilidadesTemp.map((h, i) => `
    <span class="pf-tag">${h}<button type="button" class="pf-tag-remove" data-i="${i}">✕</button></span>
  `).join("");
  cont.querySelectorAll(".pf-tag-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      habilidadesTemp.splice(Number(btn.dataset.i), 1);
      renderTagsHabilidades();
    });
  });
  document.getElementById("pf-habilidades").value = habilidadesTemp.join(", ");
}

function renderTagsIntereses() {
  const cont = document.getElementById("pf-intereses-tags");
  cont.innerHTML = interesesTemp.map((h, i) => `
    <span class="pf-tag">${h}<button type="button" class="pf-tag-remove" data-i="${i}">✕</button></span>
  `).join("");
  cont.querySelectorAll(".pf-tag-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      interesesTemp.splice(Number(btn.dataset.i), 1);
      renderTagsIntereses();
    });
  });
  document.getElementById("pf-intereses").value = interesesTemp.join(", ");
}

initAutocomplete("pf-habilidades-input", "pf-habilidades-suggestions", HABILIDADES_SUGERIDAS, (valor) => {
  if (valor && !habilidadesTemp.includes(valor)) {
    habilidadesTemp.push(valor);
    renderTagsHabilidades();
  }
}, true);

initAutocomplete("pf-intereses-input", "pf-intereses-suggestions", INTERESES_SUGERIDOS, (valor) => {
  if (valor && !interesesTemp.includes(valor)) {
    interesesTemp.push(valor);
    renderTagsIntereses();
  }
}, true);

// ======================================================
// ESTUDIOS (submodal "Sumar estudio")
// ======================================================

let estudiosTemp = [];
let estudioEditandoIndex = null;

function renderEstudiosLista() {
  const cont = document.getElementById("listaEstudios");
  if (!estudiosTemp.length) {
    cont.innerHTML = '<p class="pf-lista-vacia">Todavía no agregaste estudios.</p>';
    return;
  }
  cont.innerHTML = estudiosTemp.map((e, i) => `
    <div class="pf-item-card">
      <div class="pf-item-card-acciones">
        <button type="button" class="pf-item-card-btn" data-accion="editar" data-i="${i}" title="Editar">✏️</button>
        <button type="button" class="pf-item-card-btn" data-accion="borrar" data-i="${i}" title="Eliminar">🗑️</button>
      </div>
      <div class="pf-item-card-titulo">${e.tituloCarrera}</div>
      <div class="pf-item-card-detalle">
        ${e.institucion ? e.institucion + " · " : ""}${e.tipoEstudio || ""}${e.estado ? " - " + e.estado : ""}<br>
        ${e.fechaInicio || ""} - ${e.alPresente ? "Actualidad" : (e.fechaFin || "")}${e.pais ? ", " + e.pais : ""}
      </div>
      <div class="pf-item-card-extras">
        ${(e.referencias || []).map(r => `
          <div class="pf-extra-item">👤 Ref. académica: <strong>${r.nombre} ${r.apellido}</strong> · ${r.relacion || ""}</div>
        `).join("")}
        ${(e.certificados || []).map(c => `
          <div class="pf-extra-item">📎 Certificado: <a href="${c.link}" target="_blank" rel="noopener">Ver link</a></div>
        `).join("")}
        <div class="pf-item-btns-extra">
          <button type="button" class="pf-btn-sumar-extra" data-accion="ref-academica" data-i="${i}">+ Sumar referencia académica</button>
          <button type="button" class="pf-btn-sumar-extra" data-accion="certificado" data-i="${i}">+ Sumar certificado</button>
        </div>
      </div>
    </div>
  `).join("");

  cont.querySelectorAll('[data-accion="borrar"]').forEach(btn => {
    btn.addEventListener("click", () => {
      estudiosTemp.splice(Number(btn.dataset.i), 1);
      renderEstudiosLista();
      actualizarCompletitudPerfil();
    });
  });
  cont.querySelectorAll('[data-accion="editar"]').forEach(btn => {
    btn.addEventListener("click", () => abrirSubmodalEstudio(Number(btn.dataset.i)));
  });
  cont.querySelectorAll('[data-accion="ref-academica"]').forEach(btn => {
    btn.addEventListener("click", () => abrirSubmodalReferencia("academica", Number(btn.dataset.i)));
  });
  cont.querySelectorAll('[data-accion="certificado"]').forEach(btn => {
    btn.addEventListener("click", () => abrirSubmodalCertificado(Number(btn.dataset.i)));
  });
}

function abrirSubmodalEstudio(index) {
  estudioEditandoIndex = (index === undefined) ? null : index;
  const datos = (estudioEditandoIndex !== null) ? estudiosTemp[estudioEditandoIndex] : {};

  const overlay = document.createElement("div");
  overlay.className = "pf-submodal-overlay";
  overlay.id = "submodalEstudio";
  overlay.innerHTML = `
    <div class="pf-submodal-box">
      <span class="pf-submodal-cerrar" id="cerrarSubmodalEstudio">✕</span>
      <h3>${estudioEditandoIndex !== null ? "Editar estudio" : "Sumar estudio"}</h3>

      <label class="pf-label-chico">Título / Carrera *</label>
      <input type="text" id="sub-est-titulo" placeholder="Ingresá tu título o carrera" value="${datos.tituloCarrera || ""}">

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">País</label>
          <div class="pf-autocomplete-wrap">
            <input type="text" id="sub-est-pais" placeholder="Elegí una opción" value="${datos.pais || ""}">
            <div class="pf-suggestions oculto" id="sub-est-pais-suggestions"></div>
          </div>
        </div>
        <div>
          <label class="pf-label-chico">Estado</label>
          <select id="sub-est-estado">
            <option value="">Elegí una opción</option>
            <option ${datos.estado === "Graduado" ? "selected" : ""}>Graduado</option>
            <option ${datos.estado === "En Curso" ? "selected" : ""}>En Curso</option>
            <option ${datos.estado === "Abandonado" ? "selected" : ""}>Abandonado</option>
          </select>
        </div>
      </div>

      <label class="pf-label-chico">Tipo de estudio *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-est-tipo" placeholder="Elegí una opción" value="${datos.tipoEstudio || ""}">
        <div class="pf-suggestions oculto" id="sub-est-tipo-suggestions"></div>
      </div>

      <label class="pf-label-chico">Área de estudio *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-est-area" placeholder="Elegí una opción" value="${datos.areaEstudio || ""}">
        <div class="pf-suggestions oculto" id="sub-est-area-suggestions"></div>
      </div>

      <label class="pf-label-chico">Institución *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-est-institucion" placeholder="Ingresá la institución" value="${datos.institucion || ""}">
        <div class="pf-suggestions oculto" id="sub-est-institucion-suggestions"></div>
      </div>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Fecha de inicio</label>
          <input type="month" id="sub-est-inicio" value="${datos.fechaInicioRaw || ""}">
        </div>
        <div>
          <label class="pf-label-chico">Fecha de finalización</label>
          <input type="month" id="sub-est-fin" value="${datos.fechaFinRaw || ""}" ${datos.alPresente ? "disabled" : ""}>
        </div>
      </div>

      <div class="pf-submodal-check-row">
        <input type="checkbox" id="sub-est-presente" ${datos.alPresente ? "checked" : ""}>
        <label for="sub-est-presente">Al presente</label>
      </div>

      <div class="pf-submodal-acciones">
        <button type="button" class="btn-ghost" id="cancelarSubmodalEstudio">Cancelar</button>
        <button type="button" class="btn-primary" id="guardarSubmodalEstudio">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  initAutocomplete("sub-est-tipo", "sub-est-tipo-suggestions", TIPOS_ESTUDIO, (v) => {
    document.getElementById("sub-est-tipo").value = v;
  });
  initAutocomplete("sub-est-area", "sub-est-area-suggestions", AREAS_ESTUDIO, (v) => {
    document.getElementById("sub-est-area").value = v;
  });
  initAutocomplete("sub-est-pais", "sub-est-pais-suggestions", PAISES_LATAM, (v) => {
    document.getElementById("sub-est-pais").value = v;
  });
  initAutocomplete("sub-est-institucion", "sub-est-institucion-suggestions", INSTITUCIONES_SUGERIDAS, (v) => {
    document.getElementById("sub-est-institucion").value = v;
  });

  document.getElementById("sub-est-presente").addEventListener("change", (e) => {
    document.getElementById("sub-est-fin").disabled = e.target.checked;
  });

  document.getElementById("cerrarSubmodalEstudio").addEventListener("click", () => overlay.remove());
  document.getElementById("cancelarSubmodalEstudio").addEventListener("click", () => overlay.remove());

  document.getElementById("guardarSubmodalEstudio").addEventListener("click", () => {
    const tituloCarrera = document.getElementById("sub-est-titulo").value.trim();
    if (!tituloCarrera) {
      mostrarToast("⚠️ Ingresá el título o carrera.");
      return;
    }

    const inicioRaw = document.getElementById("sub-est-inicio").value;
    const finRaw = document.getElementById("sub-est-fin").value;
    const alPresente = document.getElementById("sub-est-presente").checked;

    const nuevoEstudio = {
      tituloCarrera,
      pais: document.getElementById("sub-est-pais").value,
      estado: document.getElementById("sub-est-estado").value,
      tipoEstudio: document.getElementById("sub-est-tipo").value,
      areaEstudio: document.getElementById("sub-est-area").value,
      institucion: document.getElementById("sub-est-institucion").value.trim(),
      fechaInicioRaw: inicioRaw,
      fechaFinRaw: finRaw,
      fechaInicio: formatearMesAnio(inicioRaw),
      fechaFin: alPresente ? "" : formatearMesAnio(finRaw),
      alPresente
    };

    if (estudioEditandoIndex !== null) {
      estudiosTemp[estudioEditandoIndex] = nuevoEstudio;
    } else {
      estudiosTemp.push(nuevoEstudio);
    }

    renderEstudiosLista();
    actualizarCompletitudPerfil();
    overlay.remove();
  });
}

document.getElementById("btnSumarEstudio").addEventListener("click", () => abrirSubmodalEstudio());

// Convierte "2026-03" (input type=month) en "Mar 2026"
function formatearMesAnio(valor) {
  if (!valor) return "";
  const [anio, mes] = valor.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const i = Number(mes) - 1;
  return (meses[i] || "") + " " + anio;
}

// ======================================================
// EXPERIENCIA LABORAL (submodal "Sumar experiencia laboral")
// ======================================================

let experienciasTemp = [];
let experienciaEditandoIndex = null;

function renderExperienciasLista() {
  const cont = document.getElementById("listaExperiencias");
  if (!experienciasTemp.length) {
    cont.innerHTML = '<p class="pf-lista-vacia">Todavía no agregaste experiencia laboral.</p>';
    return;
  }
  cont.innerHTML = experienciasTemp.map((e, i) => `
    <div class="pf-item-card">
      <div class="pf-item-card-acciones">
        <button type="button" class="pf-item-card-btn" data-accion="editar" data-i="${i}" title="Editar">✏️</button>
        <button type="button" class="pf-item-card-btn" data-accion="borrar" data-i="${i}" title="Eliminar">🗑️</button>
      </div>
      <div class="pf-item-card-titulo">${e.puesto} ${e.empresa ? "· " + e.empresa : ""}</div>
      <div class="pf-item-card-detalle">
        ${e.areaPuesto || ""}${e.subarea ? " - " + e.subarea : ""}${e.nivelExperiencia ? " · " + e.nivelExperiencia : ""}<br>
        ${e.fechaInicio || ""} - ${e.alPresente ? "Actualidad" : (e.fechaFin || "")}${e.paisEmpresa ? ", " + e.paisEmpresa : ""}
      </div>
      <div class="pf-item-card-extras">
        ${(e.referencias || []).map(r => `
          <div class="pf-extra-item">👤 Ref. laboral: <strong>${r.nombre} ${r.apellido}</strong> · ${r.relacion || ""}</div>
        `).join("")}
        <div class="pf-item-btns-extra">
          <button type="button" class="pf-btn-sumar-extra" data-accion="ref-laboral" data-i="${i}">+ Sumar referencia laboral</button>
        </div>
      </div>
    </div>
  `).join("");

  cont.querySelectorAll('[data-accion="borrar"]').forEach(btn => {
    btn.addEventListener("click", () => {
      experienciasTemp.splice(Number(btn.dataset.i), 1);
      renderExperienciasLista();
      actualizarCompletitudPerfil();
    });
  });
  cont.querySelectorAll('[data-accion="editar"]').forEach(btn => {
    btn.addEventListener("click", () => abrirSubmodalExperiencia(Number(btn.dataset.i)));
  });
  cont.querySelectorAll('[data-accion="ref-laboral"]').forEach(btn => {
    btn.addEventListener("click", () => abrirSubmodalReferencia("laboral", Number(btn.dataset.i)));
  });
}

function abrirSubmodalExperiencia(index) {
  experienciaEditandoIndex = (index === undefined) ? null : index;
  const datos = (experienciaEditandoIndex !== null) ? experienciasTemp[experienciaEditandoIndex] : {};

  const overlay = document.createElement("div");
  overlay.className = "pf-submodal-overlay";
  overlay.id = "submodalExperiencia";
  overlay.innerHTML = `
    <div class="pf-submodal-box">
      <span class="pf-submodal-cerrar" id="cerrarSubmodalExperiencia">✕</span>
      <h3>${experienciaEditandoIndex !== null ? "Editar experiencia" : "Sumar experiencia laboral"}</h3>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Empresa *</label>
          <input type="text" id="sub-exp-empresa" placeholder="Ingresá el nombre" value="${datos.empresa || ""}">
        </div>
        <div>
          <label class="pf-label-chico">Puesto *</label>
          <input type="text" id="sub-exp-puesto" placeholder="Ingresá el nombre" value="${datos.puesto || ""}">
        </div>
      </div>

      <label class="pf-label-chico">Actividad de la empresa *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-exp-actividad" placeholder="Elegí una opción" value="${datos.actividadEmpresa || ""}">
        <div class="pf-suggestions oculto" id="sub-exp-actividad-suggestions"></div>
      </div>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Nivel de experiencia *</label>
          <div class="pf-autocomplete-wrap">
            <input type="text" id="sub-exp-nivel" placeholder="Elegí una opción" value="${datos.nivelExperiencia || ""}">
            <div class="pf-suggestions oculto" id="sub-exp-nivel-suggestions"></div>
          </div>
        </div>
        <div>
          <label class="pf-label-chico">País de la empresa</label>
          <div class="pf-autocomplete-wrap">
            <input type="text" id="sub-exp-pais" placeholder="Elegí una opción" value="${datos.paisEmpresa || ""}">
            <div class="pf-suggestions oculto" id="sub-exp-pais-suggestions"></div>
          </div>
        </div>
      </div>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Área del puesto *</label>
          <div class="pf-autocomplete-wrap">
            <input type="text" id="sub-exp-area" placeholder="Elegí una opción" value="${datos.areaPuesto || ""}">
            <div class="pf-suggestions oculto" id="sub-exp-area-suggestions"></div>
          </div>
        </div>
        <div>
          <label class="pf-label-chico">Subárea</label>
          <div class="pf-autocomplete-wrap">
            <input type="text" id="sub-exp-subarea" placeholder="Elegí una opción" value="${datos.subarea || ""}">
            <div class="pf-suggestions oculto" id="sub-exp-subarea-suggestions"></div>
          </div>
        </div>
      </div>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Fecha de inicio</label>
          <input type="month" id="sub-exp-inicio" value="${datos.fechaInicioRaw || ""}">
        </div>
        <div>
          <label class="pf-label-chico">Fecha de finalización</label>
          <input type="month" id="sub-exp-fin" value="${datos.fechaFinRaw || ""}" ${datos.alPresente ? "disabled" : ""}>
        </div>
      </div>

      <div class="pf-submodal-check-row">
        <input type="checkbox" id="sub-exp-presente" ${datos.alPresente ? "checked" : ""}>
        <label for="sub-exp-presente">Al presente</label>
      </div>

      <label class="pf-label-chico">Descripción de responsabilidades</label>
      <textarea id="sub-exp-descripcion" rows="3" placeholder="Escribí cuáles son tus tareas">${datos.descripcion || ""}</textarea>

      <div class="pf-submodal-acciones">
        <button type="button" class="btn-ghost" id="cancelarSubmodalExperiencia">Cancelar</button>
        <button type="button" class="btn-primary" id="guardarSubmodalExperiencia">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  initAutocomplete("sub-exp-actividad", "sub-exp-actividad-suggestions", ACTIVIDADES_EMPRESA, (v) => {
    document.getElementById("sub-exp-actividad").value = v;
  });
  initAutocomplete("sub-exp-nivel", "sub-exp-nivel-suggestions", NIVELES_EXPERIENCIA, (v) => {
    document.getElementById("sub-exp-nivel").value = v;
  });
  initAutocomplete("sub-exp-area", "sub-exp-area-suggestions", AREAS_PUESTO, (v) => {
    document.getElementById("sub-exp-area").value = v;
    // Al elegir área, ofrecemos subáreas relacionadas
    const subareasDelArea = SUBAREAS_PUESTO[v] || [];
    initAutocomplete("sub-exp-subarea", "sub-exp-subarea-suggestions", subareasDelArea, (sub) => {
      document.getElementById("sub-exp-subarea").value = sub;
    });
  });
  initAutocomplete("sub-exp-subarea", "sub-exp-subarea-suggestions", SUBAREAS_PUESTO[datos.areaPuesto] || [], (v) => {
    document.getElementById("sub-exp-subarea").value = v;
  });
  initAutocomplete("sub-exp-pais", "sub-exp-pais-suggestions", PAISES_LATAM, (v) => {
    document.getElementById("sub-exp-pais").value = v;
  });

  document.getElementById("sub-exp-presente").addEventListener("change", (e) => {
    document.getElementById("sub-exp-fin").disabled = e.target.checked;
  });

  document.getElementById("cerrarSubmodalExperiencia").addEventListener("click", () => overlay.remove());
  document.getElementById("cancelarSubmodalExperiencia").addEventListener("click", () => overlay.remove());

  document.getElementById("guardarSubmodalExperiencia").addEventListener("click", () => {
    const empresa = document.getElementById("sub-exp-empresa").value.trim();
    const puesto = document.getElementById("sub-exp-puesto").value.trim();
    if (!empresa || !puesto) {
      mostrarToast("⚠️ Completá al menos empresa y puesto.");
      return;
    }

    const inicioRaw = document.getElementById("sub-exp-inicio").value;
    const finRaw = document.getElementById("sub-exp-fin").value;
    const alPresente = document.getElementById("sub-exp-presente").checked;

    const nuevaExperiencia = {
      empresa,
      puesto,
      actividadEmpresa: document.getElementById("sub-exp-actividad").value,
      nivelExperiencia: document.getElementById("sub-exp-nivel").value,
      areaPuesto: document.getElementById("sub-exp-area").value,
      subarea: document.getElementById("sub-exp-subarea").value,
      paisEmpresa: document.getElementById("sub-exp-pais").value,
      fechaInicioRaw: inicioRaw,
      fechaFinRaw: finRaw,
      fechaInicio: formatearMesAnio(inicioRaw),
      fechaFin: alPresente ? "" : formatearMesAnio(finRaw),
      alPresente,
      descripcion: document.getElementById("sub-exp-descripcion").value.trim()
    };

    if (experienciaEditandoIndex !== null) {
      experienciasTemp[experienciaEditandoIndex] = nuevaExperiencia;
    } else {
      experienciasTemp.push(nuevaExperiencia);
    }

    renderExperienciasLista();
    actualizarCompletitudPerfil();
    overlay.remove();
  });
}

document.getElementById("btnSumarExperiencia").addEventListener("click", () => abrirSubmodalExperiencia());

// ======================================================
// ======================================================
// REFERENCIAS (laboral / académica)
// ======================================================

const RELACIONES_REFERENCIA = [
  "Jefe/a directo/a", "Colega / Par", "Cliente", "Subordinado/a",
  "Profesor/a", "Tutor/a", "Director/a académico/a", "Otro"
];

function abrirSubmodalReferencia(tipo, itemIndex) {
  // tipo: "laboral" | "academica"
  const lista = tipo === "laboral" ? experienciasTemp : estudiosTemp;
  const item = lista[itemIndex];
  const tituloContexto = tipo === "laboral"
    ? (item.puesto || "") + (item.empresa ? " — " + item.empresa : "")
    : item.tituloCarrera || "";

  const overlay = document.createElement("div");
  overlay.className = "pf-submodal-overlay";
  overlay.innerHTML = `
    <div class="pf-submodal-box">
      <span class="pf-submodal-cerrar" id="cerrarSubmodalRef">✕</span>
      <h3>Sumar referencia ${tipo === "laboral" ? "laboral" : "académica"}</h3>
      ${tituloContexto ? `<p class="pf-tip">Relacionada a: <strong>${tituloContexto}</strong></p>` : ""}
      <p class="pf-tip">Tu referencia recibirá un email para confirmar sus datos.</p>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Nombre *</label>
          <input type="text" id="sub-ref-nombre" placeholder="Nombre">
        </div>
        <div>
          <label class="pf-label-chico">Apellido *</label>
          <input type="text" id="sub-ref-apellido" placeholder="Apellido">
        </div>
      </div>

      <label class="pf-label-chico">Email *</label>
      <input type="email" id="sub-ref-email" placeholder="Email de la referencia">

      <label class="pf-label-chico">Teléfono (opcional)</label>
      <div class="pf-row pf-row-tel">
        <span class="pf-tel-prefijo">+54</span>
        <input type="tel" id="sub-ref-telefono" placeholder="Ej: 91123456789">
      </div>

      <label class="pf-label-chico">Relación *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-ref-relacion" placeholder="Elegí una opción">
        <div class="pf-suggestions oculto" id="sub-ref-relacion-suggestions"></div>
      </div>

      <div class="pf-submodal-acciones">
        <button type="button" class="btn-ghost" id="cancelarSubmodalRef">Cancelar</button>
        <button type="button" class="btn-primary" id="guardarSubmodalRef">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  initAutocomplete("sub-ref-relacion", "sub-ref-relacion-suggestions", RELACIONES_REFERENCIA, (v) => {
    document.getElementById("sub-ref-relacion").value = v;
  });

  document.getElementById("cerrarSubmodalRef").addEventListener("click", () => overlay.remove());
  document.getElementById("cancelarSubmodalRef").addEventListener("click", () => overlay.remove());

  document.getElementById("guardarSubmodalRef").addEventListener("click", () => {
    const nombre = document.getElementById("sub-ref-nombre").value.trim();
    const apellido = document.getElementById("sub-ref-apellido").value.trim();
    const email = document.getElementById("sub-ref-email").value.trim();
    const relacion = document.getElementById("sub-ref-relacion").value.trim();

    if (!nombre || !apellido || !email) {
      mostrarToast("⚠️ Completá nombre, apellido y email.");
      return;
    }

    const nuevaRef = {
      nombre, apellido, email,
      telefono: document.getElementById("sub-ref-telefono").value.trim(),
      relacion
    };

    if (!lista[itemIndex].referencias) lista[itemIndex].referencias = [];
    lista[itemIndex].referencias.push(nuevaRef);

    if (tipo === "laboral") renderExperienciasLista();
    else renderEstudiosLista();

    mostrarToast("✅ Referencia agregada.");
    overlay.remove();
  });
}

// ======================================================
// CERTIFICADOS (vinculados a un estudio)
// ======================================================

function abrirSubmodalCertificado(estudioIndex) {
  const estudio = estudiosTemp[estudioIndex];

  const overlay = document.createElement("div");
  overlay.className = "pf-submodal-overlay";
  overlay.innerHTML = `
    <div class="pf-submodal-box">
      <span class="pf-submodal-cerrar" id="cerrarSubmodalCert">✕</span>
      <h3>Sumar certificado</h3>
      ${estudio.tituloCarrera ? `<p class="pf-tip">Relacionado a: <strong>${estudio.tituloCarrera}</strong></p>` : ""}

      <label class="pf-label-chico">Ingresá un link al certificado</label>
      <input type="url" id="sub-cert-link" placeholder="https://...">

      <p class="pf-tip">O si tenés el archivo, podés nombrar el archivo aquí y adjuntarlo más tarde cuando el equipo implemente la subida de archivos.</p>
      <input type="text" id="sub-cert-nombre" placeholder="Nombre del certificado (opcional)">

      <div class="pf-submodal-acciones">
        <button type="button" class="btn-ghost" id="cancelarSubmodalCert">Cancelar</button>
        <button type="button" class="btn-primary" id="guardarSubmodalCert">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("cerrarSubmodalCert").addEventListener("click", () => overlay.remove());
  document.getElementById("cancelarSubmodalCert").addEventListener("click", () => overlay.remove());

  document.getElementById("guardarSubmodalCert").addEventListener("click", () => {
    const link = document.getElementById("sub-cert-link").value.trim();
    const nombre = document.getElementById("sub-cert-nombre").value.trim();

    if (!link && !nombre) {
      mostrarToast("⚠️ Ingresá un link o el nombre del certificado.");
      return;
    }

    if (!estudiosTemp[estudioIndex].certificados) estudiosTemp[estudioIndex].certificados = [];
    estudiosTemp[estudioIndex].certificados.push({ link, nombre });

    renderEstudiosLista();
    mostrarToast("✅ Certificado agregado.");
    overlay.remove();
  });
}

// ======================================================
// IDIOMAS (submodal "Sumar idioma")
// ======================================================

// ======================================================

let idiomasTemp = [];

const IDIOMAS_SUGERIDOS = ["Español", "Inglés", "Portugués", "Francés", "Italiano", "Alemán"];
const NIVELES_IDIOMA = ["Nativo", "Avanzado", "Intermedio", "Básico"];

function renderIdiomasLista() {
  const cont = document.getElementById("listaIdiomas");
  if (!idiomasTemp.length) {
    cont.innerHTML = '<p class="pf-lista-vacia">Todavía no agregaste idiomas.</p>';
    return;
  }
  cont.innerHTML = idiomasTemp.map((idi, i) => `
    <div class="pf-item-card">
      <div class="pf-item-card-acciones">
        <button type="button" class="pf-item-card-btn" data-accion="borrar" data-i="${i}" title="Eliminar">🗑️</button>
      </div>
      <div class="pf-item-card-titulo">${idi.idioma}</div>
      <div class="pf-item-card-detalle">Escrito: ${idi.escrito} · Oral: ${idi.oral}</div>
    </div>
  `).join("");

  cont.querySelectorAll('[data-accion="borrar"]').forEach(btn => {
    btn.addEventListener("click", () => {
      idiomasTemp.splice(Number(btn.dataset.i), 1);
      renderIdiomasLista();
    });
  });
}

function abrirSubmodalIdioma() {
  const overlay = document.createElement("div");
  overlay.className = "pf-submodal-overlay";
  overlay.innerHTML = `
    <div class="pf-submodal-box">
      <span class="pf-submodal-cerrar" id="cerrarSubmodalIdioma">✕</span>
      <h3>Sumar idioma</h3>

      <label class="pf-label-chico">Idioma *</label>
      <div class="pf-autocomplete-wrap">
        <input type="text" id="sub-idi-nombre" placeholder="Elegí una opción">
        <div class="pf-suggestions oculto" id="sub-idi-nombre-suggestions"></div>
      </div>

      <div class="pf-row">
        <div>
          <label class="pf-label-chico">Escrito *</label>
          <select id="sub-idi-escrito">
            <option value="">Elegí una opción</option>
            ${NIVELES_IDIOMA.map(n => `<option>${n}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="pf-label-chico">Oral *</label>
          <select id="sub-idi-oral">
            <option value="">Elegí una opción</option>
            ${NIVELES_IDIOMA.map(n => `<option>${n}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="pf-submodal-acciones">
        <button type="button" class="btn-ghost" id="cancelarSubmodalIdioma">Cancelar</button>
        <button type="button" class="btn-primary" id="guardarSubmodalIdioma">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  initAutocomplete("sub-idi-nombre", "sub-idi-nombre-suggestions", IDIOMAS_SUGERIDOS, (v) => {
    document.getElementById("sub-idi-nombre").value = v;
  });

  document.getElementById("cerrarSubmodalIdioma").addEventListener("click", () => overlay.remove());
  document.getElementById("cancelarSubmodalIdioma").addEventListener("click", () => overlay.remove());

  document.getElementById("guardarSubmodalIdioma").addEventListener("click", () => {
    const idioma = document.getElementById("sub-idi-nombre").value.trim();
    const escrito = document.getElementById("sub-idi-escrito").value;
    const oral = document.getElementById("sub-idi-oral").value;

    if (!idioma || !escrito || !oral) {
      mostrarToast("⚠️ Completá idioma, escrito y oral.");
      return;
    }

    idiomasTemp.push({ idioma, escrito, oral });
    renderIdiomasLista();
    overlay.remove();
  });
}

document.getElementById("btnSumarIdioma").addEventListener("click", abrirSubmodalIdioma);

// ======================================================
// COMPLETITUD DEL PERFIL (barra de progreso visual)
// ======================================================

function actualizarCompletitudPerfil() {
  const campos = [
    document.getElementById("pf-nombre").value,
    document.getElementById("pf-apellido").value,
    document.getElementById("pf-email").value,
    document.getElementById("pf-celular").value,
    document.getElementById("pf-nacionalidad").value,
    document.getElementById("pf-objetivo").value,
    estudiosTemp.length ? "x" : "",
    experienciasTemp.length ? "x" : "",
    habilidadesTemp.length ? "x" : "",
    interesesTemp.length ? "x" : ""
  ];

  const completos = campos.filter(c => c && c.trim && c.trim() !== "" || c === "x").length;
  const porcentaje = Math.round((completos / campos.length) * 100);

  const barra = document.getElementById("pfBarraCompletitud");
  const texto = document.getElementById("pfPorcentajeCompletitud");
  if (barra) barra.style.width = porcentaje + "%";
  if (texto) texto.textContent = porcentaje + "% completo";
}

// Recalcular completitud cada vez que el usuario toca el formulario
document.getElementById("profileForm").addEventListener("input", actualizarCompletitudPerfil);

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

    // Campos obligatorios: nombre, apellido y email (visibles siempre, no dependen de tabs)
    const nombre = document.getElementById("pf-nombre").value.trim();
    const apellido = document.getElementById("pf-apellido").value.trim();

    if (!nombre || !apellido) {
      mostrarToast("⚠️ Completá nombre y apellido antes de guardar.");
      return;
    }

    // Validar email antes de guardar nada
    const inputEmail = document.getElementById("pf-email");
    const errorEmail = document.getElementById("errorPfEmail");

    if (!validarEmail(inputEmail, errorEmail)) return;

    const datosPersonales = {
      nombre,
      apellido,
      nacionalidad: document.getElementById("pf-nacionalidad").value,
      fechaNacimiento: document.getElementById("pf-fecha-nacimiento").value,
      genero: document.getElementById("pf-genero").value,
      estadoCivil: document.getElementById("pf-estado-civil").value,
      dni: document.getElementById("pf-dni").value.trim(),
      celular: document.getElementById("pf-celular").value.trim(),
      telefono: document.getElementById("pf-telefono").value.trim(),
      email: inputEmail.value.trim(),
      canalPrincipal: document.getElementById("pf-canal-principal").value,
      canalSecundario: document.getElementById("pf-canal-secundario").value,
      discapacidad: document.getElementById("pf-discapacidad").value.trim(),
      pretensionSalarial: {
        moneda: document.getElementById("pf-moneda-salario").value,
        monto: document.getElementById("pf-pretension-salarial").value
      }
    };

    const objetivoProfesional = document.getElementById("pf-objetivo").value.trim();

    // "formacion.carrera" se deriva del estudio más reciente para no romper
    // el matching existente en reordenarPorPerfil (usa perfil.formacion.carrera)
    const ultimoEstudio = estudiosTemp[estudiosTemp.length - 1];

    perfilUsuario = {
      foto: fotoPerfilTemp,
      datosPersonales,
      estudios: estudiosTemp,
      experiencias: experienciasTemp,
      idiomas: idiomasTemp,
      formacion: { carrera: ultimoEstudio ? ultimoEstudio.tituloCarrera : "" },
      habilidades: habilidadesTemp,
      interesesProfesionales: interesesTemp,
      objetivoProfesional,
      ultimaModificacion: new Date().toISOString()
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

// Click en "Creá tu perfil" -> si ya tiene perfil, lo abre para editar; si no, va a crear cuenta
document.getElementById("step1").addEventListener("click", function(){
  const perfil = cargarPerfil();
  if (perfil && perfil.datosPersonales) {
    precargarFormularioPerfil(perfil);
    document.getElementById("modalPerfil").classList.remove("oculto");
  } else {
    abrirModalLogin();
  }
});

// Click en "Analizá tu perfil" -> si tiene perfil, reordena todo por compatibilidad
document.getElementById("step2").addEventListener("click", function(){
  const perfil = cargarPerfil();
  if (!perfil || !perfil.datosPersonales) return;
  reordenarPorPerfil(perfil);
  completarPaso(2);
  activarPaso(3); // Descubrí cursos
  activarPaso(4); // Explorá becas
  activarPaso(5); // Encontrá empleos
  // Scroll suave a cursos
  document.getElementById("hub").scrollIntoView({ behavior: "smooth" });
});

// Click en "Descubrí cursos" -> si está desbloqueado, lleva directo a la sección de cursos
document.getElementById("step3").addEventListener("click", function(){
  if (this.classList.contains("locked")) return;
  completarPaso(3);
  document.getElementById("hub").scrollIntoView({ behavior: "smooth" });
});

// Click en "Explorá becas" -> si está desbloqueado, lleva directo a la sección de becas
document.getElementById("step4").addEventListener("click", function(){
  if (this.classList.contains("locked")) return;
  completarPaso(4);
  document.getElementById("becas").scrollIntoView({ behavior: "smooth" });
});

// Click en "Encontrá empleos" -> si está desbloqueado, lleva directo a la sección de empleos
document.getElementById("step5").addEventListener("click", function(){
  if (this.classList.contains("locked")) return;
  completarPaso(5);
  document.getElementById("empleos").scrollIntoView({ behavior: "smooth" });
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
// "areaProfesional" se usa en el filtro de abajo: Tecnología / Diseño / Negocios / Marketing / Administración
const catalogoCursos = [
  {
    id: "curso-excel-datos",
    plataforma: "Google Career Certificates",
    plataformaIcono: "🔵",
    titulo: "Excel y Análisis de Datos para el Trabajo",
    categoria: "Datos & IA",
    areaProfesional: "Administración",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 6,
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
    areaProfesional: "Negocios",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 3,
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
    areaProfesional: "Tecnología",
    nivel: "Intermedio",
    modalidad: "Online",
    horasSemanales: 5,
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
    areaProfesional: "Tecnología",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 2,
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
    areaProfesional: "Diseño",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 5,
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
    areaProfesional: "Marketing",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 5,
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
    areaProfesional: "Negocios",
    nivel: "Intermedio",
    modalidad: "Online",
    horasSemanales: 4,
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
    areaProfesional: "Negocios",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 3,
    duracion: "15 horas",
    certificado: true,
    gratis: true,
    icono: "🩺",
    colorThumb: "linear-gradient(135deg,#10B981,#059669)",
    url: "https://www.coursera.org/learn/public-health",
    matchScore: 65,
    tags: ["salud", "salud pública", "comunidad", "bienestar"]
  },
  {
    id: "curso-programacion-python",
    plataforma: "edX",
    plataformaIcono: "📘",
    titulo: "Python para Principiantes",
    categoria: "Tecnología",
    areaProfesional: "Tecnología",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 3,
    duracion: "8 semanas",
    certificado: true,
    gratis: true,
    icono: "🐍",
    colorThumb: "linear-gradient(135deg,#1E40AF,#2563EB)",
    url: "https://www.edx.org/learn/python",
    matchScore: 84,
    tags: ["programación", "python", "tecnología", "código"]
  },
  {
    id: "curso-redes-cisco",
    plataforma: "Cisco Networking Academy",
    plataformaIcono: "🌐",
    titulo: "Fundamentos de Redes (CCNA Intro)",
    categoria: "Tecnología",
    areaProfesional: "Tecnología",
    nivel: "Intermedio",
    modalidad: "Online",
    horasSemanales: 4,
    duracion: "10 semanas",
    certificado: true,
    gratis: true,
    icono: "🔌",
    colorThumb: "linear-gradient(135deg,#0284C7,#0EA5E9)",
    url: "https://www.netacad.com/courses/networking-basics",
    matchScore: 76,
    tags: ["redes", "networking", "infraestructura", "cisco"]
  },
  {
    id: "curso-diseno-grafico",
    plataforma: "Udemy",
    plataformaIcono: "🎯",
    titulo: "Diseño Gráfico con Canva desde Cero",
    categoria: "Diseño",
    areaProfesional: "Diseño",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 2,
    duracion: "12 horas",
    certificado: true,
    gratis: false,
    icono: "🖼️",
    colorThumb: "linear-gradient(135deg,#DB2777,#7C3AED)",
    url: "https://www.udemy.com/course/canva-diseno-grafico/",
    matchScore: 72,
    tags: ["diseño gráfico", "canva", "redes sociales", "visual"]
  },
  {
    id: "curso-gestion-proyectos",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Fundamentos de Gestión de Proyectos",
    categoria: "Negocios",
    areaProfesional: "Negocios",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 6,
    duracion: "6 semanas",
    certificado: true,
    gratis: true,
    icono: "📋",
    colorThumb: "linear-gradient(135deg,#2563EB,#0EA5E9)",
    url: "https://www.coursera.org/learn/project-management-foundations",
    matchScore: 85,
    tags: ["gestión de proyectos", "planificación", "scrum", "negocios"]
  },
  {
    id: "curso-seo",
    plataforma: "Udemy",
    plataformaIcono: "🎯",
    titulo: "SEO: Posicionamiento Web desde Cero",
    categoria: "Marketing",
    areaProfesional: "Marketing",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 3,
    duracion: "10 horas",
    certificado: true,
    gratis: false,
    icono: "🔍",
    colorThumb: "linear-gradient(135deg,#F97316,#EF4444)",
    url: "https://www.udemy.com/course/seo-posicionamiento/",
    matchScore: 74,
    tags: ["seo", "posicionamiento", "google", "marketing digital"]
  },
  {
    id: "curso-administracion-empresas",
    plataforma: "Fundación Carlos Slim",
    plataformaIcono: "🏛️",
    titulo: "Administración de Empresas para No Administradores",
    categoria: "Negocios",
    areaProfesional: "Administración",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 2,
    duracion: "8 horas",
    certificado: true,
    gratis: true,
    icono: "🏢",
    colorThumb: "linear-gradient(135deg,#0F766E,#10B981)",
    url: "https://capacitateparaelempleo.org/",
    matchScore: 88,
    tags: ["administración", "empresa", "gestión", "organización"]
  },
  {
    id: "curso-recursos-humanos",
    plataforma: "Coursera",
    plataformaIcono: "🎓",
    titulo: "Introducción a la Gestión de Recursos Humanos",
    categoria: "Negocios",
    areaProfesional: "Administración",
    nivel: "Principiante",
    modalidad: "Online",
    horasSemanales: 3,
    duracion: "5 semanas",
    certificado: true,
    gratis: true,
    icono: "👥",
    colorThumb: "linear-gradient(135deg,#7C3AED,#2563EB)",
    url: "https://www.coursera.org/learn/managing-human-resources",
    matchScore: 81,
    tags: ["recursos humanos", "rrhh", "selección", "gestión de personas"]
  },

  // 👉 Plantilla para agregar un curso nuevo (copiá y completá):
  // {
  //   id: "curso-xxx",                 // único, sin espacios
  //   plataforma: "...",
  //   plataformaIcono: "🔵",
  //   titulo: "...",
  //   categoria: "...",                // Tecnología / Negocios / Diseño / Datos & IA / Marketing / Idiomas / Salud
  //   areaProfesional: "...",          // Tecnología / Diseño / Negocios / Marketing / Administración
  //   nivel: "Principiante|Intermedio|Avanzado",
  //   modalidad: "Online|Presencial|Híbrido",
  //   horasSemanales: 0,
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

// ── CARRUSEL DE CURSOS (3 por página) ─────────────────────────────────────
const CURSOS_POR_PAGINA = 3;
let cursosFiltradosActuales = [...catalogoCursos];
let cursosPaginaActual = 0;

function totalPaginasCursos() {
  return Math.ceil(cursosFiltradosActuales.length / CURSOS_POR_PAGINA);
}

// Pinta en pantalla la página actual del carrusel de cursos
function renderCursos(lista) {
  cursosFiltradosActuales = lista;
  cursosPaginaActual = 0;
  renderPaginaCursos();
}

function renderPaginaCursos() {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;

  if (!cursosFiltradosActuales.length) {
    grid.innerHTML = '<p class="becas-empty">No encontramos cursos con esos filtros. Probá ajustar las opciones.</p>';
    actualizarNavegacionCursos();
    return;
  }

  const inicio = cursosPaginaActual * CURSOS_POR_PAGINA;
  const slice = cursosFiltradosActuales.slice(inicio, inicio + CURSOS_POR_PAGINA);

  grid.innerHTML = slice.map(crearCourseCard).join("");

  // Conecta cada course-card con el link real del curso
  grid.querySelectorAll(".course-card[data-curso-id]").forEach(card => {
    const curso = catalogoCursos.find(c => c.id === card.dataset.cursoId);
    if (!curso || !curso.url) return;

    card.style.cursor = "pointer";
    card.addEventListener("click", () => window.open(curso.url, "_blank"));
  });

  actualizarNavegacionCursos();
}

function actualizarNavegacionCursos() {
  const total = totalPaginasCursos();

  const btnPrev = document.getElementById("cursosPrev");
  const btnNext = document.getElementById("cursosNext");
  if (btnPrev) btnPrev.disabled = cursosPaginaActual === 0;
  if (btnNext) btnNext.disabled = cursosPaginaActual >= total - 1;

  const puntosEl = document.getElementById("cursosPuntos");
  if (puntosEl) {
    puntosEl.innerHTML = Array.from({ length: total }, (_, i) => `
      <button class="beca-punto${i === cursosPaginaActual ? ' activo' : ''}"
              onclick="irAPaginaCursos(${i})" aria-label="Página ${i + 1}">${i + 1}</button>
    `).join("");
  }

  const contadorEl = document.getElementById("cursosContador");
  if (contadorEl) contadorEl.textContent = total > 0 ? `${cursosPaginaActual + 1} / ${total}` : "";
}

function irAPaginaCursos(n) {
  cursosPaginaActual = n;
  renderPaginaCursos();
  document.getElementById("courseGrid").scrollIntoView({ behavior: "smooth", block: "nearest" });
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

// Flechas del carrusel de cursos
const cursosPrevBtn = document.getElementById("cursosPrev");
const cursosNextBtn = document.getElementById("cursosNext");
if (cursosPrevBtn) cursosPrevBtn.addEventListener("click", () => {
  if (cursosPaginaActual > 0) irAPaginaCursos(cursosPaginaActual - 1);
});
if (cursosNextBtn) cursosNextBtn.addEventListener("click", () => {
  if (cursosPaginaActual < totalPaginasCursos() - 1) irAPaginaCursos(cursosPaginaActual + 1);
});

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
            onclick="irAPagina(${i})" aria-label="Página ${i + 1}">${i + 1}</button>
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
  },

  // ── MÁS OPORTUNIDADES ──
  {
    titulo: "Diseñador Gráfico Jr.",
    modalidad: "Híbrido",
    tipo: "Part Time",
    nivel: "Junior",
    fuente: "Bumeran",
    url: "https://www.bumeran.com.ar/empleos-busqueda-diseñador+grafico.html",
    tags: ["Photoshop", "Illustrator", "Canva"],
    compatibilidad: 77,
    emoji: "🖌️"
  },
  {
    titulo: "Analista de Recursos Humanos",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Semi Senior",
    fuente: "Zona Jobs",
    url: "https://www.zonajobs.com.ar/empleos-analista-recursos-humanos.html",
    tags: ["Selección", "RRHH", "Entrevistas"],
    compatibilidad: 80,
    emoji: "👥"
  },
  {
    titulo: "Soporte Técnico IT",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Computrabajo",
    url: "https://www.computrabajo.com.ar/trabajo-de-soporte-tecnico",
    tags: ["Redes", "Hardware", "Atención al cliente"],
    compatibilidad: 75,
    emoji: "🛠️"
  },
  {
    titulo: "Social Media Manager",
    modalidad: "Remoto",
    tipo: "Part Time",
    nivel: "Junior",
    fuente: "Workana",
    url: "https://www.workana.com/jobs?category=marketing-publicidad&language=es",
    tags: ["Redes Sociales", "Contenido", "Canva"],
    compatibilidad: 81,
    emoji: "📲"
  },
  {
    titulo: "QA Tester",
    modalidad: "Remoto",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Get on Board",
    url: "https://www.getonbrd.com/jobs/qa",
    tags: ["Testing", "Bugs", "Automatización"],
    compatibilidad: 79,
    emoji: "🧪"
  },
  {
    titulo: "Recepcionista Administrativo",
    modalidad: "Presencial",
    tipo: "Full Time",
    nivel: "Junior",
    fuente: "Indeed",
    url: "https://ar.indeed.com/jobs?q=recepcionista+administrativo&l=Argentina",
    tags: ["Atención al público", "Agenda", "Organización"],
    compatibilidad: 73,
    emoji: "📞"
  }
];

// ── CARRUSEL DE EMPLEOS (3 por página) ───────────────────────────────────────
const EMPLEOS_POR_PAGINA = 3;
let empleosFiltrados = [...empleos];
let empleosPaginaActual = 0;

function totalPaginasEmpleos() {
  return Math.ceil(empleosFiltrados.length / EMPLEOS_POR_PAGINA);
}

function renderizarEmpleos(lista) {
  empleosFiltrados = lista;
  empleosPaginaActual = 0;
  renderizarPaginaEmpleos();
}

function renderizarPaginaEmpleos() {
  const contenedor = document.getElementById('jobsGrid');
  if (!contenedor) return;

  if (!empleosFiltrados.length) {
    contenedor.innerHTML = '<p style="text-align:center; padding:2rem; color:#888;">No hay empleos que coincidan con los filtros.</p>';
    actualizarNavegacionEmpleos();
    return;
  }

  const inicio = empleosPaginaActual * EMPLEOS_POR_PAGINA;
  const slice = empleosFiltrados.slice(inicio, inicio + EMPLEOS_POR_PAGINA);

  contenedor.innerHTML = slice.map(e => {
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

  actualizarNavegacionEmpleos();
}

function actualizarNavegacionEmpleos() {
  const total = totalPaginasEmpleos();

  const btnPrev = document.getElementById('empleosPrev');
  const btnNext = document.getElementById('empleosNext');
  if (btnPrev) btnPrev.disabled = empleosPaginaActual === 0;
  if (btnNext) btnNext.disabled = empleosPaginaActual >= total - 1;

  const puntosEl = document.getElementById('empleosPuntos');
  if (puntosEl) {
    puntosEl.innerHTML = Array.from({ length: total }, (_, i) => `
      <button class="beca-punto${i === empleosPaginaActual ? ' activo' : ''}"
              onclick="irAPaginaEmpleos(${i})" aria-label="Página ${i + 1}">${i + 1}</button>
    `).join('');
  }

  const contadorEl = document.getElementById('empleosContador');
  if (contadorEl) contadorEl.textContent = total > 0 ? `${empleosPaginaActual + 1} / ${total}` : '';
}

function irAPaginaEmpleos(n) {
  empleosPaginaActual = n;
  renderizarPaginaEmpleos();
  document.getElementById('jobsGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  const btnLimpiar = document.getElementById('btnLimpiarFiltrosBecas');
  if (btnLimpiar) btnLimpiar.addEventListener('click', () => {
    document.querySelectorAll('[data-filtro="tipo"], [data-filtro="alcance"], [data-filtro="area"]')
      .forEach(input => { input.checked = false; });

    const sliderEl = document.getElementById('filtroCompatMin');
    const labelEl = document.getElementById('filtroCompatMinLabel');
    if (sliderEl) sliderEl.value = 0;
    if (labelEl) labelEl.textContent = '0%+';

    renderizarBecas(becas);
  });

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

  const btnFiltrosEmpleos = document.getElementById('btnAplicarFiltrosEmpleos');
  if (btnFiltrosEmpleos) btnFiltrosEmpleos.addEventListener('click', filtrarEmpleos);

  const empleosPrevBtn = document.getElementById('empleosPrev');
  const empleosNextBtn = document.getElementById('empleosNext');
  if (empleosPrevBtn) empleosPrevBtn.addEventListener('click', () => {
    if (empleosPaginaActual > 0) irAPaginaEmpleos(empleosPaginaActual - 1);
  });
  if (empleosNextBtn) empleosNextBtn.addEventListener('click', () => {
    if (empleosPaginaActual < totalPaginasEmpleos() - 1) irAPaginaEmpleos(empleosPaginaActual + 1);
  });

  // Filtro de cursos: se aplica solo al tocar "Aplicar filtros"
  const btnFiltrosCursos = document.getElementById("btnAplicarFiltrosCursos");
  if (btnFiltrosCursos) btnFiltrosCursos.addEventListener("click", aplicarFiltrosSelectCursos);

});

// Aplica los filtros de los <select> de la sección cursos
function aplicarFiltrosSelectCursos() {
  const area        = document.getElementById("filtroAreaCursos")?.value;
  const nivel       = document.getElementById("filtroNivelCursos")?.value;
  const modalidad   = document.getElementById("filtroModalidadCursos")?.value;
  const maxHoras    = document.getElementById("filtroDuracionCursos")?.value;
  const precio      = document.getElementById("filtroPrecioCursos")?.value;
  const cert        = document.getElementById("filtroCertificadoCursos")?.value;

  // Obtener la categoría activa de las pestañas de arriba (academias)
  const tabActiva = document.querySelector('.edu-tab.active')?.textContent.trim() || 'Todos';

  let lista = catalogoCursos;

  if (area)      lista = lista.filter(c => c.areaProfesional === area);
  if (nivel)     lista = lista.filter(c => c.nivel === nivel);
  if (modalidad) lista = lista.filter(c => c.modalidad === modalidad);
  if (maxHoras)  lista = lista.filter(c => c.horasSemanales <= Number(maxHoras));
  if (precio === 'Gratuito') lista = lista.filter(c => c.gratis);
  if (precio === 'Pago')     lista = lista.filter(c => !c.gratis);
  if (cert === 'Con certificado') lista = lista.filter(c => c.certificado);
  if (cert === 'Sin certificado') lista = lista.filter(c => !c.certificado);

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
  precargarFormularioPerfil(null);
  document.getElementById("modalPerfil").classList.remove("oculto");
  irATabPerfil("formacion");
});

// Validar al iniciar sesión
document.getElementById("btnIngresar").addEventListener("click", function(e){
  e.preventDefault();

  const input = document.getElementById("emailSesion");
  const error = document.getElementById("errorEmailSesion");

  if (!validarEmail(input, error)) return;

  document.getElementById("modalLogin").classList.add("oculto");
  precargarFormularioPerfil(null);
  document.getElementById("modalPerfil").classList.remove("oculto");
  irATabPerfil("formacion");
});

// (La validación del email de perfil ya se hace dentro del submit principal,
// más arriba, antes de guardar el perfil y cerrar el modal.)

// ======================================================
// REORDENAR POR PERFIL (compatibilidad real con la IA)
// ======================================================

function reordenarPorPerfil(perfil) {
  if (!perfil || !perfil.habilidades) return;

  // Construimos un conjunto de palabras clave del perfil (todo en minúsculas)
  const palabrasClave = [
    ...(perfil.habilidades || []),
    ...(perfil.interesesProfesionales || []),
    (perfil.formacion?.carrera || ''),
    (perfil.objetivoProfesional || ''),
    // También sumamos áreas de los estudios y puestos de experiencias
    ...((perfil.estudios || []).map(e => e.areaEstudio || '')),
    ...((perfil.experiencias || []).map(e => e.areaPuesto || ''))
  ].map(p => p.toLowerCase()).filter(Boolean);

  // Compara un array de tags contra las palabras clave del perfil
  // Devuelve un score de 0 a 100
  function calcularScoreConTags(tags) {
    if (!tags || !tags.length) return 0;
    const matches = tags.filter(t =>
      palabrasClave.some(p => p.includes(t.toLowerCase()) || t.toLowerCase().includes(p))
    );
    return Math.round((matches.length / tags.length) * 100);
  }

  // Compara el área de una beca/empleo contra los intereses/habilidades del perfil
  // Devuelve un boost de 0 a 30 puntos
  function calcularBoostPorArea(area) {
    if (!area) return 0;
    const areaLower = area.toLowerCase();
    const hayMatch = palabrasClave.some(p =>
      p.includes(areaLower) || areaLower.includes(p)
    );
    return hayMatch ? 30 : 0;
  }

  // ── CURSOS: recalcula matchScore comparando tags del curso con el perfil ──
  const cursosOrdenados = [...catalogoCursos].map(c => {
    const scoreCalculado = Math.max(
      calcularScoreConTags(c.tags),
      calcularBoostPorArea(c.areaProfesional)
    );
    // Si hay match real con el perfil, usamos el score calculado (puede subir O bajar).
    // Si no hay match alguno (score = 0), conservamos el base para no dejarlo en 0.
    const matchFinal = scoreCalculado > 0
      ? Math.min(100, scoreCalculado + 50)   // boost base para que la tarjeta no muestre "0%"
      : c.matchScore;
    return { ...c, matchScore: matchFinal };
  }).sort((a, b) => b.matchScore - a.matchScore);

  renderCursos(cursosOrdenados);

  // ── BECAS: recalcula compatibilidad comparando área y nivel con el perfil ──
  const becasOrdenadas = [...becas].map(b => {
    const boost = calcularBoostPorArea(b.area);
    // Si el perfil menciona el área de la beca, sube la compatibilidad base
    const nuevaCompat = Math.min(100, b.compatibilidad + boost);
    return { ...b, compatibilidad: nuevaCompat };
  }).sort((a, b) => b.compatibilidad - a.compatibilidad);

  renderizarBecas(becasOrdenadas);

  // ── EMPLEOS: recalcula compatibilidad comparando tags y modalidad con el perfil ──
  const empleosOrdenados = [...empleos].map(e => {
    const boostTags = calcularScoreConTags(e.tags || []);
    const boostArea = calcularBoostPorArea(e.titulo);
    const nuevaCompat = Math.min(100, Math.max(e.compatibilidad, e.compatibilidad + Math.round(boostTags * 0.3) + (boostArea > 0 ? 10 : 0)));
    return { ...e, compatibilidad: nuevaCompat };
  }).sort((a, b) => b.compatibilidad - a.compatibilidad);

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