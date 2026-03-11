import type { Content } from 'pdfmake/interfaces';
import type { ClinicalSession } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import type { BrandConfig } from '../hooks/useBrandConfig';
import { isoToDDMMYYYY } from './formatters';
import {
  ensureFonts, pdfMake,
  buildPatientBlock, buildSignatureBlock,
  wrapDocDefinition, buildFilename,
} from './pdfBase';
import { INSTITUTION_LOGO, FOOTER_TEXT } from './constants';

function buildBlankHeaderBlock(instructionsTitle: string, dateStr: string, brand?: BrandConfig): Content {
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
          { text: instructionsTitle, bold: true, fontSize: 14, alignment: 'right' },
          { text: dateStr, fontSize: 9, alignment: 'right', margin: [0, 4, 0, 0] as [number, number, number, number] },
        ],
        width: '*',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 0, 0, 24] as [number, number, number, number],
  };
}

function buildInstructionsBlock(instructionsText: string): Content {
  return {
    stack: [
      { text: '', margin: [0, 0, 0, 16] as [number, number, number, number] },
      { text: instructionsText, fontSize: 13, preserveLeadingSpaces: true, alignment: 'justify' },
    ],
    margin: [0, 0, 0, 0] as [number, number, number, number],
  };
}

function buildDocContent(session: ClinicalSession, provider: ProviderConfig, dateStr: string, brand?: BrandConfig): Content[] {
  return [
    buildBlankHeaderBlock(session.instructionsTitle, dateStr, brand),
    buildPatientBlock(session),
    buildInstructionsBlock(session.instructionsText),
    buildSignatureBlock(provider),
  ];
}

function buildBlankDocDefinition(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig) {
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const docDefinition = wrapDocDefinition(buildDocContent(session, provider, dateStr, brand), brand);
  const footerText = brand ? (brand.footerText ?? '') : FOOTER_TEXT;
  docDefinition.footer = (currentPage: number, pageCount: number) => ({
    columns: [
      {
        text: footerText,
        fontSize: 10,
        alignment: 'center',
        margin: [40, 20, 0, 0],
      },
      pageCount > 1
        ? {
            text: `${currentPage}/${pageCount}`,
            fontSize: 9,
            alignment: 'right',
            margin: [0, 20, 40, 0],
            width: 60,
          }
        : { text: '', width: 60 },
    ],
  });
  return docDefinition;
}

export async function generateBlankPdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  const docDefinition = buildBlankDocDefinition(session, provider, brand);
  const filename = buildFilename('', session);
  await pdfMake.createPdf(docDefinition).download(filename);
}

export async function printBlankPdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  const docDefinition = buildBlankDocDefinition(session, provider, brand);
  pdfMake.createPdf(docDefinition).print();
}
