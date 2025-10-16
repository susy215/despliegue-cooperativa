import { createMultiSectionPDF } from './pdfExportUtils';

/**
 * Exporta el reporte de producción por parcela a PDF
 */
export const exportProductionByPlotToPDF = (reportData) => {
  if (!reportData) {
    throw new Error('No hay datos para exportar');
  }

  const { parcela, estadisticas, cosechas_detail, historico_campañas, productos_cosechados } = reportData;

  const sections = [];

  // Sección: Información de la parcela
  sections.push({
    type: 'text',
    title: 'Información de la Parcela',
    content: `
Nombre: ${parcela.nombre}
Superficie: ${parcela.superficie_hectareas} hectáreas
Tipo de Suelo: ${parcela.tipo_suelo}
Ubicación: ${parcela.ubicacion || 'N/A'}
Propietario: ${parcela.socio?.nombre_completo || 'N/A'}
    `.trim(),
  });

  // Sección: KPIs principales
  sections.push({
    type: 'kpis',
    title: 'Indicadores Principales',
    kpis: [
      {
        label: 'Producción Total',
        value: `${estadisticas.total_production?.toLocaleString() || 0} kg`,
      },
      {
        label: 'Rendimiento/ha',
        value: `${estadisticas.yield_per_hectare?.toFixed(2) || 0} kg`,
      },
      {
        label: 'Total Cosechas',
        value: estadisticas.numero_total_cosechas || 0,
      },
      {
        label: 'Valor Económico',
        value: `Bs. ${estadisticas.valor_economico_total?.toLocaleString() || 0}`,
      },
    ],
  });

  // Sección: Productos cosechados
  if (productos_cosechados && productos_cosechados.length > 0) {
    sections.push({
      type: 'table',
      title: 'Productos Cosechados',
      headers: ['Cultivo', 'Cantidad Total (kg)', 'Valor Total (Bs.)'],
      rows: productos_cosechados.map(p => [
        p.cultivo_especie || 'N/A',
        p.cantidad_total?.toLocaleString() || '0',
        p.valor_total?.toLocaleString() || '0',
      ]),
    });
  }

  // Sección: Histórico de campañas
  if (historico_campañas && historico_campañas.length > 0) {
    sections.push({
      type: 'table',
      title: 'Histórico de Campañas',
      headers: ['Campaña', 'Periodo', 'Cultivo', 'Producción (kg)', 'N° Cosechas'],
      rows: historico_campañas.map(c => [
        c.campaign_nombre || 'N/A',
        `${c.fecha_inicio} - ${c.fecha_fin}`,
        c.cultivo_planificado || 'N/A',
        c.produccion_total?.toLocaleString() || '0',
        c.numero_cosechas || '0',
      ]),
    });
  }

  // Sección: Detalle de cosechas
  if (cosechas_detail && cosechas_detail.length > 0) {
    sections.push({
      type: 'table',
      title: 'Detalle de Cosechas',
      headers: ['Fecha', 'Cultivo', 'Variedad', 'Cantidad (kg)', 'Calidad', 'Precio (Bs.)'],
      rows: cosechas_detail.slice(0, 20).map(c => [ // Limitar a 20 para no saturar
        c.fecha_cosecha || 'N/A',
        c.cultivo_especie || 'N/A',
        c.cultivo_variedad || 'N/A',
        c.cantidad_cosechada?.toLocaleString() || '0',
        c.calidad || 'N/A',
        c.precio_venta?.toFixed(2) || '0.00',
      ]),
    });

    if (cosechas_detail.length > 20) {
      sections.push({
        type: 'text',
        title: '',
        content: `* Mostrando las primeras 20 de ${cosechas_detail.length} cosechas totales`,
      });
    }
  }

  // Generar PDF
  createMultiSectionPDF({
    title: 'Reporte de Producción por Parcela',
    subtitle: `${parcela.nombre} - ${new Date().toLocaleDateString('es-BO')}`,
    sections,
    filename: `produccion_parcela_${parcela.nombre.replace(/\s+/g, '_')}_${Date.now()}`,
    orientation: 'portrait',
  });
};

