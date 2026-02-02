const MODES = [4, 5, 6, 7];

interface Props {
  mode: number;
  onSelect: (mode: number) => void;
}

export default function ModeSelector({ mode, onSelect }: Props) {
  return (
    <div className="flex justify-center gap-2 py-2">
      {MODES.map((m) => (
        <button
          key={m}
          className={`btn btn-xs rounded-full px-3 ${
            mode === m
              ? 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white hover:bg-[var(--color-correct)]'
              : 'btn-outline border-base-content/30 text-base-content/60'
          }`}
          onClick={() => onSelect(m)}
        >
          {m} letras
        </button>
      ))}
    </div>
  );
}
