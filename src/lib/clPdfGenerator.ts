import type { Content, TableCell } from 'pdfmake/interfaces';
import type { ClinicalSession, RefractionData } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
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

function buildDocContent(session: ClinicalSession, provider: ProviderConfig, dateStr: string): Content[] {
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

  return [
    buildHeaderBlock('PRESCRIÇÃO DE LENTES DE CONTACTO'),
    buildPatientBlock(session),
    makeUnifiedTable(session.clOd, session.clOe),
    ...notesContent,
    buildSignatureBlock(provider, dateStr),
  ];
}

export async function generateClPdf(session: ClinicalSession, provider: ProviderConfig): Promise<void> {
  ensureFonts();
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const docDefinition = wrapDocDefinition(buildDocContent(session, provider, dateStr));
  const filename = buildFilename('receita_lc_', session);
  await pdfMake.createPdf(docDefinition).download(filename);
}

export async function printClPdf(session: ClinicalSession, provider: ProviderConfig): Promise<void> {
  ensureFonts();
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const docDefinition = wrapDocDefinition(buildDocContent(session, provider, dateStr));
  pdfMake.createPdf(docDefinition).print();
}
