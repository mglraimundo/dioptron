export type YesNo = 'NÃO' | 'SIM';
export type AcuityCorrection = 'Sem correção' | 'Com correção';
export type DurationStatus = 'NÃO' | 'SIM (> 6 meses)' | 'SIM (< 6 meses)';
export type MonocularVision = DurationStatus;
export type Diplopia = DurationStatus;
export type OphthalmologistOpinion = '' | 'FAVORÁVEL' | 'NÃO FAVORÁVEL';
export type DrivingRestrictionCode = '01.01' | '01.02' | '01.06';

export const DRIVING_CERTIFICATE_TITLE = 'Carta Condução (Oftalmologia)';

export interface DrivingCertificateData {
  visualAcuityOD: string;
  visualAcuityOS: string;
  visualAcuityOU: string;
  visualAcuityCorrection: AcuityCorrection;
  uncorrectedAboveMinimum: YesNo;
  lensPowerExceedsSix: YesNo;
  monocularVision: MonocularVision;
  diplopia: Diplopia;
  visualFieldChanges: YesNo;
  colorVisionChanges: YesNo;
  achromatopsia: YesNo;
  protanopia: YesNo;
  twilightVisionChanges: YesNo;
  progressiveEyeDisease: YesNo;
  ophthalmologistOpinion: OphthalmologistOpinion;
  restrictions: DrivingRestrictionCode[];
  observations: string;
}

export const DRIVING_RESTRICTIONS: ReadonlyArray<{
  code: DrivingRestrictionCode;
  label: string;
}> = [
  { code: '01.01', label: 'Óculos' },
  { code: '01.02', label: 'Lentes de contacto' },
  { code: '01.06', label: 'Óculos ou lentes de contacto' },
];

export function defaultDrivingCertificate(): DrivingCertificateData {
  return {
    visualAcuityOD: '',
    visualAcuityOS: '',
    visualAcuityOU: '',
    visualAcuityCorrection: 'Sem correção',
    uncorrectedAboveMinimum: 'SIM',
    lensPowerExceedsSix: 'NÃO',
    monocularVision: 'NÃO',
    diplopia: 'NÃO',
    visualFieldChanges: 'NÃO',
    colorVisionChanges: 'NÃO',
    achromatopsia: 'NÃO',
    protanopia: 'NÃO',
    twilightVisionChanges: 'NÃO',
    progressiveEyeDisease: 'NÃO',
    ophthalmologistOpinion: '',
    restrictions: [],
    observations: '',
  };
}

function formatAcuity(value: string): string {
  const normalized = value.trim();
  if (!normalized) return '/10';
  return normalized.includes('/') ? normalized : `${normalized}/10`;
}

export function hasDrivingCertificateAlert(data: DrivingCertificateData): boolean {
  return data.uncorrectedAboveMinimum === 'NÃO'
    || data.lensPowerExceedsSix === 'SIM'
    || data.monocularVision !== 'NÃO'
    || data.diplopia !== 'NÃO'
    || data.visualFieldChanges === 'SIM'
    || data.colorVisionChanges === 'SIM'
    || data.twilightVisionChanges === 'SIM'
    || data.progressiveEyeDisease === 'SIM';
}

export function buildDrivingCertificateText(data: DrivingCertificateData): string {
  const numberedSections = [
    [
      '1. Acuidade Visual:',
      `Olho direito: ${formatAcuity(data.visualAcuityOD)} ${data.visualAcuityCorrection.toLowerCase()} | Olho esquerdo: ${formatAcuity(data.visualAcuityOS)} ${data.visualAcuityCorrection.toLowerCase()} | Dois olhos: ${formatAcuity(data.visualAcuityOU)} ${data.visualAcuityCorrection.toLowerCase()}`,
      `Visão não corrigida em cada um dos olhos é superior a 0.5/10: ${data.uncorrectedAboveMinimum}`,
      `Potência das lentes excede +/- 6.0 dioptrias: ${data.lensPowerExceedsSix}`,
    ].join('\n'),
    `2. Visão Monocular | Utente apresenta visão monocular: ${data.monocularVision}`,
    `3. Diplopia | Utente sofre de diplopia: ${data.diplopia}`,
    `4. Campo Visual e Visão Periférica | Apresenta alterações do campo visual ou da visão periférica: ${data.visualFieldChanges}`,
    data.colorVisionChanges === 'SIM'
      ? `5. Visão das Cores | Apresenta alterações da visão cromática: SIM\nAcromatópsia: ${data.achromatopsia}, Protanopia: ${data.protanopia}`
      : '5. Visão das Cores | Apresenta alterações da visão cromática: NÃO',
    `6. Visão Crepuscular | Apresenta alterações da visão crepuscular: ${data.twilightVisionChanges}`,
    `7. Doença Oftalmológica Progressiva | Outra doença progressiva detetada: ${data.progressiveEyeDisease}`,
  ];

  if (hasDrivingCertificateAlert(data)) {
    numberedSections.push(`8. Parecer de oftalmologista favorável à condução: ${data.ophthalmologistOpinion}`);
  }

  const blocks = [numberedSections.join('\n')];

  if (data.restrictions.length > 0) {
    const selected = DRIVING_RESTRICTIONS
      .filter(item => data.restrictions.includes(item.code))
      .map(item => `${item.code} ${item.label}`);
    blocks.push(`Restrições:\n${selected.join('\n')}`);
  } else {
    blocks.push('Restrições: não aplicável');
  }
  if (data.observations.trim()) blocks.push(`Observações:\n${data.observations.trim()}`);

  return blocks.join('\n\n');
}
