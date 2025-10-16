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
        console.log('CSRF token agregado a insumoService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para insumoService:', config.url);
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
      console.error('Error de autenticación en insumoService:', error.response?.status, error.response?.data);
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

// Servicio para gestión de pesticidas
export const pesticidaService = {
  // Obtener todos los pesticidas
  async getPesticidas(params = {}) {
    try {
      const response = await api.get('/api/pesticidas/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener pesticidas:', error);
      throw error;
    }
  },

  // Obtener pesticida por ID
  async getPesticidaById(id) {
    try {
      const response = await api.get(`/api/pesticidas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pesticida:', error);
      throw error;
    }
  },

  // Crear pesticida
  async crearPesticida(pesticidaData) {
    try {
      const response = await api.post('/api/pesticidas/', pesticidaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pesticida:', error);
      throw error;
    }
  },

  // Actualizar pesticida
  async updatePesticida(id, pesticidaData) {
    try {
      const response = await api.put(`/api/pesticidas/${id}/`, pesticidaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pesticida:', error);
      throw error;
    }
  },

  // Eliminar pesticida
  async deletePesticida(id) {
    try {
      const response = await api.delete(`/api/pesticidas/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar pesticida:', error);
      throw error;
    }
  },

  // Actualizar cantidad de pesticida
  async actualizarCantidad(id, cantidad) {
    try {
      const response = await api.post(`/api/pesticidas/${id}/actualizar_cantidad/`, { cantidad });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  },

  // Marcar pesticida como vencido
  async marcarVencido(id) {
    try {
      const response = await api.post(`/api/pesticidas/${id}/marcar_vencido/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar como vencido:', error);
      throw error;
    }
  },

  // Obtener pesticidas próximos a vencer
  async getPesticidasProximosVencer() {
    try {
      const response = await api.get('/api/pesticidas/proximos_vencer/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pesticidas próximos a vencer:', error);
      throw error;
    }
  },

  // Obtener pesticidas vencidos
  async getPesticidasVencidos() {
    try {
      const response = await api.get('/api/pesticidas/vencidos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pesticidas vencidos:', error);
      throw error;
    }
  },

  // Obtener reporte de inventario
  async getReporteInventario() {
    try {
      const response = await api.get('/api/pesticidas/reporte_inventario/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      throw error;
    }
  }
};

// Servicio para gestión de fertilizantes
export const fertilizanteService = {
  // Obtener todos los fertilizantes
  async getFertilizantes(params = {}) {
    try {
      const response = await api.get('/api/fertilizantes/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener fertilizantes:', error);
      throw error;
    }
  },

  // Obtener fertilizante por ID
  async getFertilizanteById(id) {
    try {
      const response = await api.get(`/api/fertilizantes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener fertilizante:', error);
      throw error;
    }
  },

  // Crear fertilizante
  async crearFertilizante(fertilizanteData) {
    try {
      const response = await api.post('/api/fertilizantes/', fertilizanteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear fertilizante:', error);
      throw error;
    }
  },

  // Actualizar fertilizante
  async updateFertilizante(id, fertilizanteData) {
    try {
      const response = await api.put(`/api/fertilizantes/${id}/`, fertilizanteData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar fertilizante:', error);
      throw error;
    }
  },

  // Eliminar fertilizante
  async deleteFertilizante(id) {
    try {
      const response = await api.delete(`/api/fertilizantes/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar fertilizante:', error);
      throw error;
    }
  },

  // Actualizar cantidad de fertilizante
  async actualizarCantidad(id, cantidad) {
    try {
      const response = await api.post(`/api/fertilizantes/${id}/actualizar_cantidad/`, { cantidad });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  },

  // Marcar fertilizante como vencido
  async marcarVencido(id) {
    try {
      const response = await api.post(`/api/fertilizantes/${id}/marcar_vencido/`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar como vencido:', error);
      throw error;
    }
  },

  // Obtener fertilizantes próximos a vencer
  async getFertilizantesProximosVencer() {
    try {
      const response = await api.get('/api/fertilizantes/proximos_vencer/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener fertilizantes próximos a vencer:', error);
      throw error;
    }
  },

  // Obtener fertilizantes vencidos
  async getFertilizantesVencidos() {
    try {
      const response = await api.get('/api/fertilizantes/vencidos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener fertilizantes vencidos:', error);
      throw error;
    }
  },

  // Obtener reporte de inventario
  async getReporteInventario() {
    try {
      const response = await api.get('/api/fertilizantes/reporte_inventario/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      throw error;
    }
  }
};

// Servicio combinado para insumos (pesticidas + fertilizantes)
export const insumoService = {
  // Obtener todos los insumos (pesticidas y fertilizantes)
  async getAllInsumos(params = {}) {
    try {
      const [pesticidas, fertilizantes] = await Promise.all([
        pesticidaService.getPesticidas(params),
        fertilizanteService.getFertilizantes(params)
      ]);

      return {
        pesticidas: pesticidas.results || pesticidas,
        fertilizantes: fertilizantes.results || fertilizantes,
        total: (pesticidas.count || 0) + (fertilizantes.count || 0)
      };
    } catch (error) {
      console.error('Error al obtener todos los insumos:', error);
      throw error;
    }
  },

  // Obtener estadísticas generales de insumos
  async getEstadisticasInsumos() {
    try {
      const [pesticidasReporte, fertilizantesReporte] = await Promise.all([
        pesticidaService.getReporteInventario(),
        fertilizanteService.getReporteInventario()
      ]);

      return {
        pesticidas: pesticidasReporte,
        fertilizantes: fertilizantesReporte
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de insumos:', error);
      throw error;
    }
  }
};