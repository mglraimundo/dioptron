import { useState, useCallback } from 'react';
import { todayISO } from '../lib/formatters';

export interface RefractionData {
  esfera: string;
  cilindro: string;
  eixo: string;
  addPP: string;
  curvaBase: string;
  diametro: string;
}

export interface ClinicalSession {
  prescriptionDate: string; // ISO format for input[type=date]
  patientName: string;
  healthSystemNumber: string;
  od: RefractionData;
  oe: RefractionData;
  addSyncActive: boolean;
  lensType: string;
  observacoes: string;
  clOd: RefractionData;
  clOe: RefractionData;
  clAddSyncActive: boolean;
  lensTypeSyncActive: boolean;
  lensTypeOD: string;
  lensTypeOE: string;
  clObservacoes: string;
}

function defaultRefraction(): RefractionData {
  return { esfera: '', cilindro: '', eixo: '', addPP: '', curvaBase: '', diametro: '' };
}

function defaultSession(): ClinicalSession {
  return {
    prescriptionDate: todayISO(),
    patientName: '',
    healthSystemNumber: '',
    od: defaultRefraction(),
    oe: defaultRefraction(),
    addSyncActive: true,
    lensType: '',
    observacoes: '',
    clOd: defaultRefraction(),
    clOe: defaultRefraction(),
    clAddSyncActive: true,
    lensTypeSyncActive: true,
    lensTypeOD: '',
    lensTypeOE: '',
    clObservacoes: '',
  };
}

type Eye = 'od' | 'oe';
type RefractionField = keyof RefractionData;

export function useClinicalSession() {
  const [session, setSession] = useState<ClinicalSession>(defaultSession);

  const setField = useCallback(<K extends keyof ClinicalSession>(field: K, value: ClinicalSession[K]) => {
    setSession(prev => {
      const next = { ...prev, [field]: value };

      // Lens type sync: OD→OE on every keystroke; disable when user types in OE
      if (field === 'lensTypeOD' && prev.lensTypeSyncActive) {
        next.lensTypeOE = value as string;
      } else if (field === 'lensTypeOE') {
        next.lensTypeSyncActive = false;
      }

      return next;
    });
  }, []);

  const setRefraction = useCallback((eye: Eye, field: RefractionField, value: string) => {
    setSession(prev => {
      const next = { ...prev };
      next[eye] = { ...prev[eye], [field]: value };

      // Add sync: OD→OE on every keystroke; disable when user types in OE
      if (field === 'addPP') {
        if (eye === 'od' && prev.addSyncActive) {
          next.oe = { ...prev.oe, addPP: value };
        } else if (eye === 'oe') {
          next.addSyncActive = false;
        }
      }

      return next;
    });
  }, []);

  const handleAddBlur = useCallback(() => {
    setSession(prev => {
      if (prev.od.addPP !== prev.oe.addPP) {
        return { ...prev, addSyncActive: false };
      }
      return prev;
    });
  }, []);

  const setClRefraction = useCallback((eye: Eye, field: RefractionField, value: string) => {
    setSession(prev => {
      const odKey = 'clOd' as const;
      const oeKey = 'clOe' as const;
      const target = eye === 'od' ? odKey : oeKey;
      const next = { ...prev, [target]: { ...prev[target], [field]: value } };

      if (field === 'addPP') {
        if (eye === 'od' && prev.clAddSyncActive) {
          next.clOe = { ...prev.clOe, addPP: value };
        } else if (eye === 'oe') {
          next.clAddSyncActive = false;
        }
      }

      return next;
    });
  }, []);

  const handleClAddBlur = useCallback(() => {
    setSession(prev => {
      if (prev.clOd.addPP !== prev.clOe.addPP) {
        return { ...prev, clAddSyncActive: false };
      }
      return prev;
    });
  }, []);

  const handleLensTypeBlur = useCallback(() => {
    setSession(prev => {
      if (prev.lensTypeOD !== prev.lensTypeOE) {
        return { ...prev, lensTypeSyncActive: false };
      }
      return prev;
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession(defaultSession);
  }, []);

  return { session, setField, setRefraction, handleAddBlur, setClRefraction, handleClAddBlur, handleLensTypeBlur, clearSession };
}
