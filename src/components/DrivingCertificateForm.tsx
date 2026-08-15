import { useEffect, useRef, useState } from 'react';
import type { BrandConfig } from '../hooks/useBrandConfig';
import type { ClinicalSession } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import {
  buildDrivingCertificateText,
  DRIVING_CERTIFICATE_TITLE,
  DRIVING_RESTRICTIONS,
  hasDrivingCertificateAlert,
  type DrivingCertificateData,
  type DrivingRestrictionCode,
} from '../lib/drivingCertificate';
import { ddmmyyyyToISO, isoToDDMMYYYY } from '../lib/formatters';
import { generateDrivingPdf, printDrivingPdf } from '../lib/drivingPdfGenerator';
import { inputClass } from '../lib/styles';
import { SectionDivider } from './SectionDivider';
import { SignatureUpload } from './SignatureUpload';
import { ProviderNameField } from './ProviderNameField';

interface Props {
  session: ClinicalSession;
  provider: ProviderConfig;
  onProviderUpdate: (field: keyof ProviderConfig, value: string) => void;
  onProviderRemoveSignature: () => void;
  setField: <K extends keyof ClinicalSession>(field: K, value: ClinicalSession[K]) => void;
  brand?: BrandConfig;
}

interface ChoiceGroupProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  defaultValue: T;
  warningOptions?: readonly T[];
  successOptions?: readonly T[];
  onChange: (value: T) => void;
}

const YES_NO = ['NÃO', 'SIM'] as const;

