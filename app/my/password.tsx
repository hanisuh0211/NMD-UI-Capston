import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import { changePassword } from '../../lib/auth';

export default function PasswordScreen() {
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [pwError, setPwError] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!curPw) { Alert.alert('알림', '현재 비밀번호를 입력해주세요.'); return; }
    if (newPw.length < 6) { Alert.alert('알림', '새 비밀번호는 6자 이상이어야 합니다.'); return; }
    if (newPw !== newPwConfirm) { setPwError(true); return; }
    setSaving(true);
    const { error } = await changePassword(curPw, newPw);
    setSaving(false);
    if (error === 'auth/wrong-password' || error === 'auth/invalid-credential') {
      Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.');
      return;
    }
    if (error) { Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다.'); return; }
    Alert.alert('완료', '비밀번호가 변경되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
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
            <Text style={s.fieldLabel}>현재 비밀번호</Text>
            <TextInput
              style={s.input}
              placeholder="현재 비밀번호"
              placeholderTextColor={Colors.gray500}
              value={curPw}
              onChangeText={setCurPw}
              secureTextEntry
            />
          </View>
          <View style={s.fieldSection}>
            <Text style={s.fieldLabel}>새 비밀번호</Text>
            <View style={{ gap: Space.s150 }}>
              <TextInput
                style={s.input}
                placeholder="새 비밀번호"
                placeholderTextColor={Colors.gray500}
                value={newPw}
                onChangeText={(t) => { setNewPw(t); setPwError(false); }}
                secureTextEntry
              />
              <View>
                <TextInput
                  style={[s.input, pwError && { borderColor: Colors.red500 }]}
                  placeholder="새 비밀번호 확인"
                  placeholderTextColor={Colors.gray500}
                  value={newPwConfirm}
                  onChangeText={(t) => { setNewPwConfirm(t); setPwError(false); }}
                  secureTextEntry
                />
                {pwError && <Text style={s.errorText}>*비밀번호가 일치하지 않습니다.</Text>}
              </View>
            </View>
          </View>
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.4 }]} onPress={save} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? '변경 중...' : '비밀번호 변경하기'}</Text>
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
  errorText: { fontSize: FontSize.size050, color: Colors.red500, lineHeight: LineHeight.lh050, letterSpacing: -0.2, paddingTop: Space.s075, paddingLeft: Space.s050 },
  saveBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingVertical: Space.s150, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
});
