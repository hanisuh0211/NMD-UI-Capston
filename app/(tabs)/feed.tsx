import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Image, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
  Modal, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentSnapshot } from 'firebase/firestore';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import NotificationsIcon from '../../assets/icons/notifications.svg';
import { getPublicFeed } from '../../lib/feed';
import { Anyway } from '../../lib/anyway';
import { getCardTemplate } from '../../lib/cardTemplates';
import { seedSampleFeed, reassignCardStyles } from '../../lib/seed';
import { Alert } from 'react-native';

const BORDER_COLORS = [Colors.blue300, Colors.pink300];
const PAGE_SIZE = 10;

// 시간 표시용 포맷 (date 문자열 → "M/D")
function formatTime(item: Anyway): string {
  if (item.date) {
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) return `${d.getMonth() + 1}/${d.getDate()}`;
    return item.date;
  }
  return '';
}

// 카드용 YYMMDD
function cardDate(item: Anyway): string {
  let d: Date | null = null;
  if (item.createdAt?.toDate) d = item.createdAt.toDate();
  else if (item.date) d = new Date(item.date);
  if (!d || isNaN(d.getTime())) d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export default function FeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [size, setSize] = useState<'small' | 'big'>('small');
  const [items, setItems] = useState<Anyway[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<DocumentSnapshot | undefined>(undefined);
  const loadingRef = useRef(false);

  const { height: screenHeight } = useWindowDimensions();
  const contentW = screenWidth - Space.s200 * 2;
  const smallCardW = (contentW - Space.s150) / 2;

  // 카드 팝업 모달
  const [selected, setSelected] = useState<Anyway | null>(null);
  const maxByWidth = screenWidth * 0.72;
  const maxByHeight = (screenHeight - 220) * (286 / 476);
  const popCardW = Math.min(maxByWidth, maxByHeight);
  const popCardH = popCardW * (476 / 286);
  const sc = popCardW / 286;

  // 페이지 불러오기 (초기 + 추가 공용)
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    const { feed, lastVisible } = await getPublicFeed(lastDocRef.current, PAGE_SIZE);
    if (feed.length > 0) {
      setItems(prev => [...prev, ...feed]);
      lastDocRef.current = lastVisible ?? undefined;
    }
    if (feed.length < PAGE_SIZE) setHasMore(false);
    setLoading(false);
    loadingRef.current = false;
  }, [hasMore]);

  // 최초 1회 로드
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 임시: 샘플 피드 생성
  const handleSeed = async () => {
    const { error } = await seedSampleFeed();
    if (error) {
      Alert.alert('오류', '샘플 생성 실패: ' + error);
      return;
    }
    // 목록 초기화 후 다시 로드
    setItems([]);
    lastDocRef.current = undefined;
    setHasMore(true);
    loadingRef.current = false;
    const { feed, lastVisible } = await getPublicFeed(undefined, PAGE_SIZE);
    setItems(feed);
    lastDocRef.current = lastVisible ?? undefined;
    Alert.alert('완료', '샘플 피드 5개를 생성했어요.');
  };

  // 임시: 기존 카드 디자인 골고루 재배정
  const handleReassign = async () => {
    const { count, error } = await reassignCardStyles();
    if (error) {
      Alert.alert('오류', '재배정 실패: ' + error);
      return;
    }
    // 목록 다시 로드
    setItems([]);
    lastDocRef.current = undefined;
    setHasMore(true);
    loadingRef.current = false;
    const { feed, lastVisible } = await getPublicFeed(undefined, PAGE_SIZE);
    setItems(feed);
    lastDocRef.current = lastVisible ?? undefined;
    Alert.alert('완료', `카드 ${count}개의 디자인을 재배정했어요.`);
  };

  // 끝에 도달하면 다음 페이지 (무한 스크롤)
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceToBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceToBottom < 400) {
      loadMore();
    }
  }, [loadMore]);

  // 작게: 2열 체커보드 패턴 (row + col 패리티)
  const smallBorderColor = (i: number) =>
    BORDER_COLORS[(Math.floor(i / 2) + (i % 2)) % 2];
  // 크게: 1열 번갈아
  const bigBorderColor = (i: number) => BORDER_COLORS[i % 2];

  // 카드 썸네일 배경 (문구가 채워진 카드를 cover 비율로 채움)
  const renderCardBg = (item: Anyway, w: number, h: number) => {
    const scale = Math.max(w / 286, h / 476);
    const bgW = 286 * scale;
    const bgH = 476 * scale;
    const left = (w - bgW) / 2;
    const top = (h - bgH) / 2;
    const tpl = getCardTemplate(item.cardStyle);
    return (
      <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
        <View style={{ position: 'absolute', left, top, width: bgW, height: bgH }}>
          <Image source={tpl.image} style={{ width: bgW, height: bgH }} resizeMode="stretch" />
          {tpl.renderOverlay({
            yymmdd: cardDate(item),
            goal: item.goal,
            done: item.done,
            anyway: item.anywayText,
          }, scale)}
        </View>
      </View>
    );
  };

  // 카드 썸네일 (이전 레이아웃: name/time 상단 + ANYWAY 문구 하단)
  const renderCard = (item: Anyway, key: string | number, w: number, h: number, borderColor: string, big = false) => (
    <TouchableOpacity
      key={key}
      activeOpacity={0.85}
      onPress={() => setSelected(item)}
      style={[s.card, { width: w, height: h, borderColor }]}
    >
      {renderCardBg(item, w, h)}
      <View style={s.metaRow}>
        <Text style={s.metaName}>name</Text>
        <Text style={s.metaTime}>{formatTime(item)}</Text>
      </View>
      <View style={s.textRow}>
        <Text style={s.anywayLabel}>ANYWAY,</Text>
        <Text style={[s.anywayText, big && { fontSize: FontSize.size300 }]} numberOfLines={2}>{item.anywayText}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      <SafeAreaView style={s.safe}>
        <ScrollView
          contentContainerStyle={s.container}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* 헤더 */}
          <View style={s.header}>
            {/* 임시: 개발용 버튼 (확인 후 제거 예정) */}
            <View style={{ flexDirection: 'row', gap: Space.s100 }}>
              <TouchableOpacity style={s.seedBtn} onPress={handleSeed}>
                <Text style={s.seedBtnText}>샘플 생성</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.seedBtn} onPress={handleReassign}>
                <Text style={s.seedBtnText}>디자인 재배정</Text>
              </TouchableOpacity>
            </View>
            <NotificationsIcon width={24} height={24} color={Colors.gray900} />
          </View>

          {/* 작게 / 크게 토글 */}
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'small' ? s.toggleBtnActive : s.toggleBtnInactive]}
              onPress={() => setSize('small')}
            >
              <Text style={[s.toggleText, size === 'small' ? s.toggleTextActive : s.toggleTextInactive]}>작게</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'big' ? s.toggleBtnActive : s.toggleBtnInactive]}
              onPress={() => setSize('big')}
            >
              <Text style={[s.toggleText, size === 'big' ? s.toggleTextActive : s.toggleTextInactive]}>크게</Text>
            </TouchableOpacity>
          </View>

          {/* 작게: 2열 그리드 */}
          {size === 'small' && (
            <View style={s.grid}>
              {items.map((item, i) => renderCard(item, item.id ?? i, smallCardW, 178, smallBorderColor(i)))}
            </View>
          )}

          {/* 크게: 1열 그리드 */}
          {size === 'big' && (
            <View style={s.bigList}>
              {items.map((item, i) => renderCard(item, item.id ?? i, contentW, contentW * (476 / 286), bigBorderColor(i), true))}
            </View>
          )}

          {/* 로딩 / 빈 상태 */}
          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color={Colors.blue500} />
            </View>
          )}
          {!loading && items.length === 0 && (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>아직 공개된 ANYWAY가 없어요.</Text>
            </View>
          )}
        </ScrollView>

        {/* 카드 팝업 모달 */}
        <Modal
          visible={selected !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelected(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelected(null)}>
            <View style={s.modalOverlay}>
              <TouchableOpacity style={s.modalClose} onPress={() => setSelected(null)}>
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={{ width: popCardW, height: popCardH }}>
                  {selected && (
                    <>
                      <Image source={getCardTemplate(selected.cardStyle).image} style={{ width: popCardW, height: popCardH }} resizeMode="stretch" />
                      {getCardTemplate(selected.cardStyle).renderOverlay({
                        yymmdd: cardDate(selected),
                        goal: selected.goal,
                        done: selected.done,
                        anyway: selected.anywayText,
                      }, sc)}
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },
  container: { paddingHorizontal: Space.s200, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Space.s100,
  },
  // 토글
  toggleRow: { flexDirection: 'row', gap: Space.s100, justifyContent: 'center', paddingVertical: Space.s200 },
  toggleBtn: {
    borderRadius: Radius.r999, paddingHorizontal: Space.s200, paddingVertical: Space.s100,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: Colors.pink400 },
  toggleBtnInactive: { backgroundColor: Colors.pink050, borderWidth: 1, borderColor: Colors.opacityBlack100 },
  toggleText: { fontSize: FontSize.size200, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  toggleTextActive: { color: Colors.white },
  toggleTextInactive: { color: Colors.gray500 },
  // 카드 공통
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s150 },
  bigList: { gap: Space.s150 },
  card: {
    borderWidth: 1, borderRadius: Radius.r300, overflow: 'hidden',
    paddingTop: Space.s200, paddingBottom: Space.s150, paddingHorizontal: Space.s150,
    justifyContent: 'space-between',
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    backgroundColor: Colors.gray050,
  },
  cardImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingLeft: Space.s050,
  },
  metaName: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  metaTime: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  textRow: { gap: Space.s100 },
  anywayLabel: { fontSize: FontSize.size050, fontWeight: '300', color: Colors.gray700, lineHeight: LineHeight.lh050, letterSpacing: -0.2 },
  anywayText: { fontSize: FontSize.size200, color: Colors.gray900, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  loadingWrap: { paddingVertical: Space.s300, alignItems: 'center' },
  emptyWrap: { paddingVertical: Space.s900, alignItems: 'center' },
  emptyText: { fontSize: FontSize.size300, color: Colors.gray400, letterSpacing: -0.6 },
  seedBtn: { backgroundColor: Colors.blue100, borderRadius: Radius.r100, paddingHorizontal: Space.s150, paddingVertical: Space.s075 },
  seedBtnText: { fontSize: FontSize.size100, color: Colors.blue700, letterSpacing: -0.2 },
  // 카드 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(96,98,109,0.75)', alignItems: 'center', justifyContent: 'center' },
  modalClose: { position: 'absolute', top: 60, right: Space.s200, padding: Space.s100, zIndex: 10 },
  modalCloseText: { fontSize: 22, color: Colors.white, fontWeight: '600' },
  cardDateText: { fontFamily: 'AVALADO-Sick', color: Colors.black, includeFontPadding: false },
  cardValueText: { fontFamily: 'Pretendard-Regular', color: Colors.gray900 },
});

