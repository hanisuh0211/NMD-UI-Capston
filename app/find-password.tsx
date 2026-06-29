import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../theme';
import { sendPasswordReset } from '../lib/auth';
import { emailExists } from '../lib/user';
import { notify } from '../lib/dialog';

export default function FindPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) { notify('알림', '아이디(이메일)를 입력해주세요.'); return; }
    if (!trimmed.includes('@')) { notify('알림', '올바른 이메일 형식을 입력해주세요.'); return; }
    setLoading(true);
    // 1) 가입된 아이디인지 먼저 확인
    const { exists, error: existErr } = await emailExists(trimmed);
    if (existErr) { setLoading(false); notify('오류', '조회 중 문제가 발생했습니다.'); return; }
    if (!exists) { setLoading(false); notify('알림', '가입되지 않은 아이디(이메일)예요.'); return; }
    // 2) 존재하면 재설정 메일 발송
    const { error } = await sendPasswordReset(trimmed);
    setLoading(false);
    if (error === 'auth/user-not-found') {
      notify('알림', '가입되지 않은 아이디(이메일)예요.');
      return;
    }
    if (error === 'auth/invalid-email') {
      notify('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }
    if (error) { notify('오류', '메일 발송 중 문제가 발생했습니다.'); return; }
    setSent(true);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Text style={s.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          <View style={s.titleSection}>
            <Text style={s.title}>비밀번호 찾기</Text>
            <Text style={s.subtitle}>가입한 아이디(이메일)를 입력하면{'\n'}비밀번호 재설정 메일을 보내드려요.</Text>
          </View>

          <View style={s.fieldSection}>
            <Text style={s.fieldLabel}>아이디(이메일)</Text>
            <TextInput
              style={s.input}
              placeholder="이메일"
              placeholderTextColor={Colors.gray500}
              value={email}
              onChangeText={(t) => { setEmail(t); setSent(false); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          {/* 발송 완료 안내 */}
          {sent && (
            <View style={s.resultBox}>
              <Text style={s.resultLabel}>재설정 메일을 보냈어요</Text>
              <Text style={s.resultDesc}>
                {email.trim()}로 비밀번호 재설정 링크를 보냈어요.{'\n'}
                메일함(스팸함 포함)을 확인해 비밀번호를 재설정해주세요.
              </Text>
            </View>
          )}

          <TouchableOpacity style={[s.findBtn, loading && { opacity: 0.4 }]} onPress={handleSend} disabled={loading}>
            <Text style={s.findBtnText}>{loading ? '보내는 중...' : (sent ? '재설정 메일 다시 보내기' : '재설정 메일 보내기')}</Text>
          </TouchableOpacity>

          {sent && (
            <TouchableOpacity style={s.loginLink} onPress={() => router.replace('/login')}>
              <Text style={s.loginLinkText}>로그인하러 가기</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  closeBtn: { padding: 4 },
  closeX: { fontSize: 20, color: Colors.gray500 },
  body: { paddingHorizontal: Space.s200, paddingTop: Space.s400, gap: Space.s400 },
  titleSection: { gap: Space.s150 },
  title: { fontSize: FontSize.size700, fontWeight: '700', color: Colors.gray900, lineHeight: 38, letterSpacing: -0.2 },
  subtitle: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  fieldSection: { gap: Space.s100 },
  fieldLabel: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.opacityBlack200,
    borderRadius: Radius.r100, paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300, height: 56,
  },
  resultBox: {
    backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100,
    borderRadius: Radius.r100, padding: Space.s200, gap: Space.s075,
  },
  resultLabel: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.blue700, letterSpacing: -0.4 },
  resultDesc: { fontSize: FontSize.size200, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.4 },
  findBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  findBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  loginLink: { alignItems: 'center', paddingVertical: Space.s100 },
  loginLinkText: { fontSize: FontSize.size300, color: Colors.gray500, letterSpacing: -0.6, textDecorationLine: 'underline' },
});
