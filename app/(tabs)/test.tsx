import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { generateAnywayText, generateMonthlyRecap } from '../../lib/gemini';

export default function TestScreen() {
  const [goal, setGoal] = useState('');
  const [done, setDone] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [recapTexts, setRecapTexts] = useState('');
  const [recapResult, setRecapResult] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);

  // ANYWAY 문구 테스트
  const handleGenerate = async () => {
    if (!goal || !done) {
      setResult('목표와 달성치를 모두 입력해주세요!');
      return;
    }
    setLoading(true);
    setResult('');
    const text = await generateAnywayText(goal, done);
    setResult(text);
    setLoading(false);
  };

  // 월간 리캡 테스트
  const handleRecap = async () => {
    if (!recapTexts) {
      setRecapResult('ANYWAY 문구들을 입력해주세요!');
      return;
    }
    setRecapLoading(true);
    setRecapResult('');
    const texts = recapTexts.split('\n').filter(t => t.trim());
    const text = await generateMonthlyRecap(texts);
    setRecapResult(text);
    setRecapLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>🧪 AI 테스트 화면</Text>
        <Text style={styles.pageSubtitle}>개발용 임시 화면입니다</Text>

        {/* ANYWAY 문구 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ANYWAY 문구 생성 테스트</Text>

          <Text style={styles.label}>목표</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 영어 단어 100개 외우기"
            placeholderTextColor="#aaa"
            value={goal}
            onChangeText={setGoal}
          />

          <Text style={styles.label}>한 것</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 영어 단어 50개 외움"
            placeholderTextColor="#aaa"
            value={done}
            onChangeText={setDone}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>ANYWAY 문구 생성하기</Text>
            }
          </TouchableOpacity>

          {result !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>생성된 문구:</Text>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}
        </View>

        {/* 월간 리캡 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>월간 리캡 총평 테스트</Text>

          <Text style={styles.label}>ANYWAY 문구들 (줄바꿈으로 구분)</Text>
          <TextInput
            style={[styles.input, { height: 120 }]}
            placeholder={"그래도 50개는 외웠잖아!\n그래도 나갔잖아!\n그래도 시작했잖아!"}
            placeholderTextColor="#aaa"
            value={recapTexts}
            onChangeText={setRecapTexts}
            multiline
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleRecap}
            disabled={recapLoading}
          >
            {recapLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>월간 총평 생성하기</Text>
            }
          </TouchableOpacity>

          {recapResult !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>생성된 총평:</Text>
              <Text style={styles.resultText}>{recapResult}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 60 },
  pageTitle: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#aaa', marginBottom: 32 },
  section: {
    backgroundColor: '#f5f5f5', borderRadius: 16,
    padding: 20, marginBottom: 24,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#333', marginBottom: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  btn: {
    backgroundColor: '#000', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultBox: {
    backgroundColor: '#fff', borderRadius: 10,
    padding: 16, marginTop: 16,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  resultLabel: { fontSize: 12, color: '#aaa', marginBottom: 6 },
  resultText: { fontSize: 17, fontWeight: '700', lineHeight: 26, color: '#333' },
});
