import { useState } from 'react';
import type { BrandConfig } from '../hooks/useBrandConfig';
import { SignatureUpload } from './SignatureUpload';
import { inputClass } from '../lib/styles';

interface Props {
  config: BrandConfig;
  onUpdateField: (field: keyof BrandConfig, value: string) => void;
  onRemoveLogo: () => void;
}

export function BrandConfigSection({ config, onUpdateField, onRemoveLogo }: Props) {
  const isConfigured = !!(config.logoImage && config.footerText);
  const [expanded, setExpanded] = useState(!isConfigured);

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between"
      >
        <h2 className="text-sm font-semibold text-amber-800">Personalização</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-amber-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-600">Logótipo</span>
              <SignatureUpload
                signatureImage={config.logoImage}
                onUpload={dataUrl => onUpdateField('logoImage', dataUrl)}
                onRemove={onRemoveLogo}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Rodapé</label>
              <input
                type="text"
                value={config.footerText ?? ''}
                onChange={e => onUpdateField('footerText', e.target.value)}
  
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
