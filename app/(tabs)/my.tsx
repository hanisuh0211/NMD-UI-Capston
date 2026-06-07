import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert, Image, TextInput, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import NotificationsIcon from '../../assets/icons/notifications.svg';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import ArrowBackIcon from '../../assets/icons/arrow_back.svg';
import { router } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { getUserProfile, deleteUserProfile, updateUserProfile } from '../../lib/user';
import { logOut, updateUserPassword } from '../../lib/auth';
import CharacterAvatar from '../../components/CharacterAvatar';

// 캐릭터 변경 카드 (회원가입 step3과 동일한 이미지/매핑)
const EDIT_CHARACTERS = [
  { id: 'char1', image: require('../../assets/images/char_female.png') },
  { id: 'char2', image: require('../../assets/images/char_male.png') },
];

const SETTINGS = ['개인정보처리방침', '서비스 이용약관', '앱 버전 정보'];

export default function MyScreen() {
  const { width: winW } = useWindowDimensions();
  // 카드 2열: 좌우 패딩 16 + 카드 사이 간격 16 → (Figma 402폭 기준 177)
  const cardSize = (winW - Space.s200 * 2 - Space.s200) / 2;

  const [showEdit, setShowEdit] = useState(false);
  const [selectedChar, setSelectedChar] = useState('char1');
  const [nickname, setNickname] = useState('');
  const [daysSince, setDaysSince] = useState(0);

  // 편집 폼 상태
  const [editNickname, setEditNickname] = useState('');
  const [editPw, setEditPw] = useState('');
  const [editPwConfirm, setEditPwConfirm] = useState('');
  const [pwError, setPwError] = useState(false);
  const [saving, setSaving] = useState(false);

  // 편집 화면 진입 (현재 값으로 초기화)
  const openEdit = () => {
    setEditNickname(nickname);
    setEditPw('');
    setEditPwConfirm('');
    setPwError(false);
    setShowEdit(true);
  };

  // 변경사항 저장
  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    // 비밀번호를 입력한 경우에만 검증
    if (editPw || editPwConfirm) {
      if (editPw.length < 6) {
        Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      if (editPw !== editPwConfirm) {
        setPwError(true);
        return;
      }
    }
    setPwError(false);
    setSaving(true);
    try {
      await updateUserProfile(uid, {
        nickname: editNickname.trim(),
        character: selectedChar,
      });
      if (editPw) {
        const { error } = await updateUserPassword(editPw);
        if (error === 'auth/requires-recent-login') {
          setSaving(false);
          Alert.alert('재로그인 필요', '보안을 위해 다시 로그인한 후 비밀번호를 변경해주세요.');
          return;
        }
        if (error) {
          setSaving(false);
          Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다.');
          return;
        }
      }
      setNickname(editNickname.trim());
      setSaving(false);
      setShowEdit(false);
      Alert.alert('완료', '변경사항이 저장되었습니다.');
    } catch (e) {
      setSaving(false);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
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
          {/* 헤더 (뒤로가기) */}
          <View style={s.editHeader}>
            <TouchableOpacity style={s.topBtn} onPress={() => setShowEdit(false)}>
              <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.editContainer} keyboardShouldPersistTaps="handled">
            {/* 캐릭터 변경 */}
            <Text style={s.editTitle}>캐릭터 변경</Text>
            <View style={s.editCardRow}>
              {EDIT_CHARACTERS.map(char => {
                const isSel = selectedChar === char.id;
                return (
                  <TouchableOpacity
                    key={char.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedChar(char.id)}
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
                    <View style={s.editCardContent}>
                      <Text style={s.editCardName}>캐릭터 이름</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 사용자 정보 */}
            <Text style={[s.editTitle, { marginTop: Space.s300 }]}>사용자 정보</Text>
            <View style={s.formSection}>
              {/* 닉네임 */}
              <View style={s.fieldSection}>
                <Text style={s.fieldLabel}>닉네임</Text>
                <TextInput
                  style={s.input}
                  placeholder="닉네임"
                  placeholderTextColor={Colors.gray500}
                  value={editNickname}
                  onChangeText={setEditNickname}
                />
              </View>
              {/* 비밀번호 */}
              <View style={s.fieldSection}>
                <Text style={s.fieldLabel}>비밀번호</Text>
                <View style={s.passwordInputs}>
                  <TextInput
                    style={s.input}
                    placeholder="비밀번호"
                    placeholderTextColor={Colors.gray500}
                    value={editPw}
                    onChangeText={(t) => { setEditPw(t); setPwError(false); }}
                    secureTextEntry
                  />
                  <View>
                    <TextInput
                      style={[s.input, pwError && s.inputError]}
                      placeholder="비밀번호 확인"
                      placeholderTextColor={Colors.gray500}
                      value={editPwConfirm}
                      onChangeText={(t) => { setEditPwConfirm(t); setPwError(false); }}
                      secureTextEntry
                    />
                    {pwError && <Text style={s.errorText}>*비밀번호가 일치하지 않습니다.</Text>}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 하단 저장 버튼 */}
          <View style={s.bottomSection}>
            <TouchableOpacity
              style={[s.saveBtn, saving && s.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={s.saveBtnText}>{saving ? '저장 중...' : '저장'}</Text>
            </TouchableOpacity>
          </View>
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
  // 캐릭터 카드 (2열)
  editCardRow: { flexDirection: 'row', gap: Space.s200 },
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
