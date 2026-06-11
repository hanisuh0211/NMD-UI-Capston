import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, ActivityIndicator,
  Modal, Image, useWindowDimensions, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';
import { generateAnywayText } from '../../lib/gemini';
import { createAnyway, updateAnyway, getTodayAnyway, getMyAnyways, Anyway } from '../../lib/anyway';
import { getPublicFeed } from '../../lib/feed';
import { getUserProfile } from '../../lib/user';
import { getCardTemplate, pickCardStyle } from '../../lib/cardTemplates';
import { auth } from '../../firebaseConfig';
import { onAuthChanged } from '../../lib/auth';
import CharacterAvatar from '../../components/CharacterAvatar';
import DecoStarSvg from '../../assets/images/deco_star.svg';
const DECO_TOP = require('../../assets/images/deco_main_top.png');
const STAR_INPUT = require('../../assets/images/deco_input_star.png');
const STAR_BUTTON = require('../../assets/images/deco_button_star.png');

// 카드 배경 그라데이션 (Figma card-calling: 위 흰색 → 아래 연분홍 pink050)
const CARD_GRADIENT = [Colors.white, Colors.white, Colors.pink050] as const;
const CARD_GRADIENT_LOCS = [0, 0.5, 1] as const;

// 카드 상단 장식 별 3개 (Figma main-before Star 10/11/12)
function CardStars() {
  return (
    <>
      <DecoStarSvg width={16} height={30} style={[ds.star, { left: 24, top: -6 }]} />
      <DecoStarSvg width={24} height={42} style={[ds.star, { right: 8, top: -18 }]} />
      <DecoStarSvg width={16} height={30} style={[ds.star, { right: 32, top: 14 }]} />
    </>
  );
}

const ds = StyleSheet.create({
  decoTop: { position: 'absolute', zIndex: 0 },
  cardDecoWrap: { marginTop: Space.s300 },
  star: { position: 'absolute', zIndex: 5 },
});

type RecentFeed = {
  id: string;
  goal: string;
  done: string;
  anywayText: string;
  time: string;
  cardDate: string;
  cardStyle: number;
  char: string;  // 작성자 캐릭터 id (char1/char2)
};

import NotificationsIcon from '../../assets/icons/notifications.svg';
import Flag2Icon from '../../assets/icons/flag_2.svg';
import RewardedAdsIcon from '../../assets/icons/rewarded_ads.svg';
import Flag2BlueIcon from '../../assets/icons/flag_2_blue.svg';
import RewardedAdsBlueIcon from '../../assets/icons/rewarded_ads_blue.svg';
import ArrowForwardIosIcon from '../../assets/icons/arrow_forward_ios.svg';
import ArrowBackIcon from '../../assets/icons/arrow_back.svg';
import CallIcon from '../../assets/icons/call.svg';
import SwapHorizIcon from '../../assets/icons/swap_horiz.svg';
import BorderColorIcon from '../../assets/icons/border_color.svg';

type Step = 'home' | 'goal' | 'done' | 'result' | 'saved';

const TODAY = new Date();
const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];
const DATE_STR = `${TODAY.getMonth() + 1}월 ${TODAY.getDate()}일 ${DAY_KR[TODAY.getDay()]}요일`;
const DATE_FULL = `${TODAY.getFullYear()}년 ${TODAY.getMonth() + 1}월 ${TODAY.getDate()}일 ${DAY_KR[TODAY.getDay()]}요일`;
// YYMMDD 형식 (카드용)
const yy = String(TODAY.getFullYear()).slice(2);
const mm = String(TODAY.getMonth() + 1).padStart(2, '0');
const dd = String(TODAY.getDate()).padStart(2, '0');
const DATE_CARD = `${yy}${mm}${dd}`;

