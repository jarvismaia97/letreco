import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { GameMode } from '../hooks/useGame';

interface Props {
  gameMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export default function GameModeSelector({ gameMode, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pill, gameMode === 'daily' && styles.pillActive]}
        onPress={() => onSelect('daily')}
      >
        <Text style={[styles.text, gameMode === 'daily' && styles.textActive]}>
          🔥 Palavra do Dia
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.pill, gameMode === 'practice' && styles.pillActive]}
        onPress={() => onSelect('practice')}
      >
        <Text style={[styles.text, gameMode === 'practice' && styles.textActive]}>
          Prática
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 12,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minWidth: 120,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.correct,
  },
  text: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: COLORS.white,
  },
});