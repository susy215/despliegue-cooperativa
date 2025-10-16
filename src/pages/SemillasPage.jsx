import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Search, Plus, Edit, Trash2, Eye, AlertTriangle, Package, Calendar, DollarSign, Filter } from 'lucide-react';
import { semillaService } from '../api/semillaService';

const SemillasPage = () => {
  const navigate = useNavigate();
  const [semillas, setSemillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    especie: '',
    variedad: '',
    proveedor: '',
    lote: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarSemillas();
  }, []);

  const cargarSemillas = async () => {
    try {
      setLoading(true);
      const response = await semillaService.getSemillas();
      setSemillas(response.results || response || []);
    } catch (error) {
      console.error('Error al cargar semillas:', error);
      // Fallback a datos simulados si hay error
      setSemillas([
        {
          id: 1,
          especie: 'Maíz',
          variedad: 'Maíz duro híbrido',
          cantidad: 100.00,
          unidad_medida: 'Kilogramos',
          fecha_vencimiento: '2025-12-31',
          porcentaje_germinacion: 95.0,
          lote: 'MZ-HYB-2025-001',
          proveedor: 'AgroSemillas SA',
          precio_unitario: 25.50,
          ubicacion_almacen: 'Sector A-15',
          estado: 'DISPONIBLE',
          valor_total: 2550.00,
          dias_para_vencer: 45
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarCantidad = async (semillaId, nuevaCantidad) => {
    const cantidad = prompt('Ingrese la nueva cantidad:');
    if (cantidad && !isNaN(cantidad)) {
      try {
        await semillaService.actualizarCantidad(semillaId, parseFloat(cantidad));
        await cargarSemillas();
      } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar cantidad');
      }
    }
  };

  const handleMarcarVencida = async (semillaId) => {
    if (window.confirm('¿Está seguro de marcar esta semilla como vencida?')) {
      try {
        await semillaService.marcarVencida(semillaId);
        await cargarSemillas();
      } catch (error) {
        console.error('Error al marcar como vencida:', error);
        alert('Error al marcar como vencida');
      }
    }
  };

  const handleDelete = async (semillaId) => {
    if (window.confirm('¿Está seguro de eliminar esta semilla?')) {
      try {
        await semillaService.deleteSemilla(semillaId);
        await cargarSemillas();
      } catch (error) {
        console.error('Error al eliminar semilla:', error);
        alert('Error al eliminar semilla');
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
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const filteredSemillas = semillas.filter(semilla => {
    const matchesSearch = searchTerm === '' ||
      semilla.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semilla.variedad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semilla.lote?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semilla.proveedor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtros.estado === '' || semilla.estado === filtros.estado;
    const matchesEspecie = filtros.especie === '' || semilla.especie === filtros.especie;
    const matchesProveedor = filtros.proveedor === '' || semilla.proveedor === filtros.proveedor;

    return matchesSearch && matchesEstado && matchesEspecie && matchesProveedor;
  });

  const especiesUnicas = [...new Set(semillas.map(s => s.especie).filter(Boolean))];
  const proveedoresUnicos = [...new Set(semillas.map(s => s.proveedor).filter(Boolean))];

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
          <h1 className="text-2xl font-bold text-white">Gestión de Semillas</h1>
          <p className="text-emerald-100/80 mt-1">
            Inventario y control de semillas agrícolas
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/semillas/nueva')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Semilla</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar semillas por especie, variedad, lote o proveedor..."
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
              value={filtros.especie}
              onChange={(e) => setFiltros({...filtros, especie: e.target.value})}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="" className="bg-gray-800">Todas las Especies</option>
              {especiesUnicas.map(especie => (
                <option key={especie} value={especie} className="bg-gray-800">{especie}</option>
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
              onClick={() => setFiltros({estado: '', especie: '', variedad: '', proveedor: '', lote: ''})}
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
              <p className="text-emerald-200/80 text-sm font-medium">Total Semillas</p>
              <p className="text-2xl font-bold text-white">{semillas.length}</p>
            </div>
            <Sprout className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Disponibles</p>
              <p className="text-2xl font-bold text-green-200">
                {semillas.filter(s => s.estado === 'DISPONIBLE').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Próximas a Vencer</p>
              <p className="text-2xl font-bold text-yellow-200">
                {semillas.filter(s => s.dias_para_vencer > 0 && s.dias_para_vencer <= 30).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200/80 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-blue-200">
                {formatCurrency(semillas.reduce((sum, s) => sum + (s.valor_total || 0), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Sprout className="w-5 h-5" />
            <span>Inventario de Semillas ({filteredSemillas.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Semilla
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
              {filteredSemillas.map((semilla) => (
                <tr key={semilla.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white font-semibold">
                        {semilla.especie} - {semilla.variedad}
                      </div>
                      <div className="text-emerald-200/60 text-sm">
                        Lote: {semilla.lote}
                      </div>
                      <div className="text-emerald-200/60 text-sm">
                        {semilla.proveedor}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {semilla.cantidad} {semilla.unidad_medida}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      Germ: {semilla.porcentaje_germinacion}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {formatDate(semilla.fecha_vencimiento)}
                    </div>
                    {semilla.dias_para_vencer !== null && (
                      <div className={`text-sm font-medium ${semilla.dias_para_vencer <= 30 ? 'text-red-300' : 'text-emerald-200/60'}`}>
                        {semilla.dias_para_vencer > 0 ? `${semilla.dias_para_vencer} días` : 'Vencida'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {formatCurrency(semilla.precio_unitario)}
                    </div>
                    <div className="text-emerald-200/60 text-sm">
                      Total: {formatCurrency(semilla.valor_total || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(semilla.estado)}`}>
                      {getEstadoIcon(semilla.estado)}
                      <span className="ml-1">{semilla.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/semillas/${semilla.id}`)}
                        className="text-blue-300 hover:text-blue-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/semillas/${semilla.id}/editar`)}
                        className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActualizarCantidad(semilla.id, semilla.cantidad)}
                        className="text-green-300 hover:text-green-200 transition-colors"
                        title="Actualizar cantidad"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                      {semilla.estado !== 'VENCIDO' && (
                        <button
                          onClick={() => handleMarcarVencida(semilla.id)}
                          className="text-orange-300 hover:text-orange-200 transition-colors"
                          title="Marcar como vencida"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(semilla.id)}
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

        {filteredSemillas.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">
              {searchTerm ? 'No se encontraron semillas con ese criterio de búsqueda' : 'No hay semillas registradas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemillasPage;