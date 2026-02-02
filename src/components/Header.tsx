
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onHelp: () => void;
  onStats: () => void;
}

export default function Header({ onHelp, onStats }: HeaderProps) {
  const { toggleTheme, themeMode } = useTheme();

  return (
    <div className="header">
      <button className="icon-button" onClick={onHelp} title="Ajuda">
        ❓
      </button>
      
      <h1 className="header-title">Letreco</h1>
      
      <div className="header-icons">
        <button 
          className="icon-button" 
          onClick={toggleTheme} 
          title={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="icon-button" onClick={onStats} title="Estatísticas">
          📊
        </button>
      </div>
    </div>
  );
}