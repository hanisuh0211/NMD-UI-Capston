import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SignupStep2() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);

  const handleEmailCheck = () => {
    if (!email) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }
    setEmailChecked(true);
    Alert.alert('확인', '사용 가능한 아이디입니다.');
  };

  const handleNext = () => {
    if (!emailChecked) {
      Alert.alert('알림', '아이디 중복 확인을 해주세요.');
      return;
    }
    if (!password) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    router.push({ pathname: '/signup/step3', params: { email, password } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>아이디&비밀번호 생성</Text>
          <View style={styles.steps}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.step, i === 2 && styles.stepActive]}>
                <Text style={[styles.stepText, i === 2 && styles.stepTextActive]}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.subtitle}>사용자 정보를 입력해 주세요.</Text>

        {/* 아이디 */}
        <Text style={styles.label}>아이디</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="아이디"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailChecked(false); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.checkBtn} onPress={handleEmailCheck}>
            <Text style={styles.checkBtnText}>중복 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 비밀번호 */}
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor="#aaa"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        {/* 다음 버튼 */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
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
  label: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  emailRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  emailInput: { flex: 1, marginBottom: 0 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 14,
    padding: 18, fontSize: 16, marginBottom: 14, color: '#333',
  },
  checkBtn: {
    backgroundColor: '#e0e0e0', borderRadius: 14,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  checkBtnText: { fontSize: 13, fontWeight: '700' },
  nextBtn: {
    backgroundColor: '#e0e0e0', borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 14,
    alignSelf: 'flex-end', marginTop: 'auto',
  },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
});
