
import type { GameStats, GameMode } from '../hooks/useGame';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
  gameOver: boolean;
  won: boolean;
  answer: string;
  shareText: string;
  gameMode: GameMode;
}

export default function StatsModal({
  visible,
  onClose,
  stats,
  gameOver,
  won,
  answer,
  shareText,
  gameMode,
}: StatsModalProps) {
  if (!visible) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDistribution = Math.max(...stats.distribution, 1);

  const handleShare = async () => {
    if (!shareText || gameMode === 'practice') return;

    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Resultado copiado para a área de transferência!');
      }
    } catch (error) {
      console.warn('Failed to share:', error);
      // Manual fallback
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Resultado copiado para a área de transferência!');
      } catch (clipboardError) {
        console.error('Clipboard failed:', clipboardError);
        alert('Não foi possível compartilhar o resultado.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Estatísticas</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.played}</span>
            <span className="stat-label">Jogos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{winPercentage}</span>
            <span className="stat-label">% Vitórias</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.currentStreak}</span>
            <span className="stat-label">Sequência</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.maxStreak}</span>
            <span className="stat-label">Máx Seq.</span>
          </div>
        </div>

        {gameOver && (
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <p>
              {won ? '🎉 Parabéns!' : '😔 Não foi desta vez!'}
            </p>
            <p>
              <strong>Palavra: {answer.toUpperCase()}</strong>
            </p>
          </div>
        )}

        <div className="distribution">
          <h3>Distribuição de Tentativas</h3>
          {stats.distribution.map((count, index) => (
            <div key={index} className="distribution-row">
              <span className="distribution-number">{index + 1}</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill"
                  style={{ 
                    width: `${Math.max((count / maxDistribution) * 100, count > 0 ? 10 : 0)}%` 
                  }}
                >
                  {count > 0 ? count : ''}
                </div>
              </div>
            </div>
          ))}
        </div>

        {shareText && gameMode === 'daily' && (
          <button className="share-button" onClick={handleShare}>
            Compartilhar Resultado
          </button>
        )}
      </div>
    </div>
  );
}