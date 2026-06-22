import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Image, useWindowDimensions,
  Modal, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import NotificationsIcon from '../../assets/icons/notifications.svg';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import ArrowBackIcon from '../../assets/icons/arrow_back.svg';
import { router, useFocusEffect } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { getUserProfile, deleteUserProfile, updateUserProfile } from '../../lib/user';
import { logOut } from '../../lib/auth';
import { confirm, notify } from '../../lib/dialog';
import CharacterAvatar from '../../components/CharacterAvatar';
import DecoStarSvg from '../../assets/images/deco_star.svg';

// 캐릭터 변경 카드 (회원가입 step3과 동일한 이미지/매핑)
const EDIT_CHARACTERS = [
  { id: 'char1', name: '캐릭터 A', image: require('../../assets/images/char_female.png') },
  { id: 'char2', name: '캐릭터 B', image: require('../../assets/images/char_male.png') },
];
const charName = (id: string) => EDIT_CHARACTERS.find((c) => c.id === id)?.name ?? '캐릭터';

const SETTINGS = ['개인정보처리방침', '서비스 이용약관', '앱 버전 정보'];

export default function MyScreen() {
  const { width: winW } = useWindowDimensions();
  // 카드 2열: 좌우 패딩 16 + 카드 사이 간격 16 → (Figma 402폭 기준 177)
  const cardSize = (winW - Space.s200 * 2 - Space.s200) / 2;

  const [showEdit, setShowEdit] = useState(false);
  const [selectedChar, setSelectedChar] = useState('char1');
  const [nickname, setNickname] = useState('');
  const [daysSince, setDaysSince] = useState(0);
  const [pendingChar, setPendingChar] = useState<string | null>(null);

  const openEdit = () => setShowEdit(true);

  // 캐릭터 변경 확정 → 저장
  const confirmChar = async () => {
    const id = pendingChar;
    setPendingChar(null);
    if (!id) return;
    setSelectedChar(id);
    const uid = auth.currentUser?.uid;
    if (uid) await updateUserProfile(uid, { character: id });
  };

  // 프로필 로드 (마운트 + 화면 포커스 시 → 닉네임 변경 후 복귀 반영)
  const loadProfile = useCallback(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getUserProfile(uid).then(({ profile }) => {
      if (!profile) return;
      setNickname(profile.nickname ?? '');
      if (profile.character) setSelectedChar(profile.character);
      if (profile.createdAt) {
        const createdDate: Date =
          typeof profile.createdAt.toDate === 'function'
            ? profile.createdAt.toDate()
            : new Date(profile.createdAt);
        const diff = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDaysSince(diff + 1);
      }
    });
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);
  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  // ── 로그아웃 ──
  const handleLogout = () => {
    confirm('로그아웃', '정말 로그아웃하시겠습니까?', async () => {
      await logOut();
      router.replace('/login');
    }, '로그아웃');
  };

  // ── 회원탈퇴 ──
  const handleDeleteAccount = () => {
    confirm(
      '회원탈퇴',
      '탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠습니까?',
      async () => {
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
            notify('재로그인 필요', '보안을 위해 다시 로그인한 후 탈퇴해주세요.');
            router.replace('/login');
          } else {
            notify('오류', '회원탈퇴 중 오류가 발생했습니다.');
          }
        }
      },
      '탈퇴하기',
    );
  };

  // ── 수정(캐릭터 변경) 화면 ──
  if (showEdit) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={s.safe}>
          {/* 헤더 (뒤로가기) */}
          <View style={s.editHeader}>
            <TouchableOpacity style={s.topBtn} onPress={() => setShowEdit(false)}>
              <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.editContainer} keyboardShouldPersistTaps="handled">
            {/* 계정 */}
            <Text style={s.editTitle}>계정</Text>
            <TouchableOpacity style={s.accountRow} activeOpacity={0.7} onPress={() => router.push('/my/nickname')}>
              <Text style={s.accountLabel}>닉네임</Text>
              <View style={s.accountRight}>
                <Text style={s.accountValue}>{nickname || '(없음)'}</Text>
                <ArrowForwardIosIcon width={16} height={16} color={Colors.gray500} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.accountRow} activeOpacity={0.7} onPress={() => router.push('/my/password')}>
              <Text style={s.accountLabel}>비밀번호 변경</Text>
              <ArrowForwardIosIcon width={16} height={16} color={Colors.gray500} />
            </TouchableOpacity>

            {/* 캐릭터 */}
            <Text style={[s.editTitle, { marginTop: Space.s700 }]}>캐릭터</Text>
            <View style={s.editCardRow}>
              {EDIT_CHARACTERS.map(char => {
                const isSel = selectedChar === char.id;
                return (
                  <View key={char.id} style={s.charCol}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => { if (char.id !== selectedChar) setPendingChar(char.id); }}
                      style={[
                        s.editCard, { width: cardSize, height: cardSize },
                        isSel ? s.editCardSelected : s.editCardDefault,
                      ]}
                    >
                      <Image
                        source={char.image}
                        style={{ position: 'absolute', top: 0, left: 0, width: cardSize, height: cardSize }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <Text style={s.charLabel}>{char.name}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* 캐릭터 변경 확인 팝업 */}
          <Modal visible={pendingChar !== null} transparent animationType="fade" onRequestClose={() => setPendingChar(null)}>
            <TouchableWithoutFeedback onPress={() => setPendingChar(null)}>
              <View style={s.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={s.confirmCard}>
                    <Text style={s.confirmTitle}>캐릭터 변경</Text>
                    <Text style={s.confirmBody}>캐릭터를 '{charName(pendingChar ?? '')}'으로{'\n'}변경하시겠습니까?</Text>
                    <View style={s.confirmBtnRow}>
                      <TouchableOpacity style={[s.confirmBtn, s.confirmCancel]} onPress={() => setPendingChar(null)}>
                        <Text style={s.confirmCancelText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.confirmBtn, s.confirmOk]} onPress={confirmChar}>
                        <Text style={s.confirmOkText}>저장</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </View>
    );
  }

  // ── 기본 마이페이지 ──
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      {/* 하단 연한 하늘색 그라데이션 (배경) */}
      <LinearGradient colors={['rgba(255,255,255,0)', '#F1F7FF']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {/* 별 데코 */}
      <DecoStarSvg width={24} height={42} style={[s.myStar, { left: '50%', marginLeft: 181, top: 298 }]} pointerEvents="none" />
      <DecoStarSvg width={16} height={28} style={[s.myStar, { left: '50%', marginLeft: 157, top: 331 }]} pointerEvents="none" />
      <DecoStarSvg width={20} height={35} style={[s.myStar, { left: '50%', marginLeft: -199, top: 165 }]} pointerEvents="none" />
      <DecoStarSvg width={12} height={21} style={[s.myStar, { left: '50%', marginLeft: -162, top: 200 }]} pointerEvents="none" />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.container}>
          {/* 헤더 */}
          <View style={s.header}>
            <View style={{ width: 24 }} />
            <NotificationsIcon width={24} height={24} color={Colors.gray900} />
          </View>

          {/* 프로필 카드 */}
          <View style={s.profileSection}>
            {/* 아바타: 선택한 캐릭터 + 분홍 별 배경 */}
            <CharacterAvatar character={selectedChar} size={160} />
            {/* 이름 + 화살표 → 클릭 시 수정 화면 */}
            <View style={s.profileTexts}>
              <TouchableOpacity style={s.nameRow} onPress={openEdit}>
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
  myStar: { position: 'absolute', zIndex: 1 },
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

  // ── 수정(캐릭터 변경) 화면 ──
  topBtn: { padding: 4 },
  editHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Space.s200, paddingVertical: Space.s100,
  },
  editContainer: { paddingHorizontal: Space.s200, paddingTop: Space.s200, paddingBottom: 40 },
  editTitle: {
    fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh600, letterSpacing: -0.4,
    paddingLeft: Space.s050, paddingBottom: Space.s300,
  },
  // 계정 리스트 행
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Space.s150, paddingLeft: Space.s050 },
  accountLabel: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.gray900, letterSpacing: -0.4 },
  accountRight: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  accountValue: { fontSize: FontSize.size400, color: Colors.gray500, letterSpacing: -0.4 },
  // 캐릭터 카드 (2열) — 카드 + 아래 라벨
  editCardRow: { flexDirection: 'row', gap: Space.s200 },
  charCol: { gap: Space.s150, alignItems: 'center' },
  charLabel: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, letterSpacing: -0.2, textAlign: 'center' },
  // 편집 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(96,98,109,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: Space.s300 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: Colors.white, borderRadius: Radius.r300, padding: Space.s300, gap: Space.s200 },
  modalTitle: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, letterSpacing: -0.4, marginBottom: Space.s050 },
  // 캐릭터 변경 확인 팝업
  confirmCard: { width: '100%', maxWidth: 320, backgroundColor: Colors.white, borderRadius: Radius.r300, paddingVertical: Space.s300, paddingHorizontal: Space.s250, alignItems: 'center', gap: Space.s200 },
  confirmTitle: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, letterSpacing: -0.2 },
  confirmBody: { fontSize: FontSize.size300, color: Colors.gray700, letterSpacing: -0.4, textAlign: 'center', lineHeight: LineHeight.lh300 },
  confirmBtnRow: { flexDirection: 'row', gap: Space.s100, width: '100%', marginTop: Space.s100 },
  confirmBtn: { flex: 1, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  confirmCancel: { backgroundColor: Colors.gray100 },
  confirmCancelText: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.gray500, letterSpacing: -0.2 },
  confirmOk: { backgroundColor: Colors.blue500 },
  confirmOkText: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.white, letterSpacing: -0.2 },
  // 전체화면 변경 페이지
  fullHeader: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  closeX: { fontSize: 20, color: Colors.gray500 },
  fullBody: { paddingHorizontal: Space.s200, paddingTop: Space.s400, gap: Space.s300 },
  editCard: {
    borderRadius: Radius.r200, overflow: 'hidden',
    paddingHorizontal: Space.s150, paddingVertical: Space.s100,
    justifyContent: 'flex-end',
  },
  editCardDefault: { borderWidth: 1, borderColor: Colors.gray100, backgroundColor: Colors.gray050 },
  editCardSelected: { borderWidth: 2, borderColor: Colors.blue400, backgroundColor: Colors.blue100 },
  editCardContent: { paddingHorizontal: Space.s050, width: '100%' },
  editCardName: {
    fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900,
    lineHeight: LineHeight.lh500, letterSpacing: -0.2,
  },
  // 사용자 정보 폼
  formSection: { gap: Space.s300 },
  fieldSection: { gap: Space.s100 },
  fieldLabel: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  input: {
    backgroundColor: Colors.gray050, borderWidth: 1,
    borderColor: Colors.opacityBlack200, borderRadius: Radius.r100,
    paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300,
    height: 56,
  },
  inputError: { borderColor: Colors.red500 },
  passwordInputs: { gap: Space.s150 },
  errorText: {
    fontSize: FontSize.size050, color: Colors.red500,
    lineHeight: LineHeight.lh050, letterSpacing: -0.2,
    paddingTop: Space.s075, paddingLeft: Space.s050,
  },
  // 저장 버튼
  saveBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  bottomSection: { paddingHorizontal: Space.s200, paddingBottom: Space.s500, paddingTop: Space.s200 },
});
