import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Filter, Download, Eye, DollarSign,
  Calendar, Package, AlertCircle, TrendingUp
} from 'lucide-react';
import { pedidosInsumosService, historialInsumosService } from '../../api/insumosVentaService';

const PedidosInsumosPage = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    page_size: 10
  });

  const [paginacion, setPaginacion] = useState({
    count: 0,
    next: null,
    previous: null
  });

  // Obtener datos del usuario
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const socioId = userData.socio_id;
  const isAdmin = userData.rol === 'Administrador';

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si es socio, filtrar solo sus pedidos
      const filtrosAplicados = socioId && !isAdmin 
        ? { ...filtros, socio: socioId }
        : filtros;

      const [pedidosData, historialData] = await Promise.all([
        pedidosInsumosService.listar(filtrosAplicados),
        historialInsumosService.obtenerHistorial({
          socio: socioId,
          fecha_desde: filtros.fecha_desde,
          fecha_hasta: filtros.fecha_hasta
        })
      ]);

      setPedidos(pedidosData.results || []);
      setPaginacion({
        count: pedidosData.count || 0,
        next: pedidosData.next,
        previous: pedidosData.previous
      });

      if (historialData.estadisticas) {
        setEstadisticas(historialData.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar pedidos de insumos:', error);
      setError('Error al cargar los pedidos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarCSV = async () => {
    try {
      await historialInsumosService.exportarCSV({
        socio: socioId,
        ...filtros
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar los datos');
    }
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      'SOLICITADO': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      'APROBADO': 'bg-green-500/20 text-green-200 border-green-400/30',
      'EN_PREPARACION': 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
      'LISTO_ENTREGA': 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      'ENTREGADO': 'bg-gray-500/20 text-gray-200 border-gray-400/30',
      'CANCELADO': 'bg-red-500/20 text-red-200 border-red-400/30'
    };
    return colores[estado] || 'bg-gray-500/20 text-gray-200 border-gray-400/30';
  };

  const obtenerColorEstadoPago = (estadoPago) => {
    const colores = {
      'PENDIENTE': 'bg-red-500/20 text-red-200 border-red-400/30',
      'PARCIAL': 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
      'PAGADO': 'bg-green-500/20 text-green-200 border-green-400/30'
    };
    return colores[estadoPago] || 'bg-gray-500/20 text-gray-200 border-gray-400/30';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Cargando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" />
            {isAdmin ? 'Pedidos de Insumos' : 'Mis Pedidos de Insumos'}
          </h1>
          <p className="text-emerald-100/80 mt-1">
            {isAdmin 
              ? 'Gestiona las solicitudes de insumos de los socios'
              : 'Solicita y gestiona tus pedidos de insumos agrícolas'
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportarCSV}
            className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center space-x-2 border border-white/20"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => navigate('/pedidos-insumos/nuevo')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-lg border border-blue-400/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Pedidos</p>
                <p className="text-3xl font-bold text-white mt-2">{estadisticas.total_pedidos || 0}</p>
              </div>
              <div className="bg-blue-500/30 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-lg border border-green-400/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Total Gastado</p>
                <p className="text-3xl font-bold text-white mt-2">
                  Bs. {parseFloat(estadisticas.total_gastado || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-500/30 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-lg rounded-lg border border-emerald-400/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">Total Pagado</p>
                <p className="text-3xl font-bold text-white mt-2">
                  Bs. {parseFloat(estadisticas.total_pagado || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-500/30 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-lg rounded-lg border border-orange-400/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Saldo Pendiente</p>
                <p className="text-3xl font-bold text-white mt-2">
                  Bs. {parseFloat(estadisticas.total_pendiente || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-500/30 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-white" />
          <h3 className="text-white font-medium">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Todos los estados</option>
              <option value="SOLICITADO">Solicitado</option>
              <option value="APROBADO">Aprobado</option>
              <option value="EN_PREPARACION">En Preparación</option>
              <option value="LISTO_ENTREGA">Listo para Entrega</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Desde</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Hasta</label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value, page: 1 })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFiltros({ estado: '', fecha_desde: '', fecha_hasta: '', page: 1 })}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all border border-white/20"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  N° Pedido
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Fecha
                </th>
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                    Socio
                  </th>
                )}
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Pendiente
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{pedido.numero_pedido}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Calendar className="w-4 h-4" />
                      {formatearFecha(pedido.fecha_pedido)}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/80">{pedido.socio_nombre || 'N/A'}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-white">
                      Bs. {parseFloat(pedido.total).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-400">
                      Bs. {parseFloat(pedido.total_pagado).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-orange-400">
                      Bs. {parseFloat(pedido.saldo_pendiente).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${obtenerColorEstado(pedido.estado)}`}>
                      {pedido.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${obtenerColorEstadoPago(pedido.estado_pago)}`}>
                      {pedido.estado_pago}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate(`/pedidos-insumos/${pedido.id}`)}
                      className="inline-flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-1.5 px-3 rounded-lg transition-all border border-emerald-400/30"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pedidos.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No se encontraron pedidos de insumos</p>
            <p className="text-white/40 text-sm mt-2">
              {isAdmin 
                ? 'Los pedidos aparecerán aquí cuando los socios realicen solicitudes'
                : 'Haz tu primera solicitud de insumos para comenzar'
              }
            </p>
            <button
              onClick={() => navigate('/pedidos-insumos/nuevo')}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-2 px-6 rounded-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Solicitud
            </button>
          </div>
        )}

        {/* Paginación */}
        {paginacion.count > filtros.page_size && (
          <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-white/60">
              Mostrando {Math.min((filtros.page - 1) * filtros.page_size + 1, paginacion.count)} - {Math.min(filtros.page * filtros.page_size, paginacion.count)} de {paginacion.count} pedidos
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                disabled={!paginacion.previous}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all disabled:cursor-not-allowed border border-white/20"
              >
                Anterior
              </button>
              <button
                onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                disabled={!paginacion.next}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all disabled:cursor-not-allowed border border-white/20"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosInsumosPage;
