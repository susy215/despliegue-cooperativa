import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Plus, Eye, Filter, X, Calendar,
  ChevronLeft, ChevronRight, DollarSign, Package, Clock,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { pedidosService } from '../../api/pagosService';

const PedidosPage = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    cliente_nombre: '',
    page: 1,
    page_size: 10
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  useEffect(() => {
    cargarPedidos();
  }, [filtros.page]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await pedidosService.listar(filtros);
      setPedidos(response.results || []);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous
      });
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFiltros(prev => ({ ...prev, page: 1 }));
    cargarPedidos();
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
      estado: '',
      fecha_desde: '',
      fecha_hasta: '',
      cliente_nombre: '',
      page: 1,
      page_size: 10
    });
    setSearchTerm('');
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'PENDIENTE': { bg: 'bg-yellow-500/20', text: 'text-yellow-200', border: 'border-yellow-400/30', icon: Clock },
      'CONFIRMADO': { bg: 'bg-blue-500/20', text: 'text-blue-200', border: 'border-blue-400/30', icon: CheckCircle },
      'EN_PROCESO': { bg: 'bg-purple-500/20', text: 'text-purple-200', border: 'border-purple-400/30', icon: Package },
      'COMPLETADO': { bg: 'bg-green-500/20', text: 'text-green-200', border: 'border-green-400/30', icon: CheckCircle },
      'CANCELADO': { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-400/30', icon: XCircle }
    };
    return badges[estado] || badges['PENDIENTE'];
  };

  const getEstadoPagoBadge = (estadoPago) => {
    const badges = {
      'PENDIENTE': { bg: 'bg-red-500/20', text: 'text-red-200', border: 'border-red-400/30' },
      'PARCIAL': { bg: 'bg-orange-500/20', text: 'text-orange-200', border: 'border-orange-400/30' },
      'PAGADO': { bg: 'bg-green-500/20', text: 'text-green-200', border: 'border-green-400/30' }
    };
    return badges[estadoPago] || badges['PENDIENTE'];
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

  const totalPages = Math.ceil(pagination.count / filtros.page_size);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7" />
            Gestión de Pedidos
          </h1>
          <p className="text-emerald-100/80 mt-1">
            Administra los pedidos y ventas de la cooperativa
          </p>
        </div>
        <button
          onClick={() => navigate('/pedidos/nuevo')}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 border border-emerald-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Pedidos</p>
              <p className="text-2xl font-bold text-white">{pagination.count}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-300">
                {pedidos.filter(p => p.estado === 'PENDIENTE').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">En Proceso</p>
              <p className="text-2xl font-bold text-purple-300">
                {pedidos.filter(p => p.estado === 'EN_PROCESO').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Completados</p>
              <p className="text-2xl font-bold text-green-300">
                {pedidos.filter(p => p.estado === 'COMPLETADO').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
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
                placeholder="Buscar por cliente, número de pedido..."
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
                <label className="block text-white/60 text-sm mb-2">Estado</label>
                <select
                  name="estado"
                  value={filtros.estado}
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
                <label className="block text-white/60 text-sm mb-2">Fecha Desde</label>
                <input
                  type="date"
                  name="fecha_desde"
                  value={filtros.fecha_desde}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  name="fecha_hasta"
                  value={filtros.fecha_hasta}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-red-400/30"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-white">Cargando pedidos...</span>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No se encontraron pedidos</p>
            <button
              onClick={() => navigate('/pedidos/nuevo')}
              className="mt-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center space-x-2 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Pedido</span>
            </button>
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
                    <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Pago</th>
                    <th className="text-center py-3 px-4 text-white/80 font-medium text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pedidos.map((pedido) => {
                    const estadoBadge = getEstadoBadge(pedido.estado);
                    const EstadoIcon = estadoBadge.icon;
                    const estadoPagoBadge = getEstadoPagoBadge(pedido.estado_pago);

                    return (
                      <tr key={pedido.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-white font-mono text-sm">
                            {pedido.numero_pedido}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white/80 text-sm">
                            {formatFecha(pedido.fecha_pedido)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{pedido.cliente_nombre}</p>
                            {pedido.cliente_email && (
                              <p className="text-white/60 text-xs">{pedido.cliente_email}</p>
                            )}
                            {pedido.cliente_direccion && (
                              <p className="text-white/40 text-xs">{pedido.cliente_direccion}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white/80 text-sm">
                            {pedido.socio?.usuario?.nombres || pedido.socio_nombre || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-white font-semibold">
                            {formatMonto(pedido.total)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-green-300">
                            {formatMonto(pedido.total_pagado)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-orange-300">
                            {formatMonto(pedido.saldo_pendiente)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${estadoBadge.bg} ${estadoBadge.text} ${estadoBadge.border}`}>
                              <EstadoIcon className="w-3 h-3" />
                              {pedido.estado}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${estadoPagoBadge.bg} ${estadoPagoBadge.text} ${estadoPagoBadge.border}`}>
                              {pedido.estado_pago}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/pedidos/${pedido.id}`)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 p-2 rounded-lg transition-colors border border-blue-400/30"
                              title="Ver detalle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {pedido.estado_pago !== 'PAGADO' && pedido.estado !== 'CANCELADO' && (
                              <button
                                onClick={() => navigate(`/pedidos/${pedido.id}/pagar`)}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-200 p-2 rounded-lg transition-colors border border-green-400/30"
                                title="Registrar pago"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white/5 px-4 py-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/60">
                  Mostrando {((filtros.page - 1) * filtros.page_size) + 1} - {Math.min(filtros.page * filtros.page_size, pagination.count)} de {pagination.count} pedidos
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(filtros.page - 1)}
                    disabled={!pagination.previous}
                    className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white p-2 rounded-lg transition-colors border border-white/10 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white px-3">
                    Página {filtros.page} de {totalPages}
                  </span>
                  <button
                    onClick={() => cambiarPagina(filtros.page + 1)}
                    disabled={!pagination.next}
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

export default PedidosPage;
