import { useRef } from 'react';

interface Props {
  signatureImage?: string;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}

export function SignatureUpload({ signatureImage, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (typeof ev.target?.result === 'string') {
        onUpload(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-3">
      {signatureImage ? (
        <>
          <img
            src={signatureImage}
            alt="Assinatura"
            className="h-12 max-w-[160px] object-contain border border-slate-200 rounded bg-white"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover imagem"
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded px-2 py-1 transition-colors"
        >
          Carregar imagem
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
