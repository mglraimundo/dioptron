import { useState, useRef } from 'react';

interface HeaderProps {
  isPersonal: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

export function Header({ isPersonal, onActivate, onDeactivate }: HeaderProps) {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAvatarClick() {
    if (isPersonal) {
      onDeactivate();
      setClicks(0);
      return;
    }

    const next = clicks + 1;
    if (next >= 3) {
      onActivate();
      setClicks(0);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setClicks(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setClicks(0), 2000);
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
        <img
          src="/avatar.webp"
          alt="Dioptron"
          onClick={handleAvatarClick}
          className={`w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer transition-shadow${isPersonal ? ' ring-2 ring-amber-400 ring-offset-2' : ''}`}
        />
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Rx Lentes · Dioptron
          </h1>
          <p className="text-sm text-slate-500 leading-tight">
            Serviço de Oftalmologia · ULS Coimbra
          </p>
        </div>
      </div>
    </header>
  );
}
