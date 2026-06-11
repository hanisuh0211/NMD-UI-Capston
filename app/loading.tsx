import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../theme';

export default function LoadingScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const rotation = useRef(new Animated.Value(0)).current;

  const isNewUser = type === 'new';

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      router.replace(isNewUser ? '/onboarding' : '/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.loadingCircle, { transform: [{ rotate: spin }] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#E5EEFF',
    borderTopColor: Colors.blue500,
  },
});
