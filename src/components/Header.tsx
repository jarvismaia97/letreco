import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  onHelp: () => void;
  onStats: () => void;
}

export default function Header({ onHelp, onStats }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onHelp} style={styles.icon}>
        <Text style={styles.iconText}>?</Text>
      </TouchableOpacity>
      <Text style={styles.title}>LETRECO</Text>
      <TouchableOpacity onPress={onStats} style={styles.icon}>
        <Text style={styles.iconText}>📊</Text>
      </TouchableOpacity>
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
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
