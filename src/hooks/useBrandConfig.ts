import { useState } from 'react';

export interface BrandConfig {
  footerText?: string;
  logoImage?: string;
}

const CONFIG_KEY = 'dioptronBrandConfig';
const LOGO_KEY = 'dioptronBrandLogo';

function load(): BrandConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    const base: BrandConfig = raw ? JSON.parse(raw) : {};
    const logo = localStorage.getItem(LOGO_KEY);
    if (logo) base.logoImage = logo;
    return base;
  } catch { /* ignore */ }
  return {};
}

export function useBrandConfig() {
  const [config, setConfig] = useState<BrandConfig>(load);

  function updateField(field: keyof BrandConfig, value: string) {
    setConfig(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'logoImage') {
        localStorage.setItem(LOGO_KEY, value);
      } else {
        const { logoImage: _, ...rest } = updated;
        localStorage.setItem(CONFIG_KEY, JSON.stringify(rest));
      }
      return updated;
    });
  }

  function removeLogo() {
    localStorage.removeItem(LOGO_KEY);
    setConfig(prev => {
      const { logoImage: _, ...rest } = prev;
      return rest;
    });
  }

  return { config, updateField, removeLogo };
}
