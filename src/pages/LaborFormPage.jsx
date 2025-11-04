// src/pages/LaborFormPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import laborService from '../api/laborService';
import { campaignService } from '../api/campaignService';
import { parcelaService } from '../api/parcelaService';

// Fallbacks por si el endpoint de catálogo no responde
const TIPOS_LABOR_FALLBACK = [
  { valor: 'SIEMBRA', etiqueta: 'Siembra' },
  { valor: 'RIEGO', etiqueta: 'Riego' },
  { valor: 'FERTILIZACION', etiqueta: 'Fertilización' },
  { valor: 'COSECHA', etiqueta: 'Cosecha' },
  { valor: 'FUMIGACION', etiqueta: 'Fumigación' },
];

const ESTADOS_FALLBACK = [
  { valor: 'PLANIFICADA', etiqueta: 'Planificada' },
  { valor: 'EN_PROCESO', etiqueta: 'En Proceso' },
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
];

// Normaliza respuestas de choices: [[value,label]] | [{valor,etiqueta}] | string[]
function normalizeChoices(raw, fallback) {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return fallback;
  const first = raw[0];

  // Pares [value, label]
  if (Array.isArray(first)) {
    return raw.map(([value, label]) => ({
      valor: String(value),
      etiqueta: label ?? String(value),
    }));
  }

  // Objetos {valor, etiqueta} o similares
  if (typeof first === 'object' && first !== null) {
    return raw
      .map(o => ({
        valor: String(o.valor ?? o.value ?? o.key ?? ''),
        etiqueta: String(o.etiqueta ?? o.label ?? o.value ?? o.key ?? ''),
      }))
      .filter(x => x.valor);
  }

  // Strings simples
  if (typeof first === 'string') {
    return raw.map(s => ({ valor: String(s), etiqueta: String(s) }));
  }

  return fallback;
}

const LaborFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Catálogos
  const [tipos, setTipos] = useState(TIPOS_LABOR_FALLBACK);
  const [estados, setEstados] = useState(ESTADOS_FALLBACK);
  const [campanias, setCampanias] = useState([]); // [{id, nombre}]
  const [parcelas, setParcelas] = useState([]);   // [{id, nombre}]

  // Form
  const [form, setForm] = useState({
    fecha_labor: '',
    labor: '',
    estado: 'PLANIFICADA',
    campania: '', // ID como string (para <select>)
    parcela: '',  // ID como string (para <select>)
    observaciones: '',
  });

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errores, setErrores] = useState({});

  // Cargar catálogos
  const loadCatalogs = async () => {
    const [tRes, eRes] = await Promise.allSettled([
      laborService.getTiposLabor(),
      laborService.getEstadosLabor(),
    ]);

    setTipos(
      tRes.status === 'fulfilled'
        ? normalizeChoices(tRes.value, TIPOS_LABOR_FALLBACK)
        : TIPOS_LABOR_FALLBACK
    );

    setEstados(
      eRes.status === 'fulfilled'
        ? normalizeChoices(eRes.value, ESTADOS_FALLBACK)
        : ESTADOS_FALLBACK
    );

    try {
      const cs = await campaignService.getCampaigns({ page_size: 1000 });
      const arr = cs?.results || cs || [];
      setCampanias(
        arr.map(c => ({
          id: String(c.id),
          nombre: c.nombre ?? c.name ?? `Campaña ${c.id}`,
        }))
      );
    } catch (err) {
      console.warn('[LaborForm] campañas vacías:', err?.message);
      setCampanias([]);
    }

    try {
      const psRaw = await parcelaService.getParcelas({ page_size: 1000 });
      const ps = psRaw?.results || psRaw || [];
      setParcelas(
        ps.map(p => ({
          id: String(p.id),
          nombre: p.nombre ?? p.name ?? `Parcela ${p.id}`,
        }))
      );
    } catch (err) {
      console.warn('[LaborForm] parcelas vacías:', err?.message);
      setParcelas([]);
    }
  };

  // Cargar datos si es edición
  const loadIfEdit = async () => {
    if (!isEdit) return;
    try {
      const data = await laborService.getLaborById(id);
      setForm({
        fecha_labor: data.fecha_labor ?? '',
        labor: String(data.labor ?? ''),
        estado: String(data.estado ?? 'PLANIFICADA'),
        // Si el backend devuelve objeto anidado o un ID plano, tomamos el ID
        campania: data?.campania?.id
          ? String(data.campania.id)
          : data.campania
          ? String(data.campania)
          : '',
        parcela: data?.parcela?.id
          ? String(data.parcela.id)
          : data.parcela
          ? String(data.parcela)
          : '',
        observaciones: data.observaciones ?? '',
      });
    } catch (err) {
      console.error('[LaborForm] no se pudo cargar la labor:', err?.message);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fecha_labor) errs.fecha_labor = 'Requerido';
    if (!form.labor) errs.labor = 'Requerido';
    if (!form.estado) errs.estado = 'Requerido';
    if (!form.campania && !form.parcela) {
      errs.campania = 'Seleccione campaña o parcela';
      errs.parcela = 'Seleccione campaña o parcela';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        fecha_labor: form.fecha_labor,
        labor: form.labor,
        estado: form.estado,
        campania: form.campania ? Number(form.campania) : null,
        parcela: form.parcela ? Number(form.parcela) : null,
        observaciones: form.observaciones || '',
      };

      if (isEdit) {
        await laborService.updateLabor(id, payload);
      } else {
        await laborService.crearLabor(payload);
      }
      navigate('/labores');
    } catch (err) {
      const apiErrors = err?.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setErrores(
          Object.fromEntries(
            Object.entries(apiErrors).map(([k, v]) => [
              k,
              Array.isArray(v) ? v.join(', ') : String(v),
            ])
          )
        );
      } else {
        alert('No se pudo guardar. ' + (err?.message || ''));
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        await loadCatalogs();
        await loadIfEdit();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? 'Editar Labor' : 'Nueva Labor'}
        </h1>
        <button
          onClick={() => navigate('/labores')}
          className="text-emerald-300 underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-5"
      >
        {/* Fecha */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">
            Fecha de la labor
          </label>
          <input
            type="date"
            value={form.fecha_labor}
            onChange={(e) =>
              setForm({ ...form, fecha_labor: e.target.value })
            }
            disabled={saving}
            className={`w-full px-3 py-2 bg-white/10 border ${
              errores.fecha_labor ? 'border-red-400' : 'border-white/20'
            } rounded-lg text-white focus:outline-none focus:border-emerald-400`}
          />
          {errores.fecha_labor && (
            <p className="text-red-300 text-sm mt-1">{errores.fecha_labor}</p>
          )}
        </div>

        {/* Tipo de labor */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">
            Tipo de labor
          </label>
          <select
            value={form.labor}
            onChange={(e) => setForm({ ...form, labor: e.target.value })}
            disabled={saving}
            className={`w-full px-3 py-2 bg-white/10 border ${
              errores.labor ? 'border-red-400' : 'border-white/20'
            } rounded-lg text-white focus:outline-none focus:border-emerald-400`}
          >
            <option value="" className="bg-gray-800">
              Seleccione…
            </option>
            {tipos.map((t) => (
              <option key={t.valor} value={t.valor} className="bg-gray-800">
                {t.etiqueta}
              </option>
            ))}
          </select>
          {errores.labor && (
            <p className="text-red-300 text-sm mt-1">{errores.labor}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">
            Estado
          </label>
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            disabled={saving}
            className={`w-full px-3 py-2 bg-white/10 border ${
              errores.estado ? 'border-red-400' : 'border-white/20'
            } rounded-lg text-white focus:outline-none focus:border-emerald-400`}
          >
            <option value="" className="bg-gray-800">
              Seleccione…
            </option>
            {estados.map((e) => (
              <option key={e.valor} value={e.valor} className="bg-gray-800">
                {e.etiqueta}
              </option>
            ))}
          </select>
          {errores.estado && (
            <p className="text-red-300 text-sm mt-1">{errores.estado}</p>
          )}
        </div>

        {/* Campaña / Parcela */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">
              Campaña (opcional)
            </label>
            <select
              value={form.campania}
              onChange={(e) => setForm({ ...form, campania: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${
                errores.campania ? 'border-red-400' : 'border-white/20'
              } rounded-lg text-white focus:outline-none focus:border-emerald-400`}
            >
              <option value="" className="bg-gray-800">
                —
              </option>
              {campanias.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-800">
                  {c.nombre}
                </option>
              ))}
            </select>
            {errores.campania && (
              <p className="text-red-300 text-sm mt-1">{errores.campania}</p>
            )}
          </div>

          <div>
            <label className="block text-emerald-100/90 text-sm mb-1">
              Parcela (opcional)
            </label>
            <select
              value={form.parcela}
              onChange={(e) => setForm({ ...form, parcela: e.target.value })}
              disabled={saving}
              className={`w-full px-3 py-2 bg-white/10 border ${
                errores.parcela ? 'border-red-400' : 'border-white/20'
              } rounded-lg text-white focus:outline-none focus:border-emerald-400`}
            >
              <option value="" className="bg-gray-800">
                —
              </option>
              {parcelas.map((p) => (
                <option key={p.id} value={p.id} className="bg-gray-800">
                  {p.nombre}
                </option>
              ))}
            </select>
            {errores.parcela && (
              <p className="text-red-300 text-sm mt-1">{errores.parcela}</p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-emerald-100/90 text-sm mb-1">
            Observaciones
          </label>
          <textarea
            rows={4}
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
            disabled={saving}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            placeholder="Notas adicionales de la labor…"
          />
        </div>

        {/* Errores generales */}
        {errores.non_field_errors && (
          <div className="text-red-300 text-sm">{errores.non_field_errors}</div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/labores')}
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
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Guardar cambios' : 'Crear labor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LaborFormPage;
