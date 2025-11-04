import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para sesiones de Django
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
        console.log('CSRF token agregado a la petición:', config.url);
      } else {
        console.warn('No se encontró CSRF token para la petición:', config.url);
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
    // Guardar CSRF token si viene en la respuesta (después del login)
    if (response.data && response.data.csrf_token) {
      localStorage.setItem('csrf_token', response.data.csrf_token);
      console.log('CSRF token guardado desde respuesta:', response.data.csrf_token);
    }

    // También guardar CSRF token de las cookies si existe
    const cookies = document.cookie.split('; ');
    const csrfFromCookie = cookies.find(row => row.startsWith('csrftoken='));
    if (csrfFromCookie) {
      const csrfToken = csrfFromCookie.split('=')[1];
      localStorage.setItem('csrf_token', csrfToken);
      console.log('CSRF token guardado desde cookie:', csrfToken);
    }

    return response;
  },
  (error) => {
    // No redirigir automáticamente si es una petición de logout
    if (error.config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Error de autenticación:', error.response?.status, error.response?.data);
      // Solo redirigir si no estamos en la página de login
      if (!window.location.pathname.includes('/login')) {
        // Sesión expirada o no autorizado
        localStorage.removeItem('user_data');
        localStorage.removeItem('csrf_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login con el backend Django (sesiones) - versión mejorada con CSRF token
  login: async (credentials) => {
    try {
      console.log('Iniciando proceso de login...');

      // Limpiar cualquier dato residual antes del login
      localStorage.removeItem('user_data');
      localStorage.removeItem('csrf_token');

      // Primero obtener un CSRF token válido
      let csrfToken = null;
      try {
        console.log('Obteniendo CSRF token...');
        const csrfResponse = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
          method: 'GET',
          credentials: 'include',
        });

        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrf_token;
          console.log('CSRF token obtenido:', csrfToken ? 'Sí' : 'No');
        } else {
          console.warn('Error obteniendo CSRF token:', csrfResponse.status);
        }
      } catch (csrfError) {
        console.warn('No se pudo obtener CSRF token:', csrfError);
      }

      // Preparar headers con CSRF token
      const headers = {
        'Content-Type': 'application/json',
      };

      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
        console.log('Incluyendo X-CSRFToken en headers');
      }

      console.log('Enviando petición de login...');
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: headers,
        credentials: 'include', // Importante para cookies de sesión
        body: JSON.stringify(credentials),
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en login:', errorData);
        throw new Error(errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login exitoso, procesando respuesta...');

      // Verificar que la respuesta tenga los datos esperados
      if (!data || !data.usuario) {
        console.error('Respuesta de login inválida:', data);
        throw new Error('Respuesta de login inválida');
      }

      const { usuario, csrf_token } = data;

      // Guardar datos de usuario
      localStorage.setItem('user_data', JSON.stringify(usuario));
      console.log('Usuario guardado en localStorage');

      // Guardar CSRF token si viene en la respuesta
      if (csrf_token) {
        localStorage.setItem('csrf_token', csrf_token);
        console.log('Nuevo CSRF token guardado');
      }

      // También intentar obtener CSRF token de las cookies después del login
      const csrfFromCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      if (csrfFromCookie) {
        localStorage.setItem('csrf_token', csrfFromCookie);
        console.log('CSRF token de cookie guardado');
      }

      console.log('Login completado exitosamente');
      return {
        usuario,
        csrf_token: csrf_token || csrfFromCookie || csrfToken,
      };
    } catch (error) {
      console.error('Error completo en login:', error);
      // Limpiar datos en caso de error de login
      localStorage.removeItem('user_data');
      localStorage.removeItem('csrf_token');

      const errorMessage = error.message || 'Error en el inicio de sesión';
      throw new Error(errorMessage);
    }
  },

  // Logout - versión con fetch
  logout: async () => {
    try {
      // Usar fetch para tener más control sobre la petición
      const response = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para cookies de sesión
        body: JSON.stringify({}),
      });

      // No verificar response.ok porque logout debe ser tolerante a errores
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return data;
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // No relanzar el error para que el logout siempre se considere exitoso
    } finally {
      // Limpiar datos locales independientemente del resultado
      localStorage.removeItem('user_data');
      localStorage.removeItem('csrf_token');
    }
  },

  // Verificar estado de la sesión
  checkSession: async () => {
    try {
      const response = await api.get('/api/auth/status/');
      return response.data;
    } catch (error) {
      throw new Error('Sesión expirada');
    }
  },

  // Obtener información de la sesión
  getSessionInfo: async () => {
    try {
      const response = await api.get('/api/auth/session-info/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Invalidar todas las sesiones
  invalidateAllSessions: async () => {
    try {
      const response = await api.post('/api/auth/invalidate-sessions/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forzar logout de un usuario (solo admin)
  forceLogoutUser: async (userId) => {
    try {
      const response = await api.post(`/api/auth/force-logout/${userId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const bitacoraService = {
  // Obtener registros de bitácora
  getBitacora: async (params = {}) => {
    try {
      const response = await api.get('/api/bitacora/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener bitácora filtrada por usuario
  getBitacoraByUser: async (userId, params = {}) => {
    try {
      const response = await api.get(`/api/bitacora/?usuario=${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener bitácora de operaciones de login/logout
  getLoginBitacora: async (params = {}) => {
    try {
      const response = await api.get('/api/bitacora/?accion__icontains=login', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;