/**
 * Exporta el reporte de labores por campaña a PDF
 */
export const exportLaborsByCampaignToPDF = (reportData, campaignName = '') => {
  if (!reportData) {
    throw new Error('No hay datos para exportar');
  }

  const { estadisticas, labors_by_type, labors_detail } = reportData;

  const sections = [];

  // Sección: Información de la campaña
  sections.push({
    type: 'text',
    title: 'Información de la Campaña',
    content: `
Campaña: ${campaignName}
Fecha de Reporte: ${new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
    `.trim(),
  });

  // Sección: Resumen estadístico (KPIs)
  if (estadisticas) {
    sections.push({
      type: 'kpis',
      title: 'Indicadores Principales',
      kpis: [
        {
          label: 'Total de Labores Realizadas',
          value: estadisticas.total_labors || 0,
        },
        {
          label: 'Área Total Trabajada',
          value: `${estadisticas.total_area_worked?.toFixed(2) || 0} hectáreas`,
        },
        {
          label: 'Costo Total Invertido',
          value: `Bs. ${estadisticas.costo_total_labores?.toLocaleString() || 0}`,
        },
        {
          label: 'Parcelas Involucradas',
          value: estadisticas.parcelas_trabajadas || 0,
        },
      ],
    });
  }

  // Sección: Distribución por tipo de labor
  if (labors_by_type && labors_by_type.length > 0) {
    sections.push({
      type: 'table',
      title: 'Distribución de Labores por Tipo',
      headers: ['Tipo de Labor', 'Cantidad', 'Costo Total (Bs.)'],
      rows: labors_by_type.map(l => [
        l.tipo_tratamiento || 'N/A',
        l.count?.toString() || '0',
        `Bs. ${l.costo_total?.toLocaleString() || '0'}`,
      ]),
    });

    // Agregar totales
    const totalCount = labors_by_type.reduce((sum, l) => sum + (l.count || 0), 0);
    const totalCost = labors_by_type.reduce((sum, l) => sum + (l.costo_total || 0), 0);
    sections.push({
      type: 'text',
      title: '',
      content: `TOTALES: ${totalCount} labores realizadas - Bs. ${totalCost.toLocaleString()} invertidos`,
    });
  }

  // Sección: Detalle de labores (limitado a 50 registros para el PDF)
  if (labors_detail && labors_detail.length > 0) {
    const limit = 50;
    sections.push({
      type: 'table',
      title: `Detalle de Labores Realizadas ${labors_detail.length > limit ? `(Primeras ${limit})` : ''}`,
      headers: ['Fecha', 'Tipo', 'Producto', 'Dosis', 'Parcela', 'Costo', 'Aplicado Por'],
      rows: labors_detail.slice(0, limit).map(l => [
        l.fecha_aplicacion || 'N/A',
        l.tipo_tratamiento || 'N/A',
        l.nombre_producto || 'N/A',
        `${l.dosis || ''} ${l.unidad_dosis || ''}`.trim() || 'N/A',
        l.parcela_nombre || 'N/A',
        `Bs. ${l.costo?.toFixed(2) || '0.00'}`,
        l.aplicado_por || 'N/A',
      ]),
    });

    if (labors_detail.length > limit) {
      sections.push({
        type: 'text',
        title: '',
        content: `* Este reporte muestra las primeras ${limit} labores de un total de ${labors_detail.length} registros. 
Para ver el reporte completo, exporte a CSV o Excel.`,
      });
    }
  }

  // Nota al pie
  sections.push({
    type: 'text',
    title: '',
    content: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reporte generado automáticamente por el Sistema de Gestión de Cooperativa
Todos los valores monetarios están expresados en Bolivianos (Bs.)
    `.trim(),
  });

  // Generar PDF
  createMultiSectionPDF({
    title: 'REPORTE DE LABORES AGRÍCOLAS',
    subtitle: `${campaignName} - ${new Date().toLocaleDateString('es-BO')}`,
    sections,
    filename: `Reporte_Labores_${campaignName.replace(/\s+/g, '_')}_${Date.now()}`,
    orientation: 'landscape',
  });
};

/**
 * Exporta el reporte de producción por campaña a PDF
 */
export const exportProductionByCampaignToPDF = (reportData, campaignName = '') => {
  if (!reportData) {
    throw new Error('No hay datos para exportar');
  }

  const { estadisticas, comparativa_meta, production_by_product, calidad_distribucion, production_by_plot } = reportData;

  const sections = [];

  // Sección: Información de la campaña
  sections.push({
    type: 'text',
    title: 'Información de la Campaña',
    content: `
Campaña: ${campaignName}
Fecha de Reporte: ${new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
Estado: ${reportData.campaign?.estado || 'N/A'}
Periodo: ${reportData.campaign?.fecha_inicio || 'N/A'} al ${reportData.campaign?.fecha_fin || 'N/A'}
    `.trim(),
  });

  // Sección: KPIs principales
  if (estadisticas) {
    sections.push({
      type: 'kpis',
      title: 'Indicadores de Producción',
      kpis: [
        {
          label: 'Producción Total Alcanzada',
          value: `${estadisticas.total_production?.toLocaleString() || 0} kg`,
        },
        {
          label: 'Rendimiento por Hectárea',
          value: `${estadisticas.avg_yield_per_hectare?.toFixed(2) || 0} kg/ha`,
        },
        {
          label: 'Valor Económico Total',
          value: `Bs. ${estadisticas.valor_economico_total?.toLocaleString() || 0}`,
        },
        {
          label: 'Total de Cosechas',
          value: estadisticas.numero_total_cosechas || 0,
        },
      ],
    });
  }

  // Sección: Análisis de cumplimiento de meta (destacado)
  if (comparativa_meta) {
    const porcentaje = comparativa_meta.porcentaje_cumplimiento || 0;
    const estado = porcentaje >= 100 ? '✓ META CUMPLIDA' :
      porcentaje >= 80 ? '⚠ EN BUEN CAMINO' :
        porcentaje >= 50 ? '⚠ REQUIERE ATENCIÓN' : '✗ REZAGADA';

    const icono = porcentaje >= 100 ? '🎯' :
      porcentaje >= 80 ? '📈' :
        porcentaje >= 50 ? '⚠️' : '📉';

    sections.push({
      type: 'text',
      title: `${icono} Análisis de Cumplimiento de Meta`,
      content: `
ESTADO: ${estado}

Meta Establecida: ${comparativa_meta.meta_produccion?.toLocaleString() || 0} kg
Producción Alcanzada: ${comparativa_meta.produccion_real?.toLocaleString() || 0} kg
Diferencia: ${comparativa_meta.diferencia >= 0 ? '+' : ''}${comparativa_meta.diferencia?.toLocaleString() || 0} kg

PORCENTAJE DE CUMPLIMIENTO: ${porcentaje.toFixed(2)}%

${porcentaje >= 100 ? '¡Felicidades! La meta ha sido superada.' :
          porcentaje >= 80 ? 'El avance es bueno, se está cerca de la meta.' :
            porcentaje >= 50 ? 'Se requiere mayor esfuerzo para alcanzar la meta.' :
              'Atención: Se necesita replantear estrategias para alcanzar la meta.'}
      `.trim(),
    });
  }

  // Sección: Producción por producto (detallada)
  if (production_by_product && production_by_product.length > 0) {
    sections.push({
      type: 'table',
      title: 'Producción Detallada por Producto',
      headers: ['Producto/Cultivo', 'Cantidad (kg)', 'N° Cosechas', 'Precio Prom.', 'Valor Total (Bs.)'],
      rows: production_by_product.map(p => [
        p.cultivo_especie || 'N/A',
        p.cantidad_total?.toLocaleString() || '0',
        p.numero_cosechas?.toString() || '0',
        `Bs. ${p.precio_promedio?.toFixed(2) || '0.00'}`,
        `Bs. ${p.valor_total?.toLocaleString() || '0'}`,
      ]),
    });

    // Agregar totales
    const totalKg = production_by_product.reduce((sum, p) => sum + (p.cantidad_total || 0), 0);
    const totalValor = production_by_product.reduce((sum, p) => sum + (p.valor_total || 0), 0);
    const totalCosechas = production_by_product.reduce((sum, p) => sum + (p.numero_cosechas || 0), 0);

    sections.push({
      type: 'text',
      title: '',
      content: `TOTALES: ${totalKg.toLocaleString()} kg producidos en ${totalCosechas} cosechas - Valor: Bs. ${totalValor.toLocaleString()}`,
    });
  }

  // Sección: Distribución de calidad
  if (calidad_distribucion && calidad_distribucion.length > 0) {
    sections.push({
      type: 'table',
      title: 'Distribución por Calidad del Producto',
      headers: ['Calidad', 'N° Cosechas', 'Cantidad (kg)', 'Porcentaje'],
      rows: calidad_distribucion.map(c => {
        const total = calidad_distribucion.reduce((sum, item) => sum + (item.cantidad_total || 0), 0);
        const porcentaje = total > 0 ? ((c.cantidad_total / total) * 100) : 0;
        return [
          c.calidad || 'N/A',
          c.count?.toString() || '0',
          c.cantidad_total?.toLocaleString() || '0',
          `${porcentaje.toFixed(1)}%`,
        ];
      }),
    });
  }

  // Sección: Producción por parcela
  if (production_by_plot && production_by_plot.length > 0) {
    const limit = 30;
    sections.push({
      type: 'table',
      title: `Producción por Parcela ${production_by_plot.length > limit ? `(Primeras ${limit})` : ''}`,
      headers: ['Parcela', 'Propietario', 'Producción (kg)', 'N° Cosechas', 'Valor (Bs.)'],
      rows: production_by_plot.slice(0, limit).map(p => [
        p.parcela_nombre || 'N/A',
        `${p.socio_nombre || ''} ${p.socio_apellido || ''}`.trim() || 'N/A',
        p.cantidad_total?.toLocaleString() || '0',
        p.numero_cosechas?.toString() || '0',
        `Bs. ${p.valor_total?.toLocaleString() || '0'}`,
      ]),
    });

    if (production_by_plot.length > limit) {
      sections.push({
        type: 'text',
        title: '',
        content: `* Este reporte muestra las primeras ${limit} parcelas de un total de ${production_by_plot.length}. 
Para ver el reporte completo de todas las parcelas, exporte a Excel.`,
      });
    }

    // Resumen de parcelas
    const totalProduccionParcelas = production_by_plot.reduce((sum, p) => sum + (p.cantidad_total || 0), 0);
    const parcelasActivas = production_by_plot.filter(p => p.cantidad_total > 0).length;

    sections.push({
      type: 'text',
      title: '',
      content: `
Resumen de Parcelas:
• Total de parcelas en la campaña: ${production_by_plot.length}
• Parcelas con producción: ${parcelasActivas}
• Producción total acumulada: ${totalProduccionParcelas.toLocaleString()} kg
      `.trim(),
    });
  }

  // Nota al pie profesional
  sections.push({
    type: 'text',
    title: '',
    content: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Reporte de Producción Agrícola
Generado automáticamente por el Sistema de Gestión de Cooperativa
Todos los valores monetarios están expresados en Bolivianos (Bs.)
Todos los pesos están expresados en kilogramos (kg)
    `.trim(),
  });

  // Generar PDF
  createMultiSectionPDF({
    title: 'REPORTE DE PRODUCCIÓN POR CAMPAÑA',
    subtitle: `${campaignName} - ${new Date().toLocaleDateString('es-BO')}`,
    sections,
    filename: `Reporte_Produccion_${campaignName.replace(/\s+/g, '_')}_${Date.now()}`,
    orientation: 'portrait',
  });
};

export default {
  exportProductionByPlotToPDF,
  exportLaborsByCampaignToPDF,
  exportProductionByCampaignToPDF,
};
