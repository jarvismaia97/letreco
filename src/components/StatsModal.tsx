import { useState, useCallback } from 'react';
import { X, Flame, PartyPopper, Check, MessageCircle, Link, Twitter, Instagram, Download } from 'lucide-react';
import { MAX_ATTEMPTS } from '../constants';
import type { GameStats, GameMode, TileData } from '../hooks/useGame';
import { getAccentedWord } from '../data/words';
import { getDefinition } from '../data/definitions';

interface Props {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
  gameOver: boolean;
  won: boolean;
  answer: string;
  shareText: string;
  gameMode: GameMode;
  board: TileData[][];
  letterMode: number;
}

export default function StatsModal({ visible, onClose, stats, gameOver, won, answer, shareText, gameMode, board, letterMode }: Props) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateShareImage = useCallback(async () => {
    setGenerating(true);
    
    // Get played rows (with letters)
    const playedRows = board.filter(row => row.some(tile => tile.letter));
    const attempts = playedRows.length;
    const result = won ? `${attempts}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
    
    // Calculate day number
    const startDate = new Date('2024-06-19');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Canvas dimensions (Instagram Story: 1080x1920)
    const width = 1080;
    const height = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Background gradient (dark theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Load and draw logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logo.onload = () => resolve();
      logo.onerror = () => resolve();
      logo.src = '/letreco-logo.png';
    });
    
    if (logo.complete && logo.naturalWidth > 0) {
      const logoWidth = 500;
      const logoHeight = (logo.naturalHeight / logo.naturalWidth) * logoWidth;
      ctx.drawImage(logo, (width - logoWidth) / 2, 200, logoWidth, logoHeight);
    } else {
      // Fallback: draw text
      ctx.font = 'bold 80px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('LETRECO', width / 2, 280);
    }
    
    // Game info
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`Dia ${dayNumber} · ${letterMode} letras · ${result}`, width / 2, 480);
    
    // Draw grid
    const tileSize = 100;
    const gap = 12;
    const gridWidth = letterMode * tileSize + (letterMode - 1) * gap;
    const gridHeight = playedRows.length * tileSize + (playedRows.length - 1) * gap;
    const startX = (width - gridWidth) / 2;
    const startY = (height - gridHeight) / 2 - 50;
    
    const colors: Record<string, string> = {
      correct: '#538d4e',
      present: '#b59f3b', 
      absent: '#3a3a3c',
      tbd: '#3a3a3c',
      empty: '#3a3a3c',
    };
    
    playedRows.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        const x = startX + colIdx * (tileSize + gap);
        const y = startY + rowIdx * (tileSize + gap);
        
        // Draw tile background
        ctx.fillStyle = colors[tile.state] || colors.empty;
        ctx.beginPath();
        ctx.roundRect(x, y, tileSize, tileSize, 8);
        ctx.fill();
      });
    });
    
    // URL at bottom
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff99';
    ctx.textAlign = 'center';
    ctx.fillText('letreco.app', width / 2, height - 200);
    
    // Portugal flag emoji
    ctx.font = '60px system-ui, sans-serif';
    ctx.fillText('🇵🇹', width / 2, height - 120);
    
    // Convert to blob and download/share
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setGenerating(false);
        return;
      }
      
      const file = new File([blob], 'letreco-resultado.png', { type: 'image/png' });
      
      // Try native share with file
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Letreco',
            text: `Letreco ${dayNumber} · ${result}`,
          });
        } catch {
          // User cancelled, download instead
          downloadImage(blob);
        }
      } else {
        // Download image
        downloadImage(blob);
      }
      
      setGenerating(false);
    }, 'image/png');
  }, [board, letterMode, won]);
  
  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'letreco-resultado.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!visible) return null;

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Letreco',
          text: shareText,
          url: 'https://letreco.app',
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await copyToClipboard('https://letreco.app');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        {gameOver && (
          <div className="text-center mb-4">
            {!won && (
              <p className="font-bold text-[var(--color-present)] mb-1">
                A palavra era: {getAccentedWord(answer)}
              </p>
            )}
            {won && (
              <p className="font-bold text-[var(--color-correct)] mb-1 flex items-center justify-center gap-2">
                <PartyPopper className="w-5 h-5" /> {getAccentedWord(answer)}
              </p>
            )}
            {getDefinition(answer) && (
              <p className="text-sm text-base-content/70 italic">
                "{getDefinition(answer)}"
              </p>
            )}
          </div>
        )}

        <h2 className="text-center font-bold text-sm tracking-widest mb-3">ESTATÍSTICAS</h2>

        <div className="flex justify-around mb-4">
          {[
            { val: stats.played, label: 'Jogos', hasFlame: false },
            { val: winPct, label: '% Vitórias', hasFlame: false },
            { val: stats.currentStreak, label: 'Sequência', hasFlame: true },
            { val: stats.maxStreak, label: 'Melhor Seq.', hasFlame: true },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {s.hasFlame && s.val > 0 && <Flame className="w-5 h-5 text-orange-500" />}
                {s.val}
              </div>
              <div className="text-xs text-base-content/60">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-center font-bold text-sm tracking-widest mb-2">DISTRIBUIÇÃO</h2>

        <div className="space-y-1 mb-4">
          {stats.distribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 text-right text-sm font-bold">{i + 1}</span>
              <div
                className="rounded px-2 py-0.5 text-right text-sm font-bold text-white"
                style={{
                  width: `${Math.max((count / maxDist) * 100, 7)}%`,
                  backgroundColor: count > 0 ? 'var(--color-correct)' : 'var(--color-absent)',
                }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>

        {gameOver && gameMode === 'daily' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold border-none gap-2"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
              <button
                className="btn bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-bold border-none gap-2"
                onClick={generateShareImage}
                disabled={generating}
              >
                {generating ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Instagram className="w-4 h-4" />
                )}
                {generating ? 'A gerar...' : 'Instagram'}
              </button>
              <button
                className="btn bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-bold border-none gap-2"
                onClick={handleTwitter}
              >
                <Twitter className="w-4 h-4" /> X / Twitter
              </button>
              <button
                className="btn bg-base-300 hover:bg-base-300/90 text-base-content font-bold border-none gap-2"
                onClick={handleCopyLink}
              >
                {linkCopied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Link className="w-4 h-4" /> Link</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
