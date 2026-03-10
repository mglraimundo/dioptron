export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}
