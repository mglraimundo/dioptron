import type { RefractionData } from '../hooks/useClinicalSession';

type Field = keyof RefractionData;

export interface ColumnDef {
  label: string;
  field: Field;
  type: 'diopter' | 'axis' | 'decimal';
}

export const GLASSES_COLUMNS: ColumnDef[] = [
  { label: 'Esfera', field: 'sphere', type: 'diopter' },
  { label: 'Cilindro', field: 'cylinder', type: 'diopter' },
  { label: 'Eixo', field: 'axis', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
];

export const CONTACT_LENS_COLUMNS: ColumnDef[] = [
  { label: 'Esfera', field: 'sphere', type: 'diopter' },
  { label: 'Cilindro', field: 'cylinder', type: 'diopter' },
  { label: 'Eixo', field: 'axis', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
  { label: 'Curva Base', field: 'baseCurve', type: 'decimal' },
  { label: 'Diâmetro', field: 'diameter', type: 'decimal' },
];
