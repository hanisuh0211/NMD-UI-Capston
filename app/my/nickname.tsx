import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import { auth } from '../../firebaseConfig';
import { getUserProfile, updateUserProfile } from '../../lib/user';
import { notify } from '../../lib/dialog';

export default function NicknameScreen() {
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getUserProfile(uid).then(({ profile }) => {
      if (profile?.nickname) setNickname(profile.nickname);
    });
  }, []);

  const save = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!nickname.trim()) { notify('알림', '닉네임을 입력해주세요.'); return; }
    setSaving(true);
    try {
      await updateUserProfile(uid, { nickname: nickname.trim() });
      router.back();
    } catch {
      notify('오류', '저장 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
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
          <View style={s.fieldSection}>
            <Text style={s.fieldLabel}>닉네임</Text>
            <TextInput
              style={s.input}
              placeholder="닉네임"
              placeholderTextColor={Colors.gray500}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
            />
          </View>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.4 }]} onPress={save} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? '변경 중...' : '닉네임 변경하기'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  closeBtn: { padding: 4 },
  closeX: { fontSize: 20, color: Colors.gray500 },
  body: { paddingHorizontal: Space.s200, paddingTop: Space.s400, gap: Space.s400 },
  fieldSection: { gap: Space.s100 },
  fieldLabel: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.opacityBlack200,
    borderRadius: Radius.r100, paddingHorizontal: Space.s200, paddingVertical: Space.s200,
    fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300, height: 56,
  },
  saveBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
});
