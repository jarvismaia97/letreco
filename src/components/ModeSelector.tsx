import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

const MODES = [4, 5, 6, 7];

interface Props {
  mode: number;
  onSelect: (mode: number) => void;
}

export default function ModeSelector({ mode, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m}
          style={[styles.pill, mode === m && styles.pillActive]}
          onPress={() => onSelect(m)}
        >
          <Text style={[styles.text, mode === m && styles.textActive]}>{m} letras</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  pillActive: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.correct,
  },
  text: {
    color: COLORS.lightGray,
    fontSize: 13,
    fontWeight: '600',
  },
  textActive: {
    color: COLORS.white,
  },
});