// 카드용 YYMMDD (createdAt 또는 date 기준)
function itemCardDate(item: Anyway): string {
  let d: Date | null = null;
  if (item.createdAt?.toDate) d = item.createdAt.toDate();
  else if (item.date) d = new Date(item.date);
  if (!d || isNaN(d.getTime())) d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// 상대 시간 표시 (createdAt 또는 date 기준)
function formatRelTime(item: Anyway): string {
  let d: Date | null = null;
  if (item.createdAt?.toDate) d = item.createdAt.toDate();
  else if (item.date) d = new Date(item.date);
  if (!d || isNaN(d.getTime())) return '';
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return '지금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}일 전`;
}

export default function MainScreen() {
  const { width: screenWidth } = useWindowDimensions();
  // 상단 deco: Figma 원본 크기(853×676) 유지, 가로 화면 중앙, 세로 top -102 (node 379:1752)
  const decoW = 853;
  const decoH = 676;
  const decoLeft = (screenWidth - decoW) / 2;
  const decoTop = -140;
  const [step, setStep] = useState<Step>('home');
  const [goal, setGoal] = useState('');
  const [done, setDone] = useState('');
  const [goalTemp, setGoalTemp] = useState('');
  const [doneTemp, setDoneTemp] = useState('');
  const [anywayText, setAnywayText] = useState('');
  const [anywayLoading, setAnywayLoading] = useState(false);
  const [visibility, setVisibility] = useState('전체 공개');
  const [emotion, setEmotion] = useState('같이 힘내요');
  const [showCardModal, setShowCardModal] = useState(false);

  // 카드 이미지 비율 (Figma 원본: 286×476)
  // 닫기버튼(60) + 탭바(80) + 상하여백(80) = 220px 확보
  const { height: screenHeight } = useWindowDimensions();
  const maxByWidth = screenWidth * 0.72;
  const maxByHeight = (screenHeight - 220) * (286 / 476);
  const cardW = Math.min(maxByWidth, maxByHeight);
  const cardH = cardW * (476 / 286);
  const sc = cardW / 286; // 피그마 px → 화면 px 스케일

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState(0);
  const [recentFeed, setRecentFeed] = useState<RecentFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<RecentFeed | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [userChar, setUserChar] = useState('char1');
  const [daysSince, setDaysSince] = useState(0);
  const [nickname, setNickname] = useState('');

  // 현재 사용자 캐릭터 + 닉네임 + 가입 후 경과일 불러오기
  const loadProfile = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const { profile } = await getUserProfile(uid);
    if (profile?.character) setUserChar(profile.character);
    if (profile?.nickname) setNickname(profile.nickname);

    // 오늘 기준 "연속 기록 일수" 계산 (하루라도 끊기면 다시 1부터)
    const { anyways } = await getMyAnyways(uid);
    const dayIdxSet = new Set<number>();
    anyways.forEach((a) => {
      const d = a.createdAt?.toDate ? a.createdAt.toDate() : (a.date ? new Date(a.date) : null);
      if (d && !isNaN(d.getTime())) {
        dayIdxSet.add(Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000));
      }
    });
    const now = new Date();
    let idx = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    // 오늘 기록이 아직 없으면 어제 기준으로 (진행 중인 연속 유지)
    if (!dayIdxSet.has(idx)) idx -= 1;
    let streak = 0;
    while (dayIdxSet.has(idx)) { streak++; idx -= 1; }
    setDaysSince(streak);
  }, []);

  // 인증 복원 타이밍 대응: 로그인 상태가 확정되면 프로필 로드
  useEffect(() => {
    const unsub = onAuthChanged((user) => { if (user) loadProfile(); });
    return unsub;
  }, [loadProfile]);

  // 진입 시: 오늘 이미 만든 카드가 있으면 그 카드를 불러와 saved 화면 표시
  useEffect(() => {
    let active = true;
    (async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) { setInitLoading(false); return; }
      const todayCard = await getTodayAnyway(uid);
      if (active && todayCard) {
        setGoal(todayCard.goal);
        setDone(todayCard.done);
        setAnywayText(todayCard.anywayText);
        setVisibility(todayCard.visibility);
        setEmotion(todayCard.emotion);
        setCardStyle(todayCard.cardStyle ?? 0);
        setSavedId(todayCard.id ?? null);
        setStep('saved');
      }
      if (active) setInitLoading(false);
    })();
    return () => { active = false; };
  }, []);

  // 최근 피드 불러오기 (전체 공개 ANYWAY + 작성자 캐릭터)
  const loadFeed = useCallback(async () => {
    const { feed } = await getPublicFeed(undefined, 5);
    if (!feed.length) { setRecentFeed([]); return; }

    // 작성자별 캐릭터 조회 (중복 userId는 한 번만, 매 호출마다 최신값)
    const charCache: Record<string, string> = {};
    const uniqueIds = [...new Set(feed.map(f => f.userId))];
    await Promise.all(
      uniqueIds.map(async (uid) => {
        const { profile } = await getUserProfile(uid);
        charCache[uid] = profile?.character ?? 'char1';
      })
    );

    setRecentFeed(
      feed.map((f: Anyway) => ({
        id: f.id ?? '',
        goal: f.goal,
        done: f.done,
        anywayText: f.anywayText,
        time: formatRelTime(f),
        cardDate: itemCardDate(f),
        cardStyle: f.cardStyle ?? 0,
        char: charCache[f.userId] ?? 'char1',
      }))
    );
  }, []);

  useEffect(() => { loadFeed(); }, [step, loadFeed]);

  // 화면에 돌아올 때마다 프로필+피드 재로드 (마이페이지에서 캐릭터 변경 시 즉시 반영)
  useFocusEffect(
    useCallback(() => { loadProfile(); loadFeed(); }, [loadProfile, loadFeed])
  );

  // 제작하기 버튼 → AI 문구 생성 후 result로 이동
  const handleMake = async () => {
    setAnywayLoading(true);
    // 신규 제작이면 이 시점에 카드 디자인을 확정 → 미리보기('전환')와 최종 저장 카드가 동일
    if (!savedId) setCardStyle(pickCardStyle());
    setStep('result');
    const text = await generateAnywayText(goal, done);
    setAnywayText(text);
    setAnywayLoading(false);
  };

  // 저장하기 → Firestore에 ANYWAY 저장(또는 수정) 후 saved 화면으로
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    // 하루 1회 제한: 신규 저장인데 오늘 이미 만든 카드가 있으면 차단
    if (!savedId) {
      const todayCard = await getTodayAnyway(user.uid);
      if (todayCard) {
        Alert.alert('알림', '오늘은 이미 ANYWAY 카드를 만들었어요.\n내일 다시 만들 수 있어요!');
        return;
      }
    }

    setSaving(true);

    if (savedId) {
      // 이미 저장된 카드 → 설정만 업데이트 (중복 생성 방지)
      const { error } = await updateAnyway(savedId, {
        visibility: visibility as '전체 공개' | '친구 공개' | '나만 보기',
        emotion,
      });
      setSaving(false);
      if (error) {
        Alert.alert('오류', '수정에 실패했습니다. 다시 시도해주세요.');
        return;
      }
    } else {
      // 신규 저장 - 제작하기 시점에 확정한 카드 디자인(cardStyle)을 그대로 사용
      const { id, error } = await createAnyway({
        userId: user.uid,
        goal,
        done,
        anywayText,
        date: TODAY.toISOString(),
        visibility: visibility as '전체 공개' | '친구 공개' | '나만 보기',
        emotion,
        cardStyle,
      });
      setSaving(false);
      if (error || !id) {
        Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      setSavedId(id);
    }
    setStep('saved');
    loadProfile(); // 연속 기록 일수 즉시 갱신
  };

  // 진입 시 오늘 카드 확인 중 → 로딩 표시 (홈 화면 깜빡임 방지)
  if (initLoading) {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.blue500} />
        </SafeAreaView>
      </View>
    );
  }

  // ── 홈 ──
  if (step === 'home') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <Image source={DECO_TOP} style={[ds.decoTop, { left: decoLeft, top: decoTop, width: decoW, height: decoH }]} resizeMode="stretch" pointerEvents="none" />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.container}>
            <View style={s.header}>
              <View style={{ width: 24, height: 24 }} />
              <TouchableOpacity>
                <NotificationsIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>

            <View style={s.titleSection}>
              <Text style={s.dateText}>{DATE_STR}</Text>
              <Text style={s.daysText}>{daysSince}days</Text>
            </View>

            <View style={ds.cardDecoWrap}>
            <LinearGradient
              colors={CARD_GRADIENT}
              locations={CARD_GRADIENT_LOCS}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={s.callingCardHome}
            >
              <View style={s.avatarWrap}>
                <CharacterAvatar character={userChar} size={100} />
              </View>
              <View style={s.cardTitleWrap}>
                <Text style={s.cardTitle}>오늘 하루 어땠어?</Text>
                <View style={s.cardSubRow}>
                  <Text style={s.cardSub}>{nickname || 'name'}! 시간될 때 알려줘!</Text>
                </View>
              </View>

              <View style={s.writingContainer}>
                <View style={s.writingRow}>
                  <View style={s.writingLeft}>
                    <Flag2Icon width={20} height={20} />
                    <Text style={[s.writingLabel, goal ? s.writingLabelFilled : {}]} numberOfLines={1}>
                      {goal || '목표 입력하기'}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.writeBtn} onPress={() => { setGoalTemp(goal); setStep('goal'); }}>
                    <Text style={s.writeBtnText}>{goal ? '수정' : '작성'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.writingRow}>
                  <View style={s.writingLeft}>
                    <RewardedAdsIcon width={20} height={20} />
                    <Text style={[s.writingLabel, done ? s.writingLabelFilled : {}]} numberOfLines={1}>
                      {done || '달성 항목 입력하기'}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.writeBtn} onPress={() => { setDoneTemp(done); setStep('done'); }}>
                    <Text style={s.writeBtnText}>{done ? '수정' : '작성'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[s.makeBtn, done ? s.makeBtnActive : {}]}
                disabled={!done}
                onPress={handleMake}
              >
                <Text style={[s.makeBtnText, done ? s.makeBtnTextActive : {}]}>제작하기</Text>
              </TouchableOpacity>
            </LinearGradient>
            <CardStars />
            </View>

            <View style={s.feedSection}>
              <View style={s.feedHeader}>
                <Text style={s.feedTitle}>최근 피드</Text>
                <TouchableOpacity>
                  <ArrowForwardIosIcon width={24} height={24} color={Colors.gray900} />
                </TouchableOpacity>
              </View>
              {recentFeed.length === 0 ? (
                <Text style={s.feedEmptyText}>아직 공개된 ANYWAY가 없어요.</Text>
              ) : (
                recentFeed.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedFeed(item)}
                    style={s.feedItem}
                  >
                    <View style={s.feedAvatar}>
                      <CharacterAvatar character={item.char} size={48} />
                    </View>
                    <View style={s.feedTextWrap}>
                      <View style={s.feedCapRow}>
                        <Text style={s.feedCaption} numberOfLines={1}>{item.goal}</Text>
                        <Text style={s.feedTime}>{item.time}</Text>
                      </View>
                      <View style={s.feedAnyway}>
                        <Text style={s.feedAnywayText} numberOfLines={1}>anyway, {item.anywayText}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

          {/* 최근 피드 카드 팝업 */}
          <Modal
            visible={selectedFeed !== null}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedFeed(null)}
          >
            <TouchableWithoutFeedback onPress={() => setSelectedFeed(null)}>
              <View style={s.modalOverlay}>
                <TouchableOpacity style={s.modalClose} onPress={() => setSelectedFeed(null)}>
                  <Text style={s.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={{ width: cardW, height: cardH }}>
                    {selectedFeed && (
                      <>
                        <Image
                          source={getCardTemplate(selectedFeed.cardStyle).image}
                          style={{ width: cardW, height: cardH }}
                          resizeMode="stretch"
                        />
                        {getCardTemplate(selectedFeed.cardStyle).renderOverlay({
                          yymmdd: selectedFeed.cardDate,
                          goal: selectedFeed.goal,
                          done: selectedFeed.done,
                          anyway: selectedFeed.anywayText,
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

  // ── 목표 입력 ──
  if (step === 'goal') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        {/* 하단 연분홍 그라데이션 (화면 전체 배경, 바닥까지 채움) */}
        <LinearGradient colors={['rgba(255,255,255,0)', Colors.pink050]} style={s.inputBgGrad} pointerEvents="none" />
        <SafeAreaView style={s.safe}>
          <View style={s.subContainer}>
            <View style={s.subHeader}>
              <TouchableOpacity onPress={() => setStep('home')}>
                <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
            <View style={[s.callHeader, { marginTop: Space.s500 }]}>
              <CharacterAvatar character={userChar} size={96} />
              <View style={s.callHeaderText}>
                <View style={s.callMeta}>
                  <CallIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={s.callMetaText}>{DATE_FULL}</Text>
                </View>
                <Text style={s.callTitle}>목표가 뭐였어?</Text>
              </View>
            </View>
            <View style={s.interactionContainer}>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  placeholder="목표 입력하기"
                  placeholderTextColor={Colors.gray500}
                  value={goalTemp}
                  onChangeText={setGoalTemp}
                  keyboardType="default"
                  autoFocus
                />
                <Image source={STAR_INPUT} style={s.sparkleInput} resizeMode="contain" pointerEvents="none" />
              </View>
              <View style={s.btnWrap}>
                <TouchableOpacity style={s.primaryBtn} onPress={() => { setGoal(goalTemp); setStep('home'); }}>
                  <Text style={s.primaryBtnText}>저장하기</Text>
                </TouchableOpacity>
                <Image source={STAR_BUTTON} style={s.sparkleButton} resizeMode="contain" pointerEvents="none" />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── 달성 입력 ──
  if (step === 'done') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        {/* 하단 연분홍 그라데이션 (화면 전체 배경, 바닥까지 채움) */}
        <LinearGradient colors={['rgba(255,255,255,0)', Colors.pink050]} style={s.inputBgGrad} pointerEvents="none" />
        <SafeAreaView style={s.safe}>
          <View style={s.subContainer}>
            <View style={s.subHeader}>
              <TouchableOpacity onPress={() => setStep('home')}>
                <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
            <View style={[s.callHeader, { marginTop: Space.s500 }]}>
              <CharacterAvatar character={userChar} size={96} />
              <View style={s.callHeaderText}>
                <View style={s.callMeta}>
                  <CallIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={s.callMetaText}>{DATE_FULL}</Text>
                </View>
                <Text style={s.callTitle}>어떤 걸 해냈어?</Text>
              </View>
            </View>
            <View style={s.interactionContainer}>
              <View style={s.inputWrap}>
                <TextInput
                  style={s.input}
                  placeholder="달성 항목 입력하기"
                  placeholderTextColor={Colors.gray500}
                  value={doneTemp}
                  onChangeText={setDoneTemp}
                  keyboardType="default"
                  autoFocus
                />
                <Image source={STAR_INPUT} style={s.sparkleInput} resizeMode="contain" pointerEvents="none" />
              </View>
              <View style={s.btnWrap}>
                <TouchableOpacity style={s.primaryBtn} onPress={() => { setDone(doneTemp); setStep('home'); }}>
                  <Text style={s.primaryBtnText}>저장하기</Text>
                </TouchableOpacity>
                <Image source={STAR_BUTTON} style={s.sparkleButton} resizeMode="contain" pointerEvents="none" />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── ANYWAY 결과 + 설정 ──
  if (step === 'result') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={[s.container, { paddingBottom: 120 }]}>
            <View style={s.callingCardResult}>
              <View style={s.callHeader}>
                <CharacterAvatar character={userChar} size={96} />
                <View style={s.callHeaderText}>
                  <View style={s.callMeta}>
                    <CallIcon width={20} height={20} color={Colors.gray700} />
                    <Text style={s.callMetaText}>ANYWAY 문구를 확인해 봐!</Text>
                  </View>
                  <Text style={s.callTitleSm}>뭐라도 해냈다는 게 대단한 거지!</Text>
                </View>
              </View>

              {/* AI 생성 문구 or 로딩 */}
              <View style={s.anywayTextWrap}>
                {anywayLoading ? (
                  <View style={s.loadingWrap}>
                    <ActivityIndicator size="small" color={Colors.blue500} />
                    <Text style={s.loadingText}>문구 생성 중...</Text>
                  </View>
                ) : (
                  <Text style={s.anywayText}>{anywayText}</Text>
                )}
              </View>

              <View style={s.textRows}>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <Flag2BlueIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>GOAL</Text>
                  </View>
                  <Text style={s.textRowValue}>{goal}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <RewardedAdsBlueIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>DONE</Text>
                  </View>
                  <Text style={s.textRowValue}>{done}</Text>
                </View>
              </View>

              <View style={s.cardBtnRow}>
                <TouchableOpacity style={s.cardBtn} onPress={() => setShowCardModal(true)}>
                  <Text style={s.cardBtnText}>전환</Text>
                  <SwapHorizIcon width={16} height={16} color={Colors.blue700} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.settingSection}>
              <Text style={s.settingTitle}>공개 설정</Text>
              <View style={s.chipRow}>
                {['전체 공개', '친구 공개', '나만 보기'].map(v => (
                  <TouchableOpacity key={v} style={[s.chip, visibility === v ? s.chipActive : s.chipInactive]} onPress={() => setVisibility(v)}>
                    <Text style={[s.chipText, visibility === v ? s.chipTextActive : s.chipTextInactive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.settingSection}>
              <Text style={s.settingTitle}>표정 설정</Text>
              <View style={s.chipRow}>
                {['같이 힘내요', '멋있어요', '분발해요'].map(v => (
                  <TouchableOpacity key={v} style={[s.chip, emotion === v ? s.chipActive : s.chipInactive]} onPress={() => setEmotion(v)}>
                    <Text style={[s.chipText, emotion === v ? s.chipTextActive : s.chipTextInactive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={s.bottomBtnWrap}>
            <TouchableOpacity
              style={[s.primaryBtn, (anywayLoading || saving) ? { opacity: 0.5 } : {}]}
              disabled={anywayLoading || saving}
              onPress={handleSave}
            >
              <Text style={s.primaryBtnText}>{saving ? '저장 중...' : '저장하기'}</Text>
            </TouchableOpacity>
          </View>

          {/* 카드 모달 (result 스텝) */}
          <Modal
            visible={showCardModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCardModal(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowCardModal(false)}>
              <View style={s.modalOverlay}>
                <TouchableOpacity style={s.modalClose} onPress={() => setShowCardModal(false)}>
                  <Text style={s.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={{ width: cardW, height: cardH }}>
                    <Image
                      source={getCardTemplate(cardStyle).image}
                      style={{ width: cardW, height: cardH }}
                      resizeMode="stretch"
                    />
                    {getCardTemplate(cardStyle).renderOverlay({
                      yymmdd: DATE_CARD, goal, done, anyway: anywayText,
                    }, sc)}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </View>
    );
  }

  // ── 저장 완료 ──
  if (step === 'saved') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <Image source={DECO_TOP} style={[ds.decoTop, { left: decoLeft, top: decoTop, width: decoW, height: decoH }]} resizeMode="stretch" pointerEvents="none" />
        <SafeAreaView style={s.safe}>
          <ScrollView contentContainerStyle={s.container}>
            <View style={s.header}>
              <View style={{ width: 24, height: 24 }} />
              <TouchableOpacity>
                <NotificationsIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
            <View style={s.titleSection}>
              <Text style={s.dateText}>{DATE_STR}</Text>
              <Text style={s.daysText}>{daysSince}days</Text>
            </View>
            <View style={ds.cardDecoWrap}>
            <LinearGradient
              colors={CARD_GRADIENT}
              locations={CARD_GRADIENT_LOCS}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={s.callingCardHome}
            >
              <View style={s.callHeader}>
                <CharacterAvatar character={userChar} size={64} />
                <View style={s.callHeaderText}>
                  <View style={s.callMeta}>
                    <CallIcon width={20} height={20} color={Colors.gray700} />
                    <Text style={s.callMetaText}>ANYWAY 카드를 확인해 봐!</Text>
                  </View>
                  <Text style={s.callTitleSm}>오늘도 무언갈 해낸 성공적인 하루야.</Text>
                </View>
              </View>
              <View style={s.textRows}>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <Flag2BlueIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>GOAL</Text>
                  </View>
                  <Text style={s.textRowValue}>{goal}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <RewardedAdsBlueIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>DONE</Text>
                  </View>
                  <Text style={s.textRowValue}>{done}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <View style={{ width: 20, height: 20 }} />
                    <Text style={s.textRowLabel}>ANYWAY</Text>
                  </View>
                  <Text style={[s.textRowValue, { color: Colors.blue400 }]}>{anywayText}</Text>
                </View>
              </View>
              <View style={s.cardBtnRow}>
                <TouchableOpacity style={s.cardBtn} onPress={() => setStep('result')}>
                  <Text style={s.cardBtnText}>수정</Text>
                  <BorderColorIcon width={16} height={16} color={Colors.blue700} />
                </TouchableOpacity>
                <TouchableOpacity style={s.cardBtn} onPress={() => setShowCardModal(true)}>
                  <Text style={s.cardBtnText}>전환</Text>
                  <SwapHorizIcon width={16} height={16} color={Colors.blue700} />
                </TouchableOpacity>
              </View>

              {/* 카드 모달 */}
              <Modal
                visible={showCardModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCardModal(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowCardModal(false)}>
                  <View style={s.modalOverlay}>
                    {/* X 닫기 버튼 */}
                    <TouchableOpacity style={s.modalClose} onPress={() => setShowCardModal(false)}>
                      <Text style={s.modalCloseText}>✕</Text>
                    </TouchableOpacity>

                    {/* 카드 */}
                    <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={{ width: cardW, height: cardH }}>
                    <Image
                      source={getCardTemplate(cardStyle).image}
                      style={{ width: cardW, height: cardH }}
                      resizeMode="stretch"
                    />
                    {getCardTemplate(cardStyle).renderOverlay({
                      yymmdd: DATE_CARD, goal, done, anyway: anywayText,
                    }, sc)}
                    </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
            </LinearGradient>
            <CardStars />
            </View>

            <View style={s.feedSection}>
              <View style={s.feedHeader}>
                <Text style={s.feedTitle}>최근 피드</Text>
                <TouchableOpacity>
                  <ArrowForwardIosIcon width={24} height={24} color={Colors.gray900} />
                </TouchableOpacity>
              </View>
              {recentFeed.length === 0 ? (
                <Text style={s.feedEmptyText}>아직 공개된 ANYWAY가 없어요.</Text>
              ) : (
                recentFeed.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedFeed(item)}
                    style={s.feedItem}
                  >
                    <View style={s.feedAvatar}>
                      <CharacterAvatar character={item.char} size={48} />
                    </View>
                    <View style={s.feedTextWrap}>
                      <View style={s.feedCapRow}>
                        <Text style={s.feedCaption} numberOfLines={1}>{item.goal}</Text>
                        <Text style={s.feedTime}>{item.time}</Text>
                      </View>
                      <View style={s.feedAnyway}>
                        <Text style={s.feedAnywayText} numberOfLines={1}>anyway, {item.anywayText}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>

          {/* 최근 피드 카드 팝업 (저장 완료 화면) */}
          <Modal
            visible={selectedFeed !== null}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedFeed(null)}
          >
            <TouchableWithoutFeedback onPress={() => setSelectedFeed(null)}>
              <View style={s.modalOverlay}>
                <TouchableOpacity style={s.modalClose} onPress={() => setSelectedFeed(null)}>
                  <Text style={s.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={{ width: cardW, height: cardH }}>
                    {selectedFeed && (
                      <>
                        <Image
                          source={getCardTemplate(selectedFeed.cardStyle).image}
                          style={{ width: cardW, height: cardH }}
                          resizeMode="stretch"
                        />
                        {getCardTemplate(selectedFeed.cardStyle).renderOverlay({
                          yymmdd: selectedFeed.cardDate,
                          goal: selectedFeed.goal,
                          done: selectedFeed.done,
                          anyway: selectedFeed.anywayText,
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

  return null;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  gradBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 102 },
  safe: { flex: 1 },
  container: { paddingHorizontal: Space.s200, paddingBottom: 40 },
  subContainer: { flex: 1, paddingHorizontal: Space.s200 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingVertical: Space.s100 },
  subHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: Space.s100 },
  titleSection: { alignItems: 'center' },
  dateText: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray700, lineHeight: LineHeight.lh500, letterSpacing: -0.2 },
  daysText: { fontSize: FontSize.size900, fontFamily: 'JejuSamdasooBrand-Regular', color: Colors.gray900, lineHeight: LineHeight.lh900, letterSpacing: -0.6 },
  callingCard: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.gray100, borderRadius: Radius.r300, paddingHorizontal: Space.s200, paddingTop: Space.s300, paddingBottom: Space.s200, gap: Space.s300, marginTop: Space.s300, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  // 홈 카드: 위 흰색 → 아래 연분홍 그라데이션 + blue200 테두리 (Figma card-calling)
  callingCardHome: { borderWidth: 1, borderColor: Colors.blue200, borderRadius: Radius.r300, paddingHorizontal: Space.s200, paddingTop: Space.s300, paddingBottom: Space.s200, gap: Space.s300, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  callingCardResult: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.gray100, borderRadius: Radius.r300, paddingHorizontal: Space.s200, paddingTop: Space.s300, paddingBottom: Space.s200, gap: Space.s300, marginTop: Space.s300, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  avatarWrap: { alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.pink400 },
  avatarSmall: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.pink400 },
  cardTitleWrap: { alignItems: 'center', gap: Space.s050 },
  cardTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh600, letterSpacing: -0.4, textAlign: 'center' },
  cardSubRow: { flexDirection: 'row', justifyContent: 'center' },
  cardSub: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  writingContainer: { gap: Space.s200, paddingLeft: Space.s050 },
  writingRow: { flexDirection: 'row', alignItems: 'center', gap: Space.s200 },
  writingLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  writingLabel: { flex: 1, fontSize: FontSize.size300, color: Colors.gray500, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  writingLabelFilled: { color: Colors.gray900 },
  writeBtn: { backgroundColor: Colors.blue200, borderWidth: 1, borderColor: Colors.opacityBlack100, borderRadius: Radius.r100, paddingHorizontal: Space.s150, paddingVertical: Space.s075 },
  writeBtnText: { fontSize: FontSize.size200, color: Colors.blue700, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  makeBtn: { backgroundColor: Colors.gray200, borderWidth: 1, borderColor: Colors.opacityBlack100, borderRadius: Radius.r100, paddingHorizontal: Space.s300, paddingVertical: Space.s150, alignItems: 'center' },
  makeBtnActive: { backgroundColor: Colors.blue500, borderColor: Colors.blue500 },
  makeBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.gray500, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  makeBtnTextActive: { color: Colors.white },
  feedSection: { marginTop: Space.s500, paddingBottom: Space.s900 },
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: Space.s050, paddingBottom: Space.s300 },
  feedTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh600, letterSpacing: -0.4 },
  feedItem: { backgroundColor: Colors.blue100, borderRadius: Radius.r200, flexDirection: 'row', alignItems: 'center', paddingLeft: Space.s200, paddingRight: Space.s250, paddingVertical: Space.s250, gap: Space.s200, marginBottom: Space.s200, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  feedAvatar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  feedEmptyText: { fontSize: FontSize.size200, color: Colors.gray400, letterSpacing: -0.6, paddingVertical: Space.s200 },
  feedTextWrap: { flex: 1 },
  feedCapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: Space.s025 },
  feedCaption: { flex: 1, fontSize: FontSize.size200, color: Colors.gray700, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  feedTime: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  feedAnyway: { flexDirection: 'row', gap: 4 },
  feedAnywayText: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  callHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.s200 },
  callHeaderText: { flex: 1, gap: Space.s050 },
  callMeta: { flexDirection: 'row', alignItems: 'center', gap: Space.s050 },
  callMetaText: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  callTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh600, letterSpacing: -0.4 },
  callTitleSm: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  interactionContainer: { gap: Space.s300, paddingTop: Space.s500 },
  // 입력 화면 하단 연분홍 그라데이션 (배경) + 반짝이
  inputBgGrad: { ...StyleSheet.absoluteFillObject },
  inputWrap: { width: '100%', position: 'relative' },
  btnWrap: { width: '100%', position: 'relative' },
  sparkleInput: { position: 'absolute', right: -16, top: -45, width: 57, height: 78, zIndex: 1 },
  sparkleButton: { position: 'absolute', left: -24, bottom: -40, width: 57, height: 78, zIndex: 1 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.opacityBlack200, borderRadius: Radius.r100, padding: Space.s200, fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  primaryBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingHorizontal: Space.s300, paddingVertical: Space.s150, alignItems: 'center' },
  primaryBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  bottomBtnWrap: { paddingHorizontal: Space.s200, paddingBottom: Space.s500 },
  anywayTextWrap: { alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  loadingText: { fontSize: FontSize.size300, color: Colors.gray500, letterSpacing: -0.6 },
  anywayText: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.blue400, lineHeight: LineHeight.lh500, letterSpacing: -0.2, textAlign: 'center' },
  textRows: { gap: Space.s200, paddingLeft: Space.s050 },
  textRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.s300 },
  textRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  textRowLabel: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.6, width: 68 },
  textRowValue: { flex: 1, fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6, textAlign: 'right' },
  cardBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Space.s150 },
  cardBtn: { backgroundColor: Colors.blue200, borderWidth: 1, borderColor: Colors.opacityBlack100, borderRadius: Radius.r100, paddingHorizontal: Space.s150, paddingVertical: Space.s075, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardBtnText: { fontSize: FontSize.size200, color: Colors.blue700, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  settingSection: { marginTop: Space.s400, paddingBottom: Space.s100 },
  settingTitle: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh500, letterSpacing: -0.2, paddingLeft: Space.s050, paddingBottom: Space.s200 },
  chipRow: { flexDirection: 'row', gap: Space.s150, flexWrap: 'wrap' },
  chip: { borderRadius: Radius.r999, paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  chipActive: { backgroundColor: Colors.pink400 },
  chipInactive: { backgroundColor: Colors.pink050, borderWidth: 1, borderColor: Colors.opacityBlack100 },
  chipText: { fontSize: FontSize.size200, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  chipTextActive: { color: Colors.white },
  chipTextInactive: { color: Colors.gray500 },
  // 카드 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(96,98,109,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    right: Space.s200,
    padding: Space.s100,
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 22, color: Colors.white, fontWeight: '600',
  },
  cardDateText: {
    fontFamily: 'AVALADO-Sick',
    color: Colors.black,
    includeFontPadding: false,
  },
  cardValueText: {
    fontFamily: 'Pretendard-Regular',
    color: Colors.gray900,
    letterSpacing: -0.4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  feedGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  feedImgCard: { width: '47%', aspectRatio: 1, borderWidth: 1, borderColor: Colors.gray300, borderRadius: Radius.r300, paddingHorizontal: Space.s150, paddingTop: Space.s200, paddingBottom: Space.s150, justifyContent: 'space-between', backgroundColor: Colors.gray100, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  feedImgMeta: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 4 },
  feedImgName: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  feedImgTime: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  feedImgBottom: { gap: Space.s100 },
  feedAnywayLabel: { fontSize: FontSize.size050, fontWeight: '300', color: Colors.gray700, lineHeight: LineHeight.lh050, letterSpacing: -0.2 },
  feedAnywayContent: { fontSize: FontSize.size200, color: Colors.gray900, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
});
