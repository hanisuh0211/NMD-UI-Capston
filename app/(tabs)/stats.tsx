import React, { useState, useRef } from 'react';
import { PanResponder, Animated } from 'react-native';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, FlatList, StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Star12Icon from '../../assets/icons/star_12.svg';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import NotificationsIcon from '../../assets/icons/notifications.svg';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import CallIcon from '../../assets/icons/call.svg';
import TableRowsIcon from '../../assets/icons/table_rows.svg';
import CalendarTodayIcon from '../../assets/icons/calendar_today.svg';
import ArrowDropDownIcon from '../../assets/icons/arrow_drop_down.svg';
import CallEndIcon from '../../assets/icons/call_end.svg';
import PhoneForwardedIcon from '../../assets/icons/phone_forwarded.svg';
import DownloadIcon from '../../assets/icons/download.svg';
import OpenInNewIcon from '../../assets/icons/open_in_new.svg';

// ── 캘린더 데이터 ──
type CellType = 'num' | 'blank' | 'empty';
type Cell = { type: CellType; day?: number };
type Row = { cells: Cell[] };

const JUNE_ROWS: Row[] = [
  { cells: [{ type: 'blank' }, { type: 'num', day: 1 }, { type: 'empty' }, { type: 'blank' }, { type: 'num', day: 2 }, { type: 'num', day: 3 }, { type: 'empty' }, { type: 'num', day: 4 }, { type: 'blank' }] },
  { cells: [{ type: 'empty' }, { type: 'num', day: 5 }, { type: 'num', day: 6 }, { type: 'num', day: 7 }, { type: 'empty' }, { type: 'num', day: 8 }, { type: 'num', day: 9 }, { type: 'blank' }, { type: 'empty' }] },
  { cells: [{ type: 'blank' }, { type: 'empty' }, { type: 'num', day: 10 }, { type: 'blank' }, { type: 'num', day: 11 }, { type: 'empty' }, { type: 'num', day: 12 }, { type: 'num', day: 13 }, { type: 'blank' }] },
  { cells: [{ type: 'empty' }, { type: 'num', day: 14 }, { type: 'blank' }, { type: 'num', day: 15 }, { type: 'num', day: 16 }, { type: 'blank' }, { type: 'empty' }, { type: 'num', day: 17 }, { type: 'blank' }] },
  { cells: [{ type: 'empty' }, { type: 'empty' }, { type: 'num', day: 18 }, { type: 'num', day: 19 }, { type: 'num', day: 20 }, { type: 'num', day: 21 }, { type: 'num', day: 22 }, { type: 'blank' }, { type: 'empty' }] },
  { cells: [{ type: 'empty' }, { type: 'num', day: 23 }, { type: 'blank' }, { type: 'num', day: 24 }, { type: 'blank' }, { type: 'blank' }, { type: 'num', day: 25 }, { type: 'num', day: 26 }, { type: 'empty' }] },
  { cells: [{ type: 'blank' }, { type: 'blank' }, { type: 'num', day: 27 }, { type: 'num', day: 28 }, { type: 'num', day: 29 }, { type: 'empty' }, { type: 'num', day: 30 }, { type: 'num', day: 31 }, { type: 'blank' }] },
];

const STAMP_DAYS = [2, 3, 4, 5, 8, 12];
const RECAP_PAGES = ['compare', 'list', 'final'];

const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];


