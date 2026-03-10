import { inputClass } from '../lib/styles';

const PRESETS = [
  { label: 'Longe',        value: 'Lentes monofocais de longe com armação' },
  { label: 'Progressivas', value: 'Lentes progressivas com armação' },
  { label: 'Perto',        value: 'Lentes monofocais de perto com armação' },
  { label: '2 Pares',      value: 'Lentes monofocais de longe e perto com armação (2 pares)' },
]


interface LensTypeInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
}

export default function LensTypeInput({ value, onChange, id, label }: LensTypeInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-600 shrink-0">
            {label}
          </label>
        )}
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {PRESETS.map(preset => {
            const active = value === preset.value
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.value)}
                className={
                  `text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ` +
                  (active
                    ? 'bg-emerald-500 text-white border border-emerald-500'
                    : 'border border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600')
                }
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${inputClass} w-full`}
      />
    </div>
  )
}
