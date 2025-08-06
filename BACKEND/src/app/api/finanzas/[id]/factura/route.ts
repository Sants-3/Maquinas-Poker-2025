// Importa módulo para manejar rutas de archivos
import path from 'path';
// Importa la librería PDFKit para crear PDFs
import PDFDocument from 'pdfkit';
// Importa servicio para acceder a datos de finanzas
import { FinanzaService } from '@/services/finanza.service';

// Función que maneja la petición GET para generar factura en PDF
export async function GET(
  request: Request,  // objeto Request de la petición (no se usa directamente aquí)
  context: any      // contexto con parámetros dinámicos (ej. id)
): Promise<Response> {
  // Convierte el id del parámetro a número
  const id = Number(context.params.id);

  // Obtiene la lista completa de finanzas y busca la que coincide con el id
  const finanza = await FinanzaService.getFinanzas().then((f) =>
    f.find((x) => x.id === id)
  );

  // Si no se encuentra el movimiento financiero, responde con error 404
  if (!finanza) {
    return new Response(JSON.stringify({ error: 'Movimiento no encontrado' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Ruta absoluta al logo de la empresa que se pondrá en la factura
  const logoPath = path.resolve(process.cwd(), 'src/assets/logo.png');

  // Crea un nuevo documento PDF con margen de 40 px
  const doc = new PDFDocument({ margin: 40 });

  // Arreglo para ir guardando fragmentos del PDF mientras se genera
  const chunks: any[] = [];
  // Cada vez que PDFKit emite datos, se agregan a chunks
  doc.on('data', (c) => chunks.push(c));
  // Cuando termina de generar el PDF no hace nada especial (placeholder)
  doc.on('end', () => {});

  // Inserta la imagen del logo en la posición x=40, y=30 con ancho 120
  doc.image(logoPath, 40, 30, { width: 120 });

  // Escribe el título "FACTURA" alineado a la derecha, en tamaño 20
  doc
    .fontSize(20)
    .text('FACTURA', 0, 50, { align: 'right' })
    // Cambia tamaño de fuente a 10 para detalles
    .fontSize(10)
    // Escribe el número de factura alineado a la derecha
    .text(`Factura N°: ${finanza.id}`, { align: 'right' })
    // Escribe la fecha de movimiento alineada a la derecha
    .text(`Fecha: ${new Date(finanza.fecha_movimiento).toLocaleDateString()}`, {
      align: 'right',
    });

  // Salto de línea vertical para separar secciones
  doc.moveDown();

  // Información fija de la empresa emisora
  doc
    .fontSize(12)
    .text('EMPRESA: Gestión de Máquinas Poker', 40, 120)
    .fontSize(10)
    .text('Dirección: Tegucigalpa, Honduras')
    .text('Teléfono: +504 1234-5678')
    .moveDown();

  // Información del proveedor relacionado a la factura
  doc
    .fontSize(12)
    .text(`PROVEEDOR: ${finanza.proveedor_id?.nombre || 'N/A'}`)
    .fontSize(10)
    .text(`Contacto: ${finanza.proveedor_id?.contacto || '-'}`)
    .moveDown();

  // Título para sección de detalle con subrayado
  doc.fontSize(12).text('Detalle:', { underline: true }).moveDown(0.2);

  // Encabezados de tabla: descripción, tipo y monto, en negrita
  doc.font('Helvetica-Bold').text('Descripción', 40, doc.y, { continued: true });
  doc.text('Tipo', 260, doc.y, { continued: true });
  doc.text('Monto', 400, doc.y);

  // Pequeño espacio vertical entre encabezado y contenido
  doc.moveDown(0.5);
  // Cambia a fuente normal para el contenido
  doc.font('Helvetica');

  // Detalles de la finanza: descripción, tipo movimiento y monto + moneda
  doc.text(finanza.descripcion || '-', 40, doc.y, { continued: true });
  doc.text(finanza.tipo_movimiento, 260, doc.y, { continued: true });
  doc.text(`${finanza.monto} ${finanza.moneda}`, 400, doc.y);

  // Salto de línea
  doc.moveDown();

  // Total de la factura en negrita y tamaño más grande, alineado a la derecha
  doc.font('Helvetica-Bold').fontSize(14).text(
    `TOTAL: ${finanza.monto} ${finanza.moneda}`,
    { align: 'right' }
  );

  // Finaliza la creación del PDF
  doc.end();

  // Espera a que termine la creación para juntar los fragmentos en un buffer
  await new Promise((res) => doc.on('end', res));
  const buffer = Buffer.concat(chunks);

  // Devuelve el PDF como respuesta con cabeceras para descargarlo como archivo
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura-${finanza.id}.pdf`,
    },
  });
}