// ── 밀어서 확인하기 슬라이더 컴포넌트 ──
function SlideToNext({ onSlide, onSlidingChange }: { onSlide: () => void; onSlidingChange: (v: boolean) => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  // 트랙 274px, 양쪽 패딩 6px, 원 64px → 최대 이동거리
  const MAX_SLIDE = 274 - 64 - 6 - 6;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        onSlidingChange(true);
      },
      onPanResponderMove: (_, gs) => {
        // offset 없이 dx를 직접 사용 → 빠르게 밀어도 추적 가능
        const val = Math.max(0, Math.min(gs.dx, MAX_SLIDE));
        translateX.setValue(val);
      },
      onPanResponderRelease: (_, gs) => {
        onSlidingChange(false);
        if (gs.dx > MAX_SLIDE * 0.5) {
          Animated.timing(translateX, {
            toValue: MAX_SLIDE,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            onSlide();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        onSlidingChange(false);
        Animated.spring(translateX, { toValue: 0, friction: 8, useNativeDriver: false }).start();
      },
    })
  ).current;

  return (
    <View style={sliderStyle.track} pointerEvents="box-none">
      <Text style={sliderStyle.label} pointerEvents="none">밀어서 확인하기</Text>
      <Animated.View
        style={[sliderStyle.circle, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <PhoneForwardedIcon width={24} height={24} color={Colors.white} />
      </Animated.View>
    </View>
  );
}

const sliderStyle = StyleSheet.create({
  track: {
    width: 274,
    height: 76,
    backgroundColor: Colors.gray050,
    borderWidth: 1,
    borderColor: Colors.gray100,
    borderRadius: Radius.r999,
    paddingVertical: Space.s075,
    paddingHorizontal: Space.s075,
    justifyContent: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: Space.s075,
  },
  label: {
    fontSize: FontSize.size300,
    color: Colors.gray500,
    lineHeight: LineHeight.lh300,
    letterSpacing: -0.6,
    textAlign: 'center',
    width: '100%',
  },
});

export default function StatsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cellSize = screenWidth / 9;

  const flatRef = useRef<FlatList>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  const [showRecap, setShowRecap] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const today = new Date();
  const monthStr = MONTH_NAMES[today.getMonth()];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;

  // ── 리캡 슬라이드 ──
  if (showRecap) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{x:0,y:0}} end={{x:0,y:1}} />
        <SafeAreaView style={s.safe}>
          {/* 인디케이터 - absolute로 피그마 위치 그대로 */}
          <View style={s.indicatorRow} pointerEvents="none">
            {RECAP_PAGES.map((_, i) => (
              <View key={i} style={[s.indicatorBar, i === currentPage && s.indicatorBarActive]} />
            ))}
          </View>
          {/* X 버튼 - absolute */}
          <TouchableOpacity style={s.closeBtn} onPress={() => { setShowRecap(false); setCurrentPage(0); }}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <FlatList
            ref={flatRef}
            data={RECAP_PAGES}
            keyExtractor={item => item}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            scrollEnabled={!isSliding}
            onMomentumScrollEnd={(e) => setCurrentPage(Math.round(e.nativeEvent.contentOffset.x / screenWidth))}
            renderItem={({ item }) => {
              if (item === 'compare') return (
                <View style={{ width: screenWidth, flex: 1 }}>
                  <ScrollView contentContainerStyle={s.comparePage} showsVerticalScrollIndicator={false}>
                    {/* 아바타 */}
                    <View style={s.compareAvatar} />
                    {/* 제목 */}
                    <Text style={s.compareTitle}>5월 다시보기</Text>
                    {/* 비교 수치 */}
                    <View style={s.compareRow}>
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>4월 연속 통화 횟수</Text>
                        <Text style={s.compareValuePrev}>11회</Text>
                      </View>
                      <ArrowForwardIosIcon width={12} height={22} color={Colors.black} />
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>5월 연속 통화 횟수</Text>
                        <Text style={s.compareValueCurr}>16회</Text>
                      </View>
                    </View>
                    {/* 메시지 버블 */}
                    <View style={s.compareMsgBubble}>
                      <Text style={s.compareMsgBold}>
                        이번엔 <Text style={s.compareMsgHighlight}>5일</Text>이나 더 만났네!
                      </Text>
                      <Text style={s.compareMsgSub}>다음 달도 같이 즐겨보자!</Text>
                    </View>
                    {/* 밀어서 확인하기 */}
                    <SlideToNext
                      onSlide={() => {
                        flatRef.current?.scrollToIndex({ index: 1, animated: true });
                        setCurrentPage(1);
                      }}
                      onSlidingChange={setIsSliding}
                    />
                  </ScrollView>
                </View>
              );
              if (item === 'list') return (
                <ScrollView style={{ width: screenWidth }} contentContainerStyle={s.slideContainer}>
                  {/* 이미지 카드 + ANYWAY 하이라이트 포함 */}
                  <View style={s.anywayImageCard}>
                    {/* ANYWAY 카드 - 이미지 카드 안 상단 */}
                    <View style={s.anywayHighlightCard}>
                      <View style={s.anywayHighlightLeft}>
                        <View style={s.anywayHighlightAvatar} />
                        <View style={s.anywayHighlightTexts}>
                          <Text style={s.anywayHighlightTitle}>그래도 알람은 껐잖아!</Text>
                          <View style={s.anywayHighlightMeta}>
                            <CallIcon width={16} height={16} color={Colors.gray900} />
                            <Text style={s.anywayHighlightSub}>늦잠 자서 지각했다</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={s.anywayHighlightDate}>2026-05-12</Text>
                    </View>
                  </View>

                  {/* 5월의 Anyway 그리드 */}
                  <Text style={s.collectionTitle}>5월의 Anyway</Text>
                  <View style={s.cardGrid}>
                    {[1,2,3,4,5,6,7,8,9].map(i => {
                      const cardW = (screenWidth - Space.s200 * 2 - Space.s100 * 2) / 3;
                      const cardH = cardW * (149 / 118);
                      return (
                        <View key={i} style={[s.collectionCard, { width: cardW, height: cardH }]}>
                          <Text style={s.collectionCardLabel}>카드</Text>
                          <View style={s.dateBadge}>
                            <Text style={s.dateBadgeText}>5/1</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              );
              if (item === 'final') return (
                <ScrollView style={{ width: screenWidth }} contentContainerStyle={s.slideContainer}>
                  {/* 아바타 + 제목 섹션: gap 20 */}
                  <View style={s.finalTopSection}>
                    {/* 아바타: 80px, pink/400 border 1px */}
                    <View style={s.finalAvatar} />
                    {/* 제목 텍스트: gap 16 */}
                    <View style={s.finalTitleSection}>
                      <Text style={s.finalMonthLabel}>5월의 Anyway</Text>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={s.finalTitle}>그래도</Text>
                        <Text style={s.finalTitleBlue}>시작은 했다</Text>
                      </View>
                    </View>
                  </View>
                  {/* 통계 2×2: width 226, gap 32 */}
                  <View style={s.finalStatsGrid}>
                    <View style={s.finalStatsRow}>
                      {[
                        { label: '이번 달 통화 횟수', value: '27' },
                        { label: '누적 통화 횟수', value: '182' },
                      ].map((st, i) => (
                        <View key={i} style={s.finalStatItem}>
                          <Text style={s.finalStatValue}>{st.value}</Text>
                          <Text style={s.finalStatLabel}>{st.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={s.finalStatsRow}>
                      {[
                        { label: '이번 달 연속 통화 횟수', value: '16' },
                        { label: '최장 연속 통화 횟수', value: '93' },
                      ].map((st, i) => (
                        <View key={i} style={s.finalStatItem}>
                          <Text style={s.finalStatValue}>{st.value}</Text>
                          <Text style={s.finalStatLabel}>{st.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  {/* 메시지 버블: gray/050 bg, blue/100 border, r24, pt12 pb15 px20 */}
                  <View style={s.finalMsgBubble}>
                    <PhoneForwardedIcon width={24} height={24} color={Colors.pink400} />
                    <View style={{ alignItems: 'flex-start' }}>
                      <Text style={s.finalMsgBold}>
                        {'이번엔 '}<Text style={s.finalMsgHighlight}>5일</Text>{'이나 더 만났네!'}
                      </Text>
                      <Text style={s.finalMsgSub}>다음 달도 같이 즐겨보자!</Text>
                    </View>
                  </View>
                  {/* 하단: 아이콘(gap 20) + 확인 버튼 */}
                  <View style={s.finalFooter}>
                    <View style={s.finalIconsRow}>
                      <TouchableOpacity>
                        <DownloadIcon width={28} height={28} color={Colors.gray900} />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <OpenInNewIcon width={28} height={28} color={Colors.gray900} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={s.confirmBtn}
                      onPress={() => { setShowRecap(false); setCurrentPage(0); }}
                    >
                      <Text style={s.confirmBtnText}>확인</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              );
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
          {/* 헤더 */}
          <View style={s.header}>
            <View style={{ width: 28 }} />
            <TouchableOpacity>
              <NotificationsIcon width={28} height={28} color={Colors.gray900} />
            </TouchableOpacity>
          </View>

          {/* 월 네비게이션 */}
          <View style={s.monthRow}>
            <TouchableOpacity><Text style={s.monthArrow}>‹</Text></TouchableOpacity>
            <Text style={s.monthText}>{monthStr}</Text>
            <TouchableOpacity><Text style={s.monthArrow}>›</Text></TouchableOpacity>
          </View>

          {/* 날짜 + 토글: 캘린더 모드에서만 표시 */}
          {mode === 'calendar' && (
            <View style={s.dateToggleRow}>
              <Text style={s.dateLabel}>{dateStr}</Text>
              <TouchableOpacity onPress={() => setMode('list')}>
                <TableRowsIcon width={28} height={28} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── 캘린더 ── */}
          {mode === 'calendar' && (
            <View style={[s.board, { width: screenWidth, marginLeft: -Space.s200 }]}>
              {JUNE_ROWS.map((row, rowIdx) => (
                <View key={rowIdx} style={[s.boardRow, { height: cellSize }]}>
                  {row.cells.map((cell, cellIdx) => {
                    const cellStyle = { width: cellSize, height: cellSize };
                    if (cell.type === 'blank') {
                      return <View key={cellIdx} style={[s.cell, s.cellBlank, cellStyle]} />;
                    }
                    if (cell.type === 'empty') {
                      return <View key={cellIdx} style={[s.cell, s.cellEmpty, cellStyle]} />;
                    }
                    const hasStamp = STAMP_DAYS.includes(cell.day!);
                    return (
                      <View key={cellIdx} style={[s.cell, s.cellNum, cellStyle]}>
                        {hasStamp ? (
                          <View style={[s.stampWrap, { width: cellSize, height: cellSize }]}>
                            <Star12Icon width={cellSize} height={cellSize} />
                            <Text style={s.stampNum}>{cell.day}</Text>
                          </View>
                        ) : (
                          <Text style={s.numText}>{cell.day}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* ── 리스트 뷰 ── */}
          {mode === 'list' && (
            <View style={s.listView}>
              {/* 날짜 + 정렬 태그 + 캘린더 아이콘 */}
              <View style={s.listHeader}>
                <View style={s.listHeaderLeft}>
                  <Text style={s.listDateLabel}>{dateStr}</Text>
                  <View style={s.sortTag}>
                    <Text style={s.sortTagText}>최신순</Text>
                    <ArrowDropDownIcon width={16} height={16} color={Colors.gray900} />
                  </View>
                </View>
                <TouchableOpacity onPress={() => setMode('calendar')}>
                  <CalendarTodayIcon width={28} height={28} color={Colors.gray900} />
                </TouchableOpacity>
              </View>

              {/* 리스트 아이템 */}
              {[
                { title: '일이삼사오육칠팔구십일이삼사오육칠팔구십일이삼사오', goal: '일이삼사오육칠팔구십일이삼사오육칠', date: '2026-06-13', active: true },
                { title: '아무 일 없었어', goal: '아무 일 없었어', date: '2026-06-12', active: false },
                { title: '아무 일 없었어', goal: '아무 일 없었어', date: '2026-06-11', active: false },
                { title: '일이삼사오육칠팔구십일이삼', goal: '일이삼사오육칠팔구', date: '2026-06-10', active: true },
              ].map((item, i) => (
                <View key={i} style={[s.listCard, item.active ? s.listCardActive : s.listCardInactive]}>
                  <View style={s.listAvatar} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[s.listCardTitle, item.active && s.listCardTitleActive]}
                      numberOfLines={item.active ? 2 : 1}
                    >
                      {item.title}
                    </Text>
                    <View style={s.listCardMeta}>
                      {item.active
                        ? <CallIcon width={16} height={16} color={Colors.gray900} />
                        : <CallEndIcon width={16} height={16} color={Colors.pink400} />
                      }
                      <Text style={s.listCardGoal} numberOfLines={1}>{item.goal}</Text>
                    </View>
                  </View>
                  <Text style={s.listCardDate}>{item.date}</Text>
                </View>
              ))}

              {/* 페이지네이션 */}
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
          <View style={s.statsRow}>
            {[
              { label: '이번 달 ANYWAY', value: '6' },
              { label: '이번달 연속', value: '4' },
            ].map((st, i) => (
              <View key={i} style={s.statBox}>
                <Text style={s.statLabel}>{st.label}</Text>
                <Text style={[s.statValue, { color: '#005DE2' }]}>{st.value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.compareLink}>
            <Text style={s.compareLinkText}>지난 달과 비교하기</Text>
            <ArrowForwardIosIcon width={16} height={16} color={Colors.gray900} />
          </TouchableOpacity>

          {/* 리캡 버튼 */}
          <TouchableOpacity style={s.recapBtn} onPress={() => setShowRecap(true)}>
            <View style={s.recapAvatarWrap}>
              <View style={s.recapAvatar} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.recapTitle}>5월 다시보기</Text>
              <View style={s.recapMetaRow}>
                <CallIcon width={16} height={16} color={Colors.gray900} />
                <Text style={s.recapSub}>2026-05</Text>
              </View>
            </View>
            <ArrowForwardIosIcon width={28} height={28} color={Colors.gray900} />
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
  container: { paddingHorizontal: Space.s200, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingVertical: Space.s100 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.s100 },
  monthArrow: { fontSize: 24, color: Colors.gray900, paddingHorizontal: Space.s100 },
  monthText: { fontSize: FontSize.size900, fontWeight: '700', color: Colors.black, lineHeight: LineHeight.lh900, letterSpacing: -0.6, textAlign: 'center' },
  dateToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: Space.s150 },
  dateLabel: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, lineHeight: 24.3, letterSpacing: -0.36 },
  // 캘린더
  board: { backgroundColor: '#F1F7FF', marginBottom: Space.s400, overflow: 'hidden' },
  boardRow: { flexDirection: 'row' },
  cell: { borderWidth: 1, borderColor: Colors.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cellBlank: { backgroundColor: Colors.blue100 },
  cellEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  cellNum: { backgroundColor: Colors.white },
  numText: { fontSize: FontSize.size200, color: Colors.gray900, textAlign: 'center', letterSpacing: -0.28 },
  stampWrap: { alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  stampNum: { position: 'absolute', fontSize: FontSize.size200, color: Colors.white, fontWeight: '400', textAlign: 'center', letterSpacing: -0.28 },
  // 리스트
  listView: { marginBottom: Space.s300, gap: Space.s150 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Space.s150 },
  listHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.s150 },
  listDateLabel: { fontSize: FontSize.size400, fontWeight: '700', color: Colors.gray900, lineHeight: 24.3, letterSpacing: -0.36 },
  sortTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blue100, borderWidth: 1, borderColor: Colors.opacityBlack100, borderRadius: Radius.r999, paddingLeft: Space.s200, paddingRight: Space.s100, paddingVertical: Space.s050 },
  sortTagText: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: 16.2, letterSpacing: -0.24 },
  listCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.s200, padding: Space.s150, borderRadius: Radius.r200, marginBottom: 0 },
  listCardActive: { backgroundColor: Colors.blue200 },
  listCardInactive: { backgroundColor: '#F1F7FF', borderWidth: 1, borderColor: Colors.blue200 },
  listAvatar: { width: 48, height: 48, borderRadius: 599, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.pink400, flexShrink: 0 },
  listCardTitle: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.32, marginBottom: Space.s100 },
  listCardTitleActive: { fontWeight: '600', letterSpacing: -0.6 },
  listCardMeta: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  listCardGoal: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: LineHeight.lh100, letterSpacing: -0.24, flex: 1 },
  listCardDate: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: 18, flexShrink: 0, paddingTop: Space.s050 },
  pagination: { flexDirection: 'row', gap: Space.s100, justifyContent: 'center', marginTop: Space.s100 },
  pageBtn: { width: 32, height: 32, borderRadius: Radius.r999, borderWidth: 1, borderColor: Colors.blue100, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray050 },
  pageBtnActive: { backgroundColor: Colors.blue100, borderColor: Colors.blue200 },
  pageBtnText: { fontSize: FontSize.size100, fontWeight: '700', color: Colors.gray900, letterSpacing: -0.24 },
  pageBtnTextActive: { color: Colors.gray900 },
  // 통계
  statsTitle: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, lineHeight: 31, letterSpacing: -0.4, marginBottom: Space.s200 },
  statsRow: { flexDirection: 'row', gap: Space.s100, marginBottom: Space.s100 },
  statBox: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.blue100, borderRadius: Radius.r300, padding: Space.s200, gap: Space.s100 },
  statLabel: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: LineHeight.lh100, letterSpacing: -0.2, textAlign: 'center' },
  statValue: { fontSize: FontSize.size600, fontWeight: '700', lineHeight: 33.6, letterSpacing: -0.48, textAlign: 'center' },
  compareLink: { flexDirection: 'row', alignItems: 'center', gap: Space.s100, justifyContent: 'flex-end', paddingVertical: Space.s100, marginBottom: Space.s200 },
  compareLinkText: { fontSize: FontSize.size200, fontWeight: '700', color: Colors.gray900, lineHeight: 21, letterSpacing: -0.28 },
  recapBtn: { backgroundColor: '#F1F7FF', borderWidth: 1, borderColor: Colors.blue100, borderRadius: Radius.r200, flexDirection: 'row', alignItems: 'center', gap: Space.s200, padding: Space.s200 },
  recapAvatarWrap: { borderWidth: 1, borderColor: Colors.pink400, borderRadius: 1332, overflow: 'hidden', width: 64, height: 64 },
  recapAvatar: { width: 64, height: 64, backgroundColor: Colors.gray100 },
  recapTitle: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, lineHeight: 24, letterSpacing: -0.4, marginBottom: Space.s100 },
  recapMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  recapSub: { fontSize: FontSize.size100, color: Colors.gray900, lineHeight: LineHeight.lh200, letterSpacing: -0.24 },
  // 리캡 슬라이드
  recapTopBar: {},
  closeBtn: { position: 'absolute', top: 108, right: Space.s200, zIndex: 20 },
  closeBtnText: { fontSize: 22, color: Colors.gray500 },
  indicatorRow: { position: 'absolute', top: 86, left: Space.s200, right: Space.s200, flexDirection: 'row', gap: Space.s100, zIndex: 20, alignItems: 'center' },
  indicatorBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.gray200 },
  indicatorBarActive: { backgroundColor: Colors.blue500 },
  slideContainer: { padding: Space.s200, paddingTop: 120, paddingBottom: 60, alignItems: 'center' },
  // 리캡 1페이지
  comparePage: { alignItems: 'center', paddingHorizontal: Space.s200, paddingBottom: 40, paddingTop: 120 },
  compareAvatar: { width: 217, height: 217, borderRadius: 108.5, backgroundColor: Colors.gray100, borderWidth: 2, borderColor: Colors.pink400, marginBottom: Space.s200 },
  compareTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.black, lineHeight: 32.4, letterSpacing: -0.48, textAlign: 'center', marginBottom: Space.s400 },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Space.s300, width: '100%' },
  compareItem: { alignItems: 'center', flex: 1, gap: Space.s050 },
  compareLabel: { fontSize: FontSize.size100, color: Colors.black, lineHeight: 16.8, letterSpacing: -0.24, textAlign: 'center' },
  compareValuePrev: { fontSize: FontSize.size600, fontWeight: '700', color: '#5FA6FF', lineHeight: 32.4, letterSpacing: -0.48, textAlign: 'center' },
  compareValueCurr: { fontSize: FontSize.size600, fontWeight: '700', color: '#005DE2', lineHeight: 32.4, letterSpacing: -0.48, textAlign: 'center' },
  compareMsgBubble: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100, borderRadius: Radius.r300, paddingVertical: Space.s150, paddingHorizontal: Space.s250, alignItems: 'center', marginBottom: Space.s400, width: '100%' },
  compareMsgBold: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 24, letterSpacing: -0.2, textAlign: 'center' },
  compareMsgHighlight: { color: '#005DE2' },
  compareMsgSub: { fontSize: FontSize.size050, color: Colors.black, lineHeight: 14, letterSpacing: -0.2, textAlign: 'center' },
  slideHintBtn: { flexDirection: 'row', backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.gray100, borderRadius: Radius.r999, paddingVertical: Space.s075, paddingLeft: Space.s075, paddingRight: Space.s400, alignItems: 'center', gap: Space.s150, width: 274 },
  slideHintCircle: { width: 64, height: 64, borderRadius: 48, backgroundColor: Colors.blue500, alignItems: 'center', justifyContent: 'center' },
  slideHintText: { fontSize: FontSize.size300, color: Colors.gray500, lineHeight: LineHeight.lh300, letterSpacing: -0.6, textAlign: 'center' },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.gray100, borderWidth: 3, borderColor: Colors.pink400, marginBottom: Space.s200 },
  // 리캡 2페이지
  anywayHighlightCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100,
    borderRadius: Radius.r200, padding: Space.s150, width: '100%', marginBottom: Space.s300,
  },
  anywayHighlightLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.s200, flex: 1 },
  anywayHighlightAvatar: { width: 48, height: 48, borderRadius: 599, backgroundColor: Colors.gray100, borderWidth: 0.6, borderColor: Colors.pink400, flexShrink: 0 },
  anywayHighlightTexts: { gap: Space.s075, flex: 1 },
  anywayHighlightTitle: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 21.6, letterSpacing: -0.32 },
  anywayHighlightMeta: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  anywayHighlightSub: { fontSize: FontSize.size100, color: Colors.black, lineHeight: 16.2, letterSpacing: -0.24 },
  anywayHighlightDate: { fontSize: FontSize.size100, color: Colors.black, lineHeight: LineHeight.lh100, flexShrink: 0 },
  anywayImageCard: {
    width: '100%', height: 450,
    borderWidth: 1, borderColor: Colors.opacityBlack200,
    borderRadius: Radius.r100, marginBottom: Space.s500,
    padding: Space.s150,
  },
  collectionTitle: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 24.8, letterSpacing: -0.32, marginBottom: Space.s250, alignSelf: 'flex-start' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s100, width: '100%' },
  collectionCard: { width: 118, height: 149, backgroundColor: Colors.gray100, borderRadius: 15, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  collectionCardLabel: { fontSize: FontSize.size100, color: Colors.gray400, lineHeight: 16.8, letterSpacing: -0.24 },
  dateBadge: { position: 'absolute', bottom: 8, left: 8, width: 33, height: 33, borderRadius: 16.5, backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100, alignItems: 'center', justifyContent: 'center' },
  dateBadgeText: { fontSize: FontSize.size050, fontWeight: '700', color: '#005DE2', lineHeight: 14, letterSpacing: -0.2 },
  // 리캡 3페이지
  finalTopSection: { alignItems: 'center', gap: Space.s250, marginBottom: Space.s400 },
  finalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.pink400 },
  finalTitleSection: { alignItems: 'center', gap: Space.s200 },
  finalMonthLabel: { fontSize: FontSize.size300, color: Colors.black, lineHeight: 22.4, letterSpacing: -0.32, textAlign: 'center' },
  finalTitle: { fontSize: 32, fontWeight: '700', color: Colors.black, lineHeight: 44, letterSpacing: -2, textAlign: 'center', fontFamily: 'JejuSamdasooBrand-Regular' },
  finalTitleBlue: { fontSize: 32, fontWeight: '700', color: '#005DE2', lineHeight: 44, letterSpacing: -2, textAlign: 'center', fontFamily: 'JejuSamdasooBrand-Regular' },
  finalStatsGrid: { gap: Space.s400, marginBottom: Space.s400, width: 226 },
  finalStatsRow: { flexDirection: 'row', gap: 0, justifyContent: 'space-between' },
  finalStatItem: { width: 80, gap: Space.s050, alignItems: 'flex-start' },
  finalStatValue: { fontSize: FontSize.size800, fontWeight: '700', color: Colors.black, lineHeight: 38.4, letterSpacing: -0.64 },
  finalStatLabel: { fontSize: FontSize.size100, color: Colors.black, lineHeight: 16.8, letterSpacing: -0.24 },
  finalMsgBubble: {
    backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100,
    borderRadius: Radius.r300, paddingVertical: Space.s150, paddingHorizontal: Space.s250,
    alignItems: 'center', gap: Space.s100, marginBottom: Space.s250, width: '100%',
  },
  finalMsgTexts: { alignItems: 'center', gap: 0 },
  finalMsgBold: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 24, letterSpacing: -0.2, textAlign: 'center' },
  finalMsgHighlight: { color: '#005DE2' },
  finalMsgSub: { fontSize: FontSize.size050, color: Colors.black, lineHeight: 15, letterSpacing: -0.2, textAlign: 'center' },
  finalFooter: { flexDirection: 'row', gap: Space.s250, justifyContent: 'flex-end', alignItems: 'center', width: '100%' },
  confirmBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r300, paddingHorizontal: Space.s250, paddingVertical: Space.s100 },
  confirmBtnText: { fontSize: FontSize.size200, fontWeight: '500', color: Colors.white, lineHeight: 16.8, letterSpacing: -0.2 },
});
