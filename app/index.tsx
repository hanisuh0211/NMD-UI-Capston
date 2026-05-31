import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Animated, PanResponder, Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SplashScreen() {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SCREEN_WIDTH * 0.5) {
        Animated.timing(translateX, {
          toValue: SCREEN_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setSwiped(true);
          router.replace('/login');
        });
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 캐릭터 영역 */}
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

        {/* 앱 이름 */}
        <Text style={styles.appName}>ANYWAY</Text>

        {/* 하단 버튼들 */}
        <View style={styles.bottomButtons}>
          <View style={styles.sideButton}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <Text style={styles.sideButtonLabel}>재알림</Text>
          </View>
          <View style={styles.sideButton}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>💬</Text>
            </View>
            <Text style={styles.sideButtonLabel}>메세지</Text>
          </View>
        </View>

        {/* 밀어서 잠금 해제 */}
        <View style={styles.sliderTrack}>
          <Animated.View
            style={[styles.sliderThumb, { transform: [{ translateX }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.pill}>
              <Text style={styles.pillText}>통화</Text>
            </View>
          </Animated.View>
          <Text style={styles.sliderLabel}>밀어서 잠금 해제</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  characterCircle: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#e0e0e0', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
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
  appName: { fontSize: 36, fontWeight: '900', marginBottom: 80 },
  bottomButtons: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginBottom: 24, paddingHorizontal: 16,
  },
  sideButton: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  sideButtonLabel: { fontSize: 13, color: '#555' },
  sliderTrack: {
    width: '100%', height: 64, backgroundColor: '#f0f0f0',
    borderRadius: 32, justifyContent: 'center',
    alignItems: 'center', overflow: 'hidden',
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute', left: 8,
    zIndex: 1,
  },
  sliderLabel: {
    fontSize: 16, color: '#aaa', position: 'absolute',
  },
});
