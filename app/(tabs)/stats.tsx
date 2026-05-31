import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, FlatList, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';

const { width: SW } = Dimensions.get('window');
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const STAMP_DAYS = [2, 3, 4, 5, 8, 12];

// 리캡 슬라이드 페이지 (각각 독립적인 화면)
const RECAP_PAGES = ['compare', 'list', 'final'];

export default function StatsScreen() {
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  const [showRecap, setShowRecap] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const TODAY = new Date();
  const DATE_STR = `${TODAY.getFullYear()}년 ${TODAY.getMonth()+1}월 ${TODAY.getDate()}일`;
  const MONTH_STR = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][TODAY.getMonth()];

  if (showRecap) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{x:0,y:0}} end={{x:0,y:1}} />
        <SafeAreaView style={s.safe}>
          {/* 닫기 버튼 */}
          <TouchableOpacity style={s.closeBtn} onPress={() => { setShowRecap(false); setCurrentPage(0); }}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* 슬라이드 인디케이터 */}
          <View style={s.indicatorRow}>
            {RECAP_PAGES.map((_, i) => (
              <View key={i} style={[s.indicatorBar, i === currentPage && s.indicatorBarActive]} />
            ))}
          </View>

          <FlatList
            ref={flatRef}
            data={RECAP_PAGES}
            keyExtractor={(item) => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setCurrentPage(Math.round(e.nativeEvent.contentOffset.x / SW));
            }}
            renderItem={({ item, index }) => {
              // 페이지 1: 비교
              if (item === 'compare') {
                return (
                  <ScrollView style={{ width: SW }} contentContainerStyle={s.slideContainer}>
                    <View style={s.avatarLarge} />
                    <Text style={s.recapTitle}>5월 다시보기</Text>
                    <View style={s.compareRow}>
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>4월 연속 통화 횟수</Text>
                        <Text style={s.compareValue}>11회</Text>
                      </View>
                      <Text style={s.compareArrow}>›</Text>
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>5월 연속 통화 횟수</Text>
                        <Text style={s.compareValue}>16회</Text>
                      </View>
                    </View>
                    <View style={s.msgBubble}>
                      <Text style={s.msgIcon}>📞</Text>
                      <View>
                        <Text style={s.msgBold}>이번엔 <Text style={s.msgHighlight}>5일</Text>이나 더 만났네!</Text>
                        <Text style={s.msgSub}>다음 달도 같이 즐겨보자!</Text>
                      </View>
                    </View>
                    {/* 밀어서 다음 페이지 안내 */}
                    <View style={s.slideHint}>
                      <View style={s.slideHintThumb} />
                      <Text style={s.slideHintText}>밀어서 확인하기</Text>
                    </View>
                  </ScrollView>
                );
              }

              // 페이지 2: 이번 달 ANYWAY 리스트
              if (item === 'list') {
                return (
                  <ScrollView style={{ width: SW }} contentContainerStyle={s.slideContainer}>
                    <View style={s.anywayListCard}>
                      <View style={s.anywayListItem}>
                        <View style={s.listAvatar} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.anywayListTitle}>그래도 알람은 껐잖아!</Text>
                          <Text style={s.anywayListSub}>📞 늦잠 자서 지각했다</Text>
                        </View>
                        <Text style={s.anywayListDate}>2026-05-12</Text>
                      </View>
                    </View>
                    <Text style={s.collectionTitle}>5월의 Anyway</Text>
                    <View style={s.cardGrid}>
                      {[1,2,3,4,5,6,7,8,9].map(i => (
                        <View key={i} style={s.collectionCard}>
                          <View style={s.collectionCardImage} />
                          <View style={[s.dateBadge, { backgroundColor: i % 2 === 0 ? Colors.pink : Colors.blue500 }]}>
                            <Text style={s.dateBadgeText}>5/1</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                );
              }

              // 페이지 3: 최종 총평
              if (item === 'final') {
                return (
                  <ScrollView style={{ width: SW }} contentContainerStyle={s.slideContainer}>
                    <View style={s.avatarLarge} />
                    <Text style={s.finalMonthLabel}>5월의 Anyway</Text>
                    <Text style={s.finalTitle}>그래도{'\n'}<Text style={s.finalTitleBlue}>시작은 했다</Text></Text>
                    <View style={s.statsGrid}>
                      {[
                        { label: '이번 달 통화 횟수', value: '27' },
                        { label: '누적 통화 횟수', value: '182' },
                        { label: '이번 달 연속 통화 횟수', value: '16' },
                        { label: '최장 연속 통화 횟수', value: '93' },
                      ].map((st, i) => (
                        <View key={i} style={s.statBox}>
                          <Text style={s.statValue}>{st.value}</Text>
                          <Text style={s.statLabel}>{st.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={s.msgBubble}>
                      <Text style={s.msgIcon}>📞</Text>
                      <View>
                        <Text style={s.msgBold}>이번엔 <Text style={s.msgHighlight}>5일</Text>이나 더 만났네!</Text>
                        <Text style={s.msgSub}>다음 달도 같이 즐겨보자!</Text>
                      </View>
                    </View>
                    <View style={s.finalFooter}>
                      <TouchableOpacity style={s.finalIconBtn}><Text>⬇</Text></TouchableOpacity>
                      <TouchableOpacity style={s.finalIconBtn}><Text>↗</Text></TouchableOpacity>
                      <TouchableOpacity
                        style={s.confirmBtn}
                        onPress={() => { setShowRecap(false); setCurrentPage(0); }}
                      >
                        <Text style={s.confirmBtnText}>확인</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                );
              }

              return null;
            }}
          />
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
          {/* 월 네비게이션 */}
          <View style={s.monthRow}>
            <TouchableOpacity><Text style={s.monthArrow}>‹</Text></TouchableOpacity>
            <Text style={s.monthText}>{MONTH_STR}</Text>
            <TouchableOpacity><Text style={s.monthArrow}>›</Text></TouchableOpacity>
          </View>

          {/* 날짜 + 토글 아이콘 */}
          <View style={s.dateToggleRow}>
            <Text style={s.dateLabel}>{DATE_STR}</Text>
            <TouchableOpacity onPress={() => setMode(mode === 'calendar' ? 'list' : 'calendar')}>
              <Text style={s.modeIcon}>{mode === 'calendar' ? '≡' : '📅'}</Text>
            </TouchableOpacity>
          </View>

          {/* 달력 뷰 */}
          {mode === 'calendar' && (
            <View style={s.calendar}>
              {MONTH_DAYS.map((day) => {
                const hasStamp = STAMP_DAYS.includes(day);
                return (
                  <View key={day} style={[s.calDay, hasStamp && s.calDayStamped]}>
                    {hasStamp ? (
                      <View style={[s.stamp, { backgroundColor: day % 2 === 0 ? Colors.pink : Colors.blue500 }]}>
                        <Text style={s.stampText}>{day}</Text>
                      </View>
                    ) : (
                      <Text style={s.calDayText}>{day}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* 리스트 뷰 */}
          {mode === 'list' && (
            <View style={s.listView}>
              {[
                { title: '영어 단어 50개 외웠어!', goal: '영어 단어 100개 외우기', date: '2026-06-13', hi: true },
                { title: '아무 일 없었어', goal: '아무 일 없었어', date: '2026-06-12', hi: false },
                { title: '아무 일 없었어', goal: '아무 일 없었어', date: '2026-06-11', hi: false },
                { title: '영어 단어 50개 외웠어!', goal: '영어 단어 100개 외우기', date: '2026-06-10', hi: true },
              ].map((item, i) => (
                <View key={i} style={[s.listCard, item.hi && s.listCardHi]}>
                  <View style={s.listAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.listCardTitle, item.hi && { fontWeight: '700', color: Colors.gray900 }]}>{item.title}</Text>
                    <Text style={s.listCardGoal}>📞 {item.goal}</Text>
                  </View>
                  <Text style={s.listCardDate}>{item.date}</Text>
                </View>
              ))}
              <View style={s.pagination}>
                {[1,2,3,4,5,6,7,8].map(p => (
                  <TouchableOpacity key={p} style={[s.pageBtn, p === 1 && s.pageBtnActive]}>
                    <Text style={[s.pageBtnText, p === 1 && s.pageBtnTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 통계 */}
          <Text style={s.statsTitle}>통계</Text>
          <View style={s.statsGrid}>
            {[
              { label: '이번 달 ANYWAY', value: '6' },
              { label: '이번달 연속', value: '4' },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statLabel}>{st.label}</Text>
                <Text style={[s.statValue, { color: Colors.blue500 }]}>{st.value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.compareLink}>
            <Text style={s.compareLinkText}>지난 달과 비교하기 ›</Text>
          </TouchableOpacity>

          {/* 리캡 버튼 */}
          <TouchableOpacity style={s.recapBtn} onPress={() => setShowRecap(true)}>
            <View style={s.recapAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={s.recapTitle}>5월 다시보기</Text>
              <Text style={s.recapSub}>📞 2026-05</Text>
            </View>
            <Text style={s.recapArrow}>›</Text>
          </TouchableOpacity>
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
  // 월 네비게이션
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.s100 },
  monthArrow: { fontSize: 28, color: Colors.gray900, paddingHorizontal: Space.s100 },
  monthText: { fontSize: 48, fontWeight: '900', color: Colors.gray900, fontFamily: 'Pretendard-Bold' },
  dateToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.s150 },
  dateLabel: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.gray900, fontFamily: 'Pretendard-SemiBold' },
  modeIcon: { fontSize: 22 },
  // 달력
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: Space.s300 },
  calDay: {
    width: '12%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.r100, backgroundColor: 'rgba(74,144,226,0.1)',
  },
  calDayStamped: { backgroundColor: 'transparent' },
  calDayText: { fontSize: 13, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  stamp: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stampText: { fontSize: 11, color: Colors.white, fontWeight: '700', fontFamily: 'Pretendard-Bold' },
  // 리스트
  listView: { marginBottom: Space.s300 },
  listCard: {
    flexDirection: 'row', alignItems: 'center', gap: Space.s150,
    padding: Space.s200, borderRadius: Radius.r100, backgroundColor: Colors.white, marginBottom: 2,
  },
  listCardHi: { backgroundColor: 'rgba(74,144,226,0.08)' },
  listAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.pink },
  listCardTitle: { fontSize: FontSize.size300, color: Colors.gray500, marginBottom: 2, fontFamily: 'Pretendard-Regular' },
  listCardGoal: { fontSize: FontSize.size100, color: Colors.gray400, fontFamily: 'Pretendard-Regular' },
  listCardDate: { fontSize: FontSize.size100, color: Colors.gray300, fontFamily: 'Pretendard-Regular' },
  pagination: { flexDirection: 'row', gap: Space.s075, justifyContent: 'center', marginTop: Space.s200 },
  pageBtn: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: Colors.gray200,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white,
  },
  pageBtnActive: { backgroundColor: Colors.blue500, borderColor: Colors.blue500 },
  pageBtnText: { fontSize: 12, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  pageBtnTextActive: { color: Colors.white, fontFamily: 'Pretendard-SemiBold' },
  // 통계
  statsTitle: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, marginBottom: Space.s150, fontFamily: 'Pretendard-Bold' },
  statsGrid: { flexDirection: 'row', gap: Space.s150, marginBottom: Space.s100 },
  statBox: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.r200, padding: Space.s200,
    shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.06, shadowRadius:6, elevation:2,
  },
  statLabel: { fontSize: FontSize.size200, color: Colors.gray500, marginBottom: Space.s100, fontFamily: 'Pretendard-Regular' },
  statValue: { fontSize: 40, fontWeight: '900', color: Colors.gray900, fontFamily: 'Pretendard-Bold' },
  compareLink: { alignItems: 'flex-end', marginBottom: Space.s200 },
  compareLinkText: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  recapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Space.s200,
    backgroundColor: Colors.white, borderRadius: Radius.r200, padding: Space.s200,
    shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.06, shadowRadius:6, elevation:2,
  },
  recapAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.gray100, borderWidth: 2, borderColor: Colors.pink },
  recapTitle: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold' },
  recapSub: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  recapArrow: { fontSize: 22, color: Colors.gray300 },
  // 리캡 슬라이드
  closeBtn: { position: 'absolute', top: 56, right: Space.s200, zIndex: 10 },
  closeBtnText: { fontSize: 22, color: Colors.gray500 },
  indicatorRow: { flexDirection: 'row', gap: Space.s100, paddingTop: 56, paddingBottom: Space.s200, alignSelf: 'center' },
  indicatorBar: { width: 80, height: 4, borderRadius: 2, backgroundColor: Colors.gray200 },
  indicatorBarActive: { backgroundColor: Colors.blue500 },
  slideContainer: { padding: Space.s200, paddingTop: Space.s100, paddingBottom: 60, alignItems: 'center' },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.gray100, borderWidth: 3, borderColor: Colors.pink, marginBottom: Space.s200 },
  recapTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: Space.s300, textAlign: 'center' },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Space.s300, width: '100%' },
  compareItem: { alignItems: 'center', flex: 1 },
  compareLabel: { fontSize: FontSize.size200, color: Colors.gray500, marginBottom: Space.s100, fontFamily: 'Pretendard-Regular', textAlign: 'center' },
  compareValue: { fontSize: 28, fontWeight: '900', color: Colors.blue500, fontFamily: 'Pretendard-Bold' },
  compareArrow: { fontSize: 28, color: Colors.gray300 },
  msgBubble: {
    flexDirection: 'row', alignItems: 'center', gap: Space.s150,
    backgroundColor: Colors.gray050, borderRadius: Radius.r200, padding: Space.s200, marginBottom: Space.s300, width: '100%',
  },
  msgIcon: { fontSize: 24 },
  msgBold: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: 2 },
  msgHighlight: { color: Colors.blue500 },
  msgSub: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  slideHint: {
    flexDirection: 'row', backgroundColor: Colors.gray050, borderRadius: Radius.r999,
    paddingVertical: Space.s150, paddingHorizontal: Space.s200, alignItems: 'center', gap: Space.s100, width: '100%', justifyContent: 'flex-start',
  },
  slideHintThumb: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.blue500 },
  slideHintText: { fontSize: FontSize.size300, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  // 리스트 슬라이드
  anywayListCard: { backgroundColor: Colors.white, borderRadius: Radius.r200, padding: Space.s200, marginBottom: Space.s300, width: '100%', borderWidth: 1, borderColor: Colors.gray100 },
  anywayListItem: { flexDirection: 'row', alignItems: 'center', gap: Space.s150 },
  anywayListTitle: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: 2 },
  anywayListSub: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular' },
  anywayListDate: { fontSize: FontSize.size100, color: Colors.gray300, fontFamily: 'Pretendard-Regular' },
  collectionTitle: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, fontFamily: 'Pretendard-Bold', marginBottom: Space.s200, alignSelf: 'flex-start' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s100, width: '100%' },
  collectionCard: { width: '30%', aspectRatio: 0.85, backgroundColor: Colors.gray100, borderRadius: Radius.r100, overflow: 'hidden', position: 'relative' },
  collectionCardImage: { flex: 1, backgroundColor: Colors.gray100 },
  dateBadge: { position: 'absolute', bottom: 6, left: 6, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  dateBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700', fontFamily: 'Pretendard-Bold' },
  // 파이널
  finalMonthLabel: { fontSize: FontSize.size200, color: Colors.gray500, fontFamily: 'Pretendard-Regular', marginBottom: Space.s100, textAlign: 'center' },
  finalTitle: { fontSize: 40, fontWeight: '900', textAlign: 'center', lineHeight: 50, marginBottom: Space.s300, color: Colors.gray900, fontFamily: 'Pretendard-Bold' },
  finalTitleBlue: { color: Colors.blue500 },
  finalFooter: { flexDirection: 'row', gap: Space.s150, justifyContent: 'flex-end', alignItems: 'center', marginTop: Space.s200, width: '100%' },
  finalIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gray050, alignItems: 'center', justifyContent: 'center' },
  confirmBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingHorizontal: Space.s200, paddingVertical: Space.s150 },
  confirmBtnText: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.white, fontFamily: 'Pretendard-SemiBold' },
});
