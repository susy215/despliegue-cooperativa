import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Monitor,
  Globe,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bitacoraService } from '../api/authService';

const Dashboard = () => {
  const { user, sessionInfo, invalidateAllSessions } = useAuth();
  const [bitacoraStats, setBitacoraStats] = useState({
    total: 0,
    today: 0,
    loginAttempts: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [bitacoraFilter, setBitacoraFilter] = useState('all'); // all, login, logout, other
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Función para formatear detalles de actividad
  const formatActivityDetails = (detalles) => {
    if (!detalles) return 'Sin detalles';

    if (typeof detalles === 'string') return detalles;

    if (typeof detalles === 'object') {
      const parts = [];
      if (detalles.ip) parts.push(`IP: ${detalles.ip}`);
      if (detalles.user_agent) parts.push(`Navegador: ${detalles.user_agent.substring(0, 30)}...`);
      if (detalles.razon) parts.push(`Razón: ${detalles.razon}`);
      if (detalles.intentos_fallidos) parts.push(`Intentos fallidos: ${detalles.intentos_fallidos}`);

      return parts.length > 0 ? parts.join(' | ') : 'Detalles técnicos';
    }

    return 'Sin detalles';
  };

  useEffect(() => {
    loadDashboardData(currentPage, bitacoraFilter);
  }, [currentPage, bitacoraFilter]);

  const loadDashboardData = async (page = 1, filter = 'all') => {
    try {
      setLoading(true);

      // Construir parámetros de filtro
      const params = {
        page: page,
        page_size: 10,
        ordering: '-fecha_hora'
      };

      // Aplicar filtros
      if (filter === 'login') {
        params.accion__icontains = 'login';
      } else if (filter === 'logout') {
        params.accion__icontains = 'logout';
      } else if (filter === 'other') {
        // Excluir login y logout
        params.accion__not_contains = 'login';
        params.accion__not_contains = 'logout';
      }

      // Obtener datos de bitácora con filtros
      const bitacoraData = await bitacoraService.getBitacora(params);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const todayActivities = bitacoraData.results?.filter(item =>
        item.fecha_hora?.startsWith(today)
      ) || [];

      const loginActivities = bitacoraData.results?.filter(item =>
        item.accion?.toLowerCase().includes('login')
      ) || [];

      setBitacoraStats({
        total: bitacoraData.count || 0,
        today: todayActivities.length,
        loginAttempts: loginActivities.length,
        recentActivities: bitacoraData.results || []
      });

      setTotalPages(Math.ceil((bitacoraData.count || 0) / 10));
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setBitacoraFilter(filter);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInvalidateAllSessions = async () => {
    if (window.confirm('¿Está seguro de que desea invalidar todas las sesiones activas? Esto cerrará la sesión de todos los usuarios, incluyendo la suya.')) {
      try {
        await invalidateAllSessions();
        alert('Todas las sesiones han sido invalidadas exitosamente.');
      } catch (error) {
        console.error('Error invalidando sesiones:', error);
        alert('Error al invalidar sesiones. Intente nuevamente.');
      }
    }
  };

  const statsCards = [
    {
      title: 'Total de Actividades',
      value: bitacoraStats.total,
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Actividades Hoy',
      value: bitacoraStats.today,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/20'
    },
    {
      title: 'Intentos de Login',
      value: bitacoraStats.loginAttempts,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Sesiones Activas',
      value: sessionInfo?.active_sessions || 1,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Information */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Información de Sesión</span>
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="text-emerald-200 hover:text-emerald-100 text-sm font-medium flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Dirección IP</span>
            </div>
            <p className="text-emerald-100/80 text-sm">
              {sessionInfo?.ip_address || 'N/A'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-medium">Navegador</span>
            </div>
            <p className="text-emerald-100/80 text-sm truncate">
              {sessionInfo?.user_agent ?
                sessionInfo.user_agent.split(' ').slice(0, 3).join(' ') + '...' :
                'N/A'
              }
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm font-medium">Inicio de Sesión</span>
            </div>
            <p className="text-emerald-100/80 text-sm">
              {sessionInfo?.session_expiry ?
                new Date(sessionInfo.session_expiry).toLocaleString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short'
                }) :
                'N/A'
              }
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-medium">Estado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-emerald-100/80 text-sm">Activa</span>
            </div>
          </div>
        </div>

        {/* Session Actions for Admin */}
        {user?.is_staff && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleInvalidateAllSessions}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Invalidar Todas las Sesiones
              </button>
              <button
                onClick={() => window.location.href = '/usuarios'}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Gestionar Usuarios
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Actividades Recientes</h2>
          <button className="text-emerald-200 hover:text-emerald-100 text-sm font-medium">
            Ver todas →
          </button>
        </div>

        {/* Filtros de bitácora */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              bitacoraFilter === 'all'
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleFilterChange('login')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              bitacoraFilter === 'login'
                ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Login/Logout
          </button>
          <button
            onClick={() => handleFilterChange('other')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              bitacoraFilter === 'other'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Otras Actividades
          </button>
        </div>

        <div className="space-y-4">
          {bitacoraStats.recentActivities.length > 0 ? (
            bitacoraStats.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0">
                  {activity.accion?.toLowerCase().includes('login') ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  ) : activity.accion?.toLowerCase().includes('error') ? (
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  ) : (
                    <Activity className="w-8 h-8 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {activity.accion || 'Actividad'}
                  </p>
                  <p className="text-emerald-100/60 text-sm">
                    {formatActivityDetails(activity.detalles)}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-white text-sm">
                    {activity.usuario?.username || 'Sistema'}
                  </p>
                  <p className="text-emerald-100/60 text-xs">
                    {activity.fecha_hora ?
                      new Date(activity.fecha_hora).toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short'
                      }) :
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
              <p className="text-emerald-100/60">No hay actividades recientes</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-emerald-200 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-emerald-400" />
            <h3 className="text-white font-semibold">Gestión de Socios</h3>
          </div>
          <p className="text-emerald-100/60 text-sm mb-4">
            Administra la información de los socios de la cooperativa
          </p>
          <button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors">
            Ver Socios
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-blue-400" />
            <h3 className="text-white font-semibold">Auditoría</h3>
          </div>
          <p className="text-emerald-100/60 text-sm mb-4">
            Revisa el registro completo de actividades del sistema
          </p>
          <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors">
            <a href="/auditoria" className="block w-full">Ver Auditoría</a>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-white font-semibold">Seguridad</h3>
          </div>
          <p className="text-emerald-100/60 text-sm mb-4">
            Gestiona usuarios, roles y permisos del sistema
          </p>
          <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium py-2 px-4 rounded-lg transition-colors">
            Gestionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;