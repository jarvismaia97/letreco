import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COLORS, TILE_SIZES, TILE_GAP } from '../theme';
import type { LetterState } from '../hooks/useGame';

interface Props {
  letter: string;
  state: LetterState;
  size: number;
  delay?: number;
  revealing?: boolean;
}

export default function Tile({ letter, state, size, delay = 0, revealing }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevState = useRef(state);

  useEffect(() => {
    if (revealing && (state === 'correct' || state === 'present' || state === 'absent')) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [revealing, state, delay]);

  // Pop animation on letter input
  useEffect(() => {
    if (letter && state === 'tbd' && prevState.current === 'empty') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 50, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    }
    prevState.current = state;
  }, [letter, state]);

  const bgColor = () => {
    switch (state) {
      case 'correct': return COLORS.correct;
      case 'present': return COLORS.present;
      case 'absent': return COLORS.absent;
      default: return 'transparent';
    }
  };

  const borderColor = state === 'tbd' ? COLORS.lightGray : state === 'empty' ? COLORS.emptyBorder : 'transparent';

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  const isRevealed = !revealing || state === 'empty' || state === 'tbd';

  if (isRevealed) {
    return (
      <Animated.View
        style={[
          styles.tile,
          {
            width: size,
            height: size,
            backgroundColor: bgColor(),
            borderColor,
            borderWidth: state === 'empty' || state === 'tbd' ? 2 : 0,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize: size * 0.5 }]}>{letter}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ width: size, height: size }}>
      {/* Front (before flip) */}
      <Animated.View
        style={[
          styles.tile,
          styles.tileFace,
          {
            width: size,
            height: size,
            borderColor: COLORS.lightGray,
            borderWidth: 2,
            transform: [{ rotateX: frontInterpolate }],
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize: size * 0.5 }]}>{letter}</Text>
      </Animated.View>
      {/* Back (after flip) */}
      <Animated.View
        style={[
          styles.tile,
          styles.tileFace,
          {
            width: size,
            height: size,
            backgroundColor: bgColor(),
            transform: [{ rotateX: backInterpolate }],
          },
        ]}
      >
        <Text style={[styles.letter, { fontSize: size * 0.5 }]}>{letter}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: TILE_GAP / 2,
  },
  tileFace: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  letter: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
