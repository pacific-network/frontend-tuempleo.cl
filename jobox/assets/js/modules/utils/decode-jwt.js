// assets/js/modules/utils/decode-jwt.js

export function getUserIdFromToken() {
  const token = localStorage.getItem('token'); // ✅ Nombre correcto
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🧩 Payload decodificado:', payload);

    // ✅ Retorna el campo más confiable del token (sub, id o userId)
    return payload.sub || payload.id || payload.userId || null;
  } catch (e) {
    console.error('❌ Error al decodificar el token:', e);
    return null;
  }
}