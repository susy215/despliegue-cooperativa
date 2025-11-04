// /src/api/semillaService.js
// Reusa la misma instancia axios (con CSRF/interceptores) de productoCosechadoService
import { api } from './productoCosechadoService';

// Rutas candidatas (ajusta o añade si tu backend usa otras)
const CANDIDATE_ENDPOINTS = [
  '/api/semillas/',
  '/api/cultivos/',
  '/semillas/',
  '/cultivos/',
];

// Intenta GET en el primer endpoint que responda OK y devuelva un array (o results[])
async function fetchFirstWorkingList(params = {}) {
  let lastErr = null;
  for (const base of CANDIDATE_ENDPOINTS) {
    try {
      const res = await api.get(base, { params });
      const data = res.data?.results ?? res.data;
      if (Array.isArray(data)) {
        return { items: data, base }; // devolvemos items y qué base funcionó
      }
    } catch (err) {
      lastErr = err;
      // seguimos probando
    }
  }
  // si ninguna ruta funcionó, lanzamos el último error para debug
  throw lastErr ?? new Error('No se encontró un endpoint de semillas/cultivos');
}

// Igual que arriba, pero para detalle por ID
async function fetchFirstWorkingDetail(id) {
  let lastErr = null;
  for (const base of CANDIDATE_ENDPOINTS) {
    try {
      const res = await api.get(`${base}${id}/`);
      return res.data;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error('No se encontró un endpoint de semillas/cultivos (detalle)');
}

// Normaliza a { id: string, etiqueta: string }
function normalizeRow(s) {
  const id = String(s.id ?? s.pk ?? '');
  const especieONombre = s.nombre ?? s.especie ?? s.tipo ?? s.cultivo ?? `Semilla ${id || '?'}`;
  const variedad = s.variedad ?? s.cultivar ?? '';
  const marca = s.marca ? ` (${s.marca})` : '';
  const etiqueta = [especieONombre, variedad].filter(Boolean).join(' ') + marca;
  return { id, etiqueta: etiqueta.trim() };
}

export const semillaService = {
  // Devuelve SIEMPRE un array (no objeto paginado) para simplificar el uso
  async getSemillas(params = {}) {
    const { items } = await fetchFirstWorkingList(params);
    return items;
  },

  // Devuelve array normalizado [{id, etiqueta}]
  async getSemillasNormalized(params = {}) {
    const { items } = await fetchFirstWorkingList(params);
    return items.map(normalizeRow);
  },

  async getSemillaById(id) {
    return fetchFirstWorkingDetail(id);
  },

  // Estos CRUD intentan con la primera ruta que sirvió para listar.
  // Si quieres, puedes fijar una ruta concreta; aquí lo hacemos dinámico.
  async crearSemilla(data) {
    const { base } = await fetchFirstWorkingList({ page_size: 1 });
    const res = await api.post(base, data);
    return res.data;
  },

  async updateSemilla(id, data) {
    const { base } = await fetchFirstWorkingList({ page_size: 1 });
    const res = await api.put(`${base}${id}/`, data);
    return res.data;
  },

  async deleteSemilla(id) {
    const { base } = await fetchFirstWorkingList({ page_size: 1 });
    const res = await api.delete(`${base}${id}/`);
    return res.data;
  },
};

export default semillaService;
