import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Configurar axios con las credenciales y CSRF
const api = axios.create({
  baseURL: 'http://localhost:8000',
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
        console.log('CSRF token agregado a socioService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para socioService:', config.url);
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
      console.error('Error de autenticación en socioService:', error.response?.status, error.response?.data);
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

// Servicio para gestión de socios
export const socioService = {
  // Obtener todos los socios
  async getSocios(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener socios:', error);
      throw error;
    }
  },

  // Obtener socio por ID
  async getSocioById(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener socio:', error);
      throw error;
    }
  },

  // Crear socio completo (con usuario)
  async crearSocioCompleto(socioData) {
    try {
      const response = await api.post(`${API_BASE_URL}/socios/crear-completo/`, socioData);
      return response.data;
    } catch (error) {
      console.error('Error al crear socio:', error);
      throw error;
    }
  },

  // Actualizar socio
  async updateSocio(id, socioData) {
    try {
      const response = await api.put(`${API_BASE_URL}/socios/${id}/`, socioData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar socio:', error);
      throw error;
    }
  },

  // Activar/desactivar socio
  async activarDesactivarSocio(id, accion) {
    try {
      const response = await api.post(`${API_BASE_URL}/socios/${id}/activar-desactivar/`, { accion });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del socio:', error);
      throw error;
    }
  },

  // Búsqueda avanzada de socios
  async buscarSociosAvanzado(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/buscar-avanzado/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw error;
    }
  },

  // Búsqueda por cultivo
  async buscarSociosPorCultivo(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/buscar-por-cultivo/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda por cultivo:', error);
      throw error;
    }
  },

  // Validar datos de socio
  async validarDatosSocio(params = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/validar/datos-socio/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al validar datos:', error);
      throw error;
    }
  },

  // Obtener parcelas de un socio
  async getParcelasSocio(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/${id}/parcelas/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener parcelas:', error);
      throw error;
    }
  },

  // Obtener cultivos de un socio
  async getCultivosSocio(id) {
    try {
      const response = await api.get(`${API_BASE_URL}/socios/${id}/cultivos/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cultivos:', error);
      throw error;
    }
  }
};

// Servicio para gestión de usuarios
export const usuarioService = {
  // Obtener todos los usuarios
  async getUsuarios(params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  async getUsuarioById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  // Crear usuario
  async crearUsuario(usuarioData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/`, usuarioData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualizar usuario
  async updateUsuario(id, usuarioData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/usuarios/${id}/`, usuarioData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  // Activar/desactivar usuario
  async activarDesactivarUsuario(id, accion) {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/${id}/activar-desactivar/`, { accion });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  async cambiarPassword(id, nuevaPassword) {
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/${id}/cambiar_password/`, {
        nueva_password: nuevaPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  },

  // Obtener roles de un usuario
  async getRolesUsuario(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/usuarios/${id}/roles/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  }
};

// Servicio para reportes
export const reporteService = {
  // Reporte de usuarios y socios
  async getReporteUsuariosSocios() {
    try {
      const response = await axios.get(`${API_BASE_URL}/reportes/usuarios-socios/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      throw error;
    }
  }
};