import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Plus, Edit, Trash2, Eye, Filter, Ruler, Droplets } from 'lucide-react';
import { parcelaService } from '../api/parcelaService';

const ParcelasPage = () => {
  const navigate = useNavigate();
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    socio: '',
    tipo_suelo: '',
    superficie_min: '',
    superficie_max: '',
    ubicacion: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [tiposSuelo, setTiposSuelo] = useState([]);

  useEffect(() => {
    cargarParcelas();
    cargarTiposSuelo();
  }, []);

  const cargarParcelas = async () => {
    try {
      setLoading(true);
      const response = await parcelaService.buscarParcelasAvanzado();
      setParcelas(response.results || []);
    } catch (error) {
      console.error('Error al cargar parcelas:', error);
      // Fallback a datos simulados si hay error
      setParcelas([
        {
          id: 1,
          socio: {
            id: 1,
            usuario: { nombres: 'Juan', apellidos: 'Pérez' }
          },
          superficie: 5.5,
          tipo_suelo: 'ARCILLOSO',
          ubicacion: 'Comunidad A, Parcela 1',
          coordenadas: '-16.5, -68.1',
          fecha_registro: '2023-01-15',
          estado: 'ACTIVA'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cargarTiposSuelo = async () => {
    try {
      const response = await parcelaService.getTiposSuelo();
      setTiposSuelo(response || []);
    } catch (error) {
      console.error('Error al cargar tipos de suelo:', error);
      // Fallback a tipos comunes
      setTiposSuelo(['ARCILLOSO', 'ARENAL', 'LIMOSO', 'FRANCO']);
    }
  };

  const handleDelete = async (parcelaId) => {
    if (!confirm('¿Está seguro de que desea eliminar esta parcela?')) {
      return;
    }

    try {
      await parcelaService.deleteParcela(parcelaId);
      await cargarParcelas(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar parcela:', error);
      alert('Error al eliminar la parcela');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {
        socio: filtros.socio,
        tipo_suelo: filtros.tipo_suelo,
        superficie_min: filtros.superficie_min,
        superficie_max: filtros.superficie_max,
        ubicacion: filtros.ubicacion
      };
      const response = await parcelaService.buscarParcelasAvanzado(params);
      setParcelas(response.results || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredParcelas = parcelas.filter(parcela => {
    const socioNombre = `${parcela.socio?.usuario?.nombres || ''} ${parcela.socio?.usuario?.apellidos || ''}`.toLowerCase();
    const ubicacion = (parcela.ubicacion || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return socioNombre.includes(searchLower) ||
           ubicacion.includes(searchLower) ||
           (parcela.tipo_suelo || '').toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Parcelas</h1>
          <p className="text-emerald-100/80 mt-1">
            Administra las parcelas agrícolas de los socios
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button
            onClick={() => navigate('/parcelas/nueva')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Parcela</span>
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Filtros Avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre del socio"
              value={filtros.socio}
              onChange={(e) => setFiltros({...filtros, socio: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={filtros.tipo_suelo}
              onChange={(e) => setFiltros({...filtros, tipo_suelo: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todos los tipos de suelo</option>
              {tiposSuelo.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ubicación"
              value={filtros.ubicacion}
              onChange={(e) => setFiltros({...filtros, ubicacion: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="number"
              placeholder="Superficie mínima (ha)"
              value={filtros.superficie_min}
              onChange={(e) => setFiltros({...filtros, superficie_min: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="number"
              placeholder="Superficie máxima (ha)"
              value={filtros.superficie_max}
              onChange={(e) => setFiltros({...filtros, superficie_max: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={handleSearch}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/60" />
          <input
            type="text"
            placeholder="Buscar parcela por socio, ubicación o tipo de suelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Parcelas List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-emerald-100">Cargando parcelas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Socio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Superficie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Tipo de Suelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredParcelas.map((parcela) => (
                  <tr key={parcela.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {parcela.socio?.usuario?.nombres} {parcela.socio?.usuario?.apellidos}
                          </div>
                          <div className="text-emerald-100/60 text-sm">ID: {parcela.socio?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{parcela.ubicacion}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Ruler className="w-4 h-4 text-emerald-400" />
                        <span className="text-white">{parcela.superficie} ha</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{parcela.tipo_suelo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        parcela.estado === 'ACTIVA'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-red-500/20 text-red-200'
                      }`}>
                        {parcela.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/parcelas/ver/${parcela.id}`)}
                          className="text-blue-200 hover:text-blue-100 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/parcelas/editar/${parcela.id}`)}
                          className="text-yellow-200 hover:text-yellow-100 transition-colors"
                          title="Editar parcela"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(parcela.id)}
                          className="text-red-200 hover:text-red-100 transition-colors"
                          title="Eliminar parcela"
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
        )}

        {filteredParcelas.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">No se encontraron parcelas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelasPage;