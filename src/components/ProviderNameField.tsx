import {
  PROVIDER_SALUTATIONS,
  type ProviderConfig,
  type ProviderSalutation,
} from '../hooks/useProviderConfig';
import { inputClass } from '../lib/styles';

interface Props {
  inputId: string;
  provider: ProviderConfig;
  onProviderUpdate: (field: keyof ProviderConfig, value: string) => void;
}

export function ProviderNameField({ inputId, provider, onProviderUpdate }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-600">
        Nome do Médico
      </label>
      <div className="flex gap-2">
        <select
          id={`${inputId}-salutation`}
          aria-label="Saudação"
          value={provider.salutation}
          onChange={event => onProviderUpdate('salutation', event.target.value as ProviderSalutation)}
          className={`${inputClass} w-28 shrink-0 bg-white px-2`}
        >
          {PROVIDER_SALUTATIONS.map(salutation => (
            <option key={salutation} value={salutation}>{salutation}</option>
          ))}
        </select>
        <input
          id={inputId}
          type="text"
          value={provider.providerName}
          onChange={event => onProviderUpdate('providerName', event.target.value)}
          className={`${inputClass} min-w-0 flex-1`}
        />
      </div>
    </div>
  );
}
