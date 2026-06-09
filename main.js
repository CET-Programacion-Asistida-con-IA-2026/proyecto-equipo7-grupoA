const form = document.getElementById("profileForm");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const habilidades =
        document
        .getElementById("habilidades")
        .value
        .toLowerCase();

    let puntaje = 60;

    let cursos = [];
    let empleos = [];
    let becas = [];

    if(habilidades.includes("excel")){
        puntaje += 10;

        cursos.push("Excel Avanzado");
        cursos.push("Power BI");

        empleos.push("Administrativa");
        empleos.push("Asistente Comercial");
    }

    if(habilidades.includes("ventas")){
        puntaje += 10;

        cursos.push("Técnicas de Venta");

        empleos.push("Vendedora");
        empleos.push("Ejecutiva Comercial");
    }

    if(habilidades.includes("administracion")){
        puntaje += 10;

        cursos.push("Gestión Administrativa");

        empleos.push("Recepcionista");
        empleos.push("Administrativa");
    }

    becas.push("Santander Skills");
    becas.push("Argentina Programa");
    becas.push("Potenciar Talento");

    document.getElementById("resultado")
        .classList.remove("oculto");

    document.getElementById("puntaje")
        .innerHTML =
        `Puntaje de empleabilidad: ${puntaje}/100`;

    document.getElementById("cursos")
        .innerHTML =
        cursos.map(curso =>
            `<li>${curso}</li>`
        ).join("");

    document.getElementById("empleos")
        .innerHTML =
        empleos.map(empleo =>
            `<li>${empleo}</li>`
        ).join("");

    document.getElementById("becas")
        .innerHTML =
        becas.map(beca =>
            `<li>${beca}</li>`
        ).join("");
});