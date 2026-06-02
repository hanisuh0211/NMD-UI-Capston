import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';

const CHARACTERS = [
  { id: 'char1', name: '캐릭터 A', keywords: ['#키워드1', '#키워드2', '#키워드3'] },
  { id: 'char2', name: '캐릭터 B', keywords: ['#키워드1', '#키워드2', '#키워드3'] },
  { id: 'char3', name: '캐릭터 C', keywords: ['#키워드1', '#키워드2', '#키워드3'] },
];

export default function MyScreen() {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedChar, setSelectedChar] = useState('char1');

  if (showEdit) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{x:0,y:0}} end={{x:0,y:1}} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.container}>
            <View style={s.editHeader}>
              <TouchableOpacity style={s.backBtn} onPress={() => setShowEdit(false)}>
                <Text style={s.backBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={s.editTitle}>현재 캐릭터</Text>
            </View>

            {/* 현재 캐릭터 카드 */}
            <View style={s.currentCharCard}>
              {/* 이미지 플레이스홀더 */}
              <View style={s.currentCharImage} />
              <View style={s.currentCharInfo}>
                <Text style={s.nickLabel}>유저 닉네임</Text>
                <Text style={s.charName}>캐릭터 이름</Text>
                <View style={s.keywordRow}>
                  {['#키워드 #1', '#키워드 #2', '#키워드 #3'].map(k => (
                    <View key={k} style={s.keywordChip}>
                      <Text style={s.keywordText}>{k}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* 캐릭터 변경 */}
            <Text style={s.sectionTitle}>캐릭터 변경</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Space.s200 }} contentContainerStyle={{ paddingHorizontal: Space.s200, gap: Space.s150 }}>
              {CHARACTERS.map(char => (
                <TouchableOpacity
                  key={char.id}
                  style={[s.charOption, selectedChar === char.id && s.charOptionActive]}
                  onPress={() => setSelectedChar(char.id)}
                >
                  <View style={s.charOptionKeywords}>
                    {char.keywords.map(k => (
                      <View key={k} style={s.keywordChipSm}>
                        <Text style={s.keywordTextSm}>{k}</Text>
                      </View>
                    ))}
                  </View>
                  {/* 이미지 플레이스홀더 */}
                  <View style={s.charOptionImage} />
                  <Text style={s.charOptionName}>{char.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{x:0,y:0}} end={{x:0,y:1}} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.container}>
          {/* 프로필 */}
          <View style={s.profileRow}>
            {/* 이미지 플레이스홀더 */}
            <View style={s.profileAvatar} />
            <View style={{ flex: 1, marginLeft: Space.s200 }}>
              <Text style={s.nickLabel}>유저 닉네임</Text>
              <Text style={s.charName}>캐릭터 이름</Text>
              <View style={s.keywordRow}>
                {['#키워드 #1', '#키워드 #2', '#키워드 #3'].map(k => (
                  <View key={k} style={s.keywordChip}>
                    <Text style={s.keywordText}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity style={s.editBtn} onPress={() => setShowEdit(true)}>
              <Text style={s.editBtnText}>수정</Text>
            </TouchableOpacity>
          </View>

          {/* 캐릭터 컨셉샷 */}
          <View style={s.conceptCard}>
            {/* 이미지 플레이스홀더 */}
            <View style={s.conceptImage} />
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
  container: { padding: Space.s200, paddingBottom: 40 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Space.s300 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, borderWidth: 2.5, borderColor: Colors.pink400 },
  nickLabel: { fontSize: FontSize.size100, color: Colors.gray400, fontFamily: 'Pretendard-Regular', marginBottom: 2 },
  charName: { fontSize: 22, fontWeight: '800', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: Space.s100 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s075 },
  keywordChip: { borderRadius: Radius.r100, borderWidth: 1, borderColor: Colors.gray200, paddingHorizontal: Space.s100, paddingVertical: 3, backgroundColor: Colors.white },
  keywordText: { fontSize: 11, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  editBtn: { backgroundColor: Colors.white, borderRadius: Radius.r100, borderWidth: 1, borderColor: Colors.gray200, paddingHorizontal: 14, paddingVertical: Space.s100 },
  editBtnText: { fontSize: FontSize.size200, color: Colors.gray500, fontWeight: '600', fontFamily: 'Pretendard-SemiBold' },
  conceptCard: { borderRadius: Radius.r300, overflow: 'hidden' },
  conceptImage: { width: '100%', height: 320, backgroundColor: Colors.gray100 },
  // 수정 화면
  editHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.s150, marginBottom: Space.s300 },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 28, color: Colors.gray900 },
  editTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray900, fontFamily: 'Pretendard-Bold' },
  currentCharCard: { borderRadius: Radius.r200, overflow: 'hidden', marginBottom: Space.s300, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.08, shadowRadius:12, elevation:3 },
  currentCharImage: { width: '100%', height: 240, backgroundColor: Colors.gray100 },
  currentCharInfo: { backgroundColor: Colors.white, padding: Space.s200 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: Space.s200 },
  charOption: { width: 160, backgroundColor: Colors.white, borderRadius: Radius.r200, padding: 14, borderWidth: 2, borderColor: 'transparent' },
  charOptionActive: { borderColor: Colors.pink400 },
  charOptionKeywords: { gap: 4, marginBottom: Space.s100 },
  keywordChipSm: { borderRadius: 10, borderWidth: 1, borderColor: Colors.gray100, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: Colors.gray050, alignSelf: 'flex-start' },
  keywordTextSm: { fontSize: 10, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  charOptionImage: { width: '100%', height: 100, backgroundColor: Colors.gray100, borderRadius: Radius.r100, marginBottom: Space.s100 },
  charOptionName: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold', textAlign: 'center' },
});
