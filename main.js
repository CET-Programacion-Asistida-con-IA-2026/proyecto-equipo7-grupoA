
console.log("MAIN.JS CARGADO");
// Tab switching
document.querySelectorAll('.edu-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

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
// =====================
// CARGA DE BECAS
// =====================

let todasLasBecas = [];

async function cargarBecas() {

  try {

    const respuesta =
      await fetch("becas.json");

    const becas =
      await respuesta.json();
    
    
    todasLasBecas = becas;

    renderizarBecas(todasLasBecas); 

}

  catch(error){

    console.error(
      "Error cargando becas:",
      error
    );

  }

}

cargarBecas();

function renderizarBecas(listaBecas) {

  const contenedor =
    document.getElementById("becasGrid");

  contenedor.innerHTML = "";

  const hoy = new Date();

  listaBecas.forEach(beca => {

    const fechaCierre =
      new Date(beca.fechaCierre);

    console.log(beca.titulo);
    console.log(beca.fechaCierre);
    console.log(fechaCierre);
 

    if (fechaCierre >= hoy) {

      contenedor.innerHTML +=
        crearTarjetaBeca(beca);

    }

  });

}

function crearTarjetaBeca(beca){

  return `

  <div class="beca-card ${beca.destacada ? 'featured' : ''}">

    <div class="beca-logo-wrap">
      ${beca.logo}
    </div>

    <div class="beca-info">

      ${
        beca.destacada
        ? `<div style="margin-bottom:6px">
            <span class="beca-featured-badge">
              ⭐ Destacada
            </span>
          </div>`
        : ''
      }

      <div class="beca-title">
        ${beca.titulo}
      </div>

      <div class="beca-org">
        ${beca.organizacion}
      </div>

      <div class="beca-tags">

        <span class="beca-tag intl">
          ${beca.alcance}
        </span>

        <span class="beca-tag full">
          ${beca.tipo}
        </span>

        <span class="beca-tag">
          ${beca.nivel}
        </span>

        <span class="beca-tag">
          ${beca.idioma}
        </span>

      </div>

    </div>

    <div class="beca-side">

      <div class="match-pct">
        ${beca.compatibilidad}%
      </div>

      <div class="beca-deadline">

        Abierta:
       ${new Date(beca.fechaApertura)
       .toLocaleDateString("es-AR")}

        <br>

        Cierra:
        ${new Date(beca.fechaCierre)
        .toLocaleDateString("es-AR")}

      </div>

      <button
        class="btn-apply"
        onclick="window.open('${beca.url}')">

        Ver requisitos →

      </button>

    </div>

  </div>

  `;
}

document
.getElementById("applyFilters")
.addEventListener("click", aplicarFiltros);

function aplicarFiltros() {

  console.log("Aplicando filtros...");

  const compatibilidadMinima =
    Number(
      document.getElementById(
        "compabilityFilter"
      ).value
    );

  const areasSeleccionadas =
  [...document.querySelectorAll(
    ".area-filter:checked"
  )].map(
    checkbox => checkbox.value
  );
  const tiposSeleccionados =
  [...document.querySelectorAll(
    ".tipo-filter:checked"
  )].map(
    checkbox => checkbox.value
  );
  const nivelesSeleccionados =
  [...document.querySelectorAll(
    ".nivel-filter:checked"
  )].map(
    checkbox => checkbox.value
  );
  const modalidadesSeleccionadas =
  [...document.querySelectorAll(
    ".modalidad-filter:checked"
  )].map(
    checkbox => checkbox.value
  );
const alcancesSeleccionados =
  [...document.querySelectorAll(
    ".alcance-filter:checked"
  )].map(
    checkbox => checkbox.value
  );
  const textoBusqueda =
  document
    .getElementById("searchBeca")
    .value
    .toLowerCase();

  console.log("Compatibilidad:", compatibilidadMinima);
  console.log("Áreas:", areasSeleccionadas);
  console.log("Alcances:", alcancesSeleccionados);

  const becasFiltradas =
    todasLasBecas.filter(beca => {

    const cumpleBusqueda =

     beca.titulo
       .toLowerCase()
       .includes(textoBusqueda)

    ||

     beca.organizacion
       .toLowerCase()
       .includes(textoBusqueda)

    ||

     beca.area
       .toLowerCase()
       .includes(textoBusqueda)

    ||

     beca.pais
       .toLowerCase()
       .includes(textoBusqueda)

    ||

     beca.descripcion
       .toLowerCase()
       .includes(textoBusqueda);  
    
    const cumpleCompatibilidad =
      beca.compatibilidad >=
      compatibilidadMinima;

    const cumpleArea =
      areasSeleccionadas.length === 0
      ||
      areasSeleccionadas.includes(
        beca.area
      );

    const cumpleAlcance =
      alcancesSeleccionados.length === 0
      ||
      alcancesSeleccionados.includes(
        beca.alcance
      );
    const cumpleTipo =
      tiposSeleccionados.length === 0
      ||
      tiposSeleccionados.includes(
       beca.tipo
      );
    const cumpleNivel =
      nivelesSeleccionados.length === 0
      ||
      nivelesSeleccionados.includes(
       beca.nivel
      );
    const cumpleModalidad =
      modalidadesSeleccionadas.length === 0
      ||
      modalidadesSeleccionadas.includes(
       beca.modalidad
      );
    return (
      cumpleCompatibilidad
      &&
      cumpleArea
      &&
      cumpleAlcance
      &&
      cumpleTipo
      &&
      cumpleNivel
      &&
      cumpleModalidad
      &&
      cumpleBusqueda
    );

    });

  renderizarBecas(
    becasFiltradas
  );


// ======================================================
// CREAR PERFIL
// ======================================================

let perfilUsuario = {};

const profileForm = document.getElementById("profileForm");

if (profileForm) {

  profileForm.addEventListener("submit", function(e) {

    e.preventDefault();

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

    console.log(perfilUsuario);

    document.getElementById("modalPerfil").classList.add("oculto");

    completarPaso(1);
    activarPaso(2);

  });
}

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

// Mostrar cursos recomendados
// Filtrar por categoría
// Buscar cursos


// ======================================================
// BECAS
// ======================================================

// Mostrar becas disponibles
// Filtrar becas
// Recomendar becas compatibles

// ======================================================
// EMPLEABILIDAD
// ======================================================

// Calcular porcentaje de compatibilidad
// Ordenar empleos por afinidad
// Filtrar por modalidad
// Filtrar por nivel
// Mostrar empleos recomendados

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

// Validar email en el formulario de perfil
profileForm.addEventListener("submit", function(e){
  e.preventDefault();

  const input = document.getElementById("pf-email");
  const error = document.getElementById("errorPfEmail");

  if (!validarEmail(input, error)) return;

});

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