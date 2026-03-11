import { useState } from 'react';

export interface ProviderConfig {
  providerName: string;
  licenseNumber: string;
  signatureImage?: string;
}

const STORAGE_KEY = 'dioptronProviderConfig';
const SIGNATURE_STORAGE_KEY = 'dioptronProviderSignature';

const defaultConfig: ProviderConfig = {
  providerName: '',
  licenseNumber: '',
};

function load(): ProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base: ProviderConfig = raw ? { ...defaultConfig, ...JSON.parse(raw) } : { ...defaultConfig };
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
        const { signatureImage: _, ...rest } = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      }
      return updated;
    });
  }

  function removeSignature() {
    localStorage.removeItem(SIGNATURE_STORAGE_KEY);
    setConfig(prev => {
      const { signatureImage: _, ...rest } = prev;
      return rest;
    });
  }

  return { config, updateField, removeSignature };
}
