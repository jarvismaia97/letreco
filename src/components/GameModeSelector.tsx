import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GameMode } from '../hooks/useGame';

interface Props {
  gameMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export default function GameModeSelector({ gameMode, onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pill,
          { borderColor: theme.colors.lightGray },
          gameMode === 'daily' && { backgroundColor: theme.colors.correct, borderColor: theme.colors.correct }
        ]}
        onPress={() => onSelect('daily')}
      >
        <Text style={[
          styles.text,
          { color: theme.colors.lightGray },
          gameMode === 'daily' && { color: theme.colors.text }
        ]}>
          🔥 Palavra do Dia
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.pill,
          { borderColor: theme.colors.lightGray },
          gameMode === 'practice' && { backgroundColor: theme.colors.correct, borderColor: theme.colors.correct }
        ]}
        onPress={() => onSelect('practice')}
      >
        <Text style={[
          styles.text,
          { color: theme.colors.lightGray },
          gameMode === 'practice' && { color: theme.colors.text }
        ]}>
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
    minWidth: 120,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});