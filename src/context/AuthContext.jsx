import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userData = localStorage.getItem('user_data');

    if (userData) {
      try {
        setUser(JSON.parse(userData));
        // Verificar sesión con el backend
        const sessionData = await authService.checkSession();
        if (sessionData.autenticado) {
          setUser(sessionData.usuario);
          // Obtener información adicional de la sesión
          try {
            const sessionInfoData = await authService.getSessionInfo();
            setSessionInfo(sessionInfoData);
          } catch (sessionError) {
            console.error('Error obteniendo info de sesión:', sessionError);
          }
        } else {
          // Sesión no válida
          logout();
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError('');
      setLoading(true);
      const data = await authService.login(credentials);
      setUser(data.usuario);

      // Obtener información de la sesión
      try {
        const sessionData = await authService.getSessionInfo();
        setSessionInfo(sessionData);
      } catch (sessionError) {
        console.error('Error obteniendo info de sesión:', sessionError);
      }

      return data;
    } catch (error) {
      const errorMessage = error.message || 'Error en el inicio de sesión';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado independientemente del resultado
      setUser(null);
      setSessionInfo(null);
      setError('');
      setLoading(false);

      // Pequeño delay para asegurar que la limpieza se complete
      setTimeout(() => {
        // Redirigir al login después de un breve delay
        window.location.href = '/login';
      }, 100);
    }
  };

  const refreshSessionInfo = async () => {
    try {
      const sessionData = await authService.getSessionInfo();
      setSessionInfo(sessionData);
    } catch (error) {
      console.error('Error refrescando info de sesión:', error);
    }
  };

  const invalidateAllSessions = async () => {
    try {
      await authService.invalidateAllSessions();
      await logout();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    sessionInfo,
    login,
    logout,
    refreshSessionInfo,
    invalidateAllSessions,
    isAuthenticated: !!user,
    isAdmin: user?.is_staff || user?.is_superuser || false,
    isActive: user?.is_active || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};