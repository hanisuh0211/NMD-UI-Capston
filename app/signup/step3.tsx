import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import { signUp } from '../../lib/auth';
import { createUserProfile } from '../../lib/user';

const CHARACTERS = [
  { id: 'char1', name: '캐릭터 A', tags: ['#활발함', '#긍정적'] },
  { id: 'char2', name: '캐릭터 B', tags: ['#차분함', '#신중함'] },
  { id: 'char3', name: '캐릭터 C', tags: ['#유쾌함', '#엉뚱함'] },
  { id: 'char4', name: '캐릭터 D', tags: ['#따뜻함', '#배려심'] },
];

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={[s.dot, active ? s.dotActive : s.dotInactive]}>
      <Text style={[s.dotText, active ? s.dotTextActive : s.dotTextInactive]}>{label}</Text>
    </View>
  );
}

function CharCard({ name, tags, selected, onPress }: {
  name: string; tags: string[]; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.card, selected ? s.cardSelected : s.cardDefault]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* 캐릭터 이미지 배경 (플레이스홀더) */}
      <View style={StyleSheet.absoluteFill}>
        <View style={s.cardBg} />
      </View>
      {/* 하단 정보 */}
      <View style={s.cardContent}>
        <Text style={s.cardName}>{name}</Text>
        <View style={s.tagRow}>
          {tags.map((tag, i) => (
            <View key={i} style={s.tag}>
              <Text style={s.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SignupStep3() {
  const { email, password, nickname } = useLocalSearchParams<{
    email: string; password: string; nickname: string;
  }>();
  const insets = useSafeAreaInsets();
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0].id);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const { user, error } = await signUp(email, password);
    if (error || !user) {
      Alert.alert('오류', '회원가입에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }
    await createUserProfile(user.uid, {
      email,
      nickname: nickname.trim(),
      character: selectedChar,
      keywords: [],
    });
    setLoading(false);
    router.replace({ pathname: '/loading', params: { type: 'new' } });
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
            <StepDot active={false} label="2" />
            <StepDot active label="3" />
          </View>

          {/* 헤더 */}
          <View style={s.header}>
            <Text style={s.title}>캐릭터 설정</Text>
            <Text style={s.subtitle}>캐릭터를 선택해 주세요.</Text>
          </View>

          {/* 캐릭터 카드 목록 */}
          <View style={s.cardList}>
            {CHARACTERS.map(char => (
              <CharCard
                key={char.id}
                name={char.name}
                tags={char.tags}
                selected={selectedChar === char.id}
                onPress={() => setSelectedChar(char.id)}
              />
            ))}
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={s.bottomSection}>
          <TouchableOpacity
            style={[s.nextBtn, loading && s.nextBtnDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={s.nextBtnText}>{loading ? '처리 중...' : '완료'}</Text>
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
  // 카드
  cardList: { gap: Space.s200 },
  card: {
    height: 185, borderRadius: Radius.r200, padding: Space.s200,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  cardDefault: { borderWidth: 1, borderColor: Colors.gray100 },
  cardSelected: { borderWidth: 2, borderColor: Colors.blue400 },
  cardBg: { flex: 1, backgroundColor: Colors.gray100, ...StyleSheet.absoluteFillObject },
  cardContent: { gap: Space.s100 },
  cardName: {
    fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh500, letterSpacing: -0.2, paddingHorizontal: Space.s050,
  },
  tagRow: { flexDirection: 'row', gap: Space.s100 },
  tag: {
    backgroundColor: Colors.blue100, borderRadius: Radius.r999,
    paddingHorizontal: Space.s200, paddingVertical: Space.s075,
  },
  tagText: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  // 버튼
  bottomSection: { paddingHorizontal: Space.s200, paddingBottom: Space.s500, paddingTop: Space.s200 },
  nextBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
});
