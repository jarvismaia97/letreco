import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { LetterState } from '../hooks/useGame';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

interface Props {
  onKeyPress: (key: string) => void;
  keyColors: Record<string, LetterState>;
}

function getKeyBg(state: LetterState | undefined, theme: any): string {
  switch (state) {
    case 'correct': return theme.colors.correct;
    case 'present': return theme.colors.present;
    case 'absent': return theme.colors.absent;
    default: return theme.colors.keyBg;
  }
}

export default function Keyboard({ onKeyPress, keyColors }: Props) {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const keyWidth = Math.min(Math.floor((width - 30) / 10), 40);
  const keyHeight = Math.min(52, Math.floor(height * 0.065));

  return (
    <View style={styles.container}>
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === '⌫';
            const displayKey = key === '⌫' ? '⌫' : key === 'ENTER' ? 'ENTER' : key;
            const bg = isSpecial ? theme.colors.keyBg : getKeyBg(keyColors[key], theme);
            const w = isSpecial ? keyWidth * 1.5 : keyWidth;

            return (
              <TouchableOpacity
                key={key}
                style={[styles.key, { width: w, height: keyHeight, backgroundColor: bg }]}
                onPress={() => onKeyPress(key === '⌫' ? 'BACKSPACE' : key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, { color: theme.colors.keyText }, isSpecial && { fontSize: 12 }]}>{displayKey}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 10 : 5,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  key: {
    marginHorizontal: 2.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
