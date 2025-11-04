// /src/api/productoCosechadoService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Axios con credenciales + JSON
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ---------- Interceptores (CSRF + auth) ----------
api.interceptors.request.use(
  (config) => {
    const skipCsrf =
      config.url.includes('/api/auth/login/') ||
      config.url.includes('/api/auth/csrf/');

    if (!skipCsrf) {
      let csrfToken = localStorage.getItem('csrf_token');
      if (!csrfToken && typeof document !== 'undefined') {
        const cookies = document.cookie?.split('; ') || [];
        const c = cookies.find((r) => r.startsWith('csrftoken='));
        if (c) csrfToken = c.split('=')[1];
      }
      if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (e) => Promise.reject(e)
);

api.interceptors.response.use(
  (res) => {
    if (res?.data?.csrf_token) {
      localStorage.setItem('csrf_token', res.data.csrf_token);
    }
    if (typeof document !== 'undefined') {
      const cookies = document.cookie?.split('; ') || [];
      const c = cookies.find((r) => r.startsWith('csrftoken='));
      if (c) localStorage.setItem('csrf_token', c.split('=')[1]);
    }
    return res;
  },
  (error) => {
    const s = error?.response?.status;
    if (s === 401 || s === 403) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Constantes de estado ----------
export const ESTADOS_PRODUCTO = [
  { valor: 'En Almacén', etiqueta: 'En Almacén' },
  { valor: 'Vendido', etiqueta: 'Vendido' },
  { valor: 'Procesado', etiqueta: 'Procesado' },
  { valor: 'Vencido', etiqueta: 'Vencido' },
  { valor: 'En revision', etiqueta: 'En revisión' }, // sin tilde en valor, como en tu modelo
];

// Alias para compatibilidad con código existente
export const ESTADOS_PRODUCTO_FALLBACK = ESTADOS_PRODUCTO;

// Normalizador por si el backend devuelve otros formatos
const normalizeChoices = (raw, fallback) => {
  try {
    if (!Array.isArray(raw) || raw.length === 0) return fallback;
    const f = raw[0];
    if (Array.isArray(f)) {
      return raw.map(([v, l]) => ({ valor: String(v), etiqueta: l ?? String(v) }));
    }
    if (typeof f === 'object' && f) {
      return raw
        .map((o) => ({
          valor: String(o.valor ?? o.value ?? o.key ?? ''),
          etiqueta: String(o.etiqueta ?? o.label ?? o.value ?? o.key ?? ''),
        }))
        .filter((x) => x.valor);
    }
    if (typeof f === 'string') {
      return raw.map((s) => ({ valor: s, etiqueta: s }));
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const BASE = '/api/productos-cosechados/';

const productoCosechadoService = {
  // Listar (acepta filtros/paginación DRF)
  async listar(params = {}) {
    const res = await api.get(BASE, { params });
    return res.data;
  },

  async getProductoById(id) {
    const res = await api.get(`${BASE}${id}/`);
    return res.data;
  },

  async crearProducto(data) {
    const res = await api.post(BASE, data);
    return res.data;
  },

  async updateProducto(id, data) {
    const res = await api.put(`${BASE}${id}/`, data);
    return res.data;
  },

  async patchProducto(id, data) {
    const res = await api.patch(`${BASE}${id}/`, data);
    return res.data;
  },

  async eliminar(id) {
    const res = await api.delete(`${BASE}${id}/`);
    return res.data;
  },

  // Catálogo de estados (si tu backend expone /estados/)
async getEstadosDisponibles() {
  return ESTADOS_PRODUCTO; // usamos el fallback directamente
},

  // Sinónimo por si en algunos sitios usas otro nombre
  async estadosDisponibles() {
    return this.getEstadosDisponibles();
  },

  // Acciones de negocio
  async cambiarEstado(id, payload /* { nuevo_estado, observaciones } */) {
    const res = await api.post(`${BASE}${id}/cambiar_estado/`, payload);
    return res.data;
  },

  async vender(id, payload /* { cantidad_vendida, observaciones } */) {
    const res = await api.post(`${BASE}${id}/vender/`, payload);
    return res.data;
  },
};

export default productoCosechadoService;
