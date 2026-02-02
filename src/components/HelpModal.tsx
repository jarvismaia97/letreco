

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function HelpModal({ visible, onClose }: HelpModalProps) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Como Jogar</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="help-content">
          <p>
            Descubra a palavra oculta em até 6 tentativas. Cada tentativa deve ser uma palavra válida.
          </p>

          <h3>Como funciona:</h3>
          <ul>
            <li>Digite uma palavra e pressione ENTER para enviar</li>
            <li>As cores das letras vão mudar para mostrar quão perto você está da resposta</li>
          </ul>

          <h3>Significado das cores:</h3>
          
          <div style={{ margin: '16px 0' }}>
            <div className="example-tiles">
              <div className="example-tile correct" style={{ borderColor: 'var(--color-correct)', backgroundColor: 'var(--color-correct)', color: '#ffffff' }}>
                L
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                E
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                T
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                R
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                A
              </div>
            </div>
            <p><strong>Verde:</strong> A letra está na palavra e na posição correta.</p>
          </div>

          <div style={{ margin: '16px 0' }}>
            <div className="example-tiles">
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                P
              </div>
              <div className="example-tile present" style={{ borderColor: 'var(--color-present)', backgroundColor: 'var(--color-present)', color: '#ffffff' }}>
                A
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                L
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                M
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                A
              </div>
            </div>
            <p><strong>Amarelo:</strong> A letra está na palavra, mas na posição errada.</p>
          </div>

          <div style={{ margin: '16px 0' }}>
            <div className="example-tiles">
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                C
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                A
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                S
              </div>
              <div className="example-tile absent" style={{ borderColor: 'var(--color-absent)', backgroundColor: 'var(--color-absent)', color: '#ffffff' }}>
                T
              </div>
              <div className="example-tile" style={{ borderColor: 'var(--color-empty-border)' }}>
                O
              </div>
            </div>
            <p><strong>Cinza:</strong> A letra não está presente na palavra.</p>
          </div>

          <h3>Modos de Jogo:</h3>
          <p><strong>Palavra do Dia:</strong> Uma palavra nova todos os dias, igual para todos os jogadores.</p>
          <p><strong>Treino:</strong> Pratique com palavras aleatórias, sem limite.</p>

          <h3>Dicas:</h3>
          <ul>
            <li>Comece com palavras que tenham letras comuns</li>
            <li>Use as informações das cores para eliminar ou confirmar letras</li>
            <li>Pode tocar numa posição da palavra para mover o cursor</li>
            <li>As palavras podem ter letras repetidas</li>
          </ul>

          <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--color-light-gray)' }}>
            Um jogo criado por Josh Wardle. Versão portuguesa adaptada.
          </p>
        </div>
      </div>
    </div>
  );
}