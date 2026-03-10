import { useState, useEffect, useRef } from 'react';
import type { ClinicalSession, RefractionData } from '../hooks/useClinicalSession';
import type { ProviderConfig } from '../hooks/useProviderConfig';
import { RefractionGrid } from './RefractionGrid';
import { GLASSES_COLUMNS } from './refractionColumns';
import LensTypeInput from './LensTypeInput';
import { isDiopterValid, isoToDDMMYYYY, ddmmyyyyToISO, capitalize } from '../lib/formatters';
import { inputClass } from '../lib/styles';
import { SectionDivider } from './SectionDivider';
import type { Eye } from '../hooks/useClinicalSession';

type RefractionField = keyof ClinicalSession['od'];

interface Props {
  session: ClinicalSession;
  provider: ProviderConfig;
  onProviderUpdate: (field: keyof ProviderConfig, value: string) => void;
  setField: <K extends keyof ClinicalSession>(field: K, value: ClinicalSession[K]) => void;
  setRefraction: (eye: Eye, field: RefractionField, value: string) => void;
  handleAddBlur: () => void;
}


const ALL_REFRACTION_FIELDS = ['esfera', 'cilindro', 'eixo', 'addPP'] as const;
const DIOPTER_FIELDS = ['esfera', 'cilindro', 'addPP'] as const;
const EYES: Eye[] = ['od', 'oe'];

