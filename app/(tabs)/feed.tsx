import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Image, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
  Modal, TouchableWithoutFeedback, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentSnapshot } from 'firebase/firestore';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import { getPublicFeed } from '../../lib/feed';
import { getUserProfile } from '../../lib/user';
import { Anyway, setReaction, removeReaction } from '../../lib/anyway';
import { getCardTemplate } from '../../lib/cardTemplates';
import { seedSampleFeed, reassignCardStyles } from '../../lib/seed';
import { Alert } from 'react-native';
import { auth } from '../../firebaseConfig';
import { EXPRESSIONS, getExpression, resolveCardExpressions, MOOD_BTN_DEFAULT } from '../../lib/expressions';
import { REPORT_REASONS, reportAnyway, blockUser, getBlockedUsers } from '../../lib/moderation';
import { confirm, notify } from '../../lib/dialog';
import { isDevUser } from '../../lib/dev';

const ANYWAY_STAR = require('../../assets/images/feed_anyway_star.png');

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
  const [size, setSize] = useState<'small' | 'big'>('big');
  const [items, setItems] = useState<Anyway[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const lastDocRef = useRef<DocumentSnapshot | undefined>(undefined);
  const loadingRef = useRef(false);

  // 로드된 피드의 작성자 닉네임 조회 (캐시에 없는 userId만)
  useEffect(() => {
    const missing = [...new Set(items.map(i => i.userId))]
      .filter((uid) => uid && !(uid in nicknames));
    if (missing.length === 0) return;
    let active = true;
    Promise.all(
      missing.map(async (uid) => {
        const { profile } = await getUserProfile(uid);
        return [uid, profile?.nickname?.trim() || 'name'] as const;
      })
    ).then((entries) => {
      if (!active) return;
      setNicknames((prev) => {
        const next = { ...prev };
        entries.forEach(([uid, name]) => { next[uid] = name; });
        return next;
      });
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const { height: screenHeight } = useWindowDimensions();
  const contentW = screenWidth - Space.s200 * 2;
  const smallCardW = (contentW - Space.s150) / 2;

  // 카드 팝업 모달
  const [selected, setSelected] = useState<Anyway | null>(null);

  // 표정(리액션) 선택 메뉴
  const uid = auth.currentUser?.uid;
  const dev = isDevUser();
  const [moodMenu, setMoodMenu] = useState<{ item: Anyway; x: number; y: number } | null>(null);

  // 신고/차단
  const [blocked, setBlocked] = useState<string[]>([]);
  const [actionFor, setActionFor] = useState<Anyway | null>(null);   // ⋯ 메뉴 대상
  const [reportFor, setReportFor] = useState<Anyway | null>(null);   // 신고 사유 선택 대상

  useEffect(() => {
    if (!uid) return;
    getBlockedUsers(uid).then(({ blocked }) => setBlocked(blocked));
  }, [uid]);

  const handleReport = (reason: string) => {
    const item = reportFor;
    setReportFor(null);
    if (uid && item?.id) reportAnyway(uid, item.id, item.userId, reason);
    notify('신고 완료', '신고가 접수되었어요.\n검토 후 부적절한 콘텐츠는 24시간 내 조치됩니다.');
  };

  const handleBlock = () => {
    const item = actionFor;
    setActionFor(null);
    if (!item) return;
    confirm('사용자 차단', '이 사용자의 글을 더 이상 보지 않게 됩니다.\n차단할까요?', async () => {
      if (uid) await blockUser(uid, item.userId);
      setBlocked((prev) => [...new Set([...prev, item.userId])]);
    }, '차단');
  };

  const openMoodMenu = (item: Anyway, x: number, y: number) => setMoodMenu({ item, x, y });

  // 표정 선택 → 카운트 반영(낙관적) + Firestore 저장
  // 이미 남긴 표정을 다시 선택하면 취소(삭제)
  const pickReaction = (item: Anyway, key: string) => {
    const prev = uid ? item.reactedBy?.[uid] : null;
    setMoodMenu(null);
    const removing = prev === key;
    setItems((list) => list.map((it) => {
      if (it.id !== item.id) return it;
      const reactions = { ...(it.reactions || {}) };
      const reactedBy = { ...(it.reactedBy || {}) };
      if (removing) {
        reactions[key] = Math.max(0, (reactions[key] || 0) - 1);
        if (uid) delete reactedBy[uid];
      } else {
        reactions[key] = (reactions[key] || 0) + 1;
        if (prev) reactions[prev] = Math.max(0, (reactions[prev] || 0) - 1);
        if (uid) reactedBy[uid] = key;
      }
      return { ...it, reactions, reactedBy };
    }));
    if (uid && item.id) {
      if (removing) removeReaction(item.id, uid, key);
      else setReaction(item.id, uid, key, prev);
    }
  };
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

  // 당겨서 새로고침: 목록 초기화 후 첫 페이지부터 다시 로드
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    lastDocRef.current = undefined;
    loadingRef.current = false;
    const { feed, lastVisible } = await getPublicFeed(undefined, PAGE_SIZE);
    setItems(feed);
    lastDocRef.current = lastVisible ?? undefined;
    setHasMore(feed.length >= PAGE_SIZE);
    setRefreshing(false);
  }, []);

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

  // 카드 썸네일
  const renderCard = (item: Anyway, key: string | number, w: number, h: number, borderColor: string, big = false) => {
    // 크게: 박스(테두리/배경/그림자) 없이 이름·날짜 → 카드 → ANYWAY → 문구 순으로 표시
    if (big) {
      const exprKeys = resolveCardExpressions(item);
      const myKey = uid ? item.reactedBy?.[uid] : null;
      const moodSrc = myKey ? (getExpression(myKey)?.moodIcon ?? MOOD_BTN_DEFAULT) : MOOD_BTN_DEFAULT;
      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.85}
          onPress={() => setSelected(item)}
          style={s.bigItem}
        >
          <View style={s.bigMetaRow}>
            <Text style={s.bigName}>{nicknames[item.userId] ?? 'name'}</Text>
            <View style={s.bigMetaRight}>
              <Text style={s.bigTime}>{formatTime(item)}</Text>
              {uid && item.userId !== uid && (
                <TouchableOpacity onPress={() => setActionFor(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={s.moreBtn}>⋯</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{ width: w, height: h, borderRadius: Radius.r300, overflow: 'hidden', alignSelf: 'center' }}>
            {renderCardBg(item, w, h)}
          </View>
          <View style={s.anywayBlock}>
            {/* 제목과 함께 스크롤되는 뾰족 별 배경 */}
            <Image source={ANYWAY_STAR} style={s.anywayStar} />
            <Text style={s.bigAnywayLabel}>ANYWAY,</Text>
            <View style={s.titleRow}>
              <Text style={s.bigAnywayText} numberOfLines={2}>{item.anywayText}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => {
                  // 이미 표정을 남겼으면 즉시 삭제, 아니면 선택 팝업
                  if (myKey) pickReaction(item, myKey);
                  else openMoodMenu(item, e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              >
                <Image source={moodSrc} style={s.moodBtn} />
              </TouchableOpacity>
            </View>
            {/* 표정 카운트 모음 */}
            <View style={s.reactionRow}>
              {exprKeys.map((k) => {
                const exp = getExpression(k);
                if (!exp) return null;
                return (
                  <View key={k} style={s.reactionItem}>
                    <Image source={exp.icon} style={s.reactionIcon} />
                    <Text style={s.reactionCount}>{item.reactions?.[k] ?? 0}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    // 작게: 기존 오버레이 카드
    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.85}
        onPress={() => setSelected(item)}
        style={[s.card, { width: w, height: h, borderColor }]}
      >
        {renderCardBg(item, w, h)}
        <View style={s.metaRow}>
          <Text style={s.metaName}>{nicknames[item.userId] ?? 'name'}</Text>
          <Text style={s.metaTime}>{formatTime(item)}</Text>
        </View>
        <View style={s.textRow}>
          <Text style={s.anywayLabel}>ANYWAY,</Text>
          <Text style={s.anywayText} numberOfLines={2}>{item.anywayText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 차단한 사용자의 글은 피드에서 숨김
  const visibleItems = items.filter((it) => !blocked.includes(it.userId));

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue500} colors={[Colors.blue500]} />
          }
        >
          {/* 헤더 — 개발용 버튼은 개발자 계정에서만 표시 */}
          {dev && (
            <View style={s.header}>
              <View style={{ flexDirection: 'row', gap: Space.s100 }}>
                <TouchableOpacity style={s.seedBtn} onPress={handleSeed}>
                  <Text style={s.seedBtnText}>샘플 생성</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.seedBtn} onPress={handleReassign}>
                  <Text style={s.seedBtnText}>디자인 재배정</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 작게 / 크게 토글 */}
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'big' ? s.toggleBtnActive : s.toggleBtnInactive]}
              onPress={() => setSize('big')}
            >
              <Text style={[s.toggleText, size === 'big' ? s.toggleTextActive : s.toggleTextInactive]}>크게</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, size === 'small' ? s.toggleBtnActive : s.toggleBtnInactive]}
              onPress={() => setSize('small')}
            >
              <Text style={[s.toggleText, size === 'small' ? s.toggleTextActive : s.toggleTextInactive]}>작게</Text>
            </TouchableOpacity>
          </View>

          {/* 작게: 2열 그리드 (차단 사용자 제외) */}
          {size === 'small' && (
            <View style={s.grid}>
              {visibleItems.map((item, i) => renderCard(item, item.id ?? i, smallCardW, 178, smallBorderColor(i)))}
            </View>
          )}

          {/* 크게: 1열 그리드 (차단 사용자 제외) */}
          {size === 'big' && (
            <View style={s.bigList}>
              {visibleItems.map((item, i) => {
                const bigImgW = Math.round(contentW * 0.62);
                return renderCard(item, item.id ?? i, bigImgW, Math.round(bigImgW * (476 / 286)), bigBorderColor(i), true);
              })}
            </View>
          )}

          {/* 로딩 / 빈 상태 */}
          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color={Colors.blue500} />
            </View>
          )}
          {!loading && visibleItems.length === 0 && (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>아직 공개된 ANYWAY가 없어요.</Text>
            </View>
          )}
        </ScrollView>

        {/* 표정 선택 팝업 (mood 버튼 위로 떠오름) */}
        <Modal
          visible={moodMenu !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setMoodMenu(null)}
        >
          <TouchableWithoutFeedback onPress={() => setMoodMenu(null)}>
            <View style={{ flex: 1 }}>
              {moodMenu && (() => {
                const keys = resolveCardExpressions(moodMenu.item);
                const rowH = 20, gap = 12, padV = 16, padH = 16, menuW = 140;
                const menuH = padV * 2 + keys.length * rowH + (keys.length - 1) * gap;
                let left = moodMenu.x - menuW + 20;
                left = Math.max(8, Math.min(left, screenWidth - menuW - 8));
                const top = Math.max(60, moodMenu.y - menuH - 8);
                return (
                  <View style={[s.moodMenu, { left, top, width: menuW, paddingVertical: padV, paddingHorizontal: padH, gap }]}>
                    {keys.map((k) => {
                      const exp = getExpression(k);
                      if (!exp) return null;
                      return (
                        <TouchableOpacity key={k} style={s.moodMenuRow} activeOpacity={0.7} onPress={() => pickReaction(moodMenu.item, k)}>
                          <Image source={exp.icon} style={s.moodMenuIcon} />
                          <Text style={s.moodMenuLabel}>{exp.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          </TouchableWithoutFeedback>
        </Modal>

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

        {/* 신고/차단 액션 시트 */}
        <Modal visible={actionFor !== null} transparent animationType="fade" onRequestClose={() => setActionFor(null)}>
          <TouchableWithoutFeedback onPress={() => setActionFor(null)}>
            <View style={s.sheetOverlay}>
              <View style={s.sheet}>
                <TouchableOpacity style={s.sheetRow} onPress={() => { setReportFor(actionFor); setActionFor(null); }}>
                  <Text style={s.sheetText}>신고하기</Text>
                </TouchableOpacity>
                <View style={s.sheetDivider} />
                <TouchableOpacity style={s.sheetRow} onPress={handleBlock}>
                  <Text style={[s.sheetText, { color: Colors.red500 }]}>이 사용자 차단하기</Text>
                </TouchableOpacity>
                <View style={s.sheetDivider} />
                <TouchableOpacity style={s.sheetRow} onPress={() => setActionFor(null)}>
                  <Text style={s.sheetCancel}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* 신고 사유 선택 */}
        <Modal visible={reportFor !== null} transparent animationType="fade" onRequestClose={() => setReportFor(null)}>
          <TouchableWithoutFeedback onPress={() => setReportFor(null)}>
            <View style={s.sheetOverlay}>
              <View style={s.sheet}>
                <Text style={s.sheetTitle}>신고 사유를 선택해주세요</Text>
                {REPORT_REASONS.map((reason, i) => (
                  <View key={reason}>
                    {i > 0 && <View style={s.sheetDivider} />}
                    <TouchableOpacity style={s.sheetRow} onPress={() => handleReport(reason)}>
                      <Text style={s.sheetText}>{reason}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={s.sheetDivider} />
                <TouchableOpacity style={s.sheetRow} onPress={() => setReportFor(null)}>
                  <Text style={s.sheetCancel}>취소</Text>
                </TouchableOpacity>
              </View>
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
  toggleBtnActive: { backgroundColor: Colors.blue400, borderWidth: 1, borderColor: Colors.blue400 },
  toggleBtnInactive: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.blue400 },
  toggleText: { fontSize: FontSize.size200, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  toggleTextActive: { color: Colors.white },
  toggleTextInactive: { color: Colors.gray900 },
  // 카드 공통
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.s150 },
  bigList: { gap: Space.s300 },
  // 크게: 박스 없는 스택 레이아웃 + 항목 사이 연회색 구분선
  bigItem: { gap: Space.s150, paddingBottom: Space.s300, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  bigMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Space.s050 },
  bigMetaRight: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  moreBtn: { fontSize: 20, color: Colors.gray500, fontWeight: '700', lineHeight: 20 },
  bigTextRow: { gap: Space.s075, paddingHorizontal: Space.s050 },
  // 새 ANYWAY 블록 (별 배경 + 제목 + mood + 리액션)
  anywayBlock: { paddingHorizontal: Space.s050, gap: Space.s100, position: 'relative' },
  anywayStar: { position: 'absolute', left: -28, top: -46, width: 100, height: 100 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Space.s100 },
  moodBtn: { width: 40, height: 40 },
  reactionRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s150, marginTop: Space.s050 },
  reactionItem: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  reactionIcon: { width: 19, height: 19 },
  reactionCount: { fontSize: FontSize.size200, color: Colors.gray700, lineHeight: LineHeight.lh200, letterSpacing: -0.2 },
  // 표정 선택 팝업
  moodMenu: {
    position: 'absolute', backgroundColor: Colors.white, borderRadius: Radius.r200,
    shadowColor: Colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  moodMenuRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s150, height: 20 },
  moodMenuIcon: { width: 19, height: 19 },
  moodMenuLabel: { fontSize: FontSize.size200, color: Colors.gray700, lineHeight: LineHeight.lh200, letterSpacing: -0.2 },
  // 신고/차단 액션 시트 (하단)
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r300, borderTopRightRadius: Radius.r300, paddingVertical: Space.s100, paddingBottom: Space.s500 },
  sheetTitle: { fontSize: FontSize.size200, color: Colors.gray500, textAlign: 'center', paddingVertical: Space.s200, letterSpacing: -0.4 },
  sheetRow: { paddingVertical: Space.s200, alignItems: 'center' },
  sheetText: { fontSize: FontSize.size400, color: Colors.gray900, letterSpacing: -0.4 },
  sheetCancel: { fontSize: FontSize.size400, color: Colors.gray500, letterSpacing: -0.4 },
  sheetDivider: { height: 0.5, backgroundColor: Colors.gray100 },
  bigName: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh400, letterSpacing: -0.4 },
  bigTime: { fontSize: FontSize.size300, color: Colors.gray500, lineHeight: LineHeight.lh300, letterSpacing: -0.4 },
  bigAnywayLabel: { fontSize: FontSize.size200, fontWeight: '300', color: Colors.gray700, lineHeight: LineHeight.lh200, letterSpacing: -0.2 },
  bigAnywayText: { fontSize: FontSize.size500, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh500, letterSpacing: -0.4 },
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

