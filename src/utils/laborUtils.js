// src/utils/laborUtils.js

// ============================================================================
// CONSTANTES Y CONFIGURACIONES
// ============================================================================

// Tipos de labor disponibles
export const TIPOS_LABOR = [
  { valor: 'SIEMBRA', etiqueta: 'Siembra' },
  { valor: 'RIEGO', etiqueta: 'Riego' },
  { valor: 'FERTILIZACION', etiqueta: 'Fertilización' },
  { valor: 'COSECHA', etiqueta: 'Cosecha' },
  { valor: 'FUMIGACION', etiqueta: 'Fumigación' }
];

// Estados de labor disponibles
export const ESTADOS_LABOR = [
  { valor: 'PLANIFICADA', etiqueta: 'Planificada' },
  { valor: 'EN_PROCESO', etiqueta: 'En Proceso' },
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' }
];

// Labores que pueden usar insumos y descontar del inventario
export const LABORES_CON_INSUMOS = ['FERTILIZACION', 'FUMIGACION', 'SIEMBRA'];

// Mapeo de colores para los estados (compatible con Tailwind CSS)
export const ESTADO_COLORS = {
  'PLANIFICADA': { bg: 'bg-gray-500', text: 'text-gray-200', variant: 'secondary' },
  'EN_PROCESO': { bg: 'bg-yellow-500', text: 'text-yellow-200', variant: 'warning' },
  'COMPLETADA': { bg: 'bg-green-500', text: 'text-green-200', variant: 'success' },
  'CANCELADA': { bg: 'bg-red-500', text: 'text-red-200', variant: 'danger' }
};

// Mapeo de colores para los tipos de labor
export const TIPO_LABOR_COLORS = {
  'SIEMBRA': { bg: 'bg-blue-500', text: 'text-blue-200', variant: 'primary' },
  'RIEGO': { bg: 'bg-cyan-500', text: 'text-cyan-200', variant: 'info' },
  'FERTILIZACION': { bg: 'bg-green-500', text: 'text-green-200', variant: 'success' },
  'COSECHA': { bg: 'bg-orange-500', text: 'text-orange-200', variant: 'warning' },
  'FUMIGACION': { bg: 'bg-purple-500', text: 'text-purple-200', variant: 'dark' }
};

// ============================================================================
// FUNCIONES DE FORMATEO Y VISUALIZACIÓN
// ============================================================================

/**
 * Obtiene la variante de color para un estado de labor
 * @param {string} estado - Estado de la labor
 * @returns {string} Variante de color para Tailwind
 */
export const getEstadoBadgeVariant = (estado) => {
  return ESTADO_COLORS[estado]?.variant || 'secondary';
};

/**
 * Obtiene la variante de color para un tipo de labor
 * @param {string} tipo - Tipo de labor
 * @returns {string} Variante de color para Tailwind
 */
export const getTipoLaborBadgeVariant = (tipo) => {
  return TIPO_LABOR_COLORS[tipo]?.variant || 'primary';
};

/**
 * Obtiene las clases CSS para un badge de estado
 * @param {string} estado - Estado de la labor
 * @returns {string} Clases CSS para el badge
 */
export const getEstadoBadgeClasses = (estado) => {
  const colors = ESTADO_COLORS[estado] || ESTADO_COLORS.PLANIFICADA;
  return `${colors.bg}/20 ${colors.text}`;
};

/**
 * Obtiene las clases CSS para un badge de tipo de labor
 * @param {string} tipo - Tipo de labor
 * @returns {string} Clases CSS para el badge
 */
export const getTipoLaborBadgeClasses = (tipo) => {
  const colors = TIPO_LABOR_COLORS[tipo] || TIPO_LABOR_COLORS.SIEMBRA;
  return `${colors.bg}/20 ${colors.text}`;
};

/**
 * Formatea la duración en horas a texto legible
 * @param {number} horas - Duración en horas
 * @returns {string} Duración formateada
 */
export const formatDuracion = (horas) => {
  if (!horas && horas !== 0) return 'No especificada';
  
  if (horas < 1) {
    const minutos = Math.round(horas * 60);
    return `${minutos} min`;
  } else if (horas === 1) {
    return '1 hora';
  } else if (horas < 24) {
    return `${horas} horas`;
  } else {
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (horasRestantes === 0) {
      return `${dias} ${dias === 1 ? 'día' : 'días'}`;
    } else {
      return `${dias} ${dias === 1 ? 'día' : 'días'} y ${horasRestantes} horas`;
    }
  }
};

/**
 * Formatea un valor monetario
 * @param {number} valor - Valor a formatear
 * @returns {string} Valor formateado como moneda
 */
export const formatMoneda = (valor) => {
  if (!valor && valor !== 0) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
};

/**
 * Formatea una fecha a formato legible
 * @param {string} fechaString - Fecha en formato string
 * @returns {string} Fecha formateada
 */
