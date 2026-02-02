import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onHelp: () => void;
  onStats: () => void;
}

export default function Header({ onHelp, onStats }: Props) {
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <TouchableOpacity onPress={onHelp} style={[styles.icon, { borderColor: theme.colors.lightGray }]}>
        <Text style={[styles.iconText, { color: theme.colors.text }]}>?</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.text }]}>LETRECO</Text>
      <View style={styles.rightIcons}>
        <TouchableOpacity onPress={toggleTheme} style={[styles.icon, { borderColor: theme.colors.lightGray }]}>
          <Text style={[styles.iconText, { color: theme.colors.text }]}>
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onStats} style={[styles.icon, { borderColor: theme.colors.lightGray }]}>
          <Text style={[styles.iconText, { color: theme.colors.text }]}>📊</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
