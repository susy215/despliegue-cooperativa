import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utilidades para exportación de PDFs con diseño profesional
 * Compatible con el sistema de diseño glass-morphism emerald de la cooperativa
 */

// Colores del tema (coordinados con Tailwind)
const COLORS = {
  primary: '#10b981',      // emerald-500
  primaryDark: '#047857',  // emerald-700
  text: '#ffffff',
  textSecondary: '#d1fae5', // emerald-100
  background: '#064e3b',    // emerald-900
  border: '#6ee7b7',        // emerald-300
  gray: '#9ca3af',
};

/**
 * Agrega el encabezado estándar de la cooperativa al PDF
 */
export const addPDFHeader = (doc, title, subtitle = '') => {
  const pageWidth = doc.internal.pageSize.width;

  // Fondo del encabezado con gradiente simulado
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Borde inferior del encabezado
  doc.setDrawColor(110, 231, 183); // emerald-300
  doc.setLineWidth(1);
  doc.line(0, 40, pageWidth, 40);

  // Título del documento
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 20);

  // Subtítulo si existe
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 250, 229); // emerald-100
    doc.text(subtitle, 15, 30);
  }

  // Logo/nombre de la cooperativa (esquina derecha)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(110, 231, 183); // emerald-300
  doc.text('Sistema Cooperativa', pageWidth - 15, 15, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(fecha, pageWidth - 15, 22, { align: 'right' });

  return 45; // Retorna la posición Y donde continuar el contenido
};

/**
 * Agrega el pie de página estándar con numeración
 */
export const addPDFFooter = (doc, pageNumber, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Línea superior del footer
  doc.setDrawColor(110, 231, 183); // emerald-300
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  // Número de página
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(
    `Página ${pageNumber} de ${totalPages}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Texto adicional del footer
  doc.setFontSize(8);
  doc.text(
    'Generado por Sistema de Gestión de Cooperativa Agrícola',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );
};

/**
 * Agrega una tabla con estilo al PDF
 */
export const addStyledTable = (doc, headers, rows, startY, options = {}) => {
  const {
    headerColor = [16, 185, 129],      // emerald-500
    headerTextColor = [255, 255, 255],
    rowColor = [249, 250, 251],         // gray-50
    alternateRowColor = [243, 244, 246], // gray-100
    borderColor = [209, 213, 219],      // gray-300
    fontSize = 9,
    headerFontSize = 10,
    cellPadding = 3,
    rowHeight = 8,
    headerHeight = 10,
  } = options;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const startX = 15;
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / headers.length;

  let currentY = startY;

  // Función para agregar nueva página si es necesario
  const checkNewPage = () => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 15;
      return true;
    }
    return false;
  };

  // Encabezado de la tabla
  checkNewPage();
  doc.setFillColor(...headerColor);
  doc.rect(startX, currentY, tableWidth, headerHeight, 'F');

  doc.setFontSize(headerFontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...headerTextColor);

  headers.forEach((header, i) => {
    const cellX = startX + (i * colWidth);
    const text = String(header);
    const maxWidth = colWidth - (cellPadding * 2);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(
      lines[0], // Solo primera línea si es muy largo
      cellX + cellPadding,
      currentY + 7
    );
  });

  currentY += headerHeight;

  // Filas de datos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

  rows.forEach((row, rowIndex) => {
    // Verificar si necesita nueva página
    if (checkNewPage()) {
      // Repetir encabezado en nueva página
      doc.setFillColor(...headerColor);
      doc.rect(startX, currentY, tableWidth, headerHeight, 'F');

      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...headerTextColor);

      headers.forEach((header, i) => {
        doc.text(
          String(header),
          startX + (i * colWidth) + cellPadding,
          currentY + 7
        );
      });

      currentY += headerHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);
    }

    // Alternar color de filas
    const fillColor = rowIndex % 2 === 0 ? rowColor : alternateRowColor;
    doc.setFillColor(...fillColor);
    doc.rect(startX, currentY, tableWidth, rowHeight, 'F');

    // Bordes de celda
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.1);
    doc.rect(startX, currentY, tableWidth, rowHeight, 'S');

    // Contenido de celdas
    row.forEach((cell, colIndex) => {
      const cellX = startX + (colIndex * colWidth);
      const text = String(cell);
      const maxWidth = colWidth - (cellPadding * 2);
      const lines = doc.splitTextToSize(text, maxWidth);

      doc.text(
        lines[0], // Solo primera línea si es muy largo
        cellX + cellPadding,
        currentY + 6
      );
    });

    currentY += rowHeight;
  });

  return currentY; // Retorna la posición Y final
};

/**
 * Agrega una sección con título y contenido
 */
export const addSection = (doc, title, content, startY) => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 78, 59); // emerald-900
  doc.text(title, 15, startY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const lines = doc.splitTextToSize(content, doc.internal.pageSize.width - 30);
  doc.text(lines, 15, startY + 8);

  return startY + 8 + (lines.length * 5) + 5; // Retorna nueva posición Y
};

/**
 * Agrega un KPI (indicador) con estilo destacado
 */
export const addKPIBox = (doc, label, value, x, y, width = 50, height = 20) => {
  // Fondo del KPI
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(x, y, width, height, 3, 3, 'F');

  // Borde
  doc.setDrawColor(147, 197, 253); // blue-300
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, height, 3, 3, 'S');

  // Label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(label, x + width / 2, y + 8, { align: 'center' });

  // Value
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(String(value), x + width / 2, y + 16, { align: 'center' });
};

/**
 * Exporta un elemento HTML específico a PDF (para gráficos)
 */
export const exportElementToPDF = async (elementId, filename, options = {}) => {
  const {
    title = 'Reporte',
    subtitle = '',
    orientation = 'portrait',
    format = 'a4',
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID "${elementId}" no encontrado`);
    }

    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    // Crear PDF
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Agregar encabezado
    const startY = addPDFHeader(doc, title, subtitle);

    // Calcular dimensiones de la imagen
    const pageWidth = doc.internal.pageSize.width;
    const imgWidth = pageWidth - 30;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Agregar imagen
    doc.addImage(imgData, 'PNG', 15, startY + 5, imgWidth, imgHeight);

    // Agregar footer
    addPDFFooter(doc, 1, 1);

    // Guardar
    doc.save(`${filename}.pdf`);

    return true;
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw error;
  }
};

