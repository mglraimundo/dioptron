import pdfMake from 'pdfmake/build/pdfmake';
// @ts-expect-error — pdfmake standard font module has no types
import pdfFonts from 'pdfmake/build/standard-fonts/Helvetica';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { ClinicalSession } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import type { RefractionData } from '../hooks/useClinicalSession';
import { INSTITUTION_LOGO, FOOTER_TEXT } from './constants';
import { isoToDDMMYYYY, sanitizeFilename } from './formatters';

let fontsInitialized = false;
export function ensureFonts() {
  if (!fontsInitialized) {
    pdfMake.addFontContainer(pdfFonts);
    fontsInitialized = true;
  }
}

export { pdfMake };

export function addValue(data: RefractionData): string {
  const val = parseFloat(data.addPP);
  if (!val || val === 0) return '—';
  return data.addPP;
}

export function buildHeaderBlock(title: string): Content {
  return {
    columns: [
      {
        image: INSTITUTION_LOGO,
        width: 180,
      },
      {
        text: title,
        bold: true,
        fontSize: 10,
        alignment: 'right',
        width: '*',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 0, 0, 24] as [number, number, number, number],
  };
}

export function buildPatientBlock(session: ClinicalSession): Content {
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
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

  return {
    stack: patientStack,
    margin: [0, 0, 0, 16] as [number, number, number, number],
  };
}

export function buildSignatureBlock(provider: ProviderConfig): Content {
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

  return {
    stack: signatureStack,
    margin: [0, 40, 0, 0] as [number, number, number, number],
  };
}

export function wrapDocDefinition(content: Content[]): TDocumentDefinitions {
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

export function buildFilename(prefix: string, session: ClinicalSession): string {
  const dateForFile = session.prescriptionDate.replace(/-/g, '');
  const safeName = sanitizeFilename(session.patientName);
  return `${prefix}${safeName}_${dateForFile}.pdf`;
}
