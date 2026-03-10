import type { RefractionData } from '../hooks/useClinicalSession';
import type { Eye } from '../hooks/useClinicalSession';
import type { ColumnDef } from './refractionColumns';
import { DiopterInput } from './DiopterInput';
import { AxisInput } from './AxisInput';
import { DecimalInput } from './DecimalInput';

type Field = keyof RefractionData;

interface Props {
  od: RefractionData;
  os: RefractionData;
  columns: ColumnDef[];
  onChange: (eye: Eye, field: Field, value: string) => void;
  onFieldBlur?: Partial<Record<Field, () => void>>;
}

function EyeRow({ eye, label, data, columns, onChange, onFieldBlur }: {
  eye: Eye;
  label: string;
  data: RefractionData;
  columns: ColumnDef[];
  onChange: (eye: Eye, field: Field, value: string) => void;
  onFieldBlur?: Partial<Record<Field, () => void>>;
}) {
  return (
    <tr>
      <td className="px-3 py-2 text-sm font-semibold text-slate-600 whitespace-nowrap">
        {label}
      </td>
      {columns.map(col => (
        <td key={col.field} className="px-1.5 py-1.5">
          {col.type === 'diopter' ? (
            <DiopterInput
              value={data[col.field]}
              onChange={v => onChange(eye, col.field, v)}
              onBlur={onFieldBlur?.[col.field]}
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
              onBlur={onFieldBlur?.[col.field]}
            />
          )}
        </td>
      ))}
    </tr>
  );
}

export function RefractionGrid({ od, os, columns, onChange, onFieldBlur }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-16" />
            {columns.map(col => (
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
          <EyeRow eye="od" label="OD" data={od} columns={columns} onChange={onChange} onFieldBlur={onFieldBlur} />
          <EyeRow eye="os" label="OE" data={os} columns={columns} onChange={onChange} onFieldBlur={onFieldBlur} />
        </tbody>
      </table>
    </div>
  );
}
