import pdfMake from 'pdfmake/build/pdfmake';
// @ts-expect-error — pdfmake standard font module has no types
import pdfFonts from 'pdfmake/build/standard-fonts/Helvetica';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';

let fontsInitialized = false;
function ensureFonts() {
  if (!fontsInitialized) {
    pdfMake.addFontContainer(pdfFonts);
    fontsInitialized = true;
  }
}
import type { ClinicalSession, RefractionData } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import { INSTITUTION_LOGO, FOOTER_TEXT } from './constants';
import { isoToDDMMYYYY, sanitizeFilename, capitalize } from './formatters';

function addValue(data: RefractionData): string {
  const val = parseFloat(data.addPP);
  if (!val || val === 0) return '—';
  return data.addPP;
}

function makeUnifiedTable(od: RefractionData, oe: RefractionData): Content {
  const headerRow: TableCell[] = [
    { text: '', bold: true, fontSize: 11 },
    { text: 'Esfera', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Cilindro', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Eixo', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Add', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Curva Base', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Diâmetro', bold: true, fontSize: 11, alignment: 'center' },
  ];

  const makeRow = (label: string, data: RefractionData): TableCell[] => {
    const hasCyl = !!parseFloat(data.cilindro);
    return [
      { text: label, bold: true, fontSize: 13, alignment: 'center' },
      { text: data.esfera || '—', alignment: 'center', fontSize: 13 },
      { text: hasCyl ? data.cilindro : '—', alignment: 'center', fontSize: 13 },
      { text: hasCyl ? (data.eixo || '0') + '°' : '—', alignment: 'center', fontSize: 13 },
      { text: addValue(data), alignment: 'center', fontSize: 13 },
      { text: data.curvaBase || '—', alignment: 'center', fontSize: 13 },
      { text: data.diametro || '—', alignment: 'center', fontSize: 13 },
    ];
  };

  return {
    table: {
      headerRows: 1,
      widths: [40, '*', '*', '*', '*', '*', '*'],
      body: [headerRow, makeRow('OD', od), makeRow('OE', oe)],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 7,
      paddingBottom: () => 7,
    },
    margin: [0, 0, 0, 0] as [number, number, number, number],
  };
}

function buildDocDefinition(session: ClinicalSession, provider: ProviderConfig): TDocumentDefinitions {
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);

  const headerBlock: Content = {
    columns: [
      {
        image: INSTITUTION_LOGO,
        width: 180,
      },
      {
        text: 'PRESCRIÇÃO DE LENTES DE CONTACTO',
        bold: true,
        fontSize: 10,
        alignment: 'right',
        width: '*',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 0, 0, 24] as [number, number, number, number],
  };

  const patientStack: Content[] = [
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 0, 0, 22] as [number, number, number, number] },
    {
      columns: [
        { text: session.patientName.toUpperCase(), bold: true, fontSize: 16, width: '*' },
        { text: dateStr, fontSize: 10, alignment: 'right', width: 'auto', margin: [0, 4, 0, 0] as [number, number, number, number] },
      ],
      margin: [0, 0, 0, 8] as [number, number, number, number],
    },
  ];

  if (session.healthSystemNumber) {
    patientStack.push({ text: session.healthSystemNumber, fontSize: 12, margin: [0, 0, 0, 0] as [number, number, number, number] });
  }

  const patientBlock: Content = {
    stack: patientStack,
    margin: [0, 0, 0, 16] as [number, number, number, number],
  };

  const refractionTable = makeUnifiedTable(session.clOd, session.clOe);

  const notesContent: Content[] = [];

  if (session.lensTypeOD) {
    notesContent.push({ text: `OD: ${session.lensTypeOD}`, fontSize: 12, margin: [0, 20, 0, 0] as [number, number, number, number] });
  }
  if (session.lensTypeOE) {
    notesContent.push({ text: `OE: ${session.lensTypeOE}`, fontSize: 12, margin: [0, session.lensTypeOD ? 4 : 20, 0, 0] as [number, number, number, number] });
  }

  if (session.clObservacoes) {
    notesContent.push({ text: 'Observações', bold: true, fontSize: 11, margin: [0, 18, 0, 4] as [number, number, number, number] });
    notesContent.push({ text: capitalize(session.clObservacoes), fontSize: 12 });
  }

  const signatureStack: Content[] = [
    { text: provider.providerName || '', bold: true, fontSize: 12, alignment: 'right' },
    { text: ' ', fontSize: 70 },
    {
      text: provider.licenseNumber
        ? `Médico Oftalmologista (OM nº ${provider.licenseNumber})`
        : 'Médico Oftalmologista',
      fontSize: 9,
      alignment: 'right',
      margin: [0, 0, 0, 2] as [number, number, number, number],
    },
  ];

  const signatureBlock: Content = {
    stack: signatureStack,
    margin: [0, 40, 0, 0] as [number, number, number, number],
  };

  const content: Content[] = [
    headerBlock,
    patientBlock,
    refractionTable,
    ...notesContent,
    signatureBlock,
  ];

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 80],
    content,
    footer: {
      text: FOOTER_TEXT,
      fontSize: 8,
      alignment: 'center',
      margin: [40, 20, 40, 0],
    },
    defaultStyle: {
      font: 'Helvetica',
    },
  };
}

export async function generateClPdf(session: ClinicalSession, provider: ProviderConfig): Promise<void> {
  ensureFonts();
  const docDefinition = buildDocDefinition(session, provider);
  const dateForFile = session.prescriptionDate.replace(/-/g, '');
  const safeName = sanitizeFilename(session.patientName);
  const filename = `receita_lc_${safeName}_${dateForFile}.pdf`;
  await pdfMake.createPdf(docDefinition).download(filename);
}

export async function printClPdf(session: ClinicalSession, provider: ProviderConfig): Promise<void> {
  ensureFonts();
  const docDefinition = buildDocDefinition(session, provider);
  pdfMake.createPdf(docDefinition).print();
}
