import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { campaignService } from '../../api/campaignService';

const CampaignForm = ({ campaign, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    meta_produccion: '',
    unidad_meta: 'kg',
    estado: 'PLANIFICADA',
    descripcion: '',
    presupuesto: '',
    responsable: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        nombre: campaign.nombre || '',
        fecha_inicio: campaign.fecha_inicio || '',
        fecha_fin: campaign.fecha_fin || '',
        meta_produccion: campaign.meta_produccion || '',
        unidad_meta: campaign.unidad_meta || 'kg',
        estado: campaign.estado || 'PLANIFICADA',
        descripcion: campaign.descripcion || '',
        presupuesto: campaign.presupuesto || '',
        responsable: campaign.responsable || '',
      });
    }
  }, [campaign]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.meta_produccion || parseFloat(formData.meta_produccion) <= 0) {
      newErrors.meta_produccion = 'La meta de producción debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar (limpiar campos vacíos)
      const dataToSend = {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        meta_produccion: parseFloat(formData.meta_produccion),
        unidad_meta: formData.unidad_meta,
        estado: formData.estado,
      };

      if (formData.descripcion) {
        dataToSend.descripcion = formData.descripcion;
      }

      if (formData.presupuesto) {
        dataToSend.presupuesto = parseFloat(formData.presupuesto);
      }

      if (formData.responsable) {
        dataToSend.responsable = parseInt(formData.responsable);
      }

      if (campaign) {
        await campaignService.updateCampaign(campaign.id, dataToSend);
        alert('Campaña actualizada exitosamente');
      } else {
        await campaignService.createCampaign(dataToSend);
        alert('Campaña creada exitosamente');
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar campaña:', error);
      
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const newErrors = {};
        
        Object.keys(backendErrors).forEach(key => {
          if (Array.isArray(backendErrors[key])) {
            newErrors[key] = backendErrors[key][0];
          } else {
            newErrors[key] = backendErrors[key];
          }
        });
        
        setErrors(newErrors);
        alert('Error al guardar: ' + JSON.stringify(backendErrors));
      } else {
        alert('Error al guardar la campaña');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-gradient-to-r from-emerald-900 to-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-200" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {campaign ? 'Editar Campaña' : 'Nueva Campaña'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Nombre de la Campaña *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full bg-white/10 border ${errors.nombre ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
              placeholder="Ej: Campaña Invierno 2025"
            />
            {errors.nombre && (
              <p className="text-red-300 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${errors.fecha_inicio ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400`}
              />
              {errors.fecha_inicio && (
                <p className="text-red-300 text-sm mt-1">{errors.fecha_inicio}</p>
              )}
            </div>

            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                className={`w-full bg-white/10 border ${errors.fecha_fin ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400`}
              />
              {errors.fecha_fin && (
                <p className="text-red-300 text-sm mt-1">{errors.fecha_fin}</p>
              )}
            </div>
          </div>

          {/* Meta de producción y unidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Meta de Producción *
              </label>
              <input
                type="number"
                name="meta_produccion"
                value={formData.meta_produccion}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full bg-white/10 border ${errors.meta_produccion ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                placeholder="Ej: 15000"
              />
              {errors.meta_produccion && (
                <p className="text-red-300 text-sm mt-1">{errors.meta_produccion}</p>
              )}
            </div>

            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Unidad de Medida
              </label>
              <select
                name="unidad_meta"
                value={formData.unidad_meta}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="ton">Toneladas (ton)</option>
                <option value="qq">Quintales (qq)</option>
                <option value="unidades">Unidades</option>
              </select>
            </div>
          </div>

          {/* Estado y Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="PLANIFICADA">Planificada</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-100 text-sm font-medium mb-2">
                Presupuesto (Bs.)
              </label>
              <input
                type="number"
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej: 50000"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Descripción detallada de la campaña..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-200"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;