/**
 * Crea un PDF completo de reporte con múltiples secciones
 */
export const createMultiSectionPDF = (config) => {
  const {
    title,
    subtitle = '',
    sections = [],
    filename = 'reporte',
    orientation = 'portrait',
  } = config;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  let currentY = addPDFHeader(doc, title, subtitle);
  const pageHeight = doc.internal.pageSize.height;
  let pageNumber = 1;

  sections.forEach((section, index) => {
    // Verificar si necesitamos una nueva página
    if (currentY > pageHeight - 40) {
      addPDFFooter(doc, pageNumber, '?'); // Se actualizará al final
      doc.addPage();
      pageNumber++;
      currentY = 15;
    }

    if (section.type === 'text') {
      currentY = addSection(doc, section.title, section.content, currentY);
    } else if (section.type === 'table') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 78, 59);
      doc.text(section.title, 15, currentY);
      currentY += 8;

      currentY = addStyledTable(
        doc,
        section.headers,
        section.rows,
        currentY,
        section.options
      );
    } else if (section.type === 'kpis') {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 78, 59);
      doc.text(section.title, 15, currentY);
      currentY += 10;

      const kpisPerRow = 3;
      const kpiWidth = 55;
      const kpiHeight = 25;
      const spacing = 10;

      section.kpis.forEach((kpi, i) => {
        const col = i % kpisPerRow;
        const row = Math.floor(i / kpisPerRow);
        const x = 15 + col * (kpiWidth + spacing);
        const y = currentY + row * (kpiHeight + spacing);

        addKPIBox(doc, kpi.label, kpi.value, x, y, kpiWidth, kpiHeight);
      });

      const rows = Math.ceil(section.kpis.length / kpisPerRow);
      currentY += rows * (kpiHeight + spacing) + 10;
    }

    currentY += 5; // Espacio entre secciones
  });

  // Actualizar footers con número total de páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPDFFooter(doc, i, totalPages);
  }

  doc.save(`${filename}.pdf`);
  return doc;
};

export default {
  addPDFHeader,
  addPDFFooter,
  addStyledTable,
  addSection,
  addKPIBox,
  exportElementToPDF,
  createMultiSectionPDF,
};
