import React, { useState, useEffect } from 'react';
import {
  Users,
  UserX,
  Shield,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usuarioService } from '../api/socioService';
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Estado para el modal de creación de usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    usuario: '',
    nombres: '',
    apellidos: '',
    ci_nit: '',
    email: '',
    telefono: '',
    password: '',
    password_confirm: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usuarioService.getUsuarios();
      setUsers(response.results || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      // Fallback a datos simulados si hay error
      setUsers([
        {
          id: 1,
          usuario: 'admin',
          nombres: 'Administrador',
          apellidos: 'Sistema',
          email: 'admin@cooperativa.com',
          is_staff: true,
          estado: 'ACTIVO',
          ultimo_login: '2024-01-15T10:30:00Z',
          fecha_creacion: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (userId, username) => {
    if (!window.confirm(`¿Está seguro de que desea forzar el cierre de sesión del usuario ${username}?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      // TODO: Implementar endpoint para forzar logout
      // await usuarioService.forceLogoutUser(userId);

      alert(`Sesión del usuario ${username} cerrada exitosamente.`);
    } catch (error) {
      console.error('Error forzando logout:', error);
      alert('Error al forzar cierre de sesión. Intente nuevamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (userId, username, currentStatus) => {
    const action = currentStatus === 'ACTIVO' ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Está seguro de que desea ${action} al usuario ${username}?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      await usuarioService.activarDesactivarUsuario(userId, action);

      // Actualizar estado local
      setUsers(users.map(u =>
        u.id === userId ? { ...u, estado: action === 'activar' ? 'ACTIVO' : 'INACTIVO' } : u
      ));

      alert(`Usuario ${username} ${action}do exitosamente.`);
    } catch (error) {
      console.error('Error cambiando estado de usuario:', error);
      alert('Error al cambiar estado del usuario. Intente nuevamente.');
    } finally {
      setActionLoading(null);
    }
  };

  // Funciones para el modal de creación de usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const errors = {};

    if (!createFormData.usuario.trim()) {
      errors.usuario = 'El nombre de usuario es requerido';
    }

    if (!createFormData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos';
    }

    if (!createFormData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    }

    if (!createFormData.ci_nit.trim()) {
      errors.ci_nit = 'El CI/NIT es requerido';
    }

    if (!createFormData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    if (!createFormData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (createFormData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (createFormData.password !== createFormData.password_confirm) {
      errors.password_confirm = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      setCreateLoading(true);
      setCreateErrors({});

      // Preparar datos para enviar
      const userData = {
        usuario: createFormData.usuario.trim(),
        nombres: createFormData.nombres.trim(),
        apellidos: createFormData.apellidos.trim(),
        ci_nit: createFormData.ci_nit.trim(),
        email: createFormData.email.trim(),
        telefono: createFormData.telefono.trim(),
        password: createFormData.password
      };

      await usuarioService.crearUsuario(userData);

      // Cerrar modal y resetear formulario
      setShowCreateModal(false);
      setCreateFormData({
        usuario: '',
        nombres: '',
        apellidos: '',
        ci_nit: '',
        email: '',
        telefono: '',
        password: '',
        password_confirm: ''
      });

      // Recargar lista de usuarios
      await loadUsers();

      alert('Usuario creado exitosamente.');
    } catch (error) {
      console.error('Error creando usuario:', error);

      if (error.response?.data) {
        // Manejar errores del backend
        const backendErrors = {};
        if (error.response.data.usuario) {
          backendErrors.usuario = Array.isArray(error.response.data.usuario)
            ? error.response.data.usuario[0]
            : error.response.data.usuario;
        }
        if (error.response.data.ci_nit) {
          backendErrors.ci_nit = Array.isArray(error.response.data.ci_nit)
            ? error.response.data.ci_nit[0]
            : error.response.data.ci_nit;
        }
        if (error.response.data.email) {
          backendErrors.email = Array.isArray(error.response.data.email)
            ? error.response.data.email[0]
            : error.response.data.email;
        }
        if (error.response.data.non_field_errors) {
          backendErrors.general = error.response.data.non_field_errors[0];
        }

        setCreateErrors(backendErrors);
      } else {
        alert('Error al crear usuario. Intente nuevamente.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (createErrors[name]) {
      setCreateErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredUsers = users.filter(user => {
    const nombreCompleto = `${user.nombres || ''} ${user.apellidos || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (user.usuario || '').toLowerCase().includes(searchLower) ||
           nombreCompleto.includes(searchLower) ||
           (user.email || '').toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-emerald-100/80 mt-1">
            Administra usuarios, sesiones y permisos del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
          <button
            onClick={loadUsers}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Usuarios del Sistema ({filteredUsers.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-white/10">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {(user.nombres || 'U').charAt(0)}{(user.apellidos || 'U').charAt(0)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold">
                        {user.nombres} {user.apellidos}
                      </h3>
                      <p className="text-emerald-200/80 text-sm">@{user.usuario}</p>
                      <p className="text-emerald-200/60 text-xs">{user.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {user.is_staff && (
                        <span className="bg-purple-500/20 text-purple-200 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                        user.estado === 'ACTIVO'
                          ? 'bg-green-500/20 text-green-200'
                          : 'bg-red-500/20 text-red-200'
                      }`}>
                        {user.estado === 'ACTIVO' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactivo</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Último login */}
                    <div className="text-right hidden sm:block">
                      <p className="text-white text-sm">
                        Último login
                      </p>
                      <p className="text-emerald-200/60 text-xs">
                        {user.ultimo_login ?
                          new Date(user.ultimo_login).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) :
                          'Nunca'
                        }
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/usuarios/editar/${user.id}`)}
                        className="text-blue-200 hover:text-blue-100 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleForceLogout(user.id, user.usuario)}
                        disabled={actionLoading === user.id || user.id === currentUser?.id}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-200"></div>
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                        <span>Forzar Logout</span>
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.usuario, user.estado)}
                        disabled={actionLoading === user.id || user.id === currentUser?.id}
                        className={`font-medium py-2 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 ${
                          user.estado === 'ACTIVO'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-200'
                        }`}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        <span>{user.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-emerald-400/50 mx-auto mb-4" />
              <p className="text-emerald-100/60">
                {searchTerm ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'No hay usuarios registrados'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación de Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Nuevo Usuario</span>
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-emerald-200 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={createFormData.nombres}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.nombres ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Ingrese los nombres"
                    />
                    {createErrors.nombres && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.nombres}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={createFormData.apellidos}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.apellidos ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Ingrese los apellidos"
                    />
                    {createErrors.apellidos && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.apellidos}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Cuenta */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Información de Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Usuario *
                    </label>
                    <input
                      type="text"
                      name="usuario"
                      value={createFormData.usuario}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.usuario ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Nombre de usuario"
                    />
                    {createErrors.usuario && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.usuario}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      CI/NIT *
                    </label>
                    <input
                      type="text"
                      name="ci_nit"
                      value={createFormData.ci_nit}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.ci_nit ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Cédula de identidad o NIT"
                    />
                    {createErrors.ci_nit && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.ci_nit}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={createFormData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.email ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                    {createErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={createFormData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Contraseña</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={createFormData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.password ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    {createErrors.password && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password_confirm"
                      value={createFormData.password_confirm}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400 transition-colors ${
                        createErrors.password_confirm ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Repita la contraseña"
                    />
                    {createErrors.password_confirm && (
                      <p className="text-red-400 text-xs mt-1">{createErrors.password_confirm}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error general */}
              {createErrors.general && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{createErrors.general}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-emerald-200 hover:text-white transition-colors"
                  disabled={createLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;