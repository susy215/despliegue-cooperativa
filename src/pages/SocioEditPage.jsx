import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { socioService } from '../api/socioService';

const SocioEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Datos del usuario
    usuario: {
      usuario: '',
      nombres: '',
      apellidos: '',
      ci_nit: '',
      email: '',
      telefono: '',
      estado: 'ACTIVO',
      is_staff: false
    },
    // Datos del socio
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    sexo: '',
    estado_civil: '',
    comunidad_id: '',
    fecha_ingreso: '',
    estado: 'ACTIVO'
  });

  useEffect(() => {
    cargarSocio();
  }, [id]);

  const cargarSocio = async () => {
    try {
      setLoadingData(true);
      const response = await socioService.getSocioById(id);

      // Cargar datos del socio
      setFormData({
        usuario: {
          usuario: response.usuario?.usuario || '',
          nombres: response.usuario?.nombres || '',
          apellidos: response.usuario?.apellidos || '',
          ci_nit: response.usuario?.ci_nit || '',
          email: response.usuario?.email || '',
          telefono: response.usuario?.telefono || '',
          estado: response.usuario?.estado || 'ACTIVO',
          is_staff: response.usuario?.is_staff || false
        },
        telefono: response.telefono || '',
        direccion: response.direccion || '',
        fecha_nacimiento: response.fecha_nacimiento || '',
        sexo: response.sexo || '',
        estado_civil: response.estado_civil || '',
        comunidad_id: response.comunidad?.id || '',
        fecha_ingreso: response.fecha_ingreso || '',
        estado: response.estado || 'ACTIVO'
      });
    } catch (error) {
      console.error('Error al cargar socio:', error);
      alert('Error al cargar los datos del socio');
      navigate('/socios');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Limpiar error del campo si existe
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const validateField = async (field, value) => {
    if (!value) return;

    try {
      setValidating(true);
      const params = { [field]: value };
      const response = await socioService.validarDatosSocio(params);

      if (!response.valido) {
        setErrors(prev => ({
          ...prev,
          [field]: response.errores[field]
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error en validación:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const newErrors = {};

    if (!formData.usuario.usuario) newErrors['usuario.usuario'] = 'Usuario es requerido';
    if (!formData.usuario.nombres) newErrors['usuario.nombres'] = 'Nombres son requeridos';
    if (!formData.usuario.apellidos) newErrors['usuario.apellidos'] = 'Apellidos son requeridos';
    if (!formData.usuario.ci_nit) newErrors['usuario.ci_nit'] = 'CI/NIT es requerido';
    if (!formData.usuario.email) newErrors['usuario.email'] = 'Email es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para el backend
      const socioData = {
        usuario: formData.usuario,
        telefono: formData.telefono || formData.usuario.telefono,
        direccion: formData.direccion,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo,
        estado_civil: formData.estado_civil,
        comunidad_id: formData.comunidad_id || null,
        fecha_ingreso: formData.fecha_ingreso,
        estado: formData.estado
      };

      await socioService.updateSocio(id, socioData);

      // Redirigir a la lista de socios
      navigate('/socios');
    } catch (error) {
      console.error('Error al actualizar socio:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert('Error al actualizar el socio. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-emerald-100">Cargando datos del socio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/socios')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Socio</h1>
          <p className="text-emerald-100/80 mt-1">
            Modifique la información del socio
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
                value={formData.usuario.usuario}
                onChange={(e) => handleInputChange('usuario', 'usuario', e.target.value)}
                onBlur={(e) => validateField('usuario', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Nombre de usuario"
              />
              {errors['usuario.usuario'] && (
                <p className="mt-1 text-sm text-red-400">{errors['usuario.usuario']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                value={formData.usuario.nombres}
                onChange={(e) => handleInputChange('usuario', 'nombres', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Nombres completos"
              />
              {errors['usuario.nombres'] && (
                <p className="mt-1 text-sm text-red-400">{errors['usuario.nombres']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                value={formData.usuario.apellidos}
                onChange={(e) => handleInputChange('usuario', 'apellidos', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Apellidos completos"
              />
              {errors['usuario.apellidos'] && (
                <p className="mt-1 text-sm text-red-400">{errors['usuario.apellidos']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                CI/NIT *
              </label>
              <input
                type="text"
                value={formData.usuario.ci_nit}
                onChange={(e) => handleInputChange('usuario', 'ci_nit', e.target.value)}
                onBlur={(e) => validateField('ci_nit', formData.usuario.ci_nit)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="1234567890"
              />
              {errors['usuario.ci_nit'] && (
                <p className="mt-1 text-sm text-red-400">{errors['usuario.ci_nit']}</p>
              )}
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
                  value={formData.usuario.email}
                  onChange={(e) => handleInputChange('usuario', 'email', e.target.value)}
                  onBlur={(e) => validateField('email', formData.usuario.email)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors['usuario.email'] && (
                <p className="mt-1 text-sm text-red-400">{errors['usuario.email']}</p>
              )}
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
                  value={formData.usuario.telefono}
                  onChange={(e) => handleInputChange('usuario', 'telefono', e.target.value)}
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
                value={formData.usuario.estado}
                onChange={(e) => handleInputChange('usuario', 'estado', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>

            <div className="flex items-center space-x-3 md:col-span-2">
              <input
                type="checkbox"
                id="is_staff"
                checked={formData.usuario.is_staff}
                onChange={(e) => handleInputChange('usuario', 'is_staff', e.target.checked)}
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

        {/* Información del Socio */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Información del Socio</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Teléfono adicional
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="+591 87654321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Sexo
              </label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Seleccionar sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Estado Civil
              </label>
              <select
                value={formData.estado_civil}
                onChange={(e) => setFormData({...formData, estado_civil: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Seleccionar estado civil</option>
                <option value="SOLTERO">Soltero/a</option>
                <option value="CASADO">Casado/a</option>
                <option value="DIVORCIADO">Divorciado/a</option>
                <option value="VIUDO">Viudo/a</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-emerald-200 mb-2">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-300/60" />
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/socios')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || validating}
            className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando...' : 'Actualizar Socio'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocioEditPage;