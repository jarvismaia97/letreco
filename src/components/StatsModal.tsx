import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, MAX_ATTEMPTS } from '../theme';
import type { GameStats } from '../hooks/useGame';

interface Props {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
  gameOver: boolean;
  won: boolean;
  answer: string;
  shareText: string;
}

export default function StatsModal({ visible, onClose, stats, gameOver, won, answer, shareText }: Props) {
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
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>

          {gameOver && !won && (
            <Text style={styles.answer}>A palavra era: {answer}</Text>
          )}

          <Text style={styles.heading}>ESTATÍSTICAS</Text>
          <View style={styles.statsRow}>
            {[
              { val: stats.played, label: 'Jogos' },
              { val: winPct, label: '% Vitórias' },
              { val: stats.currentStreak, label: 'Sequência' },
              { val: stats.maxStreak, label: 'Melhor Seq.' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.heading}>DISTRIBUIÇÃO</Text>
          {stats.distribution.map((count, i) => (
            <View key={i} style={styles.distRow}>
              <Text style={styles.distLabel}>{i + 1}</Text>
              <View
                style={[
                  styles.distBar,
                  {
                    width: `${Math.max((count / maxDist) * 100, 7)}%`,
                    backgroundColor: count > 0 ? COLORS.correct : COLORS.absent,
                  },
                ]}
              >
                <Text style={styles.distCount}>{count}</Text>
              </View>
            </View>
          ))}

          {gameOver && (
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareTxt}>PARTILHAR 📤</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.modalBg,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  closeBtn: { position: 'absolute', top: 12, right: 12 },
  closeTxt: { color: COLORS.white, fontSize: 20 },
  answer: {
    color: COLORS.present,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heading: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    letterSpacing: 1,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  statItem: { alignItems: 'center' },
  statVal: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: COLORS.lightGray, fontSize: 11 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  distLabel: { color: COLORS.white, fontSize: 14, width: 20, textAlign: 'right', marginRight: 6 },
  distBar: { borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, minWidth: 24 },
  distCount: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', textAlign: 'right' },
  shareBtn: {
    backgroundColor: COLORS.correct,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  shareTxt: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});
