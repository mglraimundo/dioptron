export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
        <img
          src="/avatar.webp"
          alt="Dioptron"
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
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
