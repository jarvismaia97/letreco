import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, TILE_GAP } from '../theme';
import type { LetterState } from '../hooks/useGame';

interface Props {
  letter: string;
  state: LetterState;
  size: number;
  delay?: number;
  revealing?: boolean;
  isCursor?: boolean;
  onPress?: () => void;
}

export default function Tile({ letter, state, size, delay = 0, revealing, isCursor, onPress }: Props) {
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

  const borderColor = isCursor
    ? '#ffffff'
    : state === 'tbd'
      ? COLORS.lightGray
      : state === 'empty'
        ? COLORS.emptyBorder
        : 'transparent';

  const borderWidth = (state === 'empty' || state === 'tbd') ? 2 : 0;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  const isRevealed = !revealing || state === 'empty' || state === 'tbd';

  const cursorShadow = isCursor ? {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  } : {};

  const tileContent = (
    <Text style={[styles.letter, { fontSize: size * 0.5 }]}>{letter}</Text>
  );

  if (isRevealed) {
    const inner = (
      <Animated.View
        style={[
          styles.tile,
          cursorShadow,
          {
            width: size,
            height: size,
            backgroundColor: bgColor(),
            borderColor,
            borderWidth: isCursor ? 2.5 : borderWidth,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {tileContent}
      </Animated.View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {inner}
        </TouchableOpacity>
      );
    }
    return inner;
  }

  return (
    <Animated.View style={{ width: size, height: size }}>
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
        {tileContent}
      </Animated.View>
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
        {tileContent}
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
