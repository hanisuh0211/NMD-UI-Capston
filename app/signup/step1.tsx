import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[s.dot, active ? s.dotActive : s.dotInactive]}>
      <Text style={[s.dotText, active ? s.dotTextActive : s.dotTextInactive]}>{label}</Text>
    </View>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[s.checkbox, checked && s.checkboxChecked]}>
      {checked && <Text style={s.checkmark}>✓</Text>}
    </View>
  );
}

export default function SignupStep1() {
  const insets = useSafeAreaInsets();
  const [allAgree, setAllAgree] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const handleAllAgree = () => {
    const v = !allAgree;
    setAllAgree(v); setTerms(v); setPrivacy(v);
  };
  const handleTerms = () => {
    const v = !terms; setTerms(v); setAllAgree(v && privacy);
  };
  const handlePrivacy = () => {
    const v = !privacy; setPrivacy(v); setAllAgree(terms && v);
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        {/* 상단 버튼 영역 */}
        <View style={[s.topBtnRow, { top: insets.top + Space.s100 }]}>
          <View style={s.topBtn} />
          <TouchableOpacity style={s.topBtn} onPress={() => router.replace('/login')}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          {/* 스텝 인디케이터 */}
          <View style={s.stepRow}>
            <StepDot active label="1" />
            <StepDot active={false} label="2" />
            <StepDot active={false} label="3" />
          </View>

          {/* 헤더 */}
          <View style={s.header}>
            <Text style={s.title}>약관 동의</Text>
            <Text style={s.subtitle}>서비스 이용을 위하여 약관에 동의해주세요.</Text>
          </View>

          {/* 체크 항목 */}
          <View style={s.checkSection}>
            {/* 전체 동의 */}
            <TouchableOpacity style={s.checkRow} onPress={handleAllAgree}>
              <Text style={s.checkLabel}>전체 동의</Text>
              <Checkbox checked={allAgree} />
            </TouchableOpacity>

            <View style={s.divider} />

            {/* 이용약관 */}
            <TouchableOpacity style={s.checkRow} onPress={handleTerms}>
              <View style={s.checkRowLeft}>
                <Text style={s.checkLabel}>이용약관 동의</Text>
                <ArrowForwardIosIcon width={16} height={16} color={Colors.gray700} />
              </View>
              <Checkbox checked={terms} />
            </TouchableOpacity>

            {/* 개인정보 */}
            <TouchableOpacity style={s.checkRow} onPress={handlePrivacy}>
              <View style={s.checkRowLeft}>
                <Text style={s.checkLabel}>개인 정보 수집 및 이용 동의</Text>
                <ArrowForwardIosIcon width={16} height={16} color={Colors.gray700} />
              </View>
              <Checkbox checked={privacy} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={s.bottomSection}>
          <TouchableOpacity
            style={[s.nextBtn, (!terms || !privacy) && s.nextBtnDisabled]}
            onPress={() => router.push('/signup/step2')}
            disabled={!terms || !privacy}
          >
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
  // 체크
  checkSection: { gap: Space.s300 },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  checkLabel: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  divider: { height: 2, backgroundColor: Colors.gray050 },
  checkbox: { width: 24, height: 24, borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Colors.blue400, borderColor: Colors.blue400 },
  checkmark: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  // 버튼
  bottomSection: { paddingHorizontal: Space.s200, paddingBottom: Space.s500, paddingTop: Space.s200 },
  nextBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
});
