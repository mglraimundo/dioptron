import type { RefractionData } from '../hooks/useClinicalSession';

type Field = keyof RefractionData;

export interface ColumnDef {
  label: string;
  field: Field;
  type: 'diopter' | 'axis' | 'decimal';
}

export const GLASSES_COLUMNS: ColumnDef[] = [
  { label: 'Esfera', field: 'esfera', type: 'diopter' },
  { label: 'Cilindro', field: 'cilindro', type: 'diopter' },
  { label: 'Eixo', field: 'eixo', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
];

export const CONTACT_LENS_COLUMNS: ColumnDef[] = [
  { label: 'Esfera', field: 'esfera', type: 'diopter' },
  { label: 'Cilindro', field: 'cilindro', type: 'diopter' },
  { label: 'Eixo', field: 'eixo', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
  { label: 'Curva Base', field: 'curvaBase', type: 'decimal' },
  { label: 'Diâmetro', field: 'diametro', type: 'decimal' },
];
