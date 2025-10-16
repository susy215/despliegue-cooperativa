// Configuración de la aplicación usando variables de entorno de Vite
const appConfig = {
  // URL base de la API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // Configuración de debugging
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV,
  
  // Configuración de CORS
  CORS: {
    WITH_CREDENTIALS: import.meta.env.VITE_CORS_WITH_CREDENTIALS === 'true' || true,
  },
  
  // Timeout para peticiones HTTP (en milisegundos)
  HTTP_TIMEOUT: parseInt(import.meta.env.VITE_HTTP_TIMEOUT) || 10000,
  
  // Configuración de autenticación
  AUTH: {
    SESSION_STORAGE_KEY: 'user_data',
    CSRF_STORAGE_KEY: 'csrf_token',
  },
  
  // Configuración de la aplicación
  APP: {
    NAME: 'Cooperativa Management System',
    VERSION: '1.0.0',
  },
};

// Validar configuración en modo desarrollo
if (appConfig.DEBUG) {
  console.log('🔧 Configuración de la aplicación:', {
    API_BASE_URL: appConfig.API_BASE_URL,
    DEBUG: appConfig.DEBUG,
    CORS_WITH_CREDENTIALS: appConfig.CORS.WITH_CREDENTIALS,
    HTTP_TIMEOUT: appConfig.HTTP_TIMEOUT,
  });
}

export default appConfig;