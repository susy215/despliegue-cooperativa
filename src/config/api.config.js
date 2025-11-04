/**
 * Configuración centralizada de API
 * 
 * Este archivo gestiona la URL base de la API según el entorno:
 * - Producción: Lee VITE_API_URL de las variables de entorno de Vercel
 * - Desarrollo local: Usa http://localhost:8000 por defecto
 * 
 * IMPORTANTE: En Vercel, configura la variable de entorno:
 * VITE_API_URL=https://tu-tunel-ngrok.ngrok-free.app
 */

// Obtener la URL base de la API desde variables de entorno de Vite
// Si no existe, usar localhost como fallback para desarrollo
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configuración de timeout para peticiones
export const API_TIMEOUT = 30000; // 30 segundos

// Flag para saber si estamos en producción
export const IS_PRODUCTION = import.meta.env.PROD;

// Logging de configuración (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  - Base URL:', API_BASE_URL);
  console.log('  - Environment:', import.meta.env.MODE);
  console.log('  - Production:', IS_PRODUCTION);
}

// Validación básica de la URL
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  console.error('⚠️ API_BASE_URL debe comenzar con http:// o https://');
}

export default {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  isProduction: IS_PRODUCTION,
};
