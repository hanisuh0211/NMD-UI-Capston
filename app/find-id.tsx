import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../theme';
import { getEmailsByNickname } from '../lib/user';
import { findIdByNicknameAndPassword } from '../lib/auth';
import { notify } from '../lib/dialog';

export default function FindIdScreen() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [nicknameOk, setNicknameOk] = useState(false); // 닉네임 존재 확인됨 → 비밀번호 칸 노출
  const [nicknameError, setNicknameError] = useState(false); // 존재하지 않는 닉네임
  const [loading, setLoading] = useState(false);
  // null = 아직 안 찾음, { email } = 찾음, { email: null } = 비밀번호 불일치
  const [result, setResult] = useState<{ email: string | null } | null>(null);

  // 닉네임 변경 시 모든 후속 상태 초기화
  const onChangeNickname = (t: string) => {
    setNickname(t);
    setNicknameOk(false);
    setNicknameError(false);
    setResult(null);
  };

  // 1차: 닉네임 존재 여부 확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) { notify('알림', '닉네임을 입력해주세요.'); return; }
    setLoading(true);
    const { emails, error } = await getEmailsByNickname(nickname);
    setLoading(false);
    if (error) { notify('오류', '조회 중 문제가 발생했습니다.'); return; }
    if (emails.length > 0) {
      setNicknameOk(true);
      setNicknameError(false);
    } else {
      setNicknameOk(false);
      setNicknameError(true);
    }
  };

  // 2차: 비밀번호로 본인 확인 → 아이디 표시
  const handleFind = async () => {
    if (!password) { notify('알림', '비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    const { email } = await findIdByNicknameAndPassword(nickname, password);
    setLoading(false);
    setResult({ email });
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
            <Text style={s.title}>아이디 찾기</Text>
            <Text style={s.subtitle}>가입할 때 사용한 닉네임을 먼저 확인한 뒤{'\n'}비밀번호를 입력하면 아이디(이메일)를 알려드려요.</Text>
          </View>

          {/* 닉네임 */}
          <View style={s.fieldSection}>
            <Text style={s.fieldLabel}>닉네임</Text>
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, s.inputFlex]}
                placeholder="닉네임"
                placeholderTextColor={Colors.gray500}
                value={nickname}
                onChangeText={onChangeNickname}
                autoFocus
                editable={!nicknameOk}
              />
              {!nicknameOk && (
                <TouchableOpacity style={s.checkBtn} onPress={handleCheckNickname} disabled={loading}>
                  <Text style={s.checkBtnText}>확인</Text>
                </TouchableOpacity>
              )}
            </View>
            {nicknameError && <Text style={s.errorText}>존재하지 않는 닉네임이에요.</Text>}
            {nicknameOk && <Text style={s.okText}>확인된 닉네임이에요. 비밀번호를 입력해주세요.</Text>}
          </View>

          {/* 비밀번호 (닉네임 확인 후에만) */}
          {nicknameOk && (
            <View style={s.fieldSection}>
              <Text style={s.fieldLabel}>비밀번호</Text>
              <TextInput
                style={s.input}
                placeholder="비밀번호"
                placeholderTextColor={Colors.gray500}
                value={password}
                onChangeText={(t) => { setPassword(t); setResult(null); }}
                secureTextEntry
                autoFocus
              />
            </View>
          )}

          {/* 결과 영역 */}
          {result !== null && (
            result.email ? (
              <View style={s.resultBox}>
                <Text style={s.resultLabel}>가입된 아이디</Text>
                <Text style={s.resultEmail}>{result.email}</Text>
              </View>
            ) : (
              <View style={s.resultBox}>
                <Text style={s.resultEmpty}>비밀번호가 일치하지 않아요.</Text>
              </View>
            )
          )}

          {/* 닉네임 확인 후에만 아이디 찾기 버튼 노출 */}
          {nicknameOk && (
            <TouchableOpacity style={[s.findBtn, loading && { opacity: 0.4 }]} onPress={handleFind} disabled={loading}>
              <Text style={s.findBtnText}>{loading ? '찾는 중...' : '아이디 찾기'}</Text>
            </TouchableOpacity>
          )}

          {result?.email && (
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
  inputRow: { flexDirection: 'row', gap: Space.s100, alignItems: 'stretch' },
  inputFlex: { flex: 1 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.opacityBlack200,
    borderRadius: Radius.r100, paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300, height: 56,
  },
  checkBtn: {
    backgroundColor: Colors.blue200, borderWidth: 1, borderColor: Colors.opacityBlack100,
    borderRadius: Radius.r100, paddingHorizontal: Space.s200, justifyContent: 'center', alignSelf: 'stretch',
  },
  checkBtnText: { fontSize: FontSize.size200, color: Colors.blue700, letterSpacing: -0.6 },
  errorText: { fontSize: FontSize.size100, color: Colors.red500, letterSpacing: -0.2, paddingLeft: Space.s050 },
  okText: { fontSize: FontSize.size100, color: Colors.blue700, letterSpacing: -0.2, paddingLeft: Space.s050 },
  resultBox: {
    backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100,
    borderRadius: Radius.r100, padding: Space.s200, gap: Space.s075,
  },
  resultLabel: { fontSize: FontSize.size200, color: Colors.gray700, letterSpacing: -0.4 },
  resultEmail: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.blue700, letterSpacing: -0.4 },
  resultEmpty: { fontSize: FontSize.size300, color: Colors.gray500, letterSpacing: -0.4 },
  findBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  findBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  loginLink: { alignItems: 'center', paddingVertical: Space.s100 },
  loginLinkText: { fontSize: FontSize.size300, color: Colors.gray500, letterSpacing: -0.6, textDecorationLine: 'underline' },
});
