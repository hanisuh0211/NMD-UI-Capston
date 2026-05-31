import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';``                          
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';

const FEED_ITEMS = [
  { id: 1, name: 'name', time: '지금', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
  { id: 2, name: 'name', time: '3분 전', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
  { id: 3, name: 'name', time: '54분 전', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
  { id: 4, name: 'name', time: '3시간 전', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
  { id: 5, name: 'name', time: '08:23 AM', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
  { id: 6, name: 'name', time: '06:47 AM', anyway: 'anyway,\n일이삼사오육칠팔구십일이삼사오' },
];

export default function FeedScreen() {
  const [size, setSize] = useState<'small' | 'big'>('small');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{x:0,y:0}} end={{x:0,y:1}} />
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.container}>
          {/* 토글 */}
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'small' && s.toggleBtnActive]}
              onPress={() => setSize('small')}
            >
              <Text style={[s.toggleText, size === 'small' && s.toggleTextActive]}>작게</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'big' && s.toggleBtnActive]}
              onPress={() => setSize('big')}
            >
              <Text style={[s.toggleText, size === 'big' && s.toggleTextActive]}>크게</Text>
            </TouchableOpacity>
          </View>

          {/* 작게: 2열 그리드 */}
          {size === 'small' && (
            <View style={s.grid}>
              {FEED_ITEMS.map((item) => (
                <View key={item.id} style={s.smallCard}>
                  <View style={s.smallCardTop}>
                    <Text style={s.smallName}>{item.name}</Text>
                    <Text style={s.smallTime}>{item.time}</Text>
                  </View>
                  {/* 이미지 플레이스홀더 */}
                  <View style={s.smallCardImage} />
                  <Text style={s.smallCardText}>{item.anyway}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 크게: 세로 단일 */}
          {size === 'big' && (
            <View style={s.bigList}>
              {FEED_ITEMS.map((item) => (
                <View key={item.id} style={s.bigCard}>
                  {/* 이미지 플레이스홀더 */}
                  <View style={s.bigCardImage} />
                  <View style={s.bigCardBottom}>
                    <View style={s.bigCardMeta}>
                      <Text style={s.bigName}>{item.name}</Text>
                      <Text style={s.bigTime}>{item.time}</Text>
                    </View>
                    <Text style={s.bigCardText}>{item.anyway}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  toggleRow: { flexDirection: 'row', gap: Space.s100, marginBottom: Space.s200, justifyContent: 'center' },
  toggleBtn: {
    borderRadius: Radius.r999, borderWidth: 1.5, borderColor: Colors.gray200,
    paddingHorizontal: Space.s200, paddingVertical: Space.s075, backgroundColor: Colors.white,
  },
  toggleBtnActive: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  toggleText: { fontSize: FontSize.size300, color: Colors.gray500, fontWeight: '600', fontFamily: 'Pretendard-SemiBold' },
  toggleTextActive: { color: Colors.white },
  // 작게
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s150 },
  smallCard: {
    width: '47.5%', backgroundColor: Colors.white, borderRadius: Radius.r200,
    padding: Space.s150, borderWidth: 1.5, borderColor: Colors.gray100,
  },
  smallCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Space.s100 },
  smallName: { fontSize: FontSize.size100, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  smallTime: { fontSize: FontSize.size100, color: Colors.gray300, fontFamily: 'Pretendard-Regular' },
  smallCardImage: { width: '100%', height: 120, backgroundColor: Colors.gray100, borderRadius: Radius.r100, marginBottom: Space.s100 },
  smallCardText: { fontSize: FontSize.size200, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh300, fontFamily: 'Pretendard-SemiBold' },
  // 크게
  bigList: { gap: Space.s200 },
  bigCard: {
    backgroundColor: Colors.white, borderRadius: Radius.r200, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.gray100,
  },
  bigCardImage: { width: '100%', height: 280, backgroundColor: Colors.gray100 },
  bigCardBottom: { padding: Space.s200 },
  bigCardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Space.s100 },
  bigName: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  bigTime: { fontSize: FontSize.size200, color: Colors.gray300, fontFamily: 'Pretendard-Regular' },
  bigCardText: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh500, fontFamily: 'Pretendard-Bold' },
});
