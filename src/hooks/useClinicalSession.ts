import { useState, useCallback } from 'react';
import { todayISO } from '../lib/formatters';

export interface RefractionData {
  sphere: string;
  cylinder: string;
  axis: string;
  addPP: string;
  baseCurve: string;
  diameter: string;
}

export interface ClinicalSession {
  prescriptionDate: string; // ISO format for input[type=date]
  patientName: string;
  healthSystemNumber: string;
  od: RefractionData;
  os: RefractionData;
  addSyncActive: boolean;
  lensType: string;
  notes: string;
  clOd: RefractionData;
  clOs: RefractionData;
  clAddSyncActive: boolean;
  clBaseCurveSyncActive: boolean;
  clDiameterSyncActive: boolean;
  lensTypeSyncActive: boolean;
  lensTypeOD: string;
  lensTypeOS: string;
  clNotes: string;
  instructionsTitle: string;
  instructionsText: string;
}

function defaultRefraction(): RefractionData {
  return { sphere: '', cylinder: '', axis: '', addPP: '', baseCurve: '', diameter: '' };
}

function defaultSession(): ClinicalSession {
  return {
    prescriptionDate: todayISO(),
    patientName: '',
    healthSystemNumber: '',
    od: defaultRefraction(),
    os: defaultRefraction(),
    addSyncActive: true,
    lensType: '',
    notes: '',
    clOd: defaultRefraction(),
    clOs: defaultRefraction(),
    clAddSyncActive: true,
    clBaseCurveSyncActive: true,
    clDiameterSyncActive: true,
    lensTypeSyncActive: true,
    lensTypeOD: '',
    lensTypeOS: '',
    clNotes: '',
    instructionsTitle: '',
    instructionsText: '',
  };
}

export type Eye = 'od' | 'os';
type RefractionField = keyof RefractionData;

export function useClinicalSession() {
  const [session, setSession] = useState<ClinicalSession>(defaultSession);

  const setField = useCallback(<K extends keyof ClinicalSession>(field: K, value: ClinicalSession[K]) => {
    setSession(prev => {
      const next = { ...prev, [field]: value };

      // Lens type sync: OD→OS on every keystroke; disable when user types in OS
      if (field === 'lensTypeOD' && prev.lensTypeSyncActive) {
        next.lensTypeOS = value as string;
      } else if (field === 'lensTypeOS') {
        next.lensTypeSyncActive = false;
      }

      return next;
    });
  }, []);

  const setRefraction = useCallback((eye: Eye, field: RefractionField, value: string) => {
    setSession(prev => {
      const next = { ...prev };
      next[eye] = { ...prev[eye], [field]: value };

      // Add sync: OD→OS on every keystroke; disable when user types in OS
      if (field === 'addPP') {
        if (eye === 'od' && prev.addSyncActive) {
          next.os = { ...prev.os, addPP: value };
        } else if (eye === 'os') {
          next.addSyncActive = false;
        }
      }

      return next;
    });
  }, []);

  const handleAddBlur = useCallback(() => {
    setSession(prev => {
      if (prev.od.addPP !== prev.os.addPP && prev.addSyncActive) {
        return { ...prev, addSyncActive: false };
      }
      return prev;
    });
  }, []);

  const setClRefraction = useCallback((eye: Eye, field: RefractionField, value: string) => {
    setSession(prev => {
      const target = eye === 'od' ? 'clOd' : 'clOs';
      const next = { ...prev, [target]: { ...prev[target], [field]: value } };

      if (field === 'addPP') {
        if (eye === 'od' && prev.clAddSyncActive) {
          next.clOs = { ...prev.clOs, addPP: value };
        } else if (eye === 'os') {
          next.clAddSyncActive = false;
        }
      }

      if (field === 'baseCurve') {
        if (eye === 'od' && prev.clBaseCurveSyncActive) {
          next.clOs = { ...next.clOs, baseCurve: value };
        } else if (eye === 'os') {
          next.clBaseCurveSyncActive = false;
        }
      }

      if (field === 'diameter') {
        if (eye === 'od' && prev.clDiameterSyncActive) {
          next.clOs = { ...next.clOs, diameter: value };
        } else if (eye === 'os') {
          next.clDiameterSyncActive = false;
        }
      }

      return next;
    });
  }, []);

  const handleClAddBlur = useCallback(() => {
    setSession(prev => {
      if (prev.clOd.addPP !== prev.clOs.addPP && prev.clAddSyncActive) {
        return { ...prev, clAddSyncActive: false };
      }
      return prev;
    });
  }, []);

  const handleClBaseCurveBlur = useCallback(() => {
    setSession(prev => {
      if (prev.clOd.baseCurve !== prev.clOs.baseCurve && prev.clBaseCurveSyncActive) {
        return { ...prev, clBaseCurveSyncActive: false };
      }
      return prev;
    });
  }, []);

  const handleClDiameterBlur = useCallback(() => {
    setSession(prev => {
      if (prev.clOd.diameter !== prev.clOs.diameter && prev.clDiameterSyncActive) {
        return { ...prev, clDiameterSyncActive: false };
      }
      return prev;
    });
  }, []);

  const handleLensTypeBlur = useCallback(() => {
    setSession(prev => {
      if (prev.lensTypeOD !== prev.lensTypeOS && prev.lensTypeSyncActive) {
        return { ...prev, lensTypeSyncActive: false };
      }
      return prev;
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession(defaultSession);
  }, []);

  return { session, setField, setRefraction, handleAddBlur, setClRefraction, handleClAddBlur, handleClBaseCurveBlur, handleClDiameterBlur, handleLensTypeBlur, clearSession };
}
