
console.log("MAIN.JS CARGADO");
// Tab switching
document.querySelectorAll('.edu-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.edu-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});
 
// Source toggles
document.querySelectorAll('.source-toggle').forEach(toggle => {
  toggle.addEventListener('click', function() {
    this.classList.toggle('off');
  });
});
 
// Scroll animations
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

}