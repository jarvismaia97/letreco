import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  message: string;
}

export default function Toast({ message }: Props) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [message]);

  if (!message) return null;

  // For toasts, we'll use the opposite colors to ensure visibility
  const toastBg = theme.name === 'dark' ? '#ffffff' : '#1a1a1b';
  const toastText = theme.name === 'dark' ? '#1a1a1b' : '#ffffff';

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: toastBg }]}>
      <Text style={[styles.text, { color: toastText }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    zIndex: 100,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
