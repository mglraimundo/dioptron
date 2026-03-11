import type { Content, TableCell } from 'pdfmake/interfaces';
import type { ClinicalSession, RefractionData } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import type { BrandConfig } from '../hooks/useBrandConfig';
import { capitalize, isoToDDMMYYYY } from './formatters';
import {
  ensureFonts, pdfMake, addValue,
  buildHeaderBlock, buildPatientBlock, buildSignatureBlock,
  wrapDocDefinition, buildFilename,
} from './pdfBase';

function makeUnifiedTable(od: RefractionData, oe: RefractionData): Content {
  const headerRow: TableCell[] = [
    { text: '', bold: true, fontSize: 11 },
    { text: 'Esfera', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Cilindro', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Eixo', bold: true, fontSize: 11, alignment: 'center' },
    { text: 'Add', bold: true, fontSize: 11, alignment: 'center' },
  ];

  const makeRow = (label: string, data: RefractionData): TableCell[] => {
    const hasCyl = !!parseFloat(data.cylinder);
    return [
      { text: label, bold: true, fontSize: 13, alignment: 'center' },
      { text: data.sphere || '—', alignment: 'center', fontSize: 13 },
      { text: hasCyl ? data.cylinder : '—', alignment: 'center', fontSize: 13 },
      { text: hasCyl ? (data.axis || '0') + '°' : '—', alignment: 'center', fontSize: 13 },
      { text: addValue(data), alignment: 'center', fontSize: 13 },
    ];
  };

  return {
    table: {
      headerRows: 1,
      widths: [50, '*', '*', '*', '*'],
      body: [headerRow, makeRow('OD', od), makeRow('OE', oe)],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cbd5e1',
      vLineColor: () => '#cbd5e1',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 7,
      paddingBottom: () => 7,
    },
    margin: [0, 0, 0, 0] as [number, number, number, number],
  };
}

function buildDocContent(session: ClinicalSession, provider: ProviderConfig, dateStr: string, brand?: BrandConfig): Content[] {
  const notesContent: Content[] = [];

  if (session.lensType) {
    notesContent.push({ text: capitalize(session.lensType), fontSize: 12, margin: [0, 20, 0, 0] as [number, number, number, number] });
  }

  if (session.notes) {
    notesContent.push({ text: 'Observações', bold: true, fontSize: 11, margin: [0, 18, 0, 4] as [number, number, number, number] });
    notesContent.push({ text: capitalize(session.notes), fontSize: 12 });
  }

  return [
    buildHeaderBlock('PRESCRIÇÃO DE ÓCULOS', dateStr, brand),
    buildPatientBlock(session),
    makeUnifiedTable(session.od, session.os),
    ...notesContent,
    buildSignatureBlock(provider),
  ];
}

export async function generatePdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const docDefinition = wrapDocDefinition(buildDocContent(session, provider, dateStr, brand), brand);
  const filename = buildFilename('rec_', session);
  await pdfMake.createPdf(docDefinition).download(filename);
}

export async function printPdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const docDefinition = wrapDocDefinition(buildDocContent(session, provider, dateStr, brand), brand);
  pdfMake.createPdf(docDefinition).print();
}
