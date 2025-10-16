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
        console.log('CSRF token agregado a semillaService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para semillaService:', config.url);
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
      console.error('Error de autenticación en semillaService:', error.response?.status, error.response?.data);
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

// Servicio para gestión de semillas
export const semillaService = {
  // Obtener todas las semillas
  async getSemillas(params = {}) {
    try {
      const response = await api.get('/api/semillas/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener semillas:', error);
      throw error;
    }
  },

  // Obtener semilla por ID
  async getSemillaById(id) {
    try {
      const response = await api.get(`/api/semillas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener semilla:', error);
      throw error;
    }
  },

  // Crear semilla
  async crearSemilla(semillaData) {
    try {
      const response = await api.post('/api/semillas/', semillaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear semilla:', error);
      throw error;
    }
  },

  // Actualizar semilla
  async updateSemilla(id, semillaData) {
    try {
      const response = await api.put(`/api/semillas/${id}/`, semillaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar semilla:', error);
      throw error;
    }
  },

  // Eliminar semilla
  async deleteSemilla(id) {
    try {
      const response = await api.delete(`/api/semillas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar semilla:', error);
      throw error;
    }
  },

  // Actualizar cantidad de semilla
  async actualizarCantidad(id, cantidad) {
    try {
      const response = await api.post(`/api/semillas/${id}/actualizar_cantidad/`, { cantidad });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  },

  // Marcar semilla como vencida
  async marcarVencida(id) {
    try {
      const response = await api.post(`/api/semillas/${id}/marcar_vencida/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar como vencida:', error);
      throw error;
    }
  },

  // Obtener semillas próximas a vencer
  async getSemillasProximasVencer() {
    try {
      const response = await api.get('/api/semillas/proximas_vencer/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener semillas próximas a vencer:', error);
      throw error;
    }
  },

  // Obtener semillas vencidas
  async getSemillasVencidas() {
    try {
      const response = await api.get('/api/semillas/vencidas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener semillas vencidas:', error);
      throw error;
    }
  },

  // Obtener semillas con stock bajo
  async getSemillasStockBajo() {
    try {
      const response = await api.get('/api/semillas/stock_bajo/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener semillas con stock bajo:', error);
      throw error;
    }
  },

  // Obtener reporte de inventario
  async getReporteInventario() {
    try {
      const response = await api.get('/api/semillas/reporte_inventario/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      throw error;
    }
  }
};