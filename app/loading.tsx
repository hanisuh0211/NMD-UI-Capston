import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function LoadingScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const rotation = useRef(new Animated.Value(0)).current;

  const isNewUser = type === 'new';

  useEffect(() => {
    // 로딩 애니메이션
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // 2초 후 메인으로 이동
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 캐릭터 */}
        <View style={styles.characterCircle}>
          <Text style={styles.characterText}>캐릭터</Text>
        </View>

        {/* 호출 상태 */}
        <View style={styles.callingRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>통화</Text>
          </View>
          <Text style={styles.callingText}>Calling...</Text>
        </View>

        <Text style={styles.appName}>ANYWAY</Text>

        {/* 말풍선 */}
        <View style={styles.bubble}>
          <View style={styles.bubbleInner}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>통화</Text>
            </View>
            <View>
              <Text style={styles.bubbleTitle}>
                {isNewUser
                  ? '어서와! 오늘은 무슨 일을 했어?'
                  : '연결 중이야! 조금만 기다려줘.'}
              </Text>
              <Text style={styles.bubbleSub}>
                {isNewUser
                  ? "오늘의 기록을 통해 '그래도' 무엇을 했는지 알아보세요."
                  : '오늘도 재미있게 놀자!'}
              </Text>
            </View>
          </View>
        </View>

        {/* 로딩 원 */}
        <Animated.View
          style={[styles.loadingCircle, { transform: [{ rotate: spin }] }]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60,
  },
  characterCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#e0e0e0', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  characterText: { fontSize: 16, color: '#aaa' },
  callingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  pill: {
    borderRadius: 20, borderWidth: 1, borderColor: '#ccc',
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f0f0f0',
  },
  pillText: { fontSize: 12, color: '#555' },
  callingText: { fontSize: 16, color: '#555' },
  appName: { fontSize: 36, fontWeight: '900', marginBottom: 32 },
  bubble: {
    width: '100%', backgroundColor: '#f0f0f0',
    borderRadius: 20, padding: 20, marginBottom: 40,
  },
  bubbleInner: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bubbleTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  bubbleSub: { fontSize: 13, color: '#666' },
  loadingCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 3, borderColor: '#ccc',
    borderTopColor: '#333',
  },
});
