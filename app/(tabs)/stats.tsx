import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PanResponder, Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, FlatList, StatusBar, Image, Alert,
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
import { getMyAnyways, Anyway } from '../../lib/anyway';
import { seedMyLastMonthCards } from '../../lib/seed';
import { generateMonthlyRecap } from '../../lib/gemini';
import { getRecapReview, saveRecapReview } from '../../lib/recap';
import { getCardTemplate } from '../../lib/cardTemplates';
import { getUserProfile } from '../../lib/user';
import { auth } from '../../firebaseConfig';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { onAuthChanged } from '../../lib/auth';
import CharacterAvatar from '../../components/CharacterAvatar';

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

const RECAP_PAGES = ['compare', 'list', 'final'];

const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ANYWAY → 날짜 (createdAt 우선)
function anywayDate(a: Anyway): Date | null {
  let d: Date | null = null;
  if (a.createdAt?.toDate) d = a.createdAt.toDate();
  else if (a.date) d = new Date(a.date);
  return d && !isNaN(d.getTime()) ? d : null;
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const md = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
const yymmdd = (d: Date) => `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

// 일자 배열에서 최장 연속 일수 계산
function computeStreak(days: number[]): number {
  if (days.length === 0) return 0;
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) { cur++; best = Math.max(best, cur); }
    else { cur = 1; }
  }
  return best;
}

// 전체 기간 최장 연속 일수 (월 경계 넘어가도 연속 계산)
function computeMaxStreakAll(dates: Date[]): number {
  const idxs = [...new Set(
    dates.map((d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000))
  )].sort((a, b) => a - b);
  if (idxs.length === 0) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < idxs.length; i++) {
    if (idxs[i] === idxs[i - 1] + 1) { cur++; best = Math.max(best, cur); }
    else { cur = 1; }
  }
  return best;
}


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
  const recapShotRef = useRef<View>(null);  // 3페이지 본문 캡처용
  const [isSliding, setIsSliding] = useState(false);
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar');
  const [showRecap, setShowRecap] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const today = new Date();
  const monthStr = MONTH_NAMES[today.getMonth()];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;

  // 카드를 만든 날(스탬프) - 이번 달 본인 작성 ANYWAY 기준
  const [stampDays, setStampDays] = useState<number[]>([]);
  const [recapStreak, setRecapStreak] = useState(0);       // 지난달(리캡 대상) 최장 연속
  const [recapPrevStreak, setRecapPrevStreak] = useState(0); // 지지난달 최장 연속
  const [recapCards, setRecapCards] = useState<Anyway[]>([]); // 지난달 내가 만든 카드들
  const [selectedRecap, setSelectedRecap] = useState<Anyway | null>(null);
  const [totalCount, setTotalCount] = useState(0);       // 누적 기록 횟수
  const [maxStreakAll, setMaxStreakAll] = useState(0);   // 전체 기간 최장 연속
  const [recapReview, setRecapReview] = useState('');    // 리캡 월간 총평 (AI, 고정)
  const [userChar, setUserChar] = useState('char1');
  const loadStamps = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getUserProfile(uid).then(({ profile }) => {
      if (profile?.character) setUserChar(profile.character);
    });
    const { anyways } = await getMyAnyways(uid);
    const now = new Date();
    const curY = now.getFullYear(), curM = now.getMonth();
    const recap = new Date(curY, curM - 1, 1);        // 지난달 (리캡 대상)
    const recapPrev = new Date(curY, curM - 2, 1);     // 지지난달

    const dates = anyways
      .map((a) => {
        // createdAt(Timestamp) 우선, 없으면 date(ISO)
        let d: Date | null = null;
        if (a.createdAt?.toDate) d = a.createdAt.toDate();
        else if (a.date) d = new Date(a.date);
        return d;
      })
      .filter((d): d is Date => !!d && !isNaN(d.getTime()));

    const daysOf = (y: number, m: number) =>
      dates.filter((d) => d.getFullYear() === y && d.getMonth() === m).map((d) => d.getDate());

    setStampDays([...new Set(daysOf(curY, curM))]);                       // 캘린더: 이번 달
    setRecapStreak(computeStreak(daysOf(recap.getFullYear(), recap.getMonth())));
    setRecapPrevStreak(computeStreak(daysOf(recapPrev.getFullYear(), recapPrev.getMonth())));

    // 전체 기간 통계
    setTotalCount(dates.length);
    setMaxStreakAll(computeMaxStreakAll(dates));

    // 지난달(리캡 대상)에 만든 카드 목록 (최신순)
    const recapList = anyways
      .filter((a) => {
        const d = anywayDate(a);
        return !!d && d.getFullYear() === recap.getFullYear() && d.getMonth() === recap.getMonth();
      })
      .sort((a, b) => (anywayDate(b)?.getTime() ?? 0) - (anywayDate(a)?.getTime() ?? 0));
    setRecapCards(recapList);
    setSelectedRecap(recapList[0] ?? null);

    // 월간 총평 (1회 생성 후 고정): 저장된 게 있으면 사용, 없으면 AI 생성 후 저장
    const ym = `${recap.getFullYear()}-${String(recap.getMonth() + 1).padStart(2, '0')}`;
    const existing = await getRecapReview(uid, ym);
    if (existing) {
      setRecapReview(existing);
    } else if (recapList.length > 0) {
      const text = (await generateMonthlyRecap(recapList.map((c) => c.anywayText))).trim();
      setRecapReview(text);
      saveRecapReview(uid, ym, text);
    } else {
      setRecapReview('');
    }
  }, []);

  // 인증 복원 시 로드
  useEffect(() => {
    const unsub = onAuthChanged((user) => { if (user) loadStamps(); });
    return unsub;
  }, [loadStamps]);

  // 통계 탭에 돌아올 때마다 재로딩 (새 카드 즉시 반영)
  useFocusEffect(
    useCallback(() => { loadStamps(); }, [loadStamps])
  );

  // 이번 달 총 카드 수
  const monthCount = stampDays.length;
  // 이번 달 최장 연속 작성일 수
  const maxStreak = computeStreak(stampDays);
  // 다시보기: 지난달 기준 (6월이면 5월 리캡, 비교는 5월 vs 4월)
  const recapDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const recapMonth = recapDate.getMonth() + 1;
  const recapYear = recapDate.getFullYear();
  const recapPrevMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1).getMonth() + 1;
  const streakDiff = recapStreak - recapPrevStreak;
  // 총평 두 번째 줄(파란색): "그래도 " 접두사 제거
  const recapReviewRest = recapReview.replace(/^그래도\s*/, '').trim();

  // 연속 비교 메시지 (1·3페이지 공용)
  const renderStreakMsg = (boldStyle: any, hlStyle: any) =>
    streakDiff > 0 ? (
      <Text style={boldStyle}>이번엔 <Text style={hlStyle}>{streakDiff}일</Text>이나 더 만났네!</Text>
    ) : streakDiff < 0 ? (
      <Text style={boldStyle}>이번엔 <Text style={hlStyle}>{-streakDiff}일</Text> 덜 만났네!</Text>
    ) : (
      <Text style={boldStyle}>지난 달과 똑같이 만났네!</Text>
    );

  // 개발용: 지난달 샘플 카드 3개 생성 후 리로드
  const handleSeedLastMonth = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
    const { error } = await seedMyLastMonthCards(uid);
    if (error) { Alert.alert('오류', error); return; }
    await loadStamps();
    Alert.alert('완료', '지난달 샘플 카드 3개를 만들었어요.');
  };

  // 다운로드: 3페이지 본문만 캡처해 갤러리에 저장
  const handleDownloadRecap = async () => {
    try {
      if (!recapShotRef.current) return;
      const uri = await captureRef(recapShotRef, { format: 'png', quality: 1 });
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) { Alert.alert('권한 필요', '사진 저장 권한을 허용해주세요.'); return; }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('저장 완료', '리캡 이미지를 갤러리에 저장했어요.');
    } catch (e) {
      Alert.alert('오류', '이미지 저장에 실패했어요.');
    }
  };

  // 공유: 본문 캡처 → OS 공유 시트로 이미지 전송 (호스팅 불필요)
  const [sharing, setSharing] = useState(false);
  const handleShareRecap = async () => {
    if (sharing || !recapShotRef.current) return;
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      const uri = await captureRef(recapShotRef, { format: 'png', quality: 1 });
      if (!available) { Alert.alert('알림', '이 기기에서는 공유를 사용할 수 없어요.'); return; }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '리캡 공유' });
    } catch (e) {
      Alert.alert('오류', '공유에 실패했어요.');
    } finally {
      setSharing(false);
    }
  };

  // 카드 썸네일(채워진 카드)을 w×h 영역에 cover로 렌더
  const renderCardThumb = (item: Anyway, w: number, h: number) => {
    const scale = Math.max(w / 286, h / 476);
    const bgW = 286 * scale, bgH = 476 * scale;
    const left = (w - bgW) / 2, top = (h - bgH) / 2;
    const tpl = getCardTemplate(item.cardStyle);
    const d = anywayDate(item) ?? new Date();
    return (
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        <View style={{ position: 'absolute', left, top, width: bgW, height: bgH }}>
          <Image source={tpl.image} style={{ width: bgW, height: bgH }} resizeMode="stretch" />
          {tpl.renderOverlay({ yymmdd: yymmdd(d), goal: item.goal, done: item.done, anyway: item.anywayText }, scale)}
        </View>
      </View>
    );
  };

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
                    <View style={s.compareAvatar}>
                      <CharacterAvatar character={userChar} size={217} />
                    </View>
                    {/* 제목 */}
                    <Text style={s.compareTitle}>{recapMonth}월 다시보기</Text>
                    {/* 비교 수치 */}
                    <View style={s.compareRow}>
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>{recapPrevMonth}월 연속 기록 횟수</Text>
                        <Text style={s.compareValuePrev}>{recapPrevStreak}회</Text>
                      </View>
                      <ArrowForwardIosIcon width={12} height={22} color={Colors.black} />
                      <View style={s.compareItem}>
                        <Text style={s.compareLabel}>{recapMonth}월 연속 기록 횟수</Text>
                        <Text style={s.compareValueCurr}>{recapStreak}회</Text>
                      </View>
                    </View>
                    {/* 메시지 버블 */}
                    <View style={s.compareMsgBubble}>
                      {renderStreakMsg(s.compareMsgBold, s.compareMsgHighlight)}
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
                    {selectedRecap ? (
                      <>
                        {/* ANYWAY 하이라이트 (선택한 카드) */}
                        <View style={s.anywayHighlightCard}>
                          <View style={s.anywayHighlightLeft}>
                            <CharacterAvatar character={userChar} size={48} />
                            <View style={s.anywayHighlightTexts}>
                              <Text style={s.anywayHighlightTitle} numberOfLines={2}>{selectedRecap.anywayText}</Text>
                              <View style={s.anywayHighlightMeta}>
                                <CallIcon width={16} height={16} color={Colors.gray900} />
                                <Text style={s.anywayHighlightSub} numberOfLines={1}>{selectedRecap.goal}</Text>
                              </View>
                            </View>
                          </View>
                          <Text style={s.anywayHighlightDate}>{ymd(anywayDate(selectedRecap) ?? new Date())}</Text>
                        </View>
                        {/* 선택한 카드 썸네일 */}
                        <View style={s.recapCardPreviewWrap}>
                          <View style={{ height: 540, width: 540 * (286 / 476) }}>
                            {renderCardThumb(selectedRecap, 540 * (286 / 476), 540)}
                          </View>
                        </View>
                      </>
                    ) : (
                      <View style={s.recapEmptyWrap}>
                        <Text style={s.recapEmptyText}>지난달에 만든 카드가 없어요.</Text>
                      </View>
                    )}
                  </View>

                  {/* {월}의 Anyway 그리드 */}
                  <Text style={s.collectionTitle}>{recapMonth}월의 Anyway</Text>
                  <View style={s.cardGrid}>
                    {recapCards.map((item, i) => {
                      const cardW = (screenWidth - Space.s200 * 2 - Space.s100 * 2) / 3;
                      const cardH = cardW * (149 / 118);
                      const d = anywayDate(item) ?? new Date();
                      const sel = selectedRecap?.id === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id ?? i}
                          activeOpacity={0.85}
                          onPress={() => setSelectedRecap(item)}
                          style={[s.collectionCard, { width: cardW, height: cardH }, sel && s.collectionCardSelected]}
                        >
                          {renderCardThumb(item, cardW, cardH)}
                          <View style={s.dateBadge}>
                            <Text style={s.dateBadgeText}>{md(d)}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              );
              if (item === 'final') return (
                <ScrollView style={{ width: screenWidth }} contentContainerStyle={s.slideContainer}>
                  {/* 캡처 대상 본문 (헤더/아이콘/버튼 제외) */}
                  <View ref={recapShotRef} collapsable={false} style={s.recapShot}>
                  {/* 아바타 + 제목 섹션: gap 20 */}
                  <View style={s.finalTopSection}>
                    {/* 아바타: 사용자 캐릭터 */}
                    <CharacterAvatar character={userChar} size={80} />
                    {/* 제목 텍스트: gap 16 */}
                    <View style={s.finalTitleSection}>
                      <Text style={s.finalMonthLabel}>{recapMonth}월의 Anyway</Text>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={s.finalTitle}>그래도</Text>
                        <Text style={s.finalTitleBlue}>{recapReviewRest || '시작은 했다'}</Text>
                      </View>
                    </View>
                  </View>
                  {/* 통계 2×2: width 226, gap 32 */}
                  <View style={s.finalStatsGrid}>
                    <View style={s.finalStatsRow}>
                      {[
                        { label: '이번 달 통화 횟수', value: String(recapCards.length) },
                        { label: '누적 통화 횟수', value: String(totalCount) },
                      ].map((st, i) => (
                        <View key={i} style={s.finalStatItem}>
                          <Text style={s.finalStatValue}>{st.value}</Text>
                          <Text style={s.finalStatLabel}>{st.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={s.finalStatsRow}>
                      {[
                        { label: '이번 달 연속 통화 횟수', value: String(recapStreak) },
                        { label: '최장 연속 통화 횟수', value: String(maxStreakAll) },
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
                    <View style={{ alignItems: 'center' }}>
                      {renderStreakMsg(s.finalMsgBold, s.finalMsgHighlight)}
                      <Text style={s.finalMsgSub}>다음 달도 같이 즐겨보자!</Text>
                    </View>
                  </View>
                  </View>
                  {/* 하단: 아이콘(gap 20) + 확인 버튼 */}
                  <View style={s.finalFooter}>
                    <View style={s.finalIconsRow}>
                      <TouchableOpacity onPress={handleDownloadRecap}>
                        <DownloadIcon width={28} height={28} color={Colors.gray500} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleShareRecap}>
                        <OpenInNewIcon width={28} height={28} color={Colors.gray500} />
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
            {/* 임시: 개발용 (지난달 샘플 카드 생성) */}
            <TouchableOpacity style={s.seedBtn} onPress={handleSeedLastMonth}>
              <Text style={s.seedBtnText}>지난달 샘플</Text>
            </TouchableOpacity>
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
                    const hasStamp = stampDays.includes(cell.day!);
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
              { label: '이번 달 ANYWAY', value: String(monthCount) },
              { label: '이번달 연속', value: String(maxStreak) },
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
            <CharacterAvatar character={userChar} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={s.recapTitle}>{recapMonth}월 다시보기</Text>
              <View style={s.recapMetaRow}>
                <CallIcon width={16} height={16} color={Colors.gray900} />
                <Text style={s.recapSub}>{recapYear}-{String(recapMonth).padStart(2, '0')}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Space.s100 },
  seedBtn: { backgroundColor: Colors.blue100, borderRadius: Radius.r100, paddingHorizontal: Space.s150, paddingVertical: Space.s075 },
  seedBtnText: { fontSize: FontSize.size100, color: Colors.blue700, letterSpacing: -0.2 },
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
  compareAvatar: { width: 217, height: 217, alignItems: 'center', justifyContent: 'center', marginBottom: Space.s200 },
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
    width: '100%', height: 675,
    borderWidth: 1, borderColor: Colors.opacityBlack200,
    borderRadius: Radius.r100, marginBottom: Space.s500,
    padding: Space.s150,
  },
  collectionTitle: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 24.8, letterSpacing: -0.32, marginBottom: Space.s250, alignSelf: 'flex-start' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s100, width: '100%' },
  collectionCard: { width: 118, height: 149, backgroundColor: Colors.gray100, borderRadius: 15, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  collectionCardSelected: { borderWidth: 2, borderColor: Colors.blue400 },
  collectionCardLabel: { fontSize: FontSize.size100, color: Colors.gray400, lineHeight: 16.8, letterSpacing: -0.24 },
  recapCardPreviewWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recapEmptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recapEmptyText: { fontSize: FontSize.size200, color: Colors.gray400, letterSpacing: -0.6 },
  dateBadge: { position: 'absolute', bottom: 8, left: 8, width: 33, height: 33, borderRadius: 16.5, backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100, alignItems: 'center', justifyContent: 'center' },
  dateBadgeText: { fontSize: FontSize.size050, fontWeight: '700', color: '#005DE2', lineHeight: 14, letterSpacing: -0.2 },
  // 리캡 3페이지
  recapShot: { width: '100%', alignItems: 'center', backgroundColor: Colors.white, paddingVertical: Space.s300, borderRadius: Radius.r300 },
  finalTopSection: { alignItems: 'center', gap: Space.s250, marginBottom: Space.s400 },
  finalAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.pink400 },
  finalTitleSection: { alignItems: 'center', gap: Space.s200 },
  finalMonthLabel: { fontSize: FontSize.size300, color: Colors.black, lineHeight: 22.4, letterSpacing: -0.32, textAlign: 'center' },
  finalTitle: { fontSize: 32, fontWeight: '700', color: Colors.black, lineHeight: 44, letterSpacing: -2, textAlign: 'center', fontFamily: 'JejuSamdasooBrand-Regular' },
  finalTitleBlue: { fontSize: 32, fontWeight: '700', color: '#005DE2', lineHeight: 44, letterSpacing: -2, textAlign: 'center', fontFamily: 'JejuSamdasooBrand-Regular' },
  finalStatsGrid: { gap: Space.s400, marginBottom: Space.s400, width: 226 },
  finalStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finalStatItem: { width: 80, gap: Space.s050, alignItems: 'center' },
  finalStatValue: { fontSize: FontSize.size800, fontWeight: '700', color: Colors.black, lineHeight: 38.4, letterSpacing: -0.64, textAlign: 'center' },
  finalStatLabel: { fontSize: FontSize.size100, color: Colors.black, lineHeight: 16.8, letterSpacing: -0.24, textAlign: 'center' },
  finalMsgBubble: {
    backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.blue100,
    borderRadius: Radius.r300, paddingTop: 12, paddingBottom: 15, paddingHorizontal: Space.s250,
    flexDirection: 'column', alignItems: 'center', gap: Space.s100,
    marginBottom: Space.s250, width: '100%',
  },
  finalMsgTexts: { alignItems: 'center', gap: 0 },
  finalMsgBold: { fontSize: FontSize.size300, fontWeight: '700', color: Colors.black, lineHeight: 24, letterSpacing: -0.2, textAlign: 'center' },
  finalMsgHighlight: { color: '#005DE2' },
  finalMsgSub: { fontSize: FontSize.size050, color: Colors.black, lineHeight: 15, letterSpacing: -0.2, textAlign: 'center' },
  finalFooter: { flexDirection: 'column', alignItems: 'flex-end', gap: Space.s250, width: '100%' },
  finalIconsRow: { flexDirection: 'row', gap: Space.s250 },
  confirmBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r300, paddingHorizontal: Space.s250, paddingVertical: Space.s100 },
  confirmBtnText: { fontSize: FontSize.size200, fontWeight: '500', color: Colors.white, lineHeight: 16.8, letterSpacing: -0.2 },
});
