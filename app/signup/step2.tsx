import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[s.dot, active ? s.dotActive : s.dotInactive]}>
      <Text style={[s.dotText, active ? s.dotTextActive : s.dotTextInactive]}>{label}</Text>
    </View>
  );
}

export default function SignupStep2() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);

  const handleEmailCheck = async () => {
    if (!email) { Alert.alert('알림', '이메일을 입력해주세요.'); return; }
    if (!email.includes('@')) { Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.'); return; }
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setEmailChecked(false);
        Alert.alert('알림', '이미 사용 중인 이메일입니다.');
      } else {
        setEmailChecked(true);
        Alert.alert('확인', '사용 가능한 이메일입니다.');
      }
    } catch (e: any) {
      Alert.alert('오류', '중복 확인 중 문제가 발생했습니다.');
    }
  };

  const handleNext = () => {
    if (!emailChecked) { Alert.alert('알림', '이메일 중복 확인을 해주세요.'); return; }
    if (!password) { Alert.alert('알림', '비밀번호를 입력해주세요.'); return; }
    if (password.length < 6) { Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { Alert.alert('알림', '비밀번호가 일치하지 않습니다.'); return; }
    if (!nickname.trim()) { Alert.alert('알림', '닉네임을 입력해주세요.'); return; }
    router.push({ pathname: '/signup/step3', params: { email, password, nickname } });
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        {/* X 닫기 버튼 */}
        {/* 상단 버튼 영역 */}
        <View style={[s.topBtnRow, { top: insets.top + Space.s100 }]}>
          <TouchableOpacity style={s.topBtn} onPress={() => router.back()}>
            <ArrowForwardIosIcon width={18} height={18} color={Colors.gray500} style={{ transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={s.topBtn} onPress={() => router.replace('/login')}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          {/* 스텝 인디케이터 */}
          <View style={s.stepRow}>
            <StepDot active={false} label="1" />
            <StepDot active label="2" />
            <StepDot active={false} label="3" />
          </View>

          {/* 헤더 */}
          <View style={s.header}>
            <Text style={s.title}>계정 설정</Text>
            <Text style={s.subtitle}>사용자 정보를 입력해 주세요.</Text>
          </View>

          {/* 폼 필드 */}
          <View style={s.formSection}>
            {/* 아이디 */}
            <View style={s.fieldSection}>
              <Text style={s.fieldLabel}>이메일</Text>
              <View style={s.inputRow}>
                <TextInput
                  style={s.inputFlex}
                  placeholder="이메일"
                  placeholderTextColor={Colors.gray500}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailChecked(false); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={s.checkBtn} onPress={handleEmailCheck}>
                  <Text style={s.checkBtnText}>중복 확인</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 */}
            <View style={s.fieldSection}>
              <Text style={s.fieldLabel}>비밀번호</Text>
              <View style={s.passwordInputs}>
                <TextInput
                  style={s.input}
                  placeholder="비밀번호"
                  placeholderTextColor={Colors.gray500}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TextInput
                  style={s.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={Colors.gray500}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  secureTextEntry
                />
              </View>
            </View>

            {/* 닉네임 */}
            <View style={s.fieldSection}>
              <Text style={s.fieldLabel}>닉네임</Text>
              <TextInput
                style={s.input}
                placeholder="닉네임"
                placeholderTextColor={Colors.gray500}
                value={nickname}
                onChangeText={setNickname}
              />
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={s.bottomSection}>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
            <Text style={s.nextBtnText}>다음</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },
  topBtnRow: { position: 'absolute', left: Space.s200, right: Space.s200, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: Colors.gray500 },
  container: { paddingHorizontal: Space.s200, paddingTop: Space.s500, paddingBottom: 40, gap: Space.s500 },
  // 스텝
  stepRow: { flexDirection: 'row', justifyContent: 'center', gap: Space.s200 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', padding: Space.s025 },
  dotActive: { backgroundColor: Colors.blue400 },
  dotInactive: { borderWidth: 1, borderColor: Colors.blue100 },
  dotText: { fontSize: FontSize.size100, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  dotTextActive: { color: Colors.white },
  dotTextInactive: { color: Colors.gray500 },
  // 헤더
  header: { gap: Space.s200 },
  title: { fontSize: FontSize.size700, fontWeight: '700', color: Colors.gray900, lineHeight: 38, letterSpacing: -0.2 },
  subtitle: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  // 폼
  formSection: { gap: Space.s300 },
  fieldSection: { gap: Space.s100 },
  fieldLabel: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  inputRow: { flexDirection: 'row', gap: Space.s100, alignItems: 'stretch' },
  inputFlex: {
    flex: 1, backgroundColor: Colors.gray050, borderWidth: 1,
    borderColor: Colors.opacityBlack200, borderRadius: Radius.r100,
    paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300,
  },
  input: {
    backgroundColor: Colors.gray050, borderWidth: 1,
    borderColor: Colors.opacityBlack200, borderRadius: Radius.r100,
    paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300,
    height: 56,
  },
  passwordInputs: { gap: Space.s150 },
  checkBtn: {
    backgroundColor: Colors.blue200, borderWidth: 1, borderColor: Colors.opacityBlack100,
    borderRadius: Radius.r100, paddingHorizontal: Space.s200, paddingVertical: Space.s075,
    alignSelf: 'stretch', justifyContent: 'center',
  },
  checkBtnText: { fontSize: FontSize.size200, color: Colors.blue700, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  // 버튼
  bottomSection: { paddingHorizontal: Space.s200, paddingBottom: Space.s500, paddingTop: Space.s200 },
  nextBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  nextBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
});
