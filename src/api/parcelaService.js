import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Configurar axios con las credenciales y CSRF
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar CSRF token
api.interceptors.request.use(
  (config) => {
    // Solo agregar CSRF token para peticiones que no sean de login
    if (!config.url.includes('/api/auth/login/') && !config.url.includes('/api/auth/csrf/')) {
      // Obtener CSRF token del localStorage o cookie
      let csrfToken = localStorage.getItem('csrf_token');

      // Si no está en localStorage, intentar obtenerlo de las cookies
      if (!csrfToken) {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('csrftoken='));
        if (csrfCookie) {
          csrfToken = csrfCookie.split('=')[1];
        }
      }

      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
        console.log('CSRF token agregado a parcelaService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para parcelaService:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    // Guardar CSRF token si viene en la respuesta
    if (response.data && response.data.csrf_token) {
      localStorage.setItem('csrf_token', response.data.csrf_token);
    }

    // También guardar CSRF token de las cookies si existe
    const cookies = document.cookie.split('; ');
    const csrfFromCookie = cookies.find(row => row.startsWith('csrftoken='));
    if (csrfFromCookie) {
      const csrfToken = csrfFromCookie.split('=')[1];
      localStorage.setItem('csrf_token', csrfToken);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Error de autenticación en parcelaService:', error.response?.status, error.response?.data);
      // Solo redirigir si no estamos en la página de login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Servicio para gestión de parcelas
export const parcelaService = {
  // Obtener todas las parcelas
  async getParcelas(params = {}) {
    try {
      const response = await api.get('/api/parcelas/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcelas:', error);
      throw error;
    }
  },

  // Obtener parcela por ID
  async getParcelaById(id) {
    try {
      const response = await api.get(`/api/parcelas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcela:', error);
      throw error;
    }
  },

  // Obtener parcela por ID (alias más descriptivo)
  async getParcela(id) {
    return this.getParcelaById(id);
  },

  // Crear parcela
  async crearParcela(parcelaData) {
    try {
      const response = await api.post('/api/parcelas/', parcelaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear parcela:', error);
      throw error;
    }
  },

  // Actualizar parcela
  async updateParcela(id, parcelaData) {
    try {
      const response = await api.put(`/api/parcelas/${id}/`, parcelaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar parcela:', error);
      throw error;
    }
  },

  // Eliminar parcela
  async deleteParcela(id) {
    try {
      const response = await api.delete(`/api/parcelas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar parcela:', error);
      throw error;
    }
  },

  // Obtener parcelas por socio
  async getParcelasBySocio(socioId) {
    try {
      const response = await api.get(`/api/socios/${socioId}/parcelas/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcelas del socio:', error);
      throw error;
    }
  },

  // Búsqueda avanzada de parcelas
  async buscarParcelasAvanzado(params = {}) {
    try {
      const response = await api.get('/api/parcelas/buscar-avanzado/', { params });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda avanzada de parcelas:', error);
      throw error;
    }
  },

  // Validar datos de parcela
  async validarDatosParcela(params = {}) {
    try {
      const response = await api.get('/api/validar/datos-parcela/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al validar datos de parcela:', error);
      throw error;
    }
  },

  // Obtener tipos de suelo disponibles
  async getTiposSuelo() {
    try {
      const response = await api.get('/api/parcelas/tipos-suelo/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de suelo:', error);
      throw error;
    }
  },

  // Obtener estadísticas de parcelas
  async getEstadisticasParcelas() {
    try {
      const response = await api.get('/api/parcelas/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
};