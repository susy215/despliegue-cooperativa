import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, Shield, CheckCircle, XCircle } from 'lucide-react';
import { usuarioService } from '../api/socioService';

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    usuario: '',
    nombres: '',
    apellidos: '',
    ci_nit: '',
    email: '',
    telefono: '',
    is_staff: false,
    estado: 'ACTIVO'
  });

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      setLoadingData(true);
      const response = await usuarioService.getUsuarioById(id);

      setFormData({
        usuario: response.usuario || '',
        nombres: response.nombres || '',
        apellidos: response.apellidos || '',
        ci_nit: response.ci_nit || '',
        email: response.email || '',
        telefono: response.telefono || '',
        is_staff: response.is_staff || false,
        estado: response.estado || 'ACTIVO'
      });
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      alert('Error al cargar los datos del usuario');
      navigate('/usuarios');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const newErrors = {};

    if (!formData.usuario) newErrors.usuario = 'Usuario es requerido';
    if (!formData.nombres) newErrors.nombres = 'Nombres son requeridos';
    if (!formData.apellidos) newErrors.apellidos = 'Apellidos son requeridos';
    if (!formData.ci_nit) newErrors.ci_nit = 'CI/NIT es requerido';
    if (!formData.email) newErrors.email = 'Email es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await usuarioService.updateUsuario(id, formData);

      alert('Usuario actualizado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert('Error al actualizar el usuario. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando datos del usuario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/usuarios')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Usuario</h1>
          <p className="text-emerald-100/80 mt-1">
            Modifique la información del usuario
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Usuario */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Información del Usuario</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Nombre de usuario"
              />
              {errors.usuario && (
                <p className="mt-1 text-sm text-red-400">{errors.usuario}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => handleInputChange('nombres', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Nombres completos"
              />
              {errors.nombres && (
                <p className="mt-1 text-sm text-red-400">{errors.nombres}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => handleInputChange('apellidos', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Apellidos completos"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-400">{errors.apellidos}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                CI/NIT *
              </label>
              <input
                type="text"
                value={formData.ci_nit}
                onChange={(e) => handleInputChange('ci_nit', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="1234567890"
              />
              {errors.ci_nit && (
                <p className="mt-1 text-sm text-red-400">{errors.ci_nit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="+591 12345678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_staff"
                checked={formData.is_staff}
                onChange={(e) => handleInputChange('is_staff', e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <label htmlFor="is_staff" className="text-sm font-medium text-emerald-200">
                  Administrador
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Actualizar Usuario'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditPage;