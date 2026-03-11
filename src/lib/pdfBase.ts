import pdfMake from 'pdfmake/build/pdfmake';
// @ts-expect-error — pdfmake standard font module has no types
import pdfFonts from 'pdfmake/build/standard-fonts/Helvetica';
import JsBarcode from 'jsbarcode';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { ClinicalSession } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import type { BrandConfig } from '../hooks/useBrandConfig';
import type { RefractionData } from '../hooks/useClinicalSession';
import { INSTITUTION_LOGO, FOOTER_TEXT } from './constants';
import { sanitizeFilename } from './formatters';

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

export function buildHeaderBlock(title: string, dateStr: string, brand?: BrandConfig): Content {
  function logoColumn() {
    if (!brand) return { image: INSTITUTION_LOGO, width: 180 };
    if (brand.logoImage) return { image: brand.logoImage, fit: [180, 60] as [number, number] };
    return { text: '', width: 180 };
  }
  return {
    columns: [
      logoColumn(),
      {
        stack: [
          { text: title, bold: true, fontSize: 10, alignment: 'right' },
          { text: dateStr, fontSize: 9, alignment: 'right', margin: [0, 4, 0, 0] as [number, number, number, number] },
        ],
        width: '*',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 0, 0, 24] as [number, number, number, number],
  };
}

function generateBarcodeDataUrl(licenseNumber: string): string {
  const canvas = document.createElement('canvas');
  const barcodeText = `M${licenseNumber}`;
  JsBarcode(canvas, barcodeText, {
    format: 'CODE39',
    width: 1,
    height: 40,
    displayValue: false,
    margin: 0,
  });
  return canvas.toDataURL('image/png');
}

export function buildPatientBlock(session: ClinicalSession): Content {
  const patientStack: Content[] = [
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 0, 0, 60] as [number, number, number, number] },
    { text: session.patientName.toUpperCase(), bold: true, fontSize: 14, margin: [0, 0, 0, 8] as [number, number, number, number] },
  ];

  if (session.healthSystemNumber) {
    patientStack.push({ text: session.healthSystemNumber.toUpperCase(), fontSize: 12, margin: [0, 0, 0, 0] as [number, number, number, number] });
  }

  return {
    stack: patientStack,
    margin: [0, 0, 0, 16] as [number, number, number, number],
  };
}

export function buildSignatureBlock(provider: ProviderConfig): Content {
  const stack: Content[] = [
    { text: provider.providerName || '', bold: true, fontSize: 12, alignment: 'center' },
    provider.signatureImage
      ? { image: provider.signatureImage, fit: [200, 70] as [number, number], alignment: 'center', margin: [0, 8, 0, 8] as [number, number, number, number] }
      : { text: ' ', fontSize: 100 },
    {
      text: provider.licenseNumber
        ? `Médico Oftalmologista (OM nº ${provider.licenseNumber})`
        : 'Médico Oftalmologista',
      fontSize: 9,
      alignment: 'center',
      margin: [0, 0, 0, 6] as [number, number, number, number],
    },
  ];

  if (provider.licenseNumber) {
    stack.push({
      image: generateBarcodeDataUrl(provider.licenseNumber),
      width: 120,
      alignment: 'center',
    } as Content);
    stack.push({
      text: `*M${provider.licenseNumber}*`,
      fontSize: 8,
      alignment: 'center',
      margin: [0, 2, 0, 16] as [number, number, number, number],
    });
  }

  return {
    stack,
    margin: [0, 120, 0, 0] as [number, number, number, number],
  };
}

export function wrapDocDefinition(content: Content[], brand?: BrandConfig): TDocumentDefinitions {
  const footerText = brand ? (brand.footerText ?? '') : FOOTER_TEXT;
  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 80],
    content,
    footer: {
      text: footerText,
      fontSize: 10,
      alignment: 'center',
      margin: [40, 20, 40, 0],
    },
    defaultStyle: {
      font: 'Helvetica',
    },
  };
}

export function buildFilename(prefix: string, session: ClinicalSession): string {
  const words = session.patientName.trim().split(/\s+/);
  const namePart = words.length > 1
    ? `${words[0]}_${words[words.length - 1]}`
    : words[0];
  const name = sanitizeFilename(namePart).toLowerCase();
  const hsn = session.healthSystemNumber.replace(/\s+/g, '').toLowerCase();
  const date = session.prescriptionDate.replace(/-/g, '');
  return `${prefix}${name}_${hsn}_${date}.pdf`;
}
