import type { RefractionData } from '../hooks/useClinicalSession';
import { DiopterInput } from './DiopterInput';
import { AxisInput } from './AxisInput';
import { DecimalInput } from './DecimalInput';

type Eye = 'od' | 'oe';
type Field = keyof RefractionData;

interface Props {
  od: RefractionData;
  oe: RefractionData;
  onChange: (eye: Eye, field: Field, value: string) => void;
  onAddBlur: () => void;
}

const COLUMNS: { label: string; field: Field; type: 'diopter' | 'axis' | 'decimal' }[] = [
  { label: 'Esfera', field: 'esfera', type: 'diopter' },
  { label: 'Cilindro', field: 'cilindro', type: 'diopter' },
  { label: 'Eixo', field: 'eixo', type: 'axis' },
  { label: 'Add', field: 'addPP', type: 'diopter' },
  { label: 'Curva Base', field: 'curvaBase', type: 'decimal' },
  { label: 'Diâmetro', field: 'diametro', type: 'decimal' },
];

function EyeRow({ eye, label, data, onChange, onAddBlur }: {
  eye: Eye;
  label: string;
  data: RefractionData;
  onChange: (eye: Eye, field: Field, value: string) => void;
  onAddBlur: () => void;
}) {
  return (
    <tr>
      <td className="px-3 py-2 text-sm font-semibold text-slate-600 whitespace-nowrap">
        {label}
      </td>
      {COLUMNS.map(col => (
        <td key={col.field} className="px-1.5 py-1.5">
          {col.type === 'diopter' ? (
            <DiopterInput
              value={data[col.field]}
              onChange={v => onChange(eye, col.field, v)}
              onBlur={col.field === 'addPP' ? onAddBlur : undefined}
              positive={col.field === 'addPP'}
            />
          ) : col.type === 'axis' ? (
            <AxisInput
              value={data[col.field]}
              onChange={v => onChange(eye, col.field, v)}
            />
          ) : (
            <DecimalInput
              value={data[col.field]}
              onChange={v => onChange(eye, col.field, v)}
            />
          )}
        </td>
      ))}
    </tr>
  );
}

export function ContactLensGrid({ od, oe, onChange, onAddBlur }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-16" />
            {COLUMNS.map(col => (
              <th
                key={col.field}
                className="px-1.5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide text-center"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <EyeRow eye="od" label="OD" data={od} onChange={onChange} onAddBlur={onAddBlur} />
          <EyeRow eye="oe" label="OE" data={oe} onChange={onChange} onAddBlur={onAddBlur} />
        </tbody>
      </table>
    </div>
  );
}
