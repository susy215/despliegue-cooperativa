import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Filter,
  DollarSign,
  Warehouse,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import productoCosechadoService, {
  ESTADOS_PRODUCTO_FALLBACK,
} from '../api/productoCosechadoService';

// ✅ Formato de fecha seguro
const formatDate = (s) => {
  if (!s) return 'N/A';
  try {
    return new Date(s).toLocaleDateString('es-ES');
  } catch {
    return s;
  }
};

// ✅ Colores por estado
const getEstadoColor = (estado) => {
  switch (estado) {
    case 'En Almacén': return 'bg-green-500/20 text-green-200';
    case 'Vendido': return 'bg-blue-500/20 text-blue-200';
    case 'Procesado': return 'bg-purple-500/20 text-purple-200';
    case 'Vencido': return 'bg-red-500/20 text-red-200';
    case 'En revision': return 'bg-yellow-500/20 text-yellow-200';
    default: return 'bg-gray-500/20 text-gray-200';
  }
};

// ✅ Íconos por estado
const getEstadoIcon = (estado) => {
  switch (estado) {
    case 'Vencido': return <AlertTriangle className="w-4 h-4" />;
    case 'En Almacén': return <Warehouse className="w-4 h-4" />;
    case 'Vendido': return <DollarSign className="w-4 h-4" />;
    case 'Procesado':
    case 'En revision': return <RefreshCw className="w-4 h-4" />;
    default: return null;
  }
};

