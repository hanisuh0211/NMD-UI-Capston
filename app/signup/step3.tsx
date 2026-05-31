import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { signUp } from '../../lib/auth';
import { createUserProfile } from '../../lib/user';

const CHARACTERS = [
  { id: 'char1', name: '캐릭터 A', color: '#FFD1DC', emoji: '🐱' },
  { id: 'char2', name: '캐릭터 B', color: '#D1E8FF', emoji: '🐶' },
  { id: 'char3', name: '캐릭터 C', color: '#D1FFD6', emoji: '🐻' },
  { id: 'char4', name: '캐릭터 D', color: '#FFF3D1', emoji: '🐰' },
];

export default function SignupStep3() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const [nickname, setNickname] = useState('');
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0].id);
  const [loading, setLoading] = useState(false);

  const selectedCharData = CHARACTERS.find(c => c.id === selectedChar);

  const handleComplete = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    setLoading(true);

    // Firebase Auth 회원가입
    const { user, error } = await signUp(email, password);
    if (error || !user) {
      Alert.alert('오류', '회원가입에 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    // Firestore에 유저 프로필 저장
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>계정 설정</Text>
          <View style={styles.steps}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.step, i === 3 && styles.stepActive]}>
                <Text style={[styles.stepText, i === 3 && styles.stepTextActive]}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.subtitle}>사용자 정보를 입력해 주세요.</Text>

        {/* 선택된 캐릭터 표시 */}
        <View style={[styles.characterPreview, { backgroundColor: selectedCharData?.color }]}>
          <Text style={styles.characterEmoji}>{selectedCharData?.emoji}</Text>
        </View>

        {/* 닉네임 */}
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          placeholderTextColor="#aaa"
          value={nickname}
          onChangeText={setNickname}
        />

        {/* 캐릭터 선택 */}
        <Text style={styles.label}>캐릭터 선택</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.charScroll}>
          {CHARACTERS.map(char => (
            <TouchableOpacity
              key={char.id}
              style={[
                styles.charOption,
                { backgroundColor: char.color },
                selectedChar === char.id && styles.charOptionSelected,
              ]}
              onPress={() => setSelectedChar(char.id)}
            >
              <Text style={styles.charEmoji}>{char.emoji}</Text>
              <Text style={styles.charName}>{char.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.nextBtnText}>{loading ? '처리 중...' : '다음'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '900' },
  steps: { flexDirection: 'row', gap: 8 },
  step: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: '#333' },
  stepText: { fontSize: 13, color: '#aaa', fontWeight: '700' },
  stepTextActive: { color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32 },
  characterPreview: {
    width: 160, height: 160, borderRadius: 80,
    alignSelf: 'center', alignItems: 'center',
    justifyContent: 'center', marginBottom: 32,
  },
  characterEmoji: { fontSize: 64 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 14,
    padding: 18, fontSize: 16, marginBottom: 24, color: '#333',
  },
  charScroll: { marginBottom: 32, marginHorizontal: -24 },
  charOption: {
    width: 120, borderRadius: 16, padding: 16,
    alignItems: 'center', marginHorizontal: 6,
    borderWidth: 2, borderColor: 'transparent',
  },
  charOptionSelected: { borderColor: '#333' },
  charEmoji: { fontSize: 40, marginBottom: 8 },
  charName: { fontSize: 14, fontWeight: '700' },
  nextBtn: {
    backgroundColor: '#e0e0e0', borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 14,
    alignSelf: 'flex-end',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
});
