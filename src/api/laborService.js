// laborService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
// Instancia de axios con credenciales y JSON por defecto
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Interceptor: Adjuntar CSRF token en peticiones (excepto login/csrf) ---
api.interceptors.request.use(
  (config) => {
    const skipCsrf =
      config.url.includes('/api/auth/login/') ||
      config.url.includes('/api/auth/csrf/');

    if (!skipCsrf) {
      let csrfToken = localStorage.getItem('csrf_token');

      if (!csrfToken && typeof document !== 'undefined') {
        const cookies = document.cookie?.split('; ') || [];
        const csrfCookie = cookies.find((row) => row.startsWith('csrftoken='));
        if (csrfCookie) csrfToken = csrfCookie.split('=')[1];
      }

      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
        // console.debug('[laborService] CSRF token agregado:', config.url);
      } else {
        // console.warn('[laborService] No se encontró CSRF token:', config.url);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor: Guardar CSRF si viene y manejar 401/403 ---
api.interceptors.response.use(
  (response) => {
    if (response?.data?.csrf_token) {
      localStorage.setItem('csrf_token', response.data.csrf_token);
    }

    if (typeof document !== 'undefined') {
      const cookies = document.cookie?.split('; ') || [];
      const csrfFromCookie = cookies.find((row) => row.startsWith('csrftoken='));
      if (csrfFromCookie) {
        const csrfToken = csrfFromCookie.split('=')[1];
        localStorage.setItem('csrf_token', csrfToken);
      }
    }

    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.error('[laborService] Error de autenticación:', status, error?.response?.data);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --------------------------- Servicio de Labores ----------------------------

const BASE = '/api/labores/';

export const laborService = {
  /**
   * Listar labores (con filtros y paginación DRF)
   * @param {Object} params { page, page_size, fecha_labor_desde, fecha_labor_hasta, labor_tipo, estado, campania_id, parcela_id, socio_id, ordering }
   */
  async getLabores(params = {}) {
    try {
      const res = await api.get(BASE, { params });
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al obtener labores:', err);
      throw err;
    }
  },

  /** Obtener una labor por ID */
  async getLaborById(id) {
    try {
      const res = await api.get(`${BASE}${id}/`);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al obtener labor:', err);
      throw err;
    }
  },

  /**
   * Crear labor
   * @param {Object} data { fecha_labor(YYYY-MM-DD), labor, estado, campania, parcela, observaciones }
   */
  async crearLabor(data) {
    try {
      const res = await api.post(BASE, data);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al crear labor:', err);
      throw err;
    }
  },

  /** Reemplazo completo (PUT) */
  async updateLabor(id, data) {
    try {
      const res = await api.put(`${BASE}${id}/`, data);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al actualizar (PUT) labor:', err);
      throw err;
    }
  },

  /** Actualización parcial (PATCH) */
  async patchLabor(id, data) {
    try {
      const res = await api.patch(`${BASE}${id}/`, data);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al actualizar (PATCH) labor:', err);
      throw err;
    }
  },

  /** Eliminar labor */
  async deleteLabor(id) {
    try {
      const res = await api.delete(`${BASE}${id}/`);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al eliminar labor:', err);
      throw err;
    }
  },

  /**
   * Cambiar estado de la labor
   * @param {number|string} id
   * @param {('PLANIFICADA'|'EN_PROCESO'|'COMPLETADA'|'CANCELADA')} estado
   * @param {string} [observaciones]
   */
  async cambiarEstado(id, estado, observaciones = '') {
    try {
      const payload = { estado, observaciones };
      const res = await api.post(`${BASE}${id}/cambiar_estado/`, payload);
      return res.data;
    } catch (err) {
      console.error('[laborService] Error al cambiar estado:', err);
      throw err;
    }
  },

  /** Catálogo de tipos de labor (para combos) */
  async getTiposLabor() {
    try {
      const res = await api.get(`${BASE}tipos_labor/`);
      return res.data; // [{ valor, etiqueta }, ...]
    } catch (err) {
      console.error('[laborService] Error al obtener tipos de labor:', err);
      throw err;
    }
  },

  /** Catálogo de estados de labor (para combos) */
  async getEstadosLabor() {
    try {
      const res = await api.get(`${BASE}estados_labor/`);
      return res.data; // [{ valor, etiqueta }, ...]
    } catch (err) {
      console.error('[laborService] Error al obtener estados de labor:', err);
      throw err;
    }
  },

  /**
   * Reporte por período
   * @param {string} fecha_desde 'YYYY-MM-DD'
   * @param {string} fecha_hasta 'YYYY-MM-DD'
   */
  async reporteLaboresPorPeriodo(fecha_desde, fecha_hasta) {
    try {
      const params = { fecha_desde, fecha_hasta };
      const res = await api.get(`${BASE}reporte_labores_por_periodo/`, { params });
      return res.data;
    } catch (err) {
      console.error('[laborService] Error en reporte por período:', err);
      throw err;
    }
  },

  /**
   * Validar si una fecha cae dentro del rango de una campaña
   * @param {number|string} campania_id
   * @param {string} fecha 'YYYY-MM-DD'
   */
  async validarFechaCampania(campania_id, fecha) {
    try {
      const params = { campania_id, fecha };
      const res = await api.get(`${BASE}validar_fecha_campania/`, { params });
      return res.data; // { valido: boolean, errores: [] }
    } catch (err) {
      console.error('[laborService] Error al validar fecha de campaña:', err);
      throw err;
    }
  },
};

export default laborService;
