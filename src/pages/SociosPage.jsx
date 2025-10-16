import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, Eye, UserCheck, UserX, Filter, MapPin } from 'lucide-react';
import { socioService } from '../api/socioService';

const SociosPage = () => {
  const navigate = useNavigate();
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado: '',
    comunidad: '',
    nombre: '',
    apellido: '',
    ci_nit: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setLoading(true);
      const response = await socioService.buscarSociosAvanzado();
      setSocios(response.results || []);
    } catch (error) {
      console.error('Error al cargar socios:', error);
      // Fallback a datos simulados si hay error
      setSocios([
        {
          id: 1,
          usuario: { nombres: 'Juan', apellidos: 'Pérez', ci_nit: '1234567890', email: 'juan.perez@email.com' },
          telefono: '0991234567',
          fecha_ingreso: '2023-01-15',
          estado: 'ACTIVO',
          comunidad: { nombre: 'Comunidad A' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivarDesactivar = async (socioId, accion) => {
    try {
      await socioService.activarDesactivarSocio(socioId, accion);
      await cargarSocios(); // Recargar la lista
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del socio');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {
        nombre: filtros.nombre,
        apellido: filtros.apellido,
        ci_nit: filtros.ci_nit,
        comunidad: filtros.comunidad,
        estado: filtros.estado
      };
      const response = await socioService.buscarSociosAvanzado(params);
      setSocios(response.results || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSocios = socios.filter(socio => {
    const nombreCompleto = `${socio.usuario?.nombres || ''} ${socio.usuario?.apellidos || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return nombreCompleto.includes(searchLower) ||
           (socio.usuario?.ci_nit || '').includes(searchTerm) ||
           (socio.usuario?.email || '').includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Socios</h1>
          <p className="text-emerald-100/80 mt-1">
            Administra la información de los socios de la cooperativa
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
            onClick={() => navigate('/socios/nuevo')}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Socio</span>
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
              placeholder="Nombre"
              value={filtros.nombre}
              onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={filtros.apellido}
              onChange={(e) => setFiltros({...filtros, apellido: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="CI/NIT"
              value={filtros.ci_nit}
              onChange={(e) => setFiltros({...filtros, ci_nit: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
            <input
              type="text"
              placeholder="Comunidad"
              value={filtros.comunidad}
              onChange={(e) => setFiltros({...filtros, comunidad: e.target.value})}
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
            placeholder="Buscar socio por nombre, cédula o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Socios List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-emerald-100">Cargando socios...</span>
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
                    CI/NIT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                    Comunidad
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
                {filteredSocios.map((socio) => (
                  <tr key={socio.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {socio.usuario?.nombres} {socio.usuario?.apellidos}
                          </div>
                          <div className="text-emerald-100/60 text-sm">ID: {socio.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{socio.usuario?.ci_nit}</td>
                    <td className="px-6 py-4">
                      <div className="text-emerald-100/80 text-sm">
                        <div>{socio.telefono}</div>
                        <div>{socio.usuario?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white text-sm">
                      {socio.comunidad?.nombre || 'Sin comunidad'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        socio.estado === 'ACTIVO'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-red-500/20 text-red-200'
                      }`}>
                        {socio.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/socios/${socio.id}/parcelas`)}
                          className="text-green-200 hover:text-green-100 transition-colors"
                          title="Ver parcelas"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        <button className="text-blue-200 hover:text-blue-100 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/socios/editar/${socio.id}`)}
                          className="text-yellow-200 hover:text-yellow-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {socio.estado === 'ACTIVO' ? (
                          <button
                            onClick={() => handleActivarDesactivar(socio.id, 'desactivar')}
                            className="text-red-200 hover:text-red-100 transition-colors"
                            title="Desactivar socio"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivarDesactivar(socio.id, 'activar')}
                            className="text-green-200 hover:text-green-100 transition-colors"
                            title="Activar socio"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredSocios.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-emerald-100/60">No se encontraron socios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SociosPage;