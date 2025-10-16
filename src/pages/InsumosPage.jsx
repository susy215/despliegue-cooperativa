import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Search, Plus, Edit, Trash2, Eye, AlertTriangle, Package, Calendar, DollarSign, Filter, Bug, Leaf } from 'lucide-react';
import { insumoService, pesticidaService, fertilizanteService } from '../api/insumoService';

const InsumosPage = () => {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState({ pesticidas: [], fertilizantes: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pesticidas'); // 'pesticidas' o 'fertilizantes'
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
    proveedor: '',
    lote: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarInsumos();
  }, []);

  const cargarInsumos = async () => {
    try {
      setLoading(true);
      const response = await insumoService.getAllInsumos();
      setInsumos(response);
    } catch (error) {
      console.error('Error al cargar insumos:', error);
      // Fallback a datos simulados si hay error
      setInsumos({
        pesticidas: [
          {
            id: 1,
            nombre_comercial: 'Roundup PowerMax',
            ingrediente_activo: 'Glifosato',
            tipo_pesticida: 'HERBICIDA',
            concentracion: '48% EC',
            registro_sanitario: 'REG-001-2025',
            cantidad: 50.00,
            unidad_medida: 'Litros',
            fecha_vencimiento: '2025-12-31',
            dosis_recomendada: '2-3 L/ha',
            lote: 'RUPM-2025-001',
            proveedor: 'Monsanto',
            precio_unitario: 45.50,
            ubicacion_almacen: 'Sector B-10',
            estado: 'DISPONIBLE',
            valor_total: 2275.00,
            dias_para_vencer: 45
          }
        ],
        fertilizantes: [
          {
            id: 1,
            nombre_comercial: 'NPK 15-15-15',
            tipo_fertilizante: 'QUIMICO',
            composicion_npk: '15-15-15',
            cantidad: 100.00,
            unidad_medida: 'Kilogramos',
            fecha_vencimiento: null,
            dosis_recomendada: '200-300 kg/ha',
            materia_orgánica: null,
            lote: 'NPK151515-2025-001',
            proveedor: 'Fertilizantes SA',
            precio_unitario: 25.50,
            ubicacion_almacen: 'Sector C-05',
            estado: 'DISPONIBLE',
            valor_total: 2550.00,
            dias_para_vencer: null
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarCantidad = async (id, nuevaCantidad, tipo) => {
    const cantidad = prompt('Ingrese la nueva cantidad:');
    if (cantidad && !isNaN(cantidad)) {
      try {
        if (tipo === 'pesticida') {
          await pesticidaService.actualizarCantidad(id, parseFloat(cantidad));
        } else {
          await fertilizanteService.actualizarCantidad(id, parseFloat(cantidad));
        }
        await cargarInsumos();
      } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar cantidad');
      }
    }
  };

  const handleMarcarVencido = async (id, tipo) => {
    if (window.confirm('¿Está seguro de marcar este insumo como vencido?')) {
      try {
        if (tipo === 'pesticida') {
          await pesticidaService.marcarVencido(id);
        } else {
          await fertilizanteService.marcarVencido(id);
        }
        await cargarInsumos();
      } catch (error) {
        console.error('Error al marcar como vencido:', error);
        alert('Error al marcar como vencido');
      }
    }
  };

  const handleDelete = async (id, tipo) => {
    if (window.confirm('¿Está seguro de eliminar este insumo?')) {
      try {
        if (tipo === 'pesticida') {
          await pesticidaService.deletePesticida(id);
        } else {
          await fertilizanteService.deleteFertilizante(id);
        }
        await cargarInsumos();
      } catch (error) {
        console.error('Error al eliminar insumo:', error);
        alert('Error al eliminar insumo');
      }
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'DISPONIBLE': return 'bg-green-500/20 text-green-200';
      case 'AGOTADO': return 'bg-yellow-500/20 text-yellow-200';
      case 'VENCIDO': return 'bg-red-500/20 text-red-200';
      case 'EN_TRANSITO': return 'bg-blue-500/20 text-blue-200';
      case 'EN_USO': return 'bg-purple-500/20 text-purple-200';
      case 'RESERVADO': return 'bg-orange-500/20 text-orange-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'VENCIDO': return <AlertTriangle className="w-4 h-4" />;
      case 'AGOTADO': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const currentData = activeTab === 'pesticidas' ? insumos.pesticidas : insumos.fertilizantes;

  const filteredInsumos = currentData.filter(insumo => {
    const nombre = activeTab === 'pesticidas' ? insumo.nombre_comercial : insumo.nombre_comercial;
    const tipo = activeTab === 'pesticidas' ? insumo.tipo_pesticida : insumo.tipo_fertilizante;

    const matchesSearch = searchTerm === '' ||
      nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtros.estado === '' || insumo.estado === filtros.estado;
    const matchesTipo = filtros.tipo === '' || tipo === filtros.tipo;
    const matchesProveedor = filtros.proveedor === '' || insumo.proveedor === filtros.proveedor;

    return matchesSearch && matchesEstado && matchesTipo && matchesProveedor;
  });

  const tiposUnicos = [...new Set(currentData.map(i =>
    activeTab === 'pesticidas' ? i.tipo_pesticida : i.tipo_fertilizante
  ).filter(Boolean))];
  const proveedoresUnicos = [...new Set(currentData.map(i => i.proveedor).filter(Boolean))];

  const getTotalValue = () => {
    return currentData.reduce((sum, i) => sum + (i.valor_total || 0), 0);
  };

  const getStats = () => {
    const disponibles = currentData.filter(i => i.estado === 'DISPONIBLE').length;
    const proximosVencer = currentData.filter(i =>
      i.dias_para_vencer > 0 && i.dias_para_vencer <= 30
    ).length;

    return { disponibles, proximosVencer };
  };

  const stats = getStats();

  if (loading) {
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
          <h1 className="text-2xl font-bold text-white">Gestión de Insumos</h1>
          <p className="text-emerald-100/80 mt-1">
            Inventario de pesticidas y fertilizantes
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => navigate(`/insumos/nueva?tipo=${activeTab}`)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo {activeTab === 'pesticidas' ? 'Pesticida' : 'Fertilizante'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl mb-6">
        <div className="border-b border-white/20">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pesticidas')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'pesticidas'
                  ? 'border-emerald-500 text-emerald-200'
                  : 'border-transparent text-emerald-200/60 hover:text-emerald-200 hover:border-white/30'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Pesticidas ({insumos.pesticidas.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('fertilizantes')}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'fertilizantes'
                  ? 'border-emerald-500 text-emerald-200'
                  : 'border-transparent text-emerald-200/60 hover:text-emerald-200 hover:border-white/30'
              }`}
            >
              <Leaf className="w-4 h-4" />
              <span>Fertilizantes ({insumos.fertilizantes.length})</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'pesticidas' ? 'pesticidas' : 'fertilizantes'} por nombre, lote o proveedor...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros Avanzados</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/20 mt-4">
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Estados</option>
              <option value="DISPONIBLE" className="bg-gray-800">Disponible</option>
              <option value="AGOTADO" className="bg-gray-800">Agotado</option>
              <option value="VENCIDO" className="bg-gray-800">Vencido</option>
              <option value="EN_TRANSITO" className="bg-gray-800">En Tránsito</option>
              <option value="EN_USO" className="bg-gray-800">En Uso</option>
              <option value="RESERVADO" className="bg-gray-800">Reservado</option>
            </select>

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo} className="bg-gray-800">{tipo}</option>
              ))}
            </select>

            <select
              value={filtros.proveedor}
              onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todos los Proveedores</option>
              {proveedoresUnicos.map(proveedor => (
                <option key={proveedor} value={proveedor} className="bg-gray-800">{proveedor}</option>
              ))}
            </select>

            <button
              onClick={() => setFiltros({estado: '', tipo: '', proveedor: '', lote: ''})}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 font-medium rounded-lg transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Total {activeTab === 'pesticidas' ? 'Pesticidas' : 'Fertilizantes'}</p>
              <p className="text-2xl font-bold text-white">{currentData.length}</p>
            </div>
            {activeTab === 'pesticidas' ? (
              <Bug className="w-8 h-8 text-emerald-400" />
            ) : (
              <Leaf className="w-8 h-8 text-emerald-400" />
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Disponibles</p>
              <p className="text-2xl font-bold text-green-200">{stats.disponibles}</p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-yellow-200">{stats.proximosVencer}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-blue-200">{formatCurrency(getTotalValue())}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FlaskConical className="w-5 h-5" />
            <span>Inventario de {activeTab === 'pesticidas' ? 'Pesticidas' : 'Fertilizantes'} ({filteredInsumos.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  {activeTab === 'pesticidas' ? 'Pesticida' : 'Fertilizante'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Inventario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInsumos.map((insumo) => (
                <tr key={insumo.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white font-semibold">
                        {insumo.nombre_comercial}
                      </div>
                      {activeTab === 'pesticidas' && insumo.ingrediente_activo && (
                        <div className="text-emerald-200/60 text-sm">
                          Activo: {insumo.ingrediente_activo}
                        </div>
                      )}
                      {activeTab === 'fertilizantes' && insumo.composicion_npk && (
                        <div className="text-emerald-200/60 text-sm">
                          NPK: {insumo.composicion_npk}
                        </div>
                      )}
                      <div className="text-emerald-200/60 text-sm">
                        Lote: {insumo.lote}
                      </div>
                      <div className="text-emerald-200/60 text-sm">
                        {insumo.proveedor}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {activeTab === 'pesticidas' ? insumo.tipo_pesticida : insumo.tipo_fertilizante}
                    </div>
                    {activeTab === 'pesticidas' && insumo.concentracion && (
                      <div className="text-emerald-200/60 text-sm">
                        {insumo.concentracion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {insumo.cantidad} {insumo.unidad_medida}
                    </div>
                    {activeTab === 'fertilizantes' && insumo.materia_orgánica && (
                      <div className="text-emerald-200/60 text-sm">
                        Orgánica: {insumo.materia_orgánica}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {formatDate(insumo.fecha_vencimiento)}
                    </div>
                    {insumo.dias_para_vencer !== null && insumo.dias_para_vencer !== undefined && (
                      <div className={`text-sm font-medium ${insumo.dias_para_vencer <= 30 ? 'text-red-300' : 'text-emerald-200/60'}`}>
                        {insumo.dias_para_vencer > 0 ? `${insumo.dias_para_vencer} días` : 'Vencido'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {formatCurrency(insumo.precio_unitario)}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      Total: {formatCurrency(insumo.valor_total || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoColor(insumo.estado)}`}>
                      {getEstadoIcon(insumo.estado)}
                      <span className="ml-1">{insumo.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/insumos/${insumo.id}?tipo=${activeTab}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/insumos/${insumo.id}/editar?tipo=${activeTab}`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActualizarCantidad(insumo.id, insumo.cantidad, activeTab.slice(0, -1))}
                        className="text-green-300 hover:text-green-200 transition-colors"
                        title="Actualizar cantidad"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      {insumo.estado !== 'VENCIDO' && insumo.fecha_vencimiento && (
                        <button
                          onClick={() => handleMarcarVencido(insumo.id, activeTab.slice(0, -1))}
                          className="text-orange-300 hover:text-orange-200 transition-colors"
                          title="Marcar como vencido"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(insumo.id, activeTab.slice(0, -1))}
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

        {filteredInsumos.length === 0 && (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">
              {searchTerm ? 'No se encontraron insumos con ese criterio de búsqueda' : `No hay ${activeTab === 'pesticidas' ? 'pesticidas' : 'fertilizantes'} registrados`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsumosPage;