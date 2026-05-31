import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';

export default function SignupStep1() {
  const [allAgree, setAllAgree] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const handleAllAgree = () => {
    const newVal = !allAgree;
    setAllAgree(newVal);
    setTerms(newVal);
    setPrivacy(newVal);
  };

  const handleTerms = () => {
    const newVal = !terms;
    setTerms(newVal);
    setAllAgree(newVal && privacy);
  };

  const handlePrivacy = () => {
    const newVal = !privacy;
    setPrivacy(newVal);
    setAllAgree(terms && newVal);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>약관 동의</Text>
          <View style={styles.steps}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.step, i === 1 && styles.stepActive]}>
                <Text style={[styles.stepText, i === 1 && styles.stepTextActive]}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.subtitle}>서비스 이용을 위하여 약관에 동의해주세요.</Text>

        <View style={styles.divider} />

        {/* 모두 동의 */}
        <TouchableOpacity style={styles.checkRow} onPress={handleAllAgree}>
          <View style={[styles.checkbox, allAgree && styles.checkboxActive]}>
            {allAgree && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>모두 동의합니다.</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 이용약관 */}
        <TouchableOpacity style={styles.checkRow} onPress={handleTerms}>
          <View style={[styles.checkbox, terms && styles.checkboxActive]}>
            {terms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>이용약관에 동의합니다.</Text>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>화살표</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 개인정보 */}
        <TouchableOpacity style={styles.checkRow} onPress={handlePrivacy}>
          <View style={[styles.checkbox, privacy && styles.checkboxActive]}>
            {privacy && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>개인 정보 수집 및 이용에 동의합니다.</Text>
          <TouchableOpacity style={styles.pill}>
            <Text style={styles.pillText}>화살표</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[styles.nextBtn, (!terms || !privacy) && styles.nextBtnDisabled]}
          onPress={() => router.push('/signup/step2')}
          disabled={!terms || !privacy}
        >
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
  title: { fontSize: 28, fontWeight: '900' },
  steps: { flexDirection: 'row', gap: 8 },
  step: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: '#333' },
  stepText: { fontSize: 13, color: '#aaa', fontWeight: '700' },
  stepTextActive: { color: '#fff' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 16,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#333', borderColor: '#333' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkLabel: { fontSize: 15, color: '#333', flex: 1 },
  pill: {
    borderRadius: 20, borderWidth: 1, borderColor: '#ccc',
    paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f0f0f0',
  },
  pillText: { fontSize: 12, color: '#555' },
  nextBtn: {
    backgroundColor: '#e0e0e0', borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 14,
    alignSelf: 'flex-end', marginTop: 'auto',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
});
