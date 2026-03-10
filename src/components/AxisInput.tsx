import { filterAxisInput, clampAxis } from '../lib/formatters';

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function AxisInput({ value, onChange, id }: Props) {
  function handleChange(raw: string) {
    onChange(filterAxisInput(raw));
  }

  function handleBlur() {
    if (value) onChange(clampAxis(value));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={e => handleChange(e.target.value)}
      onBlur={handleBlur}
      className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    />
  );
}
