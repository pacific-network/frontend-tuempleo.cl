//assets/js/modules/utils/generator-id.js
function generarOrderId(longitud = 12) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    for (let i = 0; i < longitud; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        resultado += caracteres.charAt(indice);
    }
    return resultado;
}