export const formatFecha = (fechaString) => {
  if (!fechaString) return 'N/A';
  try {
    return new Date(fechaString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return fechaString;
  }
};

/**
 * Formatea una fecha y hora a formato legible
 * @param {string} fechaString - Fecha en formato string
 * @returns {string} Fecha y hora formateadas
 */
export const formatFechaHora = (fechaString) => {
  if (!fechaString) return 'N/A';
  try {
    return new Date(fechaString).toLocaleString('es-ES');
  } catch {
    return fechaString;
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO Y VALIDACIÓN
// ============================================================================

/**
 * Calcula el costo total de una labor
 * @param {Object} labor - Objeto de labor
 * @returns {number} Costo total calculado
 */
export const calcularCostoTotal = (labor) => {
  let total = labor.costo_estimado || 0;
  
  // Si hay insumo, calcular costo del insumo (asumiendo que el insumo tiene precio_unitario)
  if (labor.insumo && labor.cantidad_insumo && labor.insumo.precio_unitario) {
    total += labor.cantidad_insumo * labor.insumo.precio_unitario;
  }
  
  return total;
};

/**
 * Valida si una labor puede descontar insumos del inventario
 * @param {Object} labor - Objeto de labor
 * @returns {boolean} True si puede descontar insumos
 */
export const puedeDescontarInsumo = (labor) => {
  return LABORES_CON_INSUMOS.includes(labor.labor) && 
         labor.insumo && 
         labor.cantidad_insumo && 
         labor.estado === 'COMPLETADA';
};

/**
 * Valida si una fecha está dentro del rango de una campaña
 * @param {string} fecha - Fecha a validar
 * @param {Object} campaña - Objeto de campaña
 * @returns {Object} Resultado de la validación
 */
export const validarFechaEnCampaña = (fecha, campaña) => {
  if (!fecha || !campaña) {
    return { valida: true, errores: [] };
  }

  const fechaLabor = new Date(fecha);
  const fechaInicio = new Date(campaña.fecha_inicio);
  const fechaFin = campaña.fecha_fin ? new Date(campaña.fecha_fin) : null;

  const errores = [];

  if (fechaLabor < fechaInicio) {
    errores.push(`La fecha no puede ser anterior al inicio de la campaña (${fechaInicio.toLocaleDateString('es-ES')})`);
  }

  if (fechaFin && fechaLabor > fechaFin) {
    errores.push(`La fecha no puede ser posterior al fin de la campaña (${fechaFin.toLocaleDateString('es-ES')})`);
  }

  return {
    valida: errores.length === 0,
    errores
  };
};

/**
 * Valida el stock disponible de un insumo
 * @param {number} cantidadRequerida - Cantidad requerida
 * @param {Object} insumo - Objeto de insumo
 * @returns {Object} Resultado de la validación
 */
export const validarStockInsumo = (cantidadRequerida, insumo) => {
  if (!insumo || !cantidadRequerida) {
    return { valida: true, mensaje: '' };
  }

  const stockDisponible = insumo.cantidad_disponible || 0;
  
  if (cantidadRequerida > stockDisponible) {
    return {
      valida: false,
      mensaje: `Stock insuficiente. Disponible: ${stockDisponible} ${insumo.unidad_medida || 'unidades'}`
    };
  }

  return { valida: true, mensaje: '' };
};

// ============================================================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// ============================================================================

/**
 * Filtra labores según criterios de búsqueda
 * @param {Array} labores - Array de labores
 * @param {Object} filtros - Objeto con filtros
 * @returns {Array} Labores filtradas
 */
export const filtrarLabores = (labores, filtros = {}) => {
  return labores.filter(labor => {
    // Filtro por tipo de labor
    if (filtros.tipo && labor.labor !== filtros.tipo) {
      return false;
    }

    // Filtro por estado
    if (filtros.estado && labor.estado !== filtros.estado) {
      return false;
    }

    // Filtro por campaña
    if (filtros.campana && labor.campaña !== filtros.campana) {
      return false;
    }

    // Filtro por parcela
    if (filtros.parcela && labor.parcela !== filtros.parcela) {
      return false;
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde && new Date(labor.fecha_labor) < new Date(filtros.fechaDesde)) {
      return false;
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta && new Date(labor.fecha_labor) > new Date(filtros.fechaHasta)) {
      return false;
    }

    // Filtro por texto (búsqueda general)
    if (filtros.searchTerm) {
      const term = filtros.searchTerm.toLowerCase();
      const matchesDescripcion = labor.descripcion?.toLowerCase().includes(term);
      const matchesObservaciones = labor.observaciones?.toLowerCase().includes(term);
      const matchesResponsable = labor.responsable_nombre?.toLowerCase().includes(term);
      const matchesUbicacion = (
        labor.campaña_nombre?.toLowerCase().includes(term) ||
        labor.parcela_nombre?.toLowerCase().includes(term)
      );

      if (!matchesDescripcion && !matchesObservaciones && !matchesResponsable && !matchesUbicacion) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Ordena labores según criterio
 * @param {Array} labores - Array de labores
 * @param {string} campo - Campo por el que ordenar
 * @param {string} direccion - Dirección (asc/desc)
 * @returns {Array} Labores ordenadas
 */
export const ordenarLabores = (labores, campo = 'fecha_labor', direccion = 'desc') => {
  return [...labores].sort((a, b) => {
    let valorA = a[campo];
    let valorB = b[campo];

    // Manejo especial para fechas
    if (campo.includes('fecha') || campo.includes('_en')) {
      valorA = new Date(valorA);
      valorB = new Date(valorB);
    }

    // Manejo especial para textos
    if (typeof valorA === 'string') {
      valorA = valorA.toLowerCase();
      valorB = valorB.toLowerCase();
    }

    if (valorA < valorB) {
      return direccion === 'asc' ? -1 : 1;
    }
    if (valorA > valorB) {
      return direccion === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// ============================================================================
// FUNCIONES DE ESTADÍSTICAS Y REPORTES
// ============================================================================

/**
 * Calcula estadísticas generales de las labores
 * @param {Array} labores - Array de labores
 * @returns {Object} Estadísticas calculadas
 */
export const calcularEstadisticasLabores = (labores) => {
  const total = labores.length;
  const planificadas = labores.filter(l => l.estado === 'PLANIFICADA').length;
  const enProceso = labores.filter(l => l.estado === 'EN_PROCESO').length;
  const completadas = labores.filter(l => l.estado === 'COMPLETADA').length;
  const canceladas = labores.filter(l => l.estado === 'CANCELADA').length;

  const costoTotal = labores.reduce((sum, l) => sum + (l.costo_total || 0), 0);
  const costoEstimado = labores.reduce((sum, l) => sum + (l.costo_estimado || 0), 0);

  const laboresConInsumos = labores.filter(l => l.insumo).length;
  const laboresCompletadasConInsumos = labores.filter(l => 
    l.estado === 'COMPLETADA' && l.insumo
  ).length;

  return {
    total,
    planificadas,
    enProceso,
    completadas,
    canceladas,
    costoTotal,
    costoEstimado,
    laboresConInsumos,
    laboresCompletadasConInsumos,
    tasaCompletitud: total > 0 ? (completadas / total) * 100 : 0,
    diferenciaCosto: costoTotal - costoEstimado
  };
};

/**
 * Agrupa labores por tipo
 * @param {Array} labores - Array de labores
 * @returns {Object} Labores agrupadas por tipo
 */
export const agruparLaboresPorTipo = (labores) => {
  return labores.reduce((agrupado, labor) => {
    const tipo = labor.labor;
    if (!agrupado[tipo]) {
      agrupado[tipo] = {
        count: 0,
        completadas: 0,
        costoTotal: 0,
        duracionTotal: 0
      };
    }

    agrupado[tipo].count++;
    if (labor.estado === 'COMPLETADA') {
      agrupado[tipo].completadas++;
    }
    agrupado[tipo].costoTotal += labor.costo_total || 0;
    agrupado[tipo].duracionTotal += labor.duracion_horas || 0;

    return agrupado;
  }, {});
};

/**
 * Obtiene el icono correspondiente para un tipo de labor
 * @param {string} tipo - Tipo de labor
 * @returns {string} Nombre del icono de Lucide React
 */
export const getIconoTipoLabor = (tipo) => {
  const iconos = {
    'SIEMBRA': 'Sprout',
    'RIEGO': 'Droplets',
    'FERTILIZACION': 'FlaskConical',
    'COSECHA': 'Harvest',
    'FUMIGACION': 'Shield'
  };
  return iconos[tipo] || 'Tractor';
};

/**
 * Obtiene el icono correspondiente para un estado de labor
 * @param {string} estado - Estado de labor
 * @returns {string} Nombre del icono de Lucide React
 */
export const getIconoEstadoLabor = (estado) => {
  const iconos = {
    'PLANIFICADA': 'Calendar',
    'EN_PROCESO': 'PlayCircle',
    'COMPLETADA': 'CheckCircle',
    'CANCELADA': 'XCircle'
  };
  return iconos[estado] || 'Clock';
};

export default {
  // Constantes
  TIPOS_LABOR,
  ESTADOS_LABOR,
  LABORES_CON_INSUMOS,
  ESTADO_COLORS,
  TIPO_LABOR_COLORS,

  // Funciones de formateo
  getEstadoBadgeVariant,
  getTipoLaborBadgeVariant,
  getEstadoBadgeClasses,
  getTipoLaborBadgeClasses,
  formatDuracion,
  formatMoneda,
  formatFecha,
  formatFechaHora,

  // Funciones de cálculo y validación
  calcularCostoTotal,
  puedeDescontarInsumo,
  validarFechaEnCampaña,
  validarStockInsumo,

  // Funciones de filtrado y búsqueda
  filtrarLabores,
  ordenarLabores,

  // Funciones de estadísticas
  calcularEstadisticasLabores,
  agruparLaboresPorTipo,

  // Funciones de iconos
  getIconoTipoLabor,
  getIconoEstadoLabor
};