import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, Filter, Download, X, Calendar,
  ChevronLeft, ChevronRight, TrendingUp, DollarSign,
  ShoppingCart, AlertCircle, Eye
} from 'lucide-react';
import { historialService } from '../../api/pagosService';

const HistorialVentasPage = () => {
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filtros, setFiltros] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    cliente_nombre: '',
    estado_pedido: '',
    metodo_pago: '',
    page: 1,
    page_size: 20
  });

  const [estadisticas, setEstadisticas] = useState({
    total_ventas: 0,
    total_monto: 0,
    total_pagado: 0,
    total_pendiente: 0
  });

  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 0
  });

  useEffect(() => {
    cargarHistorial();
  }, [filtros.page]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await historialService.obtenerHistorial(filtros);
      setHistorial(response.results || []);
      setEstadisticas(response.estadisticas || {
        total_ventas: 0,
        total_monto: 0,
        total_pagado: 0,
        total_pendiente: 0
      });
      setPagination({
        count: response.count,
        total_pages: response.total_pages
      });
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFiltros(prev => ({ ...prev, page: 1 }));
    cargarHistorial();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_desde: '',
      fecha_hasta: '',
      cliente_nombre: '',
      estado_pedido: '',
      metodo_pago: '',
      page: 1,
      page_size: 20
    });
  };

  const handleExportarCSV = async () => {
    try {
      setExportando(true);
      await historialService.exportarCSV(filtros);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el archivo CSV');
    } finally {
      setExportando(false);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(monto);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-7 h-7" />
            Historial de Ventas
          </h1>
          <p className="text-emerald-100/80 mt-1">
            Consulta y exporta el historial completo de ventas
          </p>
        </div>
        <button
          onClick={handleExportarCSV}
          disabled={exportando}
          className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 text-green-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-green-400/30 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>{exportando ? 'Exportando...' : 'Exportar CSV'}</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Ventas</p>
              <p className="text-2xl font-bold text-white">{estadisticas.total_ventas}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Monto Total</p>
              <p className="text-xl font-bold text-white">{formatMonto(estadisticas.total_monto)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Pagado</p>
              <p className="text-xl font-bold text-green-300">{formatMonto(estadisticas.total_pagado)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Saldo Pendiente</p>
              <p className="text-xl font-bold text-orange-300">{formatMonto(estadisticas.total_pendiente)}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={filtros.cliente_nombre}
                onChange={(e) => setFiltros(prev => ({ ...prev, cliente_nombre: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-emerald-400/30"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-blue-400/30"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Desde
                </label>
                <input
                  type="date"
                  name="fecha_desde"
                  value={filtros.fecha_desde}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  name="fecha_hasta"
                  value={filtros.fecha_hasta}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Estado del Pedido</label>
                <select
                  name="estado_pedido"
                  value={filtros.estado_pedido}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Método de Pago</label>
                <select
                  name="metodo_pago"
                  value={filtros.metodo_pago}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Todos</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="STRIPE">Tarjeta (Stripe)</option>
                  <option value="QR">Código QR</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-red-400/30"
              >
                <X className="w-4 h-4" />
                <span>Limpiar Filtros</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de historial */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-white">Cargando historial...</span>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No se encontraron registros</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Número</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Fecha</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Cliente</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium text-sm">Socio</th>
                    <th className="text-right py-3 px-4 text-white/80 font-medium text-sm">Total</th>
                    <th className="text-right py-3 px-4 text-white/80 font-medium text-sm">Pagado</th>
                    <th className="text-right py-3 px-4 text-white/80 font-medium text-sm">Saldo</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Estado</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {historial.map((venta) => (
                    <tr key={venta.pedido_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-white font-mono text-sm">
                          {venta.numero_pedido}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white/80 text-sm">
                          {formatFecha(venta.fecha_pedido)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{venta.cliente_nombre}</p>
                          {venta.cliente_email && (
                            <p className="text-white/60 text-xs">{venta.cliente_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white/80 text-sm">
                          {venta.socio_nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-white font-semibold">
                          {formatMonto(venta.total)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-300">
                          {formatMonto(venta.total_pagado)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-orange-300">
                          {formatMonto(venta.saldo_pendiente)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            venta.estado === 'COMPLETADO' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                            venta.estado === 'EN_PROCESO' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                            venta.estado === 'CONFIRMADO' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                            venta.estado === 'CANCELADO' ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                            'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
                          }`}>
                            {venta.estado}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => navigate(`/pedidos/${venta.pedido_id}`)}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 p-2 rounded-lg transition-colors border border-blue-400/30"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.total_pages > 1 && (
              <div className="bg-white/5 px-4 py-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/60">
                  Mostrando {((filtros.page - 1) * filtros.page_size) + 1} - {Math.min(filtros.page * filtros.page_size, pagination.count)} de {pagination.count} registros
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(filtros.page - 1)}
                    disabled={filtros.page === 1}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white p-2 rounded-lg transition-colors border border-white/10 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white px-3">
                    Página {filtros.page} de {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => cambiarPagina(filtros.page + 1)}
                    disabled={filtros.page >= pagination.total_pages}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white p-2 rounded-lg transition-colors border border-white/10 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
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

export default HistorialVentasPage;
