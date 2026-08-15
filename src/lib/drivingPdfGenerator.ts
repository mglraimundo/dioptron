import type { Content } from 'pdfmake/interfaces';
import type { ClinicalSession } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import type { BrandConfig } from '../hooks/useBrandConfig';
import { isoToDDMMYYYY } from './formatters';
import {
  ensureFonts,
  pdfMake,
  buildPatientBlock,
  buildSignatureBlock,
  wrapDocDefinition,
  buildFilename,
} from './pdfBase';
import { DRIVING_CERTIFICATE_TITLE, DRIVING_RESTRICTIONS, hasDrivingCertificateAlert, type DrivingCertificateData } from './drivingCertificate';
import { INSTITUTION_LOGO, FOOTER_TEXT } from './constants';

const BODY_FONT_SIZE = 10.5;

function buildDrivingHeaderBlock(title: string, dateStr: string, brand?: BrandConfig): Content {
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
          { text: title, bold: true, fontSize: 14, alignment: 'right' },
          { text: dateStr, fontSize: 9, alignment: 'right', margin: [0, 4, 0, 0] as [number, number, number, number] },
        ],
        width: '*',
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
    margin: [0, 0, 0, 24] as [number, number, number, number],
  };
}

function formatAcuity(value: string): string {
  const normalized = value.trim();
  if (!normalized) return '/10';
  return normalized.includes('/') ? normalized : `${normalized}/10`;
}

function buildAcuityColumn(label: string, value: string, correction: string): Content {
  return {
    stack: [
      { text: label, fontSize: 8.5, color: '#64748b', margin: [0, 0, 0, 2] as [number, number, number, number] },
      { text: `${formatAcuity(value)} ${correction.toLowerCase()}`, bold: true, fontSize: BODY_FONT_SIZE },
    ],
  };
}

function buildStatusLine(label: string, value: string): Content {
  return {
    text: [
      { text: `${label}: ` },
      { text: value, bold: true },
    ],
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.2,
    margin: [0, 0, 0, 3] as [number, number, number, number],
  };
}

function buildAssessmentLine(number: number, title: string, statement: string, value: string): Content {
  return {
    text: [
      { text: `${number}. ${title}`, bold: true },
      { text: ` | ${statement}: ` },
      { text: value, bold: true },
    ],
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.22,
    margin: [0, 0, 0, 7] as [number, number, number, number],
  };
}

function buildDrivingBody(data: DrivingCertificateData): Content {
  const stack: Content[] = [
    {
      stack: [
        { text: '1. Acuidade Visual', bold: true, fontSize: 11, margin: [0, 0, 0, 5] as [number, number, number, number] },
        {
          columns: [
            buildAcuityColumn('Olho direito', data.visualAcuityOD, data.visualAcuityCorrection),
            buildAcuityColumn('Olho esquerdo', data.visualAcuityOS, data.visualAcuityCorrection),
            buildAcuityColumn('Dois olhos', data.visualAcuityOU, data.visualAcuityCorrection),
          ],
          columnGap: 14,
          margin: [0, 0, 0, 7] as [number, number, number, number],
        },
        buildStatusLine('Visão não corrigida em cada um dos olhos é superior a 0.5/10', data.uncorrectedAboveMinimum),
        buildStatusLine('Potência das lentes excede +/- 6.0 dioptrias', data.lensPowerExceedsSix),
      ],
      margin: [0, 0, 0, 8] as [number, number, number, number],
      unbreakable: true,
    },
    buildAssessmentLine(2, 'Visão Monocular', 'Utente apresenta visão monocular', data.monocularVision),
    buildAssessmentLine(3, 'Diplopia', 'Utente sofre de diplopia', data.diplopia),
    buildAssessmentLine(4, 'Campo Visual e Visão Periférica', 'Apresenta alterações do campo visual ou da visão periférica', data.visualFieldChanges),
    buildAssessmentLine(5, 'Visão das Cores', 'Apresenta alterações da visão cromática', data.colorVisionChanges),
  ];

  if (data.colorVisionChanges === 'SIM') {
    stack.push({
      text: [
        { text: 'Acromatópsia: ' },
        { text: data.achromatopsia, bold: true },
        { text: '   Protanopia: ' },
        { text: data.protanopia, bold: true },
      ],
      fontSize: BODY_FONT_SIZE,
      lineHeight: 1.2,
      margin: [14, -4, 0, 7] as [number, number, number, number],
    });
  }

  stack.push(
    buildAssessmentLine(6, 'Visão Crepuscular', 'Apresenta alterações da visão crepuscular', data.twilightVisionChanges),
    buildAssessmentLine(7, 'Doença Oftalmológica Progressiva', 'Outra doença progressiva detetada', data.progressiveEyeDisease),
  );

  if (hasDrivingCertificateAlert(data)) {
    stack.push(buildAssessmentLine(8, 'Parecer de oftalmologista favorável à condução', 'Parecer', data.ophthalmologistOpinion));
  }

  const selectedRestrictions = DRIVING_RESTRICTIONS.filter(item => data.restrictions.includes(item.code));
  stack.push({
    stack: selectedRestrictions.length > 0
      ? [
          { text: 'Restrições', bold: true, fontSize: BODY_FONT_SIZE, margin: [0, 1, 0, 3] as [number, number, number, number] },
          ...selectedRestrictions.map(item => ({ text: `${item.code} ${item.label}`, fontSize: BODY_FONT_SIZE, lineHeight: 1.2 })),
        ]
      : [
          {
            text: [
              { text: 'Restrições: ', bold: true },
              { text: 'não aplicável' },
            ],
            fontSize: BODY_FONT_SIZE,
            lineHeight: 1.2,
          },
        ],
    margin: [0, 0, 0, 8] as [number, number, number, number],
  });

  if (data.observations.trim()) {
    stack.push({
      stack: [
        { text: 'Observações', bold: true, fontSize: BODY_FONT_SIZE, margin: [0, 0, 0, 3] as [number, number, number, number] },
        { text: data.observations.trim(), fontSize: BODY_FONT_SIZE, lineHeight: 1.25 },
      ],
    });
  }

  return { stack };
}

function buildDrivingDocDefinition(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig) {
  const certificate = session.drivingCertificate;
  const dateStr = isoToDDMMYYYY(session.prescriptionDate);
  const content: Content[] = [
    buildDrivingHeaderBlock(DRIVING_CERTIFICATE_TITLE, dateStr, brand),
    buildPatientBlock(session),
    buildDrivingBody(certificate),
    buildSignatureBlock(provider),
  ];
  const docDefinition = wrapDocDefinition(content, brand);
  const footerText = brand ? (brand.footerText ?? '') : FOOTER_TEXT;
  docDefinition.footer = {
    text: footerText,
    fontSize: 9,
    alignment: 'center',
    margin: [40, 20, 40, 0],
  };
  return docDefinition;
}

export async function generateDrivingPdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  const filename = buildFilename('', session);
  await pdfMake.createPdf(buildDrivingDocDefinition(session, provider, brand)).download(filename);
}

export async function printDrivingPdf(session: ClinicalSession, provider: ProviderConfig, brand?: BrandConfig): Promise<void> {
  ensureFonts();
  pdfMake.createPdf(buildDrivingDocDefinition(session, provider, brand)).print();
}
