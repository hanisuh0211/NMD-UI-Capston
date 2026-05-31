import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, TouchableOpacity, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signIn } from '../lib/auth';
import { Colors, FontSize, LineHeight, Space, Radius } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('*아이디 또는 비밀번호를 입력해주세요');
      return;
    }
    setError('');
    setLoading(true);
    const { user, error: loginError } = await signIn(email, password);
    setLoading(false);
    if (loginError) {
      setError('*비밀번호가 일치하지 않습니다');
      return;
    }
    router.replace('/loading');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {/* 상단 그라데이션 배경 */}
      <LinearGradient
        colors={[Colors.blue200, Colors.gray050, Colors.white]}
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* 앱 이름 */}
          <Text style={styles.appName}>ANYWAY</Text>

          {/* 입력 필드 */}
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor={Colors.gray500}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={Colors.gray500}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry
              />
              {error !== '' && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </View>

          {/* 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{loading ? '로그인 중...' : '로그인'}</Text>
          </TouchableOpacity>

          {/* 하단 링크 */}
          <View style={styles.bottomLinks}>
            <TouchableOpacity onPress={() => router.push('/signup/step1')}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
            <View style={styles.dividerLine} />
            <TouchableOpacity>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </TouchableOpacity>
            <View style={styles.dividerLine} />
            <TouchableOpacity>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 102,
  },
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Space.s200,
    paddingTop: Space.s900,
    gap: Space.s600,
  },
  appName: {
    fontSize: FontSize.size900,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
    lineHeight: LineHeight.lh900,
    letterSpacing: -0.6,
    fontFamily: 'Pretendard-Bold',
  },
  fieldContainer: {
    gap: Space.s150,
  },
  passwordBox: {
    gap: Space.s075,
  },
  input: {
    backgroundColor: Colors.gray050,
    borderWidth: 1,
    borderColor: 'rgba(18,18,18,0.2)',
    borderRadius: Radius.r100,
    padding: Space.s200,
    fontSize: FontSize.size300,
    color: Colors.gray900,
    lineHeight: LineHeight.lh300,
    letterSpacing: -0.6,
    fontFamily: 'Pretendard-Regular',
  },
  errorText: {
    fontSize: FontSize.size050,
    fontWeight: '300',
    color: Colors.red500,
    textAlign: 'right',
    lineHeight: LineHeight.lh050,
    letterSpacing: -0.2,
    fontFamily: 'Pretendard-Light',
  },
  loginBtn: {
    backgroundColor: Colors.blue500,
    borderRadius: Radius.r100,
    paddingVertical: Space.s150,
    paddingHorizontal: Space.s300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontSize: FontSize.size400,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: LineHeight.lh400,
    letterSpacing: -0.2,
    fontFamily: 'Pretendard-SemiBold',
  },
  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.s100,
  },
  linkText: {
    fontSize: FontSize.size200,
    fontWeight: '400',
    color: Colors.gray500,
    lineHeight: LineHeight.lh200,
    letterSpacing: -0.6,
    fontFamily: 'Pretendard-Regular',
  },
  dividerLine: {
    width: 1.6,
    height: 12.8,
    backgroundColor: Colors.gray400,
  },
});