function ChoiceGroup<T extends string>({ label, value, options, defaultValue, warningOptions = [], successOptions = [], onChange }: ChoiceGroupProps<T>) {
  function selectedClass(option: T): string {
    if (option === defaultValue || successOptions.includes(option)) {
      return 'border-emerald-600 bg-emerald-600 text-white';
    }
    if (warningOptions.includes(option)) {
      return 'border-amber-400 bg-amber-400 text-amber-950';
    }
    return 'border-red-600 bg-red-600 text-white';
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="whitespace-pre-line text-sm font-medium text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(option => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              value === option
                ? selectedClass(option)
                : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AcuityCorrectionSelector({ value, onChange }: { value: DrivingCertificateData['visualAcuityCorrection']; onChange: (value: DrivingCertificateData['visualAcuityCorrection']) => void }) {
  const options = ['Sem correção', 'Com correção'] as const;
  return (
    <div role="group" aria-label="Correção da acuidade visual" className="flex gap-1.5">
      {options.map(option => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === option
              ? 'border-slate-600 bg-slate-600 text-white'
              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-500 hover:bg-slate-100'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function DrivingCertificateForm({ session, provider, onProviderUpdate, onProviderRemoveSignature, setField, brand }: Props) {
  const [loading, setLoading] = useState<'pdf' | 'print' | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dateText, setDateText] = useState(() => isoToDDMMYYYY(session.prescriptionDate));
  const [dateInvalid, setDateInvalid] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const certificate = session.drivingCertificate;
  const generatedText = buildDrivingCertificateText(certificate);
  const hasAlert = hasDrivingCertificateAlert(certificate);

  useEffect(() => {
    setDateText(isoToDDMMYYYY(session.prescriptionDate));
    if (datePickerRef.current) datePickerRef.current.value = session.prescriptionDate;
  }, [session.prescriptionDate]);

  function updateCertificate<K extends keyof DrivingCertificateData>(field: K, value: DrivingCertificateData[K]) {
    setField('drivingCertificate', { ...certificate, [field]: value });
  }

  function toggleRestriction(code: DrivingRestrictionCode) {
    const restrictions = certificate.restrictions.includes(code)
      ? []
      : [code];
    updateCertificate('restrictions', restrictions);
  }

  const hasVisualAcuity = certificate.visualAcuityOD.trim() !== ''
    && certificate.visualAcuityOS.trim() !== ''
    && certificate.visualAcuityOU.trim() !== '';
  const hasRequiredOpinion = !hasAlert
    || certificate.ophthalmologistOpinion === 'FAVORÁVEL'
    || certificate.ophthalmologistOpinion === 'NÃO FAVORÁVEL';
  const canCopy = hasVisualAcuity && hasRequiredOpinion;
  const canGenerate = session.patientName.trim() !== ''
    && provider.providerName.trim() !== ''
    && provider.licenseNumber.trim() !== ''
    && session.prescriptionDate.trim() !== ''
    && canCopy;

  async function handleGeneratePdf() {
    setLoading('pdf');
    setPdfError(null);
    try {
      await generateDrivingPdf(session, provider, brand);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
    } finally {
      setLoading(null);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(`${DRIVING_CERTIFICATE_TITLE}:\n${generatedText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handlePrint() {
    setLoading('print');
    setPdfError(null);
    try {
      await printDrivingPdf(session, provider, brand);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Erro ao imprimir');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      <div>
        <SectionDivider label="Utente" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="cc-patientName" className="text-sm font-medium text-slate-600">Nome do Paciente</label>
            <input
              id="cc-patientName"
              type="text"
              autoComplete="off"
              value={session.patientName}
              onChange={event => setField('patientName', event.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cc-healthSystemNumber" className="text-sm font-medium text-slate-600">Beneficiário</label>
            <input
              id="cc-healthSystemNumber"
              type="text"
              autoComplete="off"
              value={session.healthSystemNumber}
              onChange={event => setField('healthSystemNumber', event.target.value)}
              className={`${inputClass} w-full`}
            />
          </div>
        </div>
      </div>

      <div>
        <SectionDivider label="Avaliação oftalmológica" />
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Acuidade Visual</h2>
              <AcuityCorrectionSelector
                value={certificate.visualAcuityCorrection}
                onChange={value => updateCertificate('visualAcuityCorrection', value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                ['visualAcuityOD', 'Olho direito'],
                ['visualAcuityOS', 'Olho esquerdo'],
                ['visualAcuityOU', 'Dois olhos'],
              ] as const).map(([field, label]) => (
                <div key={field} className="flex flex-col gap-1">
                  <label htmlFor={`cc-${field}`} className="text-xs font-medium text-slate-600">{label}</label>
                  <div className="flex items-center">
                    <input
                      id={`cc-${field}`}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={certificate[field]}
                      onChange={event => updateCertificate(field, event.target.value)}
                      className={`${inputClass} w-full rounded-r-none bg-white`}
                    />
                    <span className="self-stretch flex items-center rounded-r-md border border-l-0 border-slate-300 bg-white px-3 text-sm text-slate-500">/10</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ChoiceGroup
                label="Visão não corrigida em cada olho superior a 0.5/10"
                value={certificate.uncorrectedAboveMinimum}
                options={YES_NO}
                defaultValue="SIM"
                onChange={value => updateCertificate('uncorrectedAboveMinimum', value)}
              />
              <ChoiceGroup
                label="Potência das lentes excede +/- 6.0 dioptrias"
                value={certificate.lensPowerExceedsSix}
                options={YES_NO}
                defaultValue="NÃO"
                onChange={value => updateCertificate('lensPowerExceedsSix', value)}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <ChoiceGroup
              label="Visão Monocular"
              value={certificate.monocularVision}
              options={['NÃO', 'SIM (> 6 meses)', 'SIM (< 6 meses)']}
              defaultValue="NÃO"
              warningOptions={['SIM (> 6 meses)']}
              onChange={value => updateCertificate('monocularVision', value)}
            />
            <ChoiceGroup
              label="Diplopia"
              value={certificate.diplopia}
              options={['NÃO', 'SIM (> 6 meses)', 'SIM (< 6 meses)']}
              defaultValue="NÃO"
              warningOptions={['SIM (> 6 meses)']}
              onChange={value => updateCertificate('diplopia', value)}
            />
            <ChoiceGroup
              label="Alterações do campo visual ou visão periférica"
              value={certificate.visualFieldChanges}
              options={YES_NO}
              defaultValue="NÃO"
              onChange={value => updateCertificate('visualFieldChanges', value)}
            />
            <div className="flex flex-col gap-2">
              <ChoiceGroup
                label="Alterações da visão cromática"
                value={certificate.colorVisionChanges}
                options={YES_NO}
                defaultValue="NÃO"
                onChange={value => updateCertificate('colorVisionChanges', value)}
              />
              {certificate.colorVisionChanges === 'SIM' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2.5">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <ChoiceGroup
                      label="Acromatópsia"
                      value={certificate.achromatopsia}
                      options={YES_NO}
                      defaultValue="NÃO"
                      onChange={value => updateCertificate('achromatopsia', value)}
                    />
                    <ChoiceGroup
                      label="Protanopia"
                      value={certificate.protanopia}
                      options={YES_NO}
                      defaultValue="NÃO"
                      onChange={value => updateCertificate('protanopia', value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <ChoiceGroup
              label="Alterações da visão crepuscular"
              value={certificate.twilightVisionChanges}
              options={YES_NO}
              defaultValue="NÃO"
              onChange={value => updateCertificate('twilightVisionChanges', value)}
            />
            <ChoiceGroup
              label="Doença oftalmológica progressiva"
              value={certificate.progressiveEyeDisease}
              options={YES_NO}
              defaultValue="NÃO"
              onChange={value => updateCertificate('progressiveEyeDisease', value)}
            />
          </div>

          {hasAlert && (
            <ChoiceGroup
              label="Parecer de oftalmologista favorável à condução"
              value={certificate.ophthalmologistOpinion}
              options={['FAVORÁVEL', 'NÃO FAVORÁVEL']}
              defaultValue="FAVORÁVEL"
              successOptions={['FAVORÁVEL']}
              onChange={value => updateCertificate('ophthalmologistOpinion', value)}
            />
          )}
        </div>
      </div>

      <div>
        <SectionDivider label="Restrições e observações" />
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Restrições</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DRIVING_RESTRICTIONS.map(restriction => {
              const selected = certificate.restrictions.includes(restriction.code);
              return (
                <button
                  key={restriction.code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRestriction(restriction.code)}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                >
                  <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border ${selected ? 'border-emerald-600 bg-emerald-600 ring-2 ring-white ring-inset' : 'border-slate-400'}`} aria-hidden="true" />
                  <span><strong>{restriction.code}</strong><br />{restriction.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="cc-observations" className="text-sm font-medium text-slate-600">Observações</label>
          <textarea
            id="cc-observations"
            value={certificate.observations}
            onChange={event => updateCertificate('observations', event.target.value)}
            rows={3}
            className={`${inputClass} w-full resize-y`}
          />
        </div>
      </div>

      <div>
        <SectionDivider label="Texto gerado" />
        <textarea
          aria-label="Pré-visualização do texto da carta de condução"
          value={generatedText}
          readOnly
          rows={10}
          className={`${inputClass} w-full resize-y bg-slate-50 font-mono text-xs leading-relaxed`}
        />
      </div>

      <div>
        <SectionDivider label="Médico" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProviderNameField inputId="cc-providerName" provider={provider} onProviderUpdate={onProviderUpdate} />
          <div className="flex flex-col gap-1">
            <label htmlFor="cc-licenseNumber" className="text-sm font-medium text-slate-600">Nº Cédula OM</label>
            <input id="cc-licenseNumber" type="text" value={provider.licenseNumber} onChange={event => onProviderUpdate('licenseNumber', event.target.value.replace(/\D/g, ''))} className={`${inputClass} w-full`} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cc-prescriptionDate" className="text-sm font-medium text-slate-600">Data</label>
            <div className="relative">
              <input
                id="cc-prescriptionDate"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="dd/mm/aaaa"
                value={dateText}
                onChange={event => { setDateText(event.target.value); setDateInvalid(false); }}
                onBlur={() => {
                  const iso = ddmmyyyyToISO(dateText);
                  if (iso) { setField('prescriptionDate', iso); setDateInvalid(false); }
                  else if (dateText.trim() !== '') setDateInvalid(true);
                }}
                className={`${inputClass} w-full pr-8 ${dateInvalid ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              <button type="button" onClick={() => datePickerRef.current?.showPicker()} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600" tabIndex={-1} aria-label="Abrir calendário">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>
              <input ref={datePickerRef} type="date" className="sr-only" onChange={event => { setField('prescriptionDate', event.target.value); setDateText(isoToDDMMYYYY(event.target.value)); setDateInvalid(false); }} />
            </div>
            {dateInvalid && <p className="text-xs text-red-500 mt-0.5">Data inválida</p>}
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <label className="text-sm font-medium text-slate-600">Assinatura</label>
            <SignatureUpload signatureImage={provider.signatureImage} onUpload={dataUrl => onProviderUpdate('signatureImage', dataUrl)} onRemove={onProviderRemoveSignature} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex gap-2 justify-end">
          <button onClick={handleGeneratePdf} disabled={!canGenerate || loading !== null} title={!canGenerate ? 'Preencha o utente, médico e os três valores de acuidade visual' : undefined} aria-label="PDF" className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">{loading === 'pdf' ? 'A gerar...' : 'PDF'}</span>
          </button>
          <button onClick={handleCopy} disabled={!canCopy || loading !== null} title={!canCopy ? 'Preencha os três valores de acuidade visual e o parecer quando aplicável' : undefined} aria-label="Copiar" className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {copied ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
          <button onClick={handlePrint} disabled={!canGenerate || loading !== null} title={!canGenerate ? 'Preencha o utente, médico e os três valores de acuidade visual' : undefined} aria-label="Imprimir" className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span className="hidden sm:inline">{loading === 'print' ? 'A imprimir...' : 'Imprimir'}</span>
          </button>
        </div>
        {pdfError && <p role="alert" className="text-xs text-red-600 text-right mt-2">{pdfError}</p>}
      </div>
    </div>
  );
}
