// src/pages/LaborPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tractor,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Calendar,
  RefreshCw,
  CheckCircle,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import laborService from '../api/laborService';
import { campaignService } from '../api/campaignService';
import { parcelaService } from '../api/parcelaService';
import { getEstadoBadgeVariant, getTipoLaborBadgeVariant } from '../utils/laborUtils';

// ---- helpers ----
const formatDate = (s) => (s ? new Date(s).toLocaleDateString('es-ES') : '—');

const normalizeChoices = (raw, fallback) => {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return fallback;
  const first = raw[0];

  // [[value, label]]
  if (Array.isArray(first)) {
    return raw.map(([value, label]) => ({
      valor: String(value),
      etiqueta: label ?? String(value),
    }));
  }
  // [{valor, etiqueta}] u otras claves comunes
  if (typeof first === 'object' && first !== null) {
    return raw
      .map((o) => ({
        valor: String(o.valor ?? o.value ?? o.key ?? ''),
        etiqueta: String(o.etiqueta ?? o.label ?? o.value ?? o.key ?? ''),
      }))
      .filter((x) => x.valor);
  }
  // ['SIEMBRA', 'COSECHA', ...]
  if (typeof first === 'string') {
    return raw.map((s) => ({ valor: String(s), etiqueta: String(s) }));
  }
  return fallback;
};

const TIPOS_LABOR_FALLBACK = [
  { valor: 'SIEMBRA', etiqueta: 'Siembra' },
  { valor: 'RIEGO', etiqueta: 'Riego' },
  { valor: 'FERTILIZACION', etiqueta: 'Fertilización' },
  { valor: 'COSECHA', etiqueta: 'Cosecha' },
  { valor: 'FUMIGACION', etiqueta: 'Fumigación' },
];
const ESTADOS_FALLBACK = [
  { valor: 'PLANIFICADA', etiqueta: 'Planificada' },
  { valor: 'EN_PROCESO', etiqueta: 'En Proceso' },
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
];

