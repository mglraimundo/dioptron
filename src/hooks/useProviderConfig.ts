import { useState } from 'react';

export const PROVIDER_SALUTATIONS = ['Dr.', 'Dra.', 'Prof. Dr.', 'Prof. Dra.'] as const;
export type ProviderSalutation = typeof PROVIDER_SALUTATIONS[number];

export interface ProviderConfig {
  salutation: ProviderSalutation;
  providerName: string;
  licenseNumber: string;
  signatureImage?: string;
}

const STORAGE_KEY = 'dioptronProviderConfig';
const SIGNATURE_STORAGE_KEY = 'dioptronProviderSignature';

const defaultConfig: ProviderConfig = {
  salutation: 'Dr.',
  providerName: '',
  licenseNumber: '',
};

function load(): ProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) as Partial<ProviderConfig> : {};
    const salutation = PROVIDER_SALUTATIONS.includes(stored.salutation as ProviderSalutation)
      ? stored.salutation as ProviderSalutation
      : defaultConfig.salutation;
    const base: ProviderConfig = { ...defaultConfig, ...stored, salutation };
    const sig = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (sig) base.signatureImage = sig;
    return base;
  } catch { /* ignore */ }
  return { ...defaultConfig };
}

export function useProviderConfig() {
  const [config, setConfig] = useState<ProviderConfig>(load);

  function updateField(field: keyof ProviderConfig, value: string) {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'signatureImage') {
        localStorage.setItem(SIGNATURE_STORAGE_KEY, value);
      } else {
        const rest = { ...updated };
        delete rest.signatureImage;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      }
      return updated;
    });
  }

  function removeSignature() {
    localStorage.removeItem(SIGNATURE_STORAGE_KEY);
    setConfig(prev => {
      const rest = { ...prev };
      delete rest.signatureImage;
      return rest;
    });
  }

  return { config, updateField, removeSignature };
}
