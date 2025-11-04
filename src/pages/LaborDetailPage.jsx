// src/pages/LaborDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Calendar, CheckCircle, Edit, Loader2, PlayCircle, Trash2, XCircle } from 'lucide-react';
import laborService from '../api/laborService';
import { getEstadoBadgeVariant, getTipoLaborBadgeVariant } from '../utils/laborUtils';

const Badge = ({ children, variant }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${variant}/20 text-${variant}-200`}>
    {children}
  </span>
);

const LaborDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [labor, setLabor] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (s) => new Date(s).toLocaleDateString('es-ES');

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await laborService.getLaborById(id);
      setLabor(data);
    } catch (e) {
      console.error('Error al cargar labor:', e);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (estado) => {
    try {
      await laborService.cambiarEstado(id, estado);
      await cargar();
    } catch (e) {
      alert('No se pudo cambiar el estado: ' + (e?.response?.data?.error || e.message));
    }
  };

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar esta labor?')) return;
    try {
      await laborService.deleteLabor(id);
      navigate('/labores');
    } catch (e) {
      alert('No se pudo eliminar: ' + (e?.response?.data?.error || e.message));
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-400" />
      </div>
    );
  }

  if (!labor) {
    return (
      <div className="text-center py-16">
        <p className="text-emerald-100/80">No se encontró la labor solicitada.</p>
        <Link to="/labores" className="text-emerald-300 underline">Volver al listado</Link>
      </div>
    );
  }

  const estadoVariant = getEstadoBadgeVariant(labor.estado);
  const tipoVariant = getTipoLaborBadgeVariant(labor.labor);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Detalle de Labor #{labor.id}</h1>
          <p className="text-emerald-100/80 mt-1">Tipo:&nbsp;
            <Badge variant={tipoVariant}>{labor.tipo_labor_display || labor.labor}</Badge>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/labores/editar/${labor.id}`)}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 px-3 py-2 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={eliminar}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-2 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1 */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Información</h2>
          <div className="space-y-3 text-emerald-100/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span><b>Fecha:</b> {formatDate(labor.fecha_labor)}</span>
            </div>
            <div>
              <b>Estado:</b> <Badge variant={estadoVariant}>{labor.estado.replace('_', ' ')}</Badge>
            </div>
            <div>
              <b>Campaña:</b> {labor.campania_nombre || <em className="opacity-60">—</em>}
            </div>
            <div>
              <b>Parcela:</b> {labor.parcela_nombre || <em className="opacity-60">—</em>}
            </div>
            <div>
              <b>Socio:</b> {labor.socio_nombre || <em className="opacity-60">—</em>}
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Observaciones</h2>
          <p className="text-emerald-100/90 whitespace-pre-wrap">
            {labor.observaciones || <em className="opacity-60">Sin observaciones</em>}
          </p>
        </div>

        {/* Col 3 */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Meta</h2>
          <div className="space-y-2 text-emerald-100/90">
            <div><b>Creado:</b> {formatDate(labor.creado_en)}</div>
            <div><b>Actualizado:</b> {formatDate(labor.actualizado_en)}</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {labor.estado !== 'COMPLETADA' && (
              <button
                onClick={() => cambiarEstado('COMPLETADA')}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Completar
              </button>
            )}
            {labor.estado !== 'EN_PROCESO' && labor.estado !== 'COMPLETADA' && (
              <button
                onClick={() => cambiarEstado('EN_PROCESO')}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <PlayCircle className="w-4 h-4" /> En proceso
              </button>
            )}
            {labor.estado !== 'CANCELADA' && (
              <button
                onClick={() => cambiarEstado('CANCELADA')}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={() => navigate('/labores')} className="text-emerald-300 underline">
          ← Volver al listado
        </button>
      </div>
    </div>
  );
};

export default LaborDetailPage;
