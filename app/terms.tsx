import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space } from '../theme';
import ArrowBackIcon from '../assets/icons/arrow_back.svg';

const EFFECTIVE_DATE = '2026년 6월 30일';
const CONTACT_EMAIL = 'hanisuh@swu.ac.kr';

// 서비스 이용약관 본문
const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '제1조 (목적)',
    body:
      '본 약관은 ANYWAY(이하 "서비스")가 제공하는 모든 서비스의 이용 조건 및 절차, ' +
      '이용자와 서비스 간의 권리·의무·책임사항을 규정하는 것을 목적으로 합니다.',
  },
  {
    heading: '제2조 (정의)',
    body:
      '• "이용자"란 본 약관에 동의하고 서비스를 이용하는 회원을 말합니다.\n' +
      '• "기록(ANYWAY)"이란 이용자가 작성한 목표·한 일·문구 등 콘텐츠를 말합니다.\n' +
      '• "공개 기록"이란 이용자가 전체 공개로 설정하여 다른 이용자가 볼 수 있는 기록을 말합니다.',
  },
  {
    heading: '제3조 (약관의 효력 및 변경)',
    body:
      '본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. ' +
      '서비스는 필요 시 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, ' +
      '변경 시 앱 내 공지를 통해 안내합니다.',
  },
  {
    heading: '제4조 (회원가입 및 계정)',
    body:
      '이용자는 본인의 정확한 정보로 가입해야 하며, 계정 정보(이메일·비밀번호)의 관리 책임은 이용자에게 있습니다. ' +
      '타인의 정보를 도용하거나 부정하게 사용해서는 안 됩니다.',
  },
  {
    heading: '제5조 (서비스의 제공 및 변경)',
    body:
      '서비스는 기록 작성, 피드, 통계, 월간 리캡, AI 응원 문구 생성 등의 기능을 제공합니다. ' +
      '서비스는 운영상·기술상 필요에 따라 제공 내용을 변경하거나 중단할 수 있습니다.',
  },
  {
    heading: '제6조 (이용자의 의무)',
    body:
      '이용자는 다음 행위를 해서는 안 됩니다.\n\n' +
      '• 타인의 권리를 침해하거나 명예를 훼손하는 행위\n' +
      '• 욕설·혐오·음란물 등 부적절한 콘텐츠 게시\n' +
      '• 서비스의 정상적인 운영을 방해하는 행위\n' +
      '• 법령 또는 본 약관에 위반되는 행위',
  },
  {
    heading: '제7조 (이용자 콘텐츠)',
    body:
      '이용자가 작성한 기록의 저작권은 이용자에게 있습니다. ' +
      '다만 전체 공개로 설정한 기록은 서비스 내 다른 이용자에게 노출될 수 있으며, ' +
      '이용자는 회원 탈퇴 또는 삭제를 통해 자신의 기록을 언제든 삭제할 수 있습니다. ' +
      '서비스는 본 약관에 위반되는 콘텐츠를 사전 통지 없이 삭제할 수 있습니다.',
  },
  {
    heading: '제8조 (AI 생성 문구에 관한 안내)',
    body:
      'AI 응원 문구는 참고용으로 자동 생성되며, 그 정확성이나 적합성을 보장하지 않습니다. ' +
      'AI 문구로 인해 발생한 결과에 대해 서비스는 책임을 지지 않습니다.',
  },
  {
    heading: '제9조 (면책 및 책임의 한계)',
    body:
      '서비스는 천재지변, 시스템 장애, 제3자 서비스(클라우드·AI 등)의 문제 등 ' +
      '불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다. ' +
      '본 서비스는 무료로 제공되며, 데이터 손실에 대비해 중요한 기록은 별도 보관하시길 권장합니다.',
  },
  {
    heading: '제10조 (계약 해지)',
    body:
      '이용자는 마이페이지에서 언제든 회원 탈퇴할 수 있으며, 탈퇴 시 계정과 기록은 삭제됩니다. ' +
      '서비스는 이용자가 본 약관을 위반한 경우 이용을 제한하거나 계약을 해지할 수 있습니다.',
  },
  {
    heading: '제11조 (문의)',
    body: `서비스 이용 관련 문의는 아래로 연락해 주세요.\n\n• 이메일: ${CONTACT_EMAIL}`,
  },
];

export default function TermsScreen() {
  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>서비스 이용약관</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
          <Text style={s.intro}>
            본 약관은 ANYWAY 서비스 이용에 관한 조건과 절차를 안내합니다.
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
