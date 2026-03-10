import { useState } from 'react';
import { formatDiopter, formatAddPP, isDiopterValid } from '../lib/formatters';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  positive?: boolean; // clamp to >= 0 (for Add PP)
}

export function DiopterInput({ value, onChange, onBlur, id, positive }: Props) {
  const [error, setError] = useState(false);

  function handleBlur() {
    if (!value) { onBlur?.(); return; }
    const formatted = positive ? formatAddPP(value) : formatDiopter(value);
    onChange(formatted);
    setError(!isDiopterValid(formatted));
    onBlur?.();
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="text"
      autoComplete="off"
      value={value}
      onChange={e => { setError(false); onChange(e.target.value); }}
      onBlur={handleBlur}
      className={`w-full border rounded-md px-2 py-1.5 text-sm text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
        error ? 'border-red-400' : 'border-slate-300'
      }`}
    />
  );
}
