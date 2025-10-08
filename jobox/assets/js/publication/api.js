// Config: apunta al microservicio/back donde montaste las rutas
export const PUBLICATION_API = window.PUBLICATION_API_BASE || '/api/v1/publication';

// Helper fetch JSON
export async function getJSON(url, opts) {
  const r = await fetch(url, opts);
  const isJSON = r.headers.get('content-type')?.includes('application/json');
  const data = isJSON ? await r.json() : null;
  if (!r.ok) {
    const msg = data?.error || data?.message || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data;
}

// Lee employerId/empresaId desde <body data-employer-id=".." data-empresa-id="..">
// o desde window.currentEmployerId/window.currentEmpresaId si lo defines por server-side render.
export function getContextIds() {
  const b = document.body || document.documentElement;
  const employerId = Number(b.dataset.employerId || window.currentEmployerId || 0);
  const empresaId  = Number(b.dataset.empresaId  || window.currentEmpresaId  || 0);
  return { employerId, empresaId };
}
