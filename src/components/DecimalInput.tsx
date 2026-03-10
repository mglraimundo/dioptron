import { useState } from 'react';
import { formatDecimal2, isDecimal2Valid, filterDecimalInput } from '../lib/formatters';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
}

export function DecimalInput({ value, onChange, onBlur, id }: Props) {
  const [error, setError] = useState(false);

  function handleChange(raw: string) {
    setError(false);
    onChange(filterDecimalInput(raw));
  }

  function handleBlur() {
    if (!value) return;
    const formatted = formatDecimal2(value);
    onChange(formatted);
    setError(!isDecimal2Valid(formatted));
    onBlur?.();
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={e => handleChange(e.target.value)}
      onBlur={handleBlur}
      className={`w-full border rounded-md px-2 py-1.5 text-sm text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
        error ? 'border-red-400' : 'border-slate-300'
      }`}
    />
  );
}