const LaborPage = () => {
  const navigate = useNavigate();

  // data
  const [labores, setLabores] = useState([]);
  const [count, setCount] = useState(0);

  // ui
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // filtros (map a backend)
  const [filtros, setFiltros] = useState({
    estado: '',
    labor_tipo: '',
    campania_id: '',
    parcela_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    ordering: '-fecha_labor,-creado_en',
  });

  // catálogos
  const [tiposLabor, setTiposLabor] = useState(TIPOS_LABOR_FALLBACK);
  const [estadosLabor, setEstadosLabor] = useState(ESTADOS_FALLBACK);
  const [campanias, setCampanias] = useState([]);
  const [parcelas, setParcelas] = useState([]);

  // para pintar etiqueta de tipo si no viene del backend
  const tipoMap = useMemo(
    () => Object.fromEntries(tiposLabor.map((t) => [t.valor, t.etiqueta])),
    [tiposLabor]
  );

  const renderEstadoBadge = (estado) => {
    const variant = getEstadoBadgeVariant(estado);
    const iconos = {
      PLANIFICADA: <Calendar className="w-3 h-3" />,
      EN_PROCESO: <PlayCircle className="w-3 h-3" />,
      COMPLETADA: <CheckCircle className="w-3 h-3" />,
      CANCELADA: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${variant}/20 text-${variant}-200`}>
        {iconos[estado] || null}
        <span className="ml-1">{estado.replace('_', ' ')}</span>
      </span>
    );
  };

  const renderTipoBadge = (tipo) => {
    const variant = getTipoLaborBadgeVariant(tipo);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${variant}/20 text-${variant}-200`}>
        {tipo}
      </span>
    );
  };

  // ---- cargar catálogos ----
  const cargarCatalogos = async () => {
    const [tRes, eRes] = await Promise.allSettled([
      laborService.getTiposLabor(),
      laborService.getEstadosLabor(),
    ]);

    if (tRes.status === 'fulfilled') {
      setTiposLabor(normalizeChoices(tRes.value, TIPOS_LABOR_FALLBACK));
    } else {
      setTiposLabor(TIPOS_LABOR_FALLBACK);
      console.warn('[LaborPage] tipos_labor fallback:', tRes.reason?.message);
    }

    if (eRes.status === 'fulfilled') {
      setEstadosLabor(normalizeChoices(eRes.value, ESTADOS_FALLBACK));
    } else {
      setEstadosLabor(ESTADOS_FALLBACK);
      console.warn('[LaborPage] estados_labor fallback:', eRes.reason?.message);
    }

    try {
      const cs = await campaignService.getCampaigns({ page_size: 1000 });
      const list = (cs?.results || cs || []).map((c) => ({
        id: c.id,
        nombre: c.nombre ?? c.name ?? `Campaña ${c.id}`,
      }));
      setCampanias(list);
    } catch (err) {
      console.warn('[LaborPage] campañas vacías:', err?.message);
      setCampanias([]);
    }

    try {
      const psRaw = await parcelaService.getParcelas({ page_size: 1000 });
      const ps = psRaw?.results || psRaw || [];
      setParcelas(
        ps.map((p) => ({
          id: p.id,
          nombre: p.nombre ?? p.name ?? `Parcela ${p.id}`,
        }))
      );
    } catch (err) {
      console.warn('[LaborPage] parcelas vacías:', err?.message);
      setParcelas([]);
    }
  };

  // ---- cargar lista ----
  const cargarLabores = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ordering: filtros.ordering || '-fecha_labor,-creado_en',
      };
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.labor_tipo) params.labor_tipo = filtros.labor_tipo;
      if (filtros.campania_id) params.campania_id = filtros.campania_id;
      if (filtros.parcela_id) params.parcela_id = filtros.parcela_id;
      if (filtros.fecha_desde) params.fecha_labor_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_labor_hasta = filtros.fecha_hasta;

      const data = await laborService.getLabores(params);
      const rows = data.results || data;
      setLabores(rows);
      setCount(data.count ?? rows.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error al cargar labores:', error);
      setLabores([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  // ---- search local y stats ----
  const filteredLabores = useMemo(() => {
    if (!searchTerm) return labores;
    const term = searchTerm.toLowerCase();
    return labores.filter((l) => {
      const campos = [
        l?.tipo_labor_display,
        l?.labor,
        l?.estado,
        l?.campania_nombre,
        l?.parcela_nombre,
        l?.socio_nombre,
        l?.observaciones,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return campos.includes(term);
    });
  }, [labores, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredLabores.length;
    const planificadas = filteredLabores.filter((l) => l.estado === 'PLANIFICADA').length;
    const enProceso = filteredLabores.filter((l) => l.estado === 'EN_PROCESO').length;
    const completadas = filteredLabores.filter((l) => l.estado === 'COMPLETADA').length;
    const canceladas = filteredLabores.filter((l) => l.estado === 'CANCELADA').length;
    return { total, planificadas, enProceso, completadas, canceladas };
  }, [filteredLabores]);

  // ---- actions ----
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await laborService.cambiarEstado(id, nuevoEstado);
      await cargarLabores(currentPage);
    } catch (e) {
      console.error('Error al cambiar estado:', e);
      alert('Error al cambiar estado: ' + (e?.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta labor?')) return;
    try {
      await laborService.deleteLabor(id);
      await cargarLabores(currentPage);
    } catch (e) {
      console.error('Error al eliminar labor:', e);
      alert('Error al eliminar labor: ' + (e?.response?.data?.error || e.message));
    }
  };

  const aplicarFiltros = () => {
    cargarLabores(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      labor_tipo: '',
      campania_id: '',
      parcela_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      ordering: '-fecha_labor,-creado_en',
    });
    setSearchTerm('');
    cargarLabores(1);
  };

  useEffect(() => {
    (async () => {
      await cargarCatalogos();
    })();
  }, []);

  useEffect(() => {
    cargarLabores(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  if (loading && labores.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Labores Agrícolas</h1>
          <p className="text-emerald-100/80 mt-1">Registro y seguimiento de actividades agrícolas</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => cargarLabores(currentPage)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => navigate('/labores/nueva')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Labor</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por tipo, estado, campaña, parcela, socio u observaciones (en esta página)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>

          <div className="flex items-center space-x-4">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value={10} className="bg-gray-800">10 por página</option>
              <option value={25} className="bg-gray-800">25 por página</option>
              <option value={50} className="bg-gray-800">50 por página</option>
              <option value={100} className="bg-gray-800">100 por página</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 border-t border-white/20 mt-4">
            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Estados</option>
              {estadosLabor.map((e) => (
                <option key={e.valor} value={e.valor} className="bg-gray-800">
                  {e.etiqueta}
                </option>
              ))}
            </select>

            {/* Tipo Labor */}
            <select
              value={filtros.labor_tipo}
              onChange={(e) => setFiltros({ ...filtros, labor_tipo: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Tipos</option>
              {tiposLabor.map((t) => (
                <option key={t.valor} value={t.valor} className="bg-gray-800">
                  {t.etiqueta}
                </option>
              ))}
            </select>

            {/* Campaña */}
            <select
              value={filtros.campania_id}
              onChange={(e) => setFiltros({ ...filtros, campania_id: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Campañas</option>
              {campanias.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-800">
                  {c.nombre}
                </option>
              ))}
            </select>

            {/* Parcela */}
            <select
              value={filtros.parcela_id}
              onChange={(e) => setFiltros({ ...filtros, parcela_id: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Parcelas</option>
              {parcelas.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-800">
                  {p.nombre}
                </option>
              ))}
            </select>

            {/* Desde */}
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            />

            {/* Hasta */}
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            />

            <div className="md:col-span-6 flex gap-2">
              <button
                onClick={aplicarFiltros}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Aplicar
              </button>
              <button
                onClick={limpiarFiltros}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Total (página)</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Tractor className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <p className="text-emerald-200/80 text-sm font-medium">Planificadas</p>
          <p className="text-2xl font-bold text-gray-200">{stats.planificadas}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <p className="text-emerald-200/80 text-sm font-medium">En Proceso</p>
          <p className="text-2xl font-bold text-yellow-200">{stats.enProceso}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <p className="text-emerald-200/80 text-sm font-medium">Completadas</p>
          <p className="text-2xl font-bold text-green-200">{stats.completadas}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <p className="text-emerald-200/80 text-sm font-medium">Canceladas</p>
          <p className="text-2xl font-bold text-red-200">{stats.canceladas}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Tractor className="w-5 h-5" />
            <span>Lista de Labores ({count} total)</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Observaciones</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLabores.map((labor) => (
                <tr key={labor.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-semibold">{formatDate(labor.fecha_labor)}</div>
                    <div className="text-emerald-200/60 text-sm">Creado: {formatDate(labor.creado_en)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderTipoBadge(labor.labor)}
                    <div className="text-emerald-200/60 text-sm mt-1">
                      {labor.tipo_labor_display || tipoMap[labor.labor] || labor.labor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderEstadoBadge(labor.estado)}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {labor.campania_nombre || labor.parcela_nombre || 'Sin ubicación'}
                    </div>
                    {labor.socio_nombre && (
                      <div className="text-emerald-200/60 text-sm">Socio: {labor.socio_nombre}</div>
                    )}
                    {labor.campania_nombre && labor.parcela_nombre && (
                      <div className="text-emerald-200/60 text-sm">Parcela: {labor.parcela_nombre}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-200/80 text-sm line-clamp-2">
                      {labor.observaciones || <em className="opacity-60">—</em>}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/labores/${labor.id}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/labores/editar/${labor.id}`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {labor.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'COMPLETADA')}
                          className="text-green-300 hover:text-green-200 transition-colors"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {labor.estado !== 'EN_PROCESO' && labor.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'EN_PROCESO')}
                          className="text-yellow-300 hover:text-yellow-200 transition-colors"
                          title="Marcar como en proceso"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}

                      {labor.estado !== 'CANCELADA' && (
                        <button
                          onClick={() => handleCambiarEstado(labor.id, 'CANCELADA')}
                          className="text-orange-300 hover:text-orange-200 transition-colors"
                          title="Cancelar labor"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(labor.id)}
                        className="text-red-300 hover:text-red-200 transition-colors"
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/20 flex items-center justify-between">
            <div className="text-emerald-200/60 text-sm">
              Mostrando página {currentPage} de {totalPages} — {count} registros
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => currentPage > 1 && cargarLabores(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                }`}
              >
                Anterior
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => cargarLabores(page)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-1 text-emerald-200/60">
                      …
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => currentPage < totalPages && cargarLabores(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {labores.length === 0 && !loading && (
          <div className="text-center py-12">
            <Tractor className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">No hay labores registradas</p>
            <button
              onClick={() => navigate('/labores/nueva')}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Labor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaborPage;
