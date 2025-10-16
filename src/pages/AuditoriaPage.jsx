import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { bitacoraService } from '../api/authService';

const AuditoriaPage = () => {
  const [bitacoraData, setBitacoraData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
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
    loadBitacoraData();
  }, [currentPage, selectedFilter]);

  const loadBitacoraData = async () => {
    try {
      setLoading(true);
      let params = {
        page: currentPage,
        page_size: 20,
        ordering: '-fecha_hora'
      };

      // Aplicar filtros
      if (selectedFilter !== 'todos') {
        if (selectedFilter === 'login') {
          params.accion__icontains = 'login';
        } else if (selectedFilter === 'usuarios') {
          params.tabla_afectada = 'User';
        } else if (selectedFilter === 'errores') {
          params.accion__icontains = 'error';
        }
      }

      const response = await bitacoraService.getBitacora(params);
      setBitacoraData(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 20));
    } catch (error) {
      console.error('Error cargando bitácora:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (accion) => {
    const action = accion?.toLowerCase() || '';

    if (action.includes('login') && action.includes('exitoso')) {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    } else if (action.includes('login') && action.includes('fallido')) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    } else if (action.includes('error') || action.includes('fallo')) {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    } else if (action.includes('crear') || action.includes('agregar')) {
      return <CheckCircle className="w-5 h-5 text-blue-400" />;
    } else if (action.includes('eliminar') || action.includes('borrar')) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    } else if (action.includes('modificar') || action.includes('actualizar')) {
      return <Activity className="w-5 h-5 text-yellow-400" />;
    } else {
      return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredData = bitacoraData.filter(item => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      item.accion?.toLowerCase().includes(searchLower) ||
      item.usuario?.username?.toLowerCase().includes(searchLower) ||
      formatActivityDetails(item.detalles).toLowerCase().includes(searchLower) ||
      item.tabla_afectada?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Fecha', 'Usuario', 'Acción', 'Tabla Afectada', 'Registro ID', 'Detalles'],
      ...filteredData.map(item => [
        item.fecha_hora,
        item.usuario?.username || 'Sistema',
        item.accion,
        item.tabla_afectada || 'N/A',
        item.registro_id || 'N/A',
        formatActivityDetails(item.detalles)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auditoría del Sistema</h1>
          <p className="text-emerald-100/80 mt-1">
            Registro completo de actividades y operaciones
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/60" />
              <input
                type="text"
                placeholder="Buscar en la auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="sm:w-48">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            >
              <option value="todos">Todos los eventos</option>
              <option value="login">Solo login</option>
              <option value="usuarios">Gestión usuarios</option>
              <option value="errores">Solo errores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-emerald-100">Cargando auditoría...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                      Actividad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                      Detalles
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getActivityIcon(item.accion)}
                          <div>
                            <div className="text-white font-medium">
                              {item.accion}
                            </div>
                            <div className="text-emerald-100/60 text-sm">
                              {item.tabla_afectada || 'Sistema'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-emerald-300/60" />
                          <span className="text-white">
                            {item.usuario?.username || 'Sistema'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-emerald-300/60" />
                          <span className="text-white text-sm">
                            {item.fecha_hora ?
                              new Date(item.fecha_hora).toLocaleString('es-ES') :
                              'N/A'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-emerald-100/80 text-sm max-w-xs truncate">
                          {formatActivityDetails(item.detalles)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-200 hover:text-emerald-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
                <p className="text-emerald-100/60">No se encontraron registros de auditoría</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                <div className="text-emerald-100/60 text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditoriaPage;