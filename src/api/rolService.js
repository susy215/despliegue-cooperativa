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
        console.log('CSRF token agregado a rolService:', config.url);
      } else {
        console.warn('No se encontró CSRF token para rolService:', config.url);
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
      console.error('Error de autenticación en rolService:', error.response?.status, error.response?.data);
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

// Servicio para gestión de roles
export const rolService = {
  // Obtener todos los roles
  async getRoles(params = {}) {
    try {
      const response = await api.get('/api/roles/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  // Obtener rol por ID
  async getRolById(id) {
    try {
      const response = await api.get(`/api/roles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  },

  // Crear rol
  async crearRol(rolData) {
    try {
      const response = await api.post('/api/roles/', rolData);
      return response.data;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  },

  // Actualizar rol
  async updateRol(id, rolData) {
    try {
      const response = await api.put(`/api/roles/${id}/`, rolData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  },

  // Eliminar rol
  async deleteRol(id) {
    try {
      const response = await api.delete(`/api/roles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  },

  // Asignar rol a usuario
  async asignarRolUsuario(data) {
    try {
      console.log('Enviando datos para asignar rol:', data);
      console.log('Tipo de usuario_id:', typeof data.usuario_id, 'Valor:', data.usuario_id);
      console.log('Tipo de rol_id:', typeof data.rol_id, 'Valor:', data.rol_id);

      const response = await api.post('/api/roles/asignar-rol/', data);
      console.log('Respuesta exitosa al asignar rol:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al asignar rol:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  // Quitar rol a usuario
  async quitarRolUsuario(data) {
    try {
      console.log('Enviando datos para quitar rol:', data);
      console.log('Tipo de usuario_id:', typeof data.usuario_id, 'Valor:', data.usuario_id);
      console.log('Tipo de rol_id:', typeof data.rol_id, 'Valor:', data.rol_id);

      const response = await api.post('/api/roles/quitar-rol/', data);
      console.log('Respuesta exitosa al quitar rol:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al quitar rol:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  // Obtener roles de un usuario
  async getRolesUsuario(usuarioId) {
    try {
      const response = await api.get(`/api/usuarios/${usuarioId}/roles/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles del usuario:', error);
      throw error;
    }
  },

  // Obtener permisos de un usuario
  async getPermisosUsuario(usuarioId) {
    try {
      const response = await api.get(`/api/usuarios/${usuarioId}/permisos/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      throw error;
    }
  },

  // Validar permiso de usuario
  async validarPermisoUsuario(data) {
    try {
      const response = await api.post('/api/validar/permiso-usuario/', data);
      return response.data;
    } catch (error) {
      console.error('Error al validar permiso:', error);
      throw error;
    }
  },

  // Crear rol personalizado
  async crearRolPersonalizado(rolData) {
    try {
      const response = await api.post('/api/roles/crear-personalizado/', rolData);
      return response.data;
    } catch (error) {
      console.error('Error al crear rol personalizado:', error);
      throw error;
    }
  },

  // Búsqueda avanzada de roles
  async buscarRolesAvanzado(params = {}) {
    try {
      const response = await api.get('/api/roles/buscar-avanzado/', { params });
      return response.data;
    } catch (error) {
      console.error('Error en búsqueda avanzada de roles:', error);
      throw error;
    }
  },

  // Reporte de roles y permisos
  async getReporteRolesPermisos() {
    try {
      const response = await api.get('/api/reportes/roles-permisos/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de roles:', error);
      throw error;
    }
  },

  // Obtener usuarios por rol
  async getUsuariosPorRol(rolId) {
    try {
      const response = await api.get(`/api/roles/${rolId}/usuarios/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw error;
    }
  }
};

// Servicio para gestión de usuario-roles
export const usuarioRolService = {
  // Obtener todas las asignaciones usuario-rol
  async getUsuarioRoles(params = {}) {
    try {
      const response = await api.get('/api/usuario-roles/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario-roles:', error);
      throw error;
    }
  },

  // Obtener usuario-rol por ID
  async getUsuarioRolById(id) {
    try {
      const response = await api.get(`/api/usuario-roles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario-rol:', error);
      throw error;
    }
  },

  // Crear asignación usuario-rol
  async crearUsuarioRol(usuarioRolData) {
    try {
      const response = await api.post('/api/usuario-roles/', usuarioRolData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario-rol:', error);
      throw error;
    }
  },

  // Eliminar asignación usuario-rol
  async deleteUsuarioRol(id) {
    try {
      const response = await api.delete(`/api/usuario-roles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario-rol:', error);
      throw error;
    }
  }
};