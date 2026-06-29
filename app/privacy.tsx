import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space } from '../theme';
import ArrowBackIcon from '../assets/icons/arrow_back.svg';

const EFFECTIVE_DATE = '2026년 6월 30일';
const CONTACT_EMAIL = 'hanisuh@swu.ac.kr';

// 개인정보처리방침 본문 (앱이 실제로 수집·이용하는 데이터 기준)
const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. 수집하는 개인정보 항목',
    body:
      'ANYWAY(이하 "서비스")는 다음의 개인정보를 수집합니다.\n\n' +
      '• 회원가입 시: 이메일 주소(아이디), 비밀번호, 닉네임\n' +
      '• 서비스 이용 시: 선택한 캐릭터, 관심 키워드, 사용자가 작성한 기록(목표·한 일·ANYWAY 문구·작성일·공개 범위), 다른 사용자 기록에 남긴 표정(리액션)\n\n' +
      '비밀번호는 암호화되어 저장되며, 운영자도 원문을 확인할 수 없습니다.',
  },
  {
    heading: '2. 개인정보의 수집 및 이용 목적',
    body:
      '• 회원 식별 및 로그인, 계정 관리\n' +
      '• 기록 작성·보관, 피드·통계·월간 리캡 등 핵심 기능 제공\n' +
      '• AI 응원 문구 생성\n' +
      '• 서비스 개선 및 오류 대응',
  },
  {
    heading: '3. 개인정보의 처리위탁 및 제3자 제공',
    body:
      '서비스는 안정적인 운영을 위해 아래 사업자에게 일부 처리를 위탁합니다. ' +
      '수집한 개인정보를 그 외의 제3자에게 판매하거나 제공하지 않습니다.\n\n' +
      '• Google Firebase (Google LLC): 회원 인증, 데이터베이스 저장 등 백엔드 처리\n' +
      '• OpenAI (OpenAI, L.L.C.): AI 응원 문구 생성을 위해 사용자가 입력한 "목표"와 "한 일" 텍스트가 전송됩니다. 이름·이메일 등 식별정보는 전송되지 않습니다.\n\n' +
      '위탁받은 사업자는 해당 목적 범위 내에서만 정보를 처리합니다.',
  },
  {
    heading: '4. 개인정보의 보유 및 파기',
    body:
      '회원 탈퇴 시 수집한 개인정보 및 작성 기록은 지체 없이 삭제됩니다. ' +
      '관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.',
  },
  {
    heading: '5. 이용자의 권리',
    body:
      '이용자는 언제든지 본인의 개인정보를 열람·수정할 수 있으며, ' +
      '마이페이지에서 닉네임·비밀번호 변경 및 회원 탈퇴(전체 데이터 삭제)를 직접 할 수 있습니다.',
  },
  {
    heading: '6. 개인정보의 안전성 확보 조치',
    body:
      '비밀번호 암호화 저장, 접근 권한 통제, 신뢰할 수 있는 클라우드 인프라(Firebase) 사용 등 ' +
      '개인정보를 안전하게 보호하기 위한 조치를 취하고 있습니다.',
  },
  {
    heading: '7. 개인정보 보호책임자 및 문의',
    body:
      `개인정보 관련 문의는 아래로 연락해 주세요.\n\n• 이메일: ${CONTACT_EMAIL}`,
  },
  {
    heading: '8. 고지의 의무',
    body:
      '본 개인정보처리방침의 내용이 변경되는 경우, 앱 내 공지를 통해 안내합니다.',
  },
];

export default function PrivacyScreen() {
  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>개인정보처리방침</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Text style={s.intro}>
            ANYWAY는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.
          </Text>
          <Text style={s.effective}>시행일: {EFFECTIVE_DATE}</Text>

          {SECTIONS.map((sec, i) => (
            <View key={i} style={s.section}>
              <Text style={s.heading}>{sec.heading}</Text>
              <Text style={s.bodyText}>{sec.body}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Space.s200, paddingVertical: Space.s100,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.gray900, letterSpacing: -0.4 },
  container: { paddingHorizontal: Space.s200, paddingTop: Space.s200, paddingBottom: 48, gap: Space.s400 },
  intro: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.4 },
  effective: { fontSize: FontSize.size200, color: Colors.gray500, letterSpacing: -0.4, marginTop: -Space.s200 },
  section: { gap: Space.s100 },
  heading: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, letterSpacing: -0.4 },
  bodyText: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: 22, letterSpacing: -0.4 },
});
