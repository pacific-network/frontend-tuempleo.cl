function validarNumeroTelefono() {
    const telefonoInput = document.getElementById("numero_telefono");
    const errorMsg = document.getElementById("telefono-error");

    if (!telefonoInput.value.trim()) {
        errorMsg.style.display = "block";
        telefonoInput.classList.add("is-invalid");
        return false;
    } else {
        errorMsg.style.display = "none";
        telefonoInput.classList.remove("is-invalid");
        return true;
    }
}

function validarContacto() {
    const region = document.getElementById("region");
    const comuna = document.getElementById("comuna");

    const regionError = document.getElementById("region-error");
    const comunaError = document.getElementById("comuna-error");

    let valido = true;

    if (!region.value || region.value === "") {
        region.classList.add("is-invalid");
        regionError.style.display = "block";
        valido = false;
    } else {
        region.classList.remove("is-invalid");
        regionError.style.display = "none";
    }

    if (!comuna.value || comuna.value === "" || comuna.disabled) {
        comuna.classList.add("is-invalid");
        comunaError.style.display = "block";
        valido = false;
    } else {
        comuna.classList.remove("is-invalid");
        comunaError.style.display = "none";
    }

    return valido;
}

function validarCamposAdicionales() {
    let valido = true;

    const genero = document.getElementById("genero");
    const generoError = document.getElementById("genero-error");
    if (!genero.value) {
        genero.classList.add("is-invalid");
        generoError.style.display = "block";
        valido = false;
    } else {
        genero.classList.remove("is-invalid");
        generoError.style.display = "none";
    }

    const estado = document.getElementById("estado_civil");
    const estadoError = document.getElementById("estado-civil-error");
    if (!estado.value) {
        estado.classList.add("is-invalid");
        estadoError.style.display = "block";
        valido = false;
    } else {
        estado.classList.remove("is-invalid");
        estadoError.style.display = "none";
    }

    const descripcion = document.getElementById("descripcion_bio");
    const descripcionError = document.getElementById("descripcion-error");
    if (!descripcion.value.trim()) {
        descripcion.classList.add("is-invalid");
        descripcionError.style.display = "block";
        valido = false;
    } else {
        descripcion.classList.remove("is-invalid");
        descripcionError.style.display = "none";
    }

    const educacionContainer = document.getElementById("educacion-container");
    const educacionError = document.getElementById("educacion-error");
    if (!educacionContainer || educacionContainer.children.length === 0) {
        educacionError.style.display = "block";
        valido = false;
    } else {
        educacionError.style.display = "none";
    }

    const categoria = document.getElementById("categoria_empleo");
    const categoriaError = document.getElementById("categoria-error");
    if (!categoria.value.trim()) {
        categoria.classList.add("is-invalid");
        categoriaError.style.display = "block";
        valido = false;
    } else {
        categoria.classList.remove("is-invalid");
        categoriaError.style.display = "none";
    }

    const salario = document.getElementById("salario_esperado");
    const salarioError = document.getElementById("salario-error");
    if (!salario.value.trim()) {
        salario.classList.add("is-invalid");
        salarioError.style.display = "block";
        valido = false;
    } else {
        salario.classList.remove("is-invalid");
        salarioError.style.display = "none";
    }

    const modalidad = document.getElementById("modalidad");
    const modalidadError = document.getElementById("modalidad-error");
    if (!modalidad.value) {
        modalidad.classList.add("is-invalid");
        modalidadError.style.display = "block";
        valido = false;
    } else {
        modalidad.classList.remove("is-invalid");
        modalidadError.style.display = "none";
    }

    return valido;
}

document.getElementById("btn-confirmar-actualizacion").addEventListener("click", function (e) {
    const esValido = validarNumeroTelefono();

    if (!esValido) {
        console.log("Número inválido, cancelando actualización.");
        return; // Detiene aquí. Nada se ejecuta si no es válido.
    }

    // ✅ SOLO SI el número es válido, continúa:
    actualizarInformacion(); // o como se llame tu función real
});

document.getElementById("btn-confirmar-actualizacion-flotante").addEventListener("click", function (e) {
    const esValido = validarNumeroTelefono();

    if (!esValido) {
        console.log("Número inválido, cancelando actualización.");
        return;
    }

    // ✅ Continúa con tu lógica flotante
    actualizarInformacionFlotante(); // si tienes una función aparte
});