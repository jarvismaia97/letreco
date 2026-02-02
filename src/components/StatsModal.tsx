import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MAX_ATTEMPTS } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import type { GameStats, GameMode } from '../hooks/useGame';

interface Props {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
  gameOver: boolean;
  won: boolean;
  answer: string;
  shareText: string;
  gameMode: GameMode;
}

export default function StatsModal({ visible, onClose, stats, gameOver, won, answer, shareText, gameMode }: Props) {
  const { theme } = useTheme();
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(shareText);
      alert('Resultado copiado!');
    } else {
      try {
        await Share.share({ message: shareText });
      } catch {
        await Clipboard.setStringAsync(shareText);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
        <View style={[styles.modal, { backgroundColor: theme.colors.modalBg }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeTxt, { color: theme.colors.text }]}>✕</Text>
          </TouchableOpacity>

          {gameOver && !won && (
            <Text style={[styles.answer, { color: theme.colors.present }]}>A palavra era: {answer}</Text>
          )}

          <Text style={[styles.heading, { color: theme.colors.text }]}>ESTATÍSTICAS</Text>
          <View style={styles.statsRow}>
            {[
              { val: stats.played, label: 'Jogos' },
              { val: winPct, label: '% Vitórias' },
              { val: stats.currentStreak, label: 'Sequência', emoji: '🔥' },
              { val: stats.maxStreak, label: 'Melhor Seq.', emoji: '🔥' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statVal, { color: theme.colors.text }]}>
                  {s.emoji && s.val > 0 ? `${s.emoji} ` : ''}{s.val}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.lightGray }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.heading, { color: theme.colors.text }]}>DISTRIBUIÇÃO</Text>
          {stats.distribution.map((count, i) => (
            <View key={i} style={styles.distRow}>
              <Text style={[styles.distLabel, { color: theme.colors.text }]}>{i + 1}</Text>
              <View
                style={[
                  styles.distBar,
                  {
                    width: `${Math.max((count / maxDist) * 100, 7)}%`,
                    backgroundColor: count > 0 ? theme.colors.correct : theme.colors.absent,
                  },
                ]}
              >
                <Text style={[styles.distCount, { color: theme.colors.text }]}>{count}</Text>
              </View>
            </View>
          ))}

          {gameOver && gameMode === 'daily' && (
            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.colors.correct }]} onPress={handleShare}>
              <Text style={[styles.shareTxt, { color: theme.colors.text }]}>PARTILHAR 📤</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12 },
  closeTxt: { fontSize: 20 },
  answer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: 1,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 11 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  distLabel: { fontSize: 14, width: 20, textAlign: 'right', marginRight: 6 },
  distBar: { borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, minWidth: 24 },
  distCount: { fontSize: 13, fontWeight: 'bold', textAlign: 'right' },
  shareBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  shareTxt: { fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
