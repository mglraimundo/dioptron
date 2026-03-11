import type { RefractionData } from '../hooks/useClinicalSession';

type Field = keyof RefractionData;

export interface ColumnDef {
  label: string;
  field: Field;
  type: 'diopter' | 'axis' | 'decimal';
}

export const GLASSES_COLUMNS: ColumnDef[] = [
  { label: 'ESF', field: 'sphere', type: 'diopter' },
  { label: 'CIL', field: 'cylinder', type: 'diopter' },
  { label: 'Eixo', field: 'axis', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
];

export const CONTACT_LENS_COLUMNS: ColumnDef[] = [
  { label: 'ESF', field: 'sphere', type: 'diopter' },
  { label: 'CIL', field: 'cylinder', type: 'diopter' },
  { label: 'Eixo', field: 'axis', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
  { label: 'CB', field: 'baseCurve', type: 'decimal' },
  { label: 'DIA', field: 'diameter', type: 'decimal' },
];
