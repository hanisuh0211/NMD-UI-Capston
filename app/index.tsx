import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthChanged } from '../lib/auth';
import { Colors } from '../theme';

// 앱 진입: 자동 로그인 분기
// - 로그인된 유저: 바로 메인(탭)으로
// - 비로그인: 로그인 화면으로
export default function Index() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Firebase Auth 세션 복원 대기 (AsyncStorage 영속)
    const unsub = onAuthChanged((user) => {
      setLoggedIn(!!user);
      setChecking(false);
    });
    return unsub;
  }, []);

  // 인증 상태 확인 중 → 로딩 표시
  if (checking) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[Colors.blue200, Colors.gray050, Colors.white]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <ActivityIndicator size="large" color={Colors.blue500} />
      </View>
    );
  }

  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
});
