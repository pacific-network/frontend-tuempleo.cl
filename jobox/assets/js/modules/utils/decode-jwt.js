//assets/js/modules/utils/decode-jwt.js

export function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (e) {
    console.error('Error al decodificar el token:', e);
    return null;
  }
}