export function PrescriptionForm({ session, provider, onProviderUpdate, setField, setRefraction, handleAddBlur }: Props) {
  const [loading, setLoading] = useState<'pdf' | 'print' | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dateText, setDateText] = useState(() => isoToDDMMYYYY(session.prescriptionDate));
  const [dateInvalid, setDateInvalid] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setDateText(isoToDDMMYYYY(session.prescriptionDate));
    if (datePickerRef.current) datePickerRef.current.value = session.prescriptionDate;
  }, [session.prescriptionDate]);

  const hasAnyRefraction = EYES.some(eye =>
    ALL_REFRACTION_FIELDS.some(f => session[eye][f].trim() !== '')
  );
  const hasValidationError = EYES.some(eye =>
    DIOPTER_FIELDS.some(f => !isDiopterValid(session[eye][f]))
  );
  const canGenerate =
    session.patientName.trim() !== '' &&
    provider.providerName.trim() !== '' &&
    provider.licenseNumber.trim() !== '' &&
    session.prescriptionDate.trim() !== '' &&
    hasAnyRefraction &&
    !hasValidationError;

  async function handleGeneratePdf() {
    setLoading('pdf');
    setPdfError(null);
    try {
      const { generatePdf } = await import('../lib/pdfGenerator');
      await generatePdf(session, provider);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
    } finally {
      setLoading(null);
    }
  }

  async function handleCopyRx() {
    function formatEye(label: string, data: RefractionData): string {
      const add = parseFloat(data.addPP) || 0;
      const addPart = add !== 0 ? `, add ${data.addPP}` : '';
      const cyl = parseFloat(data.cilindro) || 0;
      const cylPart = cyl !== 0 ? ` (${data.cilindro} x ${data.eixo}º)` : '';
      return `${label} ${data.esfera}${cylPart}${addPart}`;
    }

    function isEyeEmpty(data: RefractionData): boolean {
      return !data.esfera && !data.cilindro && !data.eixo && !data.addPP;
    }

    const lines = ['', 'R/'];
    if (!isEyeEmpty(session.od)) lines.push(formatEye('OD', session.od));
    if (!isEyeEmpty(session.oe)) lines.push(formatEye('OE', session.oe));
    if (session.lensType.trim()) lines.push(capitalize(session.lensType.trim()));
    if (session.observacoes.trim()) lines.push(capitalize(session.observacoes.trim()));

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handlePrint() {
    setLoading('print');
    setPdfError(null);
    try {
      const { printPdf } = await import('../lib/pdfGenerator');
      await printPdf(session, provider);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Erro ao imprimir');
    } finally {
      setLoading(null);
    }
  }

  return (
      <div className="p-6 flex flex-col gap-6">
        {/* Patient info */}
        <div>
          <SectionDivider label="Utente" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="patientName" className="text-sm font-medium text-slate-600">
                Nome do Paciente
              </label>
              <input
                id="patientName"
                type="text"
                autoComplete="off"
                value={session.patientName}
                onChange={e => setField('patientName', e.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="healthSystemNumber" className="text-sm font-medium text-slate-600">
                Beneficiário
              </label>
              <input
                id="healthSystemNumber"
                type="text"
                autoComplete="off"
                value={session.healthSystemNumber}
                onChange={e => setField('healthSystemNumber', e.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>

        {/* Prescrição: refraction grid + lens + notes */}
        <div>
          <SectionDivider label="Prescrição" />
          <RefractionGrid
            od={session.od}
            oe={session.oe}
            columns={GLASSES_COLUMNS}
            onChange={setRefraction}
            onAddBlur={handleAddBlur}
          />
          <div className="mt-7">
            <LensTypeInput
              id="lensType"
              label="Tipo de Lentes"
              value={session.lensType}
              onChange={val => setField('lensType', val)}
            />
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <label htmlFor="observacoes" className="text-sm font-medium text-slate-600">
              Observações
            </label>
            <textarea
              id="observacoes"
              autoComplete="off"
              value={session.observacoes}
              onChange={e => setField('observacoes', e.target.value)}
              rows={3}
              className={`${inputClass} w-full resize-none overflow-y-auto`}
            />
          </div>
        </div>

        {/* Provider settings */}
        <div>
          <SectionDivider label="Médico" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="providerName" className="text-sm font-medium text-slate-600">
                Nome do Médico
              </label>
              <input
                id="providerName"
                type="text"
                value={provider.providerName}
                onChange={e => onProviderUpdate('providerName', e.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="licenseNumber" className="text-sm font-medium text-slate-600">
                Nº Cédula OM
              </label>
              <input
                id="licenseNumber"
                type="text"
                value={provider.licenseNumber}
                onChange={e => onProviderUpdate('licenseNumber', e.target.value.replace(/\D/g, ''))}
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="prescriptionDate" className="text-sm font-medium text-slate-600">
                Data
              </label>
              <div className="relative">
                <input
                  id="prescriptionDate"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="dd/mm/aaaa"
                  value={dateText}
                  onChange={e => { setDateText(e.target.value); setDateInvalid(false); }}
                  onBlur={() => {
                    const iso = ddmmyyyyToISO(dateText);
                    if (iso) { setField('prescriptionDate', iso); setDateInvalid(false); }
                    else if (dateText.trim() !== '') setDateInvalid(true);
                  }}
                  className={`${inputClass} w-full pr-8 ${dateInvalid ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => datePickerRef.current?.showPicker()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  tabIndex={-1}
                  aria-label="Abrir calendário"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  className="sr-only"
                  onChange={e => {
                    setField('prescriptionDate', e.target.value);
                    setDateText(isoToDDMMYYYY(e.target.value));
                    setDateInvalid(false);
                  }}
                />
              </div>
              {dateInvalid && (
                <p className="text-xs text-red-500 mt-0.5">Data inválida</p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex gap-2 justify-end">
              <button
                onClick={handleGeneratePdf}
                disabled={!canGenerate || loading !== null}
                title={!canGenerate ? 'Preencha todos os campos obrigatórios e adicione pelo menos um valor de refração' : undefined}
                aria-label="PDF"
                className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="hidden sm:inline">{loading === 'pdf' ? 'A gerar...' : 'PDF'}</span>
              </button>
              <button
                onClick={handleCopyRx}
                disabled={!canGenerate || loading !== null}
                title={!canGenerate ? 'Preencha todos os campos obrigatórios e adicione pelo menos um valor de refração' : undefined}
                aria-label="Registar Rx"
                className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Registar Rx'}</span>
              </button>
              <button
                onClick={handlePrint}
                disabled={!canGenerate || loading !== null}
                title={!canGenerate ? 'Preencha todos os campos obrigatórios e adicione pelo menos um valor de refração' : undefined}
                aria-label="Imprimir"
                className="flex items-center gap-2 px-2.5 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span className="hidden sm:inline">{loading === 'print' ? 'A imprimir...' : 'Imprimir'}</span>
              </button>
          </div>
          {pdfError && (
            <p role="alert" className="text-xs text-red-600 text-right mt-2">
              {pdfError}
            </p>
          )}
        </div>
      </div>
  );
}
