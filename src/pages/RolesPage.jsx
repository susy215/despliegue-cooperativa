import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  UserCheck,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Save,
  UserPlus,
  UserMinus,
  BarChart3,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { rolService, usuarioRolService } from '../api/rolService';
import { usuarioService } from '../api/socioService';

const RolesPage = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  // Estado para nuevo rol
  const [nuevoRol, setNuevoRol] = useState({
    nombre: '',
    descripcion: '',
    permisos: {
      usuarios: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      socios: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      parcelas: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      cultivos: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      ciclos_cultivo: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      cosechas: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      tratamientos: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      analisis_suelo: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      transferencias: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      auditoria: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
      configuracion: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false }
    }
  });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      if (activeTab === 'roles' || activeTab === 'permisos') {
        const rolesResponse = await rolService.getRoles();
        setRoles(rolesResponse.results || []);
      }

      if (activeTab === 'asignacion') {
        const [usuariosResponse, usuarioRolesResponse] = await Promise.all([
          usuarioService.getUsuarios(),
          usuarioRolService.getUsuarioRoles()
        ]);
        setUsuarios(usuariosResponse.results || []);
        setUsuarioRoles(usuarioRolesResponse.results || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRol = async () => {
    try {
      setLoading(true);
      await rolService.crearRolPersonalizado(nuevoRol);
      alert('Rol creado exitosamente');
      setShowCreateModal(false);
      setNuevoRol({
        nombre: '',
        descripcion: '',
        permisos: {
          usuarios: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          socios: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          parcelas: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          cultivos: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          ciclos_cultivo: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          cosechas: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          tratamientos: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          analisis_suelo: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          transferencias: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          reportes: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          auditoria: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false },
          configuracion: { ver: false, crear: false, editar: false, eliminar: false, aprobar: false }
        }
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear rol:', error);
      alert('Error al crear el rol. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarRol = async (usuarioId, rolId) => {
    try {
      setLoading(true);
      await rolService.asignarRolUsuario({ usuario_id: usuarioId, rol_id: rolId });
      alert('Rol asignado exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al asignar rol:', error);
      alert('Error al asignar el rol. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuitarRol = async (usuarioId, rolId) => {
    try {
      // Verificar permisos del usuario actual
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      if (!userData.is_staff) {
        alert('No tienes permisos para quitar roles. Solo los administradores pueden realizar esta acción.');
        return;
      }

      // Validar que los IDs sean válidos
      if (!usuarioId || !rolId || isNaN(usuarioId) || isNaN(rolId)) {
        console.error('IDs inválidos:', { usuarioId, rolId });
        alert('Error: IDs de usuario o rol inválidos.');
        return;
      }

      setLoading(true);
      console.log('Intentando quitar rol:', { usuarioId: parseInt(usuarioId), rolId: parseInt(rolId) });

      // Enviar como números enteros
      await rolService.quitarRolUsuario({
        usuario_id: parseInt(usuarioId),
        rol_id: parseInt(rolId)
      });

      alert('Rol removido exitosamente');
      await cargarDatos();
    } catch (error) {
      console.error('Error al quitar rol:', error);

      // Manejo específico de errores
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Error en la solicitud';
        console.error('Error 400 detallado:', error.response.data);
        alert(`Error en la solicitud: ${errorMsg}`);
      } else if (error.response?.status === 403) {
        alert('No tienes permisos para quitar roles.');
      } else if (error.response?.status === 404) {
        alert('Usuario o rol no encontrado.');
      } else {
        alert('Error al quitar el rol. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePermisoChange = (modulo, accion, valor) => {
    setNuevoRol(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modulo]: {
          ...prev.permisos[modulo],
          [accion]: valor
        }
      }
    }));
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rol.descripcion && rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsuarios = usuarios.filter(usuario =>
    `${usuario.nombres} ${usuario.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modulosPermisos = [
    { key: 'usuarios', label: 'Usuarios', icon: Users },
    { key: 'socios', label: 'Socios', icon: UserCheck },
    { key: 'parcelas', label: 'Parcelas', icon: Settings },
    { key: 'cultivos', label: 'Cultivos', icon: Settings },
    { key: 'ciclos_cultivo', label: 'Ciclos de Cultivo', icon: Settings },
    { key: 'cosechas', label: 'Cosechas', icon: Settings },
    { key: 'tratamientos', label: 'Tratamientos', icon: Settings },
    { key: 'analisis_suelo', label: 'Análisis de Suelo', icon: Settings },
    { key: 'transferencias', label: 'Transferencias', icon: Settings },
    { key: 'reportes', label: 'Reportes', icon: BarChart3 },
    { key: 'auditoria', label: 'Auditoría', icon: Settings },
    { key: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  const accionesPermisos = [
    { key: 'ver', label: 'Ver', icon: Key },
    { key: 'crear', label: 'Crear', icon: Plus },
    { key: 'editar', label: 'Editar', icon: Edit },
    { key: 'eliminar', label: 'Eliminar', icon: Trash2 },
    { key: 'aprobar', label: 'Aprobar', icon: CheckCircle }
  ];

  const tabs = [
    { id: 'roles', label: 'Roles del Sistema', icon: Shield },
    { id: 'permisos', label: 'Gestión de Permisos', icon: Lock },
    { id: 'asignacion', label: 'Asignación de Roles', icon: UserPlus },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Roles y Permisos</h1>
          <p className="text-emerald-100/80 mt-1">
            Administra roles, permisos y asignaciones del sistema
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          {activeTab === 'roles' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Rol</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      {(activeTab === 'roles' || activeTab === 'asignacion') && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'roles' ? "Buscar roles..." : "Buscar usuarios..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Roles List */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Roles del Sistema ({filteredRoles.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-100">Cargando roles...</span>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((rol) => (
                    <div key={rol.id} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>

                          <div>
                            <h3 className="text-white font-semibold flex items-center space-x-2">
                              <span>{rol.nombre}</span>
                              {rol.es_sistema && (
                                <span className="bg-purple-500/20 text-purple-200 text-xs px-2 py-1 rounded-full">
                                  Sistema
                                </span>
                              )}
                            </h3>
                            <p className="text-emerald-200/80 text-sm">{rol.descripcion}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-emerald-200/60 text-xs">
                                Creado: {new Date(rol.creado_en).toLocaleDateString()}
                              </span>
                              {rol.permisos_legibles && (
                                <span className="text-emerald-200/60 text-xs">
                                  Permisos: {Object.keys(rol.permisos_legibles).length} módulos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRol(rol)}
                            className="text-blue-200 hover:text-blue-100 transition-colors"
                            title="Ver permisos"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {!rol.es_sistema && (
                            <>
                              <button className="text-yellow-200 hover:text-yellow-100 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-200 hover:text-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Shield className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
                    <p className="text-emerald-100/60">
                      {searchTerm ? 'No se encontraron roles con ese criterio' : 'No hay roles registrados'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'permisos' && (
        <div className="space-y-6">
          {/* Permisos Matrix */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Matriz de Permisos</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-100">Cargando permisos...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                        Rol / Módulo
                      </th>
                      {accionesPermisos.map(accion => (
                        <th key={accion.key} className="px-4 py-4 text-center text-xs font-medium text-emerald-200 uppercase tracking-wider">
                          {accion.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {roles.map((rol) => (
                      <tr key={rol.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <div>
                              <div className="text-white font-medium">{rol.nombre}</div>
                              <div className="text-emerald-200/60 text-sm">{rol.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        {accionesPermisos.map(accion => (
                          <td key={accion.key} className="px-4 py-4 text-center">
                            {modulosPermisos.some(modulo =>
                              rol.permisos && rol.permisos[modulo.key] && rol.permisos[modulo.key][accion.key]
                            ) ? (
                              <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'asignacion' && (
        <div className="space-y-6">
          {/* Usuarios y sus roles */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Asignación de Roles ({filteredUsuarios.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-emerald-100">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredUsuarios.map((usuario) => {
                  const rolesUsuario = usuarioRoles.filter(ur => ur.usuario === usuario.id);
                  return (
                    <div key={usuario.id} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-white font-semibold">
                              {usuario.nombres} {usuario.apellidos}
                            </h3>
                            <p className="text-blue-200/80 text-sm">@{usuario.usuario}</p>
                            <p className="text-blue-200/60 text-xs">{usuario.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex flex-wrap gap-2">
                            {rolesUsuario.map(ur => {
                              const rol = roles.find(r => r.id === ur.rol);
                              return rol ? (
                                <span key={ur.id} className="bg-emerald-500/20 text-emerald-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                  <Shield className="w-3 h-3" />
                                  <span>{rol.nombre}</span>
                                  <button
                                    onClick={() => handleQuitarRol(usuario.id, rol.id)}
                                    className="ml-1 hover:text-red-300"
                                    title="Quitar rol"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>

                          <button
                            onClick={() => {
                              setSelectedUsuario(usuario);
                              setShowAssignModal(true);
                            }}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Asignar Rol</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reportes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estadísticas de roles */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Estadísticas de Roles</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Total Roles</span>
                  <span className="text-white font-semibold">{roles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Roles del Sistema</span>
                  <span className="text-white font-semibold">{roles.filter(r => r.es_sistema).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Roles Personalizados</span>
                  <span className="text-white font-semibold">{roles.filter(r => !r.es_sistema).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100/80">Total Asignaciones</span>
                  <span className="text-white font-semibold">{usuarioRoles.length}</span>
                </div>
              </div>
            </div>

            {/* Distribución de roles */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Distribución por Rol</span>
              </h3>
              <div className="space-y-3">
                {roles.map(rol => {
                  const count = usuarioRoles.filter(ur => ur.rol === rol.id).length;
                  return (
                    <div key={rol.id} className="flex justify-between items-center">
                      <span className="text-emerald-100/80">{rol.nombre}</span>
                      <span className="text-white font-semibold">{count} usuarios</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Rol */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 border border-white/20 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Crear Rol Personalizado</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del rol"
                  value={nuevoRol.nombre}
                  onChange={(e) => setNuevoRol({...nuevoRol, nombre: e.target.value})}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={nuevoRol.descripcion}
                  onChange={(e) => setNuevoRol({...nuevoRol, descripcion: e.target.value})}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Matriz de permisos */}
              <div>
                <h3 className="text-white font-medium mb-4">Configurar Permisos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-emerald-200 uppercase tracking-wider">
                          Módulo
                        </th>
                        {accionesPermisos.map(accion => (
                          <th key={accion.key} className="px-2 py-3 text-center text-xs font-medium text-emerald-200 uppercase tracking-wider">
                            {accion.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {modulosPermisos.map(modulo => (
                        <tr key={modulo.key} className="hover:bg-white/5">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <modulo.icon className="w-4 h-4 text-emerald-400" />
                              <span className="text-white text-sm">{modulo.label}</span>
                            </div>
                          </td>
                          {accionesPermisos.map(accion => (
                            <td key={accion.key} className="px-2 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={nuevoRol.permisos[modulo.key][accion.key]}
                                onChange={(e) => handlePermisoChange(modulo.key, accion.key, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearRol}
                  disabled={loading || !nuevoRol.nombre}
                  className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Creando...' : 'Crear Rol'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Rol */}
      {showAssignModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Asignar Rol</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-semibold text-xl">
                    {selectedUsuario.nombres.charAt(0)}{selectedUsuario.apellidos.charAt(0)}
                  </span>
                </div>
                <h3 className="text-white font-semibold">
                  {selectedUsuario.nombres} {selectedUsuario.apellidos}
                </h3>
                <p className="text-blue-200/80 text-sm">@{selectedUsuario.usuario}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-200 mb-2">
                  Seleccionar Rol
                </label>
                <select
                  value={selectedRol?.id || ''}
                  onChange={(e) => setSelectedRol(roles.find(r => r.id === parseInt(e.target.value)))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedRol) {
                      handleAsignarRol(selectedUsuario.id, selectedRol.id);
                      setShowAssignModal(false);
                    }
                  }}
                  disabled={!selectedRol || loading}
                  className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Asignar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;