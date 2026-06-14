// Tab switching / Cambio de pestañas
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
// AUTH0 — CONFIGURACIÓN
// ======================================================

// ⚠️ REEMPLAZÁ estos valores con los de tu dashboard de Auth0
// Settings → Domain y Settings → Client ID
const AUTH0_DOMAIN    = "dev-mbzyilxh7ne6hp76.us.auth0.com";
const AUTH0_CLIENT_ID = "70wCWpqF5n4UBDEPFYky3nsv09VJaj1M";

let auth0Client = null;

async function inicializarAuth0() {
  auth0Client = await auth0.createAuth0Client({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });

  // Si Auth0 redirigió de vuelta después del login
  if (location.search.includes("code=") && location.search.includes("state=")) {
    await auth0Client.handleRedirectCallback();
    history.replaceState({}, document.title, "/");
  }

  // Si el usuario ya está autenticado, mostrarlo en el nav
  if (await auth0Client.isAuthenticated()) {
    const user = await auth0Client.getUser();
    mostrarUsuarioNav(user);
    // Pre-completar el formulario de perfil con sus datos
    preLlenarPerfil(user);
  }
}

// Muestra avatar + nombre en la barra de navegación y oculta los botones de login
function mostrarUsuarioNav(user) {
  document.querySelector(".nav-actions").style.display = "none";
  const navUsuario = document.getElementById("navUsuario");
  navUsuario.style.display = "flex";
  document.getElementById("navNombre").textContent = user.given_name || user.name || user.email;
  if (user.picture) {
    document.getElementById("navAvatar").src = user.picture;
  }
}

// Pre-llena el formulario de perfil con los datos de Google/LinkedIn
function preLlenarPerfil(user) {
  if (user.name)  document.getElementById("pf-nombre").value = user.name;
  if (user.email) document.getElementById("pf-email").value  = user.email;
  if (user.picture) {
    // Si querés mostrar su foto en algún lugar del perfil, lo hacés acá
  }
}

// Dropdown del avatar
const navAvatarBtn = document.getElementById("navAvatarBtn");
const navDropdown  = document.getElementById("navDropdown");

if (navAvatarBtn) {
  navAvatarBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const visible = navDropdown.style.display === "block";
    navDropdown.style.display = visible ? "none" : "block";
  });
}

document.addEventListener("click", function() {
  if (navDropdown) navDropdown.style.display = "none";
});

// Cerrar sesión
document.getElementById("btnLogout").addEventListener("click", async function() {
  await auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
});

// Inicializar Auth0 al cargar la página
inicializarAuth0();

// ======================================================
// FLUJO DE LOGIN / REGISTRO (PASO 1)
// ======================================================

// Desbloquear un paso
function activarPaso(numero){
  const step = document.getElementById("step" + numero);
  if (step){
    step.classList.remove("locked");
    step.classList.add("available");
  }
}

// Click en "Creá tu perfil" -> abre modal de login/registro
document.getElementById("step1").addEventListener("click", function(){
  document.getElementById("modalLogin").classList.remove("oculto");
});

// Continuar con Google → Auth0 redirige a Google
document.getElementById("btnGoogle").addEventListener("click", async function(){
  mostrarCargandoSocial("Google");
  await auth0Client.loginWithRedirect({
    authorizationParams: { connection: "google-oauth2" }
  });
});

// Continuar con LinkedIn → Auth0 redirige a LinkedIn
document.getElementById("btnLinkedIn").addEventListener("click", async function(){
  mostrarCargandoSocial("LinkedIn");
  await auth0Client.loginWithRedirect({
    authorizationParams: { connection: "linkedin" }
  });
});

// Muestra spinner mientras redirige
function mostrarCargandoSocial(proveedor) {
  document.getElementById("vistaSocial").classList.add("oculto");
  document.getElementById("socialLoading").classList.remove("oculto");
  document.getElementById("socialLoadingText").textContent = `Conectando con ${proveedor}...`;
}

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
// PERFIL INTELIGENTE
// ======================================================

// Calcular puntaje del perfil
// Detectar fortalezas
// Detectar habilidades faltantes
// Mostrar recomendaciones


// ======================================================
// ASISTENTE IA
// ======================================================

// Responder consultas del usuario
// Recomendar cursos
// Recomendar becas
// Recomendar mejoras del perfil


// ======================================================
// EMPLEABILIDAD
// ======================================================

// Calcular porcentaje de compatibilidad
// Ordenar empleos por afinidad
// Filtrar por modalidad
// Filtrar por nivel
// Mostrar empleos recomendados

// Abrir modal CV inteligente
const cvInteligenteBtn = document.getElementById("cvInteligente");
if (cvInteligenteBtn) {
  cvInteligenteBtn.addEventListener("click", function(){
    document.getElementById("modalCV").classList.remove("oculto");
  });
}

// Marcar paso como completado
function completarPaso(numero){

  document
    .getElementById("step" + numero)
    .classList.add("completed");

}

// Activar un paso
function completarPaso(numero){

  document
    .getElementById("step" + numero)
    .classList.add("completed");

}

// Analizar perfil con IA
document.getElementById("step2").addEventListener("click", function(){

  if (this.classList.contains("locked")) return;

  iniciarAnalisis();

});

function iniciarAnalisis(){

  document
    .getElementById("analysisModal")
    .style.display = "flex";

  setTimeout(() => {
    document.getElementById("analisis1").classList.add("done");
    document.getElementById("progressFill").style.width = "25%";
  }, 1000);

  setTimeout(() => {
    document.getElementById("analisis2").classList.add("done");
    document.getElementById("progressFill").style.width = "50%";
  }, 2000);

  setTimeout(() => {
    document.getElementById("analisis3").classList.add("done");
    document.getElementById("progressFill").style.width = "75%";
  }, 3000);

  setTimeout(() => {
    document.getElementById("analisis4").classList.add("done");
    document.getElementById("progressFill").style.width = "100%";
  }, 4000);

  setTimeout(() => {

    document.getElementById("analysisModal").style.display = "none";

    completarPaso(2);

    document.getElementById("connector2").classList.add("active");

    activarPaso(3);

  }, 5000);

}

// Abrir al tocar el paso de cursos
document.getElementById("step3").addEventListener("click", function(){

  if (this.classList.contains("locked")) return;

  document.getElementById("modalCursos").classList.remove("oculto");

});

// Al finalizar el paso de cursos
document.getElementById("finalizarCursos").addEventListener("click", function(){

  completarPaso(3);

  document.getElementById("connector3").classList.add("active");

  activarPaso(4);

});

// Abrir al tocar el paso de becas
document.getElementById("step4").addEventListener("click", function(){

  if (this.classList.contains("locked")) return;

  document.getElementById("modalBecas").classList.remove("oculto");

});

// Al finalizar el paso de becas
document.getElementById("finalizarBecas").addEventListener("click", function(){

  completarPaso(4);

  document.getElementById("connector4").classList.add("active");

  activarPaso(5);

});

// Abrir al tocar el paso de empleos
document.getElementById("step5").addEventListener("click", function(){

  if (this.classList.contains("locked")) return;

  document.getElementById("modalEmpleos").classList.remove("oculto");

});

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