import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MODES = [4, 5, 6, 7];

interface Props {
  mode: number;
  onSelect: (mode: number) => void;
}

export default function ModeSelector({ mode, onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m}
          style={[
            styles.pill, 
            { borderColor: theme.colors.lightGray },
            mode === m && { backgroundColor: theme.colors.correct, borderColor: theme.colors.correct }
          ]}
          onPress={() => onSelect(m)}
        >
          <Text style={[
            styles.text, 
            { color: theme.colors.lightGray },
            mode === m && { color: theme.colors.text }
          ]}>
            {m} letras
          </Text>
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
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
