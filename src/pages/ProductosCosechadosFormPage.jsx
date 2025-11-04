// src/pages/ProductoCosechadoFormPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, Info } from 'lucide-react';
import productoCosechadoService, { ESTADOS_PRODUCTO_FALLBACK } from '../api/productoCosechadoService';
import { campaignService } from '../api/campaignService';
import { parcelaService } from '../api/parcelaService';
import { cultivoService } from '../api/cultivoService';
import laborService from '../api/laborService';

const ProductoCosechadoFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // catálogos
  const [estados, setEstados] = useState(ESTADOS_PRODUCTO_FALLBACK);
  const [campanias, setCampanias] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [labores, setLabores] = useState([]);

  // origen (solo para filtrar labores)
  const [origen, setOrigen] = useState(''); // '', 'campania', 'parcela'

  const [form, setForm] = useState({
    fecha_cosecha: '',
    cantidad: '',
    unidad_medida: '',
    calidad: '',
    cultivo: '',     // id del cultivo (string en UI)
    labor: '',
    estado: 'En Almacén',
    lote: '',
    ubicacion_almacen: '',
    campania: '',
    parcela: '',
    observaciones: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({});

  // ---------- Cargar catálogos ----------
  const loadCatalogs = async () => {
    try {
      const est = await productoCosechadoService.getEstadosDisponibles();
      setEstados(est);
    } catch {
      setEstados(ESTADOS_PRODUCTO_FALLBACK);
    }

    try {
      const cs = await campaignService.getCampaigns({ page_size: 1000 });
      const arr = cs?.results || cs || [];
      setCampanias(arr.map(c => ({
        id: String(c.id),
        nombre: c.nombre ?? c.name ?? `Campaña ${c.id}`
      })));
    } catch {
      setCampanias([]);
    }

    try {
      const psRaw = await parcelaService.getParcelas({ page_size: 1000 });
      const arr = psRaw?.results || psRaw || [];
      setParcelas(arr.map(p => ({
        id: String(p.id),
        nombre: p.nombre ?? p.name ?? `Parcela ${p.id}`
      })));
    } catch {
      setParcelas([]);
    }

    // Cultivos
    try {
      const cultRaw = await cultivoService.getCultivos({ page_size: 1000 });
      const arr = cultRaw?.results || cultRaw || [];
      setCultivos(arr.map(c => ({
        id: String(c.id),
        especie: c.especie ?? c.nombre ?? `Cultivo ${c.id}`,
        variedad: c.variedad ?? '',
        parcelaId: c.parcela ? String(c.parcela) : '',
        parcelaNombre: c.parcela_nombre ?? '',
        socioNombre: c.socio_nombre ?? '',
      })));
    } catch {
      setCultivos([]);
    }

    // Labores tipo COSECHA
    try {
      const data = await laborService.getLabores({ labor_tipo: 'COSECHA', page_size: 1000 });
      const rows = data.results || data || [];
      setLabores(rows.map(l => ({
        id: String(l.id),
        etiqueta: `${l.tipo_labor_display || l.labor} • ${l.fecha_labor}${
          l.campania_nombre ? ` • ${l.campania_nombre}` : ''
        }${l.parcela_nombre ? ` • ${l.parcela_nombre}` : ''}`,
        campania: l.campania ? String(l.campania) : '',
        parcela:  l.parcela  ? String(l.parcela)  : '',
      })));
    } catch {
      setLabores([]);
    }
  };

  // ---------- Cargar si es edición ----------
  const loadIfEdit = async () => {
    if (!isEdit) return;
    try {
      const data = await productoCosechadoService.getProductoById(id);
      setForm({
        fecha_cosecha: data.fecha_cosecha ?? '',
        cantidad: String(data.cantidad ?? ''),
        unidad_medida: data.unidad_medida ?? '',
        calidad: data.calidad ?? '',
        cultivo: data.cultivo ? String(data.cultivo) : '',
        labor: data.labor ? String(data.labor) : '',
        estado: data.estado ?? 'En Almacén',
        lote: data.lote != null ? String(data.lote) : '',
        ubicacion_almacen: data.ubicacion_almacen ?? '',
        campania: data.campania ? String(data.campania) : '',
        parcela: data.parcela ? String(data.parcela) : '',
        observaciones: data.observaciones ?? '',
      });
      setOrigen(data.campania ? 'campania' : data.parcela ? 'parcela' : '');
    } catch (e) {
      console.error('No se pudo cargar el producto:', e);
    }
  };

  // ---------- Filtrar labores por origen ----------
  const laboresFiltradas = useMemo(() => {
    if (!origen) return labores;
    if (origen === 'campania' && form.campania) {
      return labores.filter(l => l.campania === form.campania);
    }
    if (origen === 'parcela' && form.parcela) {
      return labores.filter(l => l.parcela === form.parcela);
    }
    return labores;
  }, [labores, origen, form.campania, form.parcela]);

  // ---------- Handlers ----------
  const handleCultivoChange = (e) => {
    const v = e.target.value; // id (string)
    const c = cultivos.find(x => x.id === v);
    setForm(prev => ({
      ...prev,
      cultivo: v,
      // autocompletamos parcela desde el cultivo (si existe)
      parcela: c?.parcelaId || '',
      campania: '', // aseguramos exclusividad
    }));
    if (c?.parcelaId) setOrigen('parcela');
  };

  const handleLaborChange = (e) => {
    const v = e.target.value;
    const l = labores.find(x => x.id === v);
    setForm(prev => {
      const next = { ...prev, labor: v };
      if (l?.campania) {
        next.campania = l.campania;
        next.parcela = '';
        setOrigen('campania');
      } else if (l?.parcela) {
        next.parcela = l.parcela;
        next.campania = '';
        setOrigen('parcela');
      }
      return next;
    });
  };

  const handleCampaniaChange = (e) => {
    const v = e.target.value;
    setOrigen('campania');
    setForm(prev => {
      const laborActual = prev.labor ? labores.find(l => l.id === prev.labor) : null;
      const keepLabor = laborActual && laborActual.campania === v;
      return { ...prev, campania: v, parcela: '', labor: keepLabor ? prev.labor : '' };
    });
  };

  const handleParcelaChange = (e) => {
    const v = e.target.value;
    setOrigen('parcela');
    setForm(prev => {
      const laborActual = prev.labor ? labores.find(l => l.id === prev.labor) : null;
      const keepLabor = laborActual && laborActual.parcela === v;
      return { ...prev, parcela: v, campania: '', labor: keepLabor ? prev.labor : '' };
    });
  };

  // ---------- Validación (alineada con tu modelo) ----------
  const validate = () => {
    const e = {};
    if (!form.fecha_cosecha) e.fecha_cosecha = 'Requerido';
    if (!form.cantidad || Number(form.cantidad) <= 0) e.cantidad = 'Cantidad > 0';
    if (!form.unidad_medida) e.unidad_medida = 'Requerido';
    if (!form.calidad) e.calidad = 'Requerido';
    if (!form.cultivo) e.cultivo = 'Seleccione un cultivo';
    // Tu modelo exige labor (OneToOneField sin null=True)
    if (!form.labor) e.labor = 'Seleccione una labor de cosecha';
    if (!form.estado) e.estado = 'Requerido';
    if (!form.lote || Number(form.lote) <= 0) e.lote = 'Lote > 0';
    if (!form.ubicacion_almacen) e.ubicacion_almacen = 'Requerido';

    // exactamente una entre campania o parcela
    const hasCamp = !!form.campania;
    const hasParc = !!form.parcela;
    if ((hasCamp && hasParc) || (!hasCamp && !hasParc)) {
      e.campania = 'Seleccione SOLO una: Campaña o Parcela (o deje que se autocompletar con el cultivo)';
      e.parcela = 'Seleccione SOLO una: Campaña o Parcela (o deje que se autocompletar con el cultivo)';
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Submit ----------
  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        fecha_cosecha: form.fecha_cosecha,
        cantidad: Number(form.cantidad),
        unidad_medida: form.unidad_medida,
        calidad: form.calidad,
        cultivo: parseInt(form.cultivo, 10),            // <- si tu API usa 'cultivo_id', cambia esta línea por: cultivo_id: parseInt(form.cultivo,10)
        labor: parseInt(form.labor, 10),
        estado: form.estado,
        lote: Number(form.lote),
        ubicacion_almacen: form.ubicacion_almacen,
        campania: form.campania ? parseInt(form.campania, 10) : null,
        parcela: form.parcela ? parseInt(form.parcela, 10) : null,
        observaciones: form.observaciones || '',
      };

      // console.log('Payload enviado:', payload);

      if (isEdit) {
        await productoCosechadoService.updateProducto(id, payload);
      } else {
        await productoCosechadoService.crearProducto(payload);
      }
      navigate('/productos-cosechados');
    } catch (e) {
      const apiErrors = e?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setErrores(Object.fromEntries(
          Object.entries(apiErrors).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])
        ));
      } else {
        alert('No se pudo guardar: ' + (e?.message || ''));
      }
    } finally {
      setSaving(false);
    }
  };

  // ---------- Init ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadCatalogs();
        await loadIfEdit();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Producto Cosechado' : 'Nuevo Producto Cosechado'}</h1>
        <button onClick={() => navigate('/productos-cosechados')} className="text-emerald-300 underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-5">
        {/* Fecha */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">Fecha de cosecha</label>
          <input
            type="date"
            value={form.fecha_cosecha}
            onChange={(e) => setForm({ ...form, fecha_cosecha: e.target.value })}
            disabled={saving}
            className={`w-full px-3 py-2 bg-white/10 border ${errores.fecha_cosecha ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
          />
          {errores.fecha_cosecha && <p className="text-red-300 text-sm mt-1">{errores.fecha_cosecha}</p>}
        </div>

        {/* Cantidad / Medida / Calidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Cantidad</label>
            <input
              type="number" step="0.01" min="0"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.cantidad ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            />
            {errores.cantidad && <p className="text-red-300 text-sm mt-1">{errores.cantidad}</p>}
          </div>
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Unidad de medida</label>
            <input
              type="text" placeholder="kg, t, qq, etc."
              value={form.unidad_medida}
              onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.unidad_medida ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            />
            {errores.unidad_medida && <p className="text-red-300 text-sm mt-1">{errores.unidad_medida}</p>}
          </div>
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Calidad</label>
            <input
              type="text" placeholder="Premium, Estándar…"
              value={form.calidad}
              onChange={(e) => setForm({ ...form, calidad: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.calidad ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            />
            {errores.calidad && <p className="text-red-300 text-sm mt-1">{errores.calidad}</p>}
          </div>
        </div>

        {/* Cultivo y Labor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Cultivo registrado</label>
            <select
              value={form.cultivo}
              onChange={handleCultivoChange}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.cultivo ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            >
              <option value="" className="bg-gray-800">Seleccione…</option>
              {cultivos.map(c => (
                <option key={c.id} value={c.id} className="bg-gray-800">
                  🌱 {c.especie}{c.variedad ? ` — ${c.variedad}` : ''}{c.parcelaNombre ? ` • ${c.parcelaNombre}` : ''}{c.socioNombre ? ` • ${c.socioNombre}` : ''}
                </option>
              ))}
            </select>
            {errores.cultivo && <p className="text-red-300 text-sm mt-1">{errores.cultivo}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-emerald-100/90 text-sm mb-1">Labor de cosecha</label>
              <span className="text-emerald-200/70 text-xs inline-flex items-center gap-1">
                <Info className="w-3 h-3" /> Solo tipo “COSECHA”
              </span>
            </div>
            <select
              value={form.labor}
              onChange={handleLaborChange}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.labor ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            >
              <option value="" className="bg-gray-800">Seleccione…</option>
              {laboresFiltradas.map(l => (
                <option key={l.id} value={l.id} className="bg-gray-800">{l.etiqueta}</option>
              ))}
            </select>
            {errores.labor && <p className="text-red-300 text-sm mt-1">{errores.labor}</p>}
          </div>
        </div>

        {/* Estado • Lote • Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.estado ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            >
              <option value="" className="bg-gray-800">Seleccione…</option>
              {estados.map(e => (
                <option key={e.valor} value={e.valor} className="bg-gray-800">{e.etiqueta}</option>
              ))}
            </select>
            {errores.estado && <p className="text-red-300 text-sm mt-1">{errores.estado}</p>}
          </div>

          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Lote</label>
            <input
              type="number" step="0.01" min="0"
              value={form.lote}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.lote ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            />
            {errores.lote && <p className="text-red-300 text-sm mt-1">{errores.lote}</p>}
          </div>

          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Ubicación en almacén</label>
            <input
              type="text"
              value={form.ubicacion_almacen}
              onChange={(e) => setForm({ ...form, ubicacion_almacen: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.ubicacion_almacen ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            />
            {errores.ubicacion_almacen && <p className="text-red-300 text-sm mt-1">{errores.ubicacion_almacen}</p>}
          </div>
        </div>

        {/* Origen manual (opcional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Campaña (opcional)</label>
            <select
              value={form.campania}
              onChange={handleCampaniaChange}
              disabled={saving || origen === 'parcela'}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.campania ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            >
              <option value="" className="bg-gray-800">—</option>
              {campanias.map(c => <option key={c.id} value={c.id} className="bg-gray-800">{c.nombre}</option>)}
            </select>
            {errores.campania && <p className="text-red-300 text-sm mt-1">{errores.campania}</p>}
          </div>

          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">Parcela (opcional)</label>
            <select
              value={form.parcela}
              onChange={handleParcelaChange}
              disabled={saving || origen === 'campania'}
              className={`w-full px-3 py-2 bg-white/10 border ${errores.parcela ? 'border-red-400' : 'border-white/20'} rounded-lg text-white`}
            >
              <option value="" className="bg-gray-800">—</option>
              {parcelas.map(p => <option key={p.id} value={p.id} className="bg-gray-800">{p.nombre}</option>)}
            </select>
            {errores.parcela && <p className="text-red-300 text-sm mt-1">{errores.parcela}</p>}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">Observaciones</label>
          <textarea
            rows={4}
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            disabled={saving}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-200/60 focus:outline-none focus:border-emerald-400"
            placeholder="Notas adicionales…"
          />
        </div>

        {/* Errores generales */}
        {errores.non_field_errors && <div className="text-red-300 text-sm">{errores.non_field_errors}</div>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/productos-cosechados')}
            disabled={saving}
            className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductoCosechadoFormPage;
