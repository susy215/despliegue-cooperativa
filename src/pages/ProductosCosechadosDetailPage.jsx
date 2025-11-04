// src/pages/ProductoCosechadoDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Calendar, CheckCircle, Edit, Loader2, PlayCircle, Trash2, XCircle, RefreshCw, DollarSign, Warehouse } from 'lucide-react';
import productoCosechadoService from '../api/productoCosechadoService';

const formatDate = (s) => (s ? new Date(s).toLocaleDateString('es-ES') : '—');

const Badge = ({ children, color }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color || 'bg-emerald-500/20 text-emerald-200'}`}>
    {children}
  </span>
);

const estadoColor = (estado) => {
  switch (estado) {
    case 'En Almacén': return 'bg-green-500/20 text-green-200';
    case 'Vendido': return 'bg-blue-500/20 text-blue-200';
    case 'Procesado': return 'bg-purple-500/20 text-purple-200';
    case 'Vencido': return 'bg-red-500/20 text-red-200';
    case 'En revision': return 'bg-yellow-500/20 text-yellow-200';
    default: return 'bg-gray-500/20 text-gray-200';
  }
};

const ProductoCosechadoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prod, setProd] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await productoCosechadoService.getProductoById(id);
      setProd(data);
    } catch (e) {
      console.error('Error al cargar producto:', e);
    } finally {
      setLoading(false);
    }
  };

  const vender = async () => {
    const cantidad = prompt('Cantidad a vender:');
    if (!cantidad || isNaN(Number(cantidad))) return;
    try {
      await productoCosechadoService.venderProducto(id, Number(cantidad), 'Venta desde detalle');
      await cargar();
    } catch (e) {
      alert('No se pudo vender: ' + (e?.response?.data?.detail || e.message));
    }
  };

  const cambiarEstado = async () => {
    const nuevo = prompt(`Estado actual: ${prod.estado}\nNuevo estado:`, prod.estado);
    if (!nuevo || nuevo === prod.estado) return;
    try {
      await productoCosechadoService.cambiarEstado(id, nuevo, 'Cambio desde detalle');
      await cargar();
    } catch (e) {
      alert('No se pudo cambiar el estado: ' + (e?.response?.data?.detail || e.message));
    }
  };

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await productoCosechadoService.deleteProducto(id);
      navigate('/productos-cosechados');
    } catch (e) {
      alert('No se pudo eliminar: ' + (e?.response?.data?.detail || e.message));
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

  if (!prod) {
    return (
      <div className="text-center py-16">
        <p className="text-emerald-100/80">No se encontró el producto solicitado.</p>
        <Link to="/productos-cosechados" className="text-emerald-300 underline">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Producto Cosechado #{prod.id}</h1>
          <p className="text-emerald-100/80 mt-1">
            {prod.cultivo_especie}{prod.cultivo_variedad ? ` – ${prod.cultivo_variedad}` : ''} • {prod.calidad}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate(`/productos-cosechados/editar/${prod.id}`)} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 px-3 py-2 rounded-lg" title="Editar">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={eliminar} className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-2 rounded-lg" title="Eliminar">
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
              <span><b>Fecha:</b> {formatDate(prod.fecha_cosecha)}</span>
            </div>
            <div><b>Estado:</b> <Badge color={estadoColor(prod.estado)}>{prod.estado}</Badge></div>
            <div><b>Origen:</b> {prod.origen_display || prod.campania_nombre || prod.parcela_nombre || '—'}</div>
            <div><b>Labor:</b> {prod.labor_nombre || prod.labor || '—'}</div>
            <div><b>Ubicación:</b> {prod.ubicacion_almacen || '—'}</div>
            <div><b>Lote:</b> {prod.lote}</div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cantidades</h2>
          <div className="space-y-2 text-emerald-100/90">
            <div><b>Cantidad:</b> {prod.cantidad} {prod.unidad_medida}</div>
            {typeof prod.dias_en_almacen === 'number' && (
              <div><b>Días en almacén:</b> {prod.dias_en_almacen}</div>
            )}
            {prod.esta_proximo_vencer && (
              <div><Badge color="bg-yellow-500/20 text-yellow-200">Próximo a vencer</Badge></div>
            )}
            {prod.puede_vender && (
              <div className="pt-2">
                <button onClick={vender} className="bg-green-500/20 hover:bg-green-500/30 text-green-200 px-3 py-2 rounded-lg inline-flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Vender
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Col 3 */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Observaciones y meta</h2>
          <p className="text-emerald-100/90 whitespace-pre-wrap min-h-[72px]">
            {prod.observaciones || <em className="opacity-60">Sin observaciones</em>}
          </p>

          <div className="space-y-2 text-emerald-100/90 mt-4">
            <div><b>Creado:</b> {formatDate(prod.creado_en)}</div>
            <div><b>Actualizado:</b> {formatDate(prod.actualizado_en)}</div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button onClick={cambiarEstado} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-3 py-2 rounded-lg flex items-center justify-center gap-1">
              <RefreshCw className="w-4 h-4" /> Cambiar estado
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button onClick={() => navigate('/productos-cosechados')} className="text-emerald-300 underline">
          ← Volver al listado
        </button>
      </div>
    </div>
  );
};

export default ProductoCosechadoDetailPage;
