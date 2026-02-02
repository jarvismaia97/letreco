interface Props {
  visible: boolean;
  onClose: () => void;
}

function ExampleTile({ letter, bg }: { letter: string; bg?: string }) {
  return (
    <div
      className={`w-9 h-9 flex items-center justify-center border-2 border-base-300 font-bold text-base-content mr-1 ${bg || ''}`}
    >
      {letter}
    </div>
  );
}

export default function HelpModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          ✕
        </button>

        <h2 className="text-center font-bold text-lg tracking-widest mb-4">COMO JOGAR</h2>

        <p className="text-sm text-base-content/70 mb-2">
          Adivinha a palavra em 6 tentativas.
        </p>
        <p className="text-sm text-base-content/70 mb-2">
          Cada tentativa deve ser uma palavra válida em português. Carrega em ENTER para submeter.
        </p>
        <p className="text-sm text-base-content/70 mb-4">
          Após cada tentativa, as cores das letras mudam para mostrar o quão perto estás da palavra certa.
        </p>

        <h3 className="font-bold text-sm mb-2">Exemplos</h3>

        <div className="flex my-2">
          <ExampleTile letter="P" bg="bg-[var(--color-correct)] !border-transparent" />
          <ExampleTile letter="R" />
          <ExampleTile letter="A" />
          <ExampleTile letter="T" />
          <ExampleTile letter="O" />
        </div>
        <p className="text-sm text-base-content/70 mb-3">
          A letra <span className="font-bold text-[var(--color-correct)]">P</span> está na palavra e na posição correta.
        </p>

        <div className="flex my-2">
          <ExampleTile letter="F" />
          <ExampleTile letter="E" bg="bg-[var(--color-present)] !border-transparent" />
          <ExampleTile letter="S" />
          <ExampleTile letter="T" />
          <ExampleTile letter="A" />
        </div>
        <p className="text-sm text-base-content/70 mb-3">
          A letra <span className="font-bold text-[var(--color-present)]">E</span> está na palavra mas na posição errada.
        </p>

        <div className="flex my-2">
          <ExampleTile letter="M" />
          <ExampleTile letter="U" />
          <ExampleTile letter="N" />
          <ExampleTile letter="D" bg="bg-[var(--color-absent)] !border-transparent" />
          <ExampleTile letter="O" />
        </div>
        <p className="text-sm text-base-content/70 mb-4">
          A letra <span className="font-bold">D</span> não está na palavra.
        </p>

        <p className="text-sm text-base-content/70 mb-2">
          Uma nova palavra fica disponível todos os dias! Escolhe entre modos de 4, 5, 6 ou 7 letras.
        </p>
        <p className="text-sm text-base-content/70">
          Os acentos são preenchidos automaticamente — escreve sem acentos.
        </p>
      </div>
    </div>
  );
}
