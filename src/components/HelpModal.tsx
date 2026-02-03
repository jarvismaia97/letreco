import { X, PenLine, Gamepad2, Type, Lightbulb, Sun, RefreshCw, Target, Square, CheckSquare } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function ExampleTile({ letter, bg }: { letter: string; bg?: string }) {
  return (
    <div
      className={`w-9 h-9 flex items-center justify-center border-2 border-base-300 font-bold text-base-content mr-1 rounded ${bg || ''}`}
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
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center font-bold text-xl tracking-widest mb-2">LETRECO</h2>
        <p className="text-center text-sm text-base-content/60 mb-4">O Wordle em Português de Portugal</p>

        <div className="divider my-2"></div>

        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><PenLine className="w-4 h-4" /> Como jogar</h3>

        <p className="text-sm text-base-content/70 mb-2">
          Adivinha a palavra em <strong>6 tentativas</strong>.
        </p>
        <p className="text-sm text-base-content/70 mb-2">
          Cada tentativa deve ser uma palavra válida em português. Carrega em ENTER para submeter.
        </p>
        <p className="text-sm text-base-content/70 mb-4">
          Após cada tentativa, as cores das letras mudam para mostrar o quão perto estás da palavra certa:
        </p>

        <div className="flex my-2">
          <ExampleTile letter="P" bg="bg-[var(--color-correct)] !border-transparent" />
          <ExampleTile letter="R" />
          <ExampleTile letter="A" />
          <ExampleTile letter="T" />
          <ExampleTile letter="O" />
        </div>
        <p className="text-sm text-base-content/70 mb-3 flex items-start gap-2">
          <CheckSquare className="w-4 h-4 mt-0.5 text-[var(--color-correct)] flex-shrink-0" />
          <span>A letra <span className="font-bold text-[var(--color-correct)]">P</span> está na palavra e na <strong>posição correta</strong>.</span>
        </p>

        <div className="flex my-2">
          <ExampleTile letter="F" />
          <ExampleTile letter="E" bg="bg-[var(--color-present)] !border-transparent" />
          <ExampleTile letter="S" />
          <ExampleTile letter="T" />
          <ExampleTile letter="A" />
        </div>
        <p className="text-sm text-base-content/70 mb-3 flex items-start gap-2">
          <Square className="w-4 h-4 mt-0.5 text-[var(--color-present)] flex-shrink-0" />
          <span>A letra <span className="font-bold text-[var(--color-present)]">E</span> está na palavra mas na <strong>posição errada</strong>.</span>
        </p>

        <div className="flex my-2">
          <ExampleTile letter="M" />
          <ExampleTile letter="U" />
          <ExampleTile letter="N" />
          <ExampleTile letter="D" bg="bg-[var(--color-absent)] !border-transparent" />
          <ExampleTile letter="O" />
        </div>
        <p className="text-sm text-base-content/70 mb-4 flex items-start gap-2">
          <X className="w-4 h-4 mt-0.5 text-base-content/50 flex-shrink-0" />
          <span>A letra <span className="font-bold">D</span> <strong>não está</strong> na palavra.</span>
        </p>

        <div className="divider my-2"></div>

        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> Modos de jogo</h3>

        <div className="bg-base-300 rounded-lg p-3 mb-3">
          <p className="text-sm font-bold text-base-content mb-1 flex items-center gap-2"><Sun className="w-4 h-4" /> Palavra do Dia</p>
          <p className="text-sm text-base-content/70">
            Uma palavra nova por dia, igual para todos. Volta amanhã para um novo desafio!
          </p>
        </div>

        <div className="bg-base-300 rounded-lg p-3 mb-4">
          <p className="text-sm font-bold text-base-content mb-1 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Treino</p>
          <p className="text-sm text-base-content/70">
            Pratica sem limites! Uma palavra aleatória de cada vez. Perfeito para melhorar.
          </p>
        </div>

        <div className="divider my-2"></div>

        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Type className="w-4 h-4" /> Tamanhos</h3>

        <p className="text-sm text-base-content/70 mb-3">
          Escolhe entre palavras de <strong>4, 5, 6 ou 7 letras</strong>. Cada tamanho tem a sua própria palavra do dia e estatísticas independentes.
        </p>

        <div className="divider my-2"></div>

        <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Dicas</h3>

        <ul className="text-sm text-base-content/70 space-y-1 mb-4">
          <li>• Os <strong>acentos são automáticos</strong> — escreve sem acentos</li>
          <li>• Usa o <strong>teclado físico</strong> ou o virtual</li>
          <li>• Toca numa <strong>letra do tabuleiro</strong> para editar essa posição</li>
          <li>• Partilha o teu resultado com amigos!</li>
        </ul>

        <button className="btn btn-success btn-block gap-2" onClick={onClose}>
          <Target className="w-5 h-5" /> Jogar!
        </button>
      </div>
    </div>
  );
}
