import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import NotificationsIcon from '../../assets/icons/notifications.svg';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import ArrowBackIcon from '../../assets/icons/arrow_back.svg';
import { router } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { getUserProfile, deleteUserProfile } from '../../lib/user';
import { logOut } from '../../lib/auth';

const CHARACTERS = [
  { id: 'char1', name: '캐릭터 A', tags: ['label', 'label'] },
  { id: 'char2', name: '캐릭터 B', tags: ['label', 'label'] },
  { id: 'char3', name: '캐릭터 C', tags: ['label', 'label'] },
];

const SETTINGS = ['개인정보처리방침', '서비스 이용약관', '앱 버전 정보'];

// ── 캐릭터 카드 컴포넌트 ──
function CharacterCard({
  name, tags, selected, large, onPress,
}: {
  name: string; tags: string[]; selected?: boolean; large?: boolean; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[
        s.charCard,
        large ? s.charCardLarge : s.charCardSmall,
        selected ? s.charCardSelected : s.charCardDefault,
      ]}
    >
      {/* 이미지 플레이스홀더 배경 */}
      <View style={StyleSheet.absoluteFill}>
        <View style={s.charCardBg} />
      </View>
      {/* 하단 텍스트 */}
      <View style={s.charCardContent}>
        <Text style={s.charCardName}>{name}</Text>
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

export default function MyScreen() {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedChar, setSelectedChar] = useState('char1');
  const [nickname, setNickname] = useState('');
  const [daysSince, setDaysSince] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getUserProfile(uid).then(({ profile }) => {
      if (!profile) return;
      setNickname(profile.nickname ?? '');
      if (profile.createdAt) {
        const createdDate: Date =
          typeof profile.createdAt.toDate === 'function'
            ? profile.createdAt.toDate()
            : new Date(profile.createdAt);
        const diff = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDaysSince(diff);
      }
    });
  }, []);

  // ── 로그아웃 ──
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: async () => {
          await logOut();
          router.replace('/login');
        },
      },
    ]);
  };

  // ── 회원탈퇴 ──
  const handleDeleteAccount = () => {
    Alert.alert(
      '회원탈퇴',
      '탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기', style: 'destructive',
          onPress: async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
              // Firestore 유저 데이터 삭제
              await deleteUserProfile(user.uid);
              // Firebase Auth 계정 삭제
              await user.delete();
              router.replace('/login');
            } catch (error: any) {
              // 재인증이 필요한 경우 (오래된 세션)
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  '재로그인 필요',
                  '보안을 위해 다시 로그인한 후 탈퇴해주세요.',
                  [{ text: '확인', onPress: () => router.replace('/login') }]
                );
              } else {
                Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
              }
            }
          },
        },
      ]
    );
  };

  // ── 수정(캐릭터 변경) 화면 ──
  if (showEdit) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.editContainer}>
            {/* 헤더 */}
            <View style={s.editHeader}>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
              <View style={{ width: 24 }} />
            </View>

            {/* 현재 캐릭터 대형 카드 */}
            <View style={{ paddingTop: Space.s300, paddingBottom: Space.s500 }}>
              <CharacterCard
                name="name"
                tags={['label', 'label']}
                large
              />
            </View>

            {/* 캐릭터 변경 섹션 */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>캐릭터 변경</Text>
            </View>
            <View style={s.charList}>
              {CHARACTERS.map(char => (
                <CharacterCard
                  key={char.id}
                  name={char.name}
                  tags={char.tags}
                  selected={selectedChar === char.id}
                  onPress={() => setSelectedChar(char.id)}
                />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── 기본 마이페이지 ──
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.container}>
          {/* 헤더 */}
          <View style={s.header}>
            <View style={{ width: 24 }} />
            <NotificationsIcon width={24} height={24} color={Colors.gray900} />
          </View>

          {/* 프로필 카드 */}
          <View style={s.profileSection}>
            {/* 아바타 */}
            <View style={s.avatar} />
            {/* 이름 + 화살표 → 클릭 시 수정 화면 */}
            <View style={s.profileTexts}>
              <TouchableOpacity style={s.nameRow} onPress={() => setShowEdit(true)}>
                <Text style={s.nameText}>{nickname || '(닉네임 없음)'}</Text>
                <ArrowForwardIosIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
              <Text style={s.subtitleText}>캐릭터와 {daysSince}일째 ANYWAY</Text>
            </View>
          </View>

          {/* 설정 섹션 */}
          <View style={s.settingsSection}>
            <View style={s.settingsTitleRow}>
              <Text style={s.settingsTitle}>설정</Text>
            </View>
            <View style={s.listContainer}>
              {SETTINGS.map((label, i) => (
                <View key={i}>
                  <TouchableOpacity style={s.listItem}>
                    <Text style={s.listItemText}>{label}</Text>
                    <ArrowForwardIosIcon width={24} height={24} color={Colors.gray500} />
                  </TouchableOpacity>
                  {i < SETTINGS.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* 로그아웃 / 회원탈퇴 */}
          <View style={s.footerRow}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={s.footerText}>로그아웃</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteAccount}>
              <Text style={s.footerText}>회원탈퇴</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },

  // ── 기본 화면 ──
  container: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Space.s200, paddingVertical: Space.s100,
  },
  profileSection: {
    alignItems: 'center', paddingVertical: 40, gap: Space.s300,
  },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.gray100,
    borderWidth: 1.5, borderColor: Colors.pink400,
  },
  profileTexts: { alignItems: 'center', gap: Space.s150 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  nameText: {
    fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh600, letterSpacing: -0.4,
  },
  subtitleText: {
    fontSize: FontSize.size200, color: Colors.gray700,
    lineHeight: LineHeight.lh200, letterSpacing: -0.6,
  },
  settingsSection: { paddingHorizontal: Space.s200 },
  settingsTitleRow: {
    paddingLeft: Space.s050, paddingBottom: Space.s300,
  },
  settingsTitle: {
    fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh600, letterSpacing: -0.4,
  },
  listContainer: { gap: Space.s100 },
  listItem: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: Space.s100, paddingVertical: Space.s200,
  },
  listItemText: {
    fontSize: FontSize.size300, color: Colors.gray700,
    lineHeight: LineHeight.lh300, letterSpacing: -0.6,
  },
  divider: { height: 0.5, backgroundColor: Colors.gray100, marginHorizontal: Space.s100 },
  footerRow: {
    flexDirection: 'row', justifyContent: 'center', gap: Space.s300,
    paddingVertical: 40,
  },
  footerText: {
    fontSize: FontSize.size300, color: Colors.gray500,
    lineHeight: LineHeight.lh300, letterSpacing: -0.6,
  },

  // ── 수정 화면 ──
  editContainer: { paddingHorizontal: Space.s200, paddingBottom: 40 },
  editHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Space.s100,
  },
  sectionHeader: { paddingLeft: Space.s050, paddingBottom: Space.s300 },
  sectionTitle: {
    fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh600, letterSpacing: -0.4,
  },
  charList: { gap: Space.s200 },

  // ── 캐릭터 카드 ──
  charCard: {
    borderRadius: Radius.r200, overflow: 'hidden',
    padding: Space.s200, justifyContent: 'flex-end',
  },
  charCardLarge: { width: '100%', aspectRatio: 1 },
  charCardSmall: { width: '100%', height: 185 },
  charCardDefault: { borderWidth: 1, borderColor: Colors.gray100 },
  charCardSelected: { borderWidth: 2, borderColor: Colors.blue400 },
  charCardBg: { flex: 1, backgroundColor: Colors.gray100 },
  charCardContent: { gap: Space.s100 },
  charCardName: {
    fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh500, letterSpacing: -0.2, paddingHorizontal: Space.s050,
  },
  tagRow: { flexDirection: 'row', gap: Space.s100 },
  tag: {
    backgroundColor: Colors.blue100, borderRadius: Radius.r999,
    paddingHorizontal: Space.s200, paddingVertical: Space.s075,
  },
  tagText: {
    fontSize: FontSize.size100, color: Colors.gray900,
    lineHeight: LineHeight.lh100, letterSpacing: -0.2,
  },
});
