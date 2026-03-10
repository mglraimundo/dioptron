import { useState } from 'react';

export interface ProviderConfig {
  providerName: string;
  licenseNumber: string;
}

const STORAGE_KEY = 'dioptronProviderConfig';

const defaultConfig: ProviderConfig = {
  providerName: '',
  licenseNumber: '',
};

function load(): ProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaultConfig };
}

export function useProviderConfig() {
  const [config, setConfig] = useState<ProviderConfig>(load);

  function updateField(field: keyof ProviderConfig, value: string) {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return { config, updateField };
}