const ProductoCosechadoPage = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [estadosChoices, setEstadosChoices] = useState(ESTADOS_PRODUCTO_FALLBACK);

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // filtros del backend
  const [filtros, setFiltros] = useState({
    estado: '',
    campania_id: '',
    parcela_id: '',
    cultivo_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    ordering: '-fecha_cosecha,-creado_en',
  });

  // ✅ Cargar catálogo de estados (usa fallback si la ruta /estados no existe)
  useEffect(() => {
    (async () => {
      try {
        const est = await productoCosechadoService.getEstadosDisponibles();
        setEstadosChoices(est);
      } catch {
        setEstadosChoices(ESTADOS_PRODUCTO_FALLBACK);
      }
    })();
  }, []);

  // ✅ Función principal para cargar los productos cosechados
  const cargar = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ordering: filtros.ordering,
      };

      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.campania_id) params.campania_id = filtros.campania_id;
      if (filtros.parcela_id) params.parcela_id = filtros.parcela_id;
      if (filtros.cultivo_id) params.cultivo_id = filtros.cultivo_id;
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;

      // ⚠️ Usa listar() en lugar de getProductos() (más consistente con tu servicio actual)
      const data = await productoCosechadoService.listar(params);

      const rows = data.results || data || [];
      setProductos(rows);
      setCount(data.count ?? rows.length);
      setCurrentPage(page);
    } catch (e) {
      console.error('Error al cargar productos cosechados:', e);
      setProductos([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  // ✅ Filtrado local (buscador)
  const filtered = useMemo(() => {
    if (!searchTerm) return productos;
    const q = searchTerm.toLowerCase();
    return productos.filter((p) => {
      const blob = [
        p.cultivo_especie,
        p.cultivo_variedad,
        p.estado,
        p.origen_display,
        p.campania_nombre,
        p.parcela_nombre,
        p.socio_nombre,
        p.ubicacion_almacen,
        p.lote,
        p.calidad,
        p.observaciones,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [productos, searchTerm]);

  // ✅ Estadísticas rápidas
  const stats = useMemo(() => {
    const enAlmacen = filtered.filter((p) => p.estado === 'En Almacén').length;
    const vendidos = filtered.filter((p) => p.estado === 'Vendido').length;
    const proximos = filtered.filter((p) => p.esta_proximo_vencer).length;
    const totalCantidad = filtered.reduce((acc, p) => acc + parseFloat(p.cantidad || 0), 0);
    return { enAlmacen, vendidos, proximos, totalCantidad };
  }, [filtered]);

  // ✅ Acciones
  const aplicar = () => cargar(1);
  const limpiar = () => {
    setFiltros({
      estado: '',
      campania_id: '',
      parcela_id: '',
      cultivo_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      ordering: '-fecha_cosecha,-creado_en',
    });
    setSearchTerm('');
    cargar(1);
  };

  const vender = async (id) => {
    const cantidad = prompt('Ingrese la cantidad a vender:');
    if (!cantidad || isNaN(Number(cantidad))) return;
    try {
      await productoCosechadoService.vender(id, {
        cantidad_vendida: Number(cantidad),
        observaciones: 'Venta desde la lista',
      });
      await cargar(currentPage);
    } catch (e) {
      alert('Error al vender: ' + (e?.response?.data?.detail || e.message));
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevo = prompt(`Estado actual: ${estadoActual}\nNuevo estado:`, estadoActual);
    if (!nuevo || nuevo === estadoActual) return;
    try {
      await productoCosechadoService.cambiarEstado(id, {
        nuevo_estado: nuevo,
        observaciones: 'Cambio manual desde listado',
      });
      await cargar(currentPage);
    } catch (e) {
      alert('Error al cambiar estado: ' + (e?.response?.data?.detail || e.message));
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto cosechado?')) return;
    try {
      await productoCosechadoService.eliminar(id);
      await cargar(currentPage);
    } catch (e) {
      alert('No se pudo eliminar: ' + (e?.response?.data?.detail || e.message));
    }
  };

  // ✅ Valores únicos para filtros
  const campaniasUnicas = [...new Set(productos.map((p) => p.campania_nombre).filter(Boolean))];
  const parcelasUnicas = [...new Set(productos.map((p) => p.parcela_nombre).filter(Boolean))];
  const cultivosUnicos = [...new Set(productos.map((p) => p.cultivo_especie).filter(Boolean))];

  // ✅ Loader
  if (loading && productos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos Cosechados</h1>
          <p className="text-emerald-100/80 mt-1">Gestión de productos cosechados por campaña/parcela</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => cargar(currentPage)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => navigate('/productos-cosechados/nuevo')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cultivo, estado, origen, socio, ubicación o notas…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aplicar()}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>

          <div className="flex items-center space-x-4">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n} className="bg-gray-800">
                  {n} por página
                </option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 border-t border-white/20 mt-4">
            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Todos los Estados</option>
              {estadosChoices.map((e) => (
                <option key={e.valor} value={e.valor} className="bg-gray-800">
                  {e.etiqueta}
                </option>
              ))}
            </select>

            {/* Campaña */}
            <select
              value={filtros.campania_id}
              onChange={(e) => setFiltros({ ...filtros, campania_id: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Todas las Campañas</option>
              {campaniasUnicas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Parcela */}
            <select
              value={filtros.parcela_id}
              onChange={(e) => setFiltros({ ...filtros, parcela_id: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Todas las Parcelas</option>
              {parcelasUnicas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Cultivo */}
            <select
              value={filtros.cultivo_id}
              onChange={(e) => setFiltros({ ...filtros, cultivo_id: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Todos los Cultivos</option>
              {cultivosUnicos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />

            <div className="md:col-span-6 flex gap-2">
              <button
                onClick={aplicar}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg"
              >
                Aplicar
              </button>
              <button
                onClick={limpiar}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span>Inventario ({count} total)</span>
          </h2>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Origen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Lote / Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-semibold">{p.cultivo_especie}</div>
                    {p.cultivo_variedad && (
                      <div className="text-emerald-200/60 text-sm">Variedad: {p.cultivo_variedad}</div>
                    )}
                    <div className="text-emerald-200/60 text-sm">Calidad: {p.calidad}</div>
                    {p.socio_nombre && <div className="text-emerald-200/60 text-sm">Socio: {p.socio_nombre}</div>}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {p.origen_display || p.campania_nombre || p.parcela_nombre || '—'}
                    </div>
                    {p.labor_nombre && (
                      <div className="text-emerald-200/60 text-sm">Labor: {p.labor_nombre}</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {p.cantidad} {p.unidad_medida}
                    </div>
                    {typeof p.dias_en_almacen === 'number' && (
                      <div className="text-emerald-200/60 text-sm">{p.dias_en_almacen} días en almacén</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{formatDate(p.fecha_cosecha)}</div>
                    {p.esta_proximo_vencer && (
                      <div className="text-yellow-300 text-sm">Próximo a vencer</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">Lote: {p.lote}</div>
                    <div className="text-emerald-200/60 text-sm">{p.ubicacion_almacen}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(
                        p.estado
                      )}`}
                    >
                      {getEstadoIcon(p.estado)} <span className="ml-1">{p.estado}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/productos-cosechados/${p.id}`)}
                        className="text-blue-300 hover:text-blue-200"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/productos-cosechados/editar/${p.id}`)}
                        className="text-indigo-300 hover:text-indigo-200"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {p.puede_vender && (
                        <button
                          onClick={() => vender(p.id)}
                          className="text-green-300 hover:text-green-200"
                          title="Vender"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(p.id, p.estado)}
                        className="text-orange-300 hover:text-orange-200"
                        title="Cambiar estado"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => eliminar(p.id)}
                        className="text-red-300 hover:text-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductoCosechadoPage;
