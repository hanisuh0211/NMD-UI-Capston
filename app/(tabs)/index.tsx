import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, TextInput, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, LineHeight, Space, Radius } from '../../theme';

import NotificationsIcon from '../../assets/icons/notifications.svg';
import Flag2Icon from '../../assets/icons/flag_2.svg';
import RewardedAdsIcon from '../../assets/icons/rewarded_ads.svg';
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

export default function MainScreen() {
  const [step, setStep] = useState<Step>('home');
  const [goal, setGoal] = useState('');
  const [done, setDone] = useState('');
  const [goalTemp, setGoalTemp] = useState('');
  const [doneTemp, setDoneTemp] = useState('');
  const [visibility, setVisibility] = useState('나만 보기');
  const [emotion, setEmotion] = useState('같이 힘내요');

  // ── 홈 ──
  if (step === 'home') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
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
              <Text style={s.daysText}>2days</Text>
            </View>

            <View style={s.callingCard}>
              <View style={s.avatarWrap}>
                <View style={s.avatarCircle} />
              </View>
              <Text style={s.cardTitle}>오늘 하루 어땠어?</Text>
              <View style={s.cardSubRow}>
                <Text style={s.cardSub}>name! 시간될 때 알려줘!</Text>
              </View>

              <View style={s.writingContainer}>
                {/* 목표 입력행 */}
                <View style={s.writingRow}>
                  <View style={s.writingLeft}>
                    <Flag2Icon width={20} height={20} />
                    <Text style={[s.writingLabel, goal ? s.writingLabelFilled : {}]} numberOfLines={1}>
                      {goal || '목표 입력하기'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.writeBtn}
                    onPress={() => {
                      setGoalTemp(goal);
                      setStep('goal');
                    }}
                  >
                    <Text style={s.writeBtnText}>{goal ? '수정' : '작성'}</Text>
                  </TouchableOpacity>
                </View>

                {/* 달성 입력행 */}
                <View style={s.writingRow}>
                  <View style={s.writingLeft}>
                    <RewardedAdsIcon width={20} height={20} />
                    <Text style={[s.writingLabel, done ? s.writingLabelFilled : {}]} numberOfLines={1}>
                      {done || '달성 항목 입력하기'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.writeBtn}
                    onPress={() => {
                      setDoneTemp(done);
                      setStep('done');
                    }}
                  >
                    <Text style={s.writeBtnText}>{done ? '수정' : '작성'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 제작하기: 둘 다 입력됐을 때만 활성화 */}
              <TouchableOpacity
                style={[s.makeBtn, goal && done ? s.makeBtnActive : {}]}
                disabled={!goal || !done}
                onPress={() => setStep('result')}
              >
                <Text style={[s.makeBtnText, goal && done ? s.makeBtnTextActive : {}]}>제작하기</Text>
              </TouchableOpacity>
            </View>

            <View style={s.feedSection}>
              <View style={s.feedHeader}>
                <Text style={s.feedTitle}>최근 피드</Text>
                <TouchableOpacity>
                  <ArrowForwardIosIcon width={24} height={24} color={Colors.gray900} />
                </TouchableOpacity>
              </View>
              {[
                { caption: '목표', time: '지금', title: '해냈어!' },
                { caption: 'title-text', time: 'time', title: 'content-text' },
                { caption: 'title-text', time: 'time', title: 'content-text' },
              ].map((item, i) => (
                <View key={i} style={s.feedItem}>
                  <View style={s.feedAvatar} />
                  <View style={s.feedTextWrap}>
                    <View style={s.feedCapRow}>
                      <Text style={s.feedCaption}>{item.caption}</Text>
                      <Text style={s.feedTime}>{item.time}</Text>
                    </View>
                    <View style={s.feedAnyway}>
                      <Text style={s.feedAnywayText}>anyway, </Text>
                      <Text style={s.feedAnywayText}>{item.title}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── 목표 입력 (홈으로 복귀) ──
  if (step === 'goal') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={s.safe}>
          <View style={s.subContainer}>
            <View style={s.subHeader}>
              <TouchableOpacity onPress={() => setStep('home')}>
                <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
            <View style={s.callHeader}>
              <View style={s.avatarSmall} />
              <View style={s.callHeaderText}>
                <View style={s.callMeta}>
                  <CallIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={s.callMetaText}>{DATE_FULL}</Text>
                </View>
                <Text style={s.callTitle}>목표가 뭐였어?</Text>
              </View>
            </View>
            <View style={s.interactionContainer}>
              <TextInput
                style={s.input}
                placeholder="목표 입력하기"
                placeholderTextColor={Colors.gray500}
                value={goalTemp}
                onChangeText={setGoalTemp}
                autoFocus
              />
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() => {
                  setGoal(goalTemp);
                  setStep('home');
                }}
              >
                <Text style={s.primaryBtnText}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── 달성 입력 (홈으로 복귀) ──
  if (step === 'done') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
        <SafeAreaView style={s.safe}>
          <View style={s.subContainer}>
            <View style={s.subHeader}>
              <TouchableOpacity onPress={() => setStep('home')}>
                <ArrowBackIcon width={24} height={24} color={Colors.gray900} />
              </TouchableOpacity>
            </View>
            <View style={s.callHeader}>
              <View style={s.avatarSmall} />
              <View style={s.callHeaderText}>
                <View style={s.callMeta}>
                  <CallIcon width={20} height={20} color={Colors.gray700} />
                  <Text style={s.callMetaText}>{DATE_FULL}</Text>
                </View>
                <Text style={s.callTitle}>어떤 걸 해냈어?</Text>
              </View>
            </View>
            <View style={s.interactionContainer}>
              <TextInput
                style={s.input}
                placeholder="달성 항목 입력하기"
                placeholderTextColor={Colors.gray500}
                value={doneTemp}
                onChangeText={setDoneTemp}
                autoFocus
              />
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() => {
                  setDone(doneTemp);
                  setStep('home');
                }}
              >
                <Text style={s.primaryBtnText}>저장하기</Text>
              </TouchableOpacity>
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
                <View style={s.avatarSmall} />
                <View style={s.callHeaderText}>
                  <View style={s.callMeta}>
                    <CallIcon width={20} height={20} color={Colors.gray700} />
                    <Text style={s.callMetaText}>ANYWAY 문구를 확인해 봐!</Text>
                  </View>
                  <Text style={s.callTitleSm}>뭐라도 해냈다는 게 대단한 거지!</Text>
                </View>
              </View>
              <View style={s.anywayTextWrap}>
                <Text style={s.anywayText}>영어 단어 50개는 외운 거잖아!</Text>
                <Text style={s.anywayText}>그것도 해낸 거지!</Text>
              </View>
              <View style={s.textRows}>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <Flag2Icon width={20} height={20} />
                    <Text style={s.textRowLabel}>GOAL</Text>
                  </View>
                  <Text style={s.textRowValue}>{goal}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <RewardedAdsIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>DONE</Text>
                  </View>
                  <Text style={s.textRowValue}>{done}</Text>
                </View>
              </View>
              <View style={s.cardBtnRow}>
                <TouchableOpacity style={s.cardBtn}>
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
            <TouchableOpacity style={s.primaryBtn} onPress={() => setStep('saved')}>
              <Text style={s.primaryBtnText}>저장하기</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── 저장 완료 ──
  if (step === 'saved') {
    return (
      <View style={s.root}>
        <LinearGradient colors={[Colors.blue200, Colors.gray050, Colors.white]} style={s.gradBg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
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
              <Text style={s.daysText}>2days</Text>
            </View>
            <View style={s.callingCard}>
              <View style={s.callHeader}>
                <View style={s.avatarSmall} />
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
                    <Flag2Icon width={20} height={20} />
                    <Text style={s.textRowLabel}>GOAL</Text>
                  </View>
                  <Text style={s.textRowValue}>{goal}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <RewardedAdsIcon width={20} height={20} />
                    <Text style={s.textRowLabel}>DONE</Text>
                  </View>
                  <Text style={s.textRowValue}>{done}</Text>
                </View>
                <View style={s.textRow}>
                  <View style={s.textRowLeft}>
                    <View style={{ width: 20, height: 20 }} />
                    <Text style={s.textRowLabel}>ANYWAY</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={s.textRowValue}>영어 단어 50개는 외운 거잖아!</Text>
                    <Text style={s.textRowValue}>그것도 해낸 거지!</Text>
                  </View>
                </View>
              </View>
              <View style={s.cardBtnRow}>
                <TouchableOpacity style={s.cardBtn}>
                  <Text style={s.cardBtnText}>수정</Text>
                  <BorderColorIcon width={16} height={16} color={Colors.blue700} />
                </TouchableOpacity>
                <TouchableOpacity style={s.cardBtn}>
                  <Text style={s.cardBtnText}>전환</Text>
                  <SwapHorizIcon width={16} height={16} color={Colors.blue700} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.feedSection}>
              <View style={s.feedHeader}>
                <Text style={s.feedTitle}>최근 피드</Text>
                <TouchableOpacity>
                  <ArrowForwardIosIcon width={24} height={24} color={Colors.gray900} />
                </TouchableOpacity>
              </View>
              <View style={s.feedGallery}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <View key={i} style={s.feedImgCard}>
                    <View style={s.feedImgMeta}>
                      <Text style={s.feedImgName}>name</Text>
                      <Text style={s.feedImgTime}>time</Text>
                    </View>
                    <View style={s.feedImgBottom}>
                      <Text style={s.feedAnywayLabel}>ANYWAY,</Text>
                      <Text style={s.feedAnywayContent}>일이삼사오육칠팔구십일이삼</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
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
  daysText: { fontSize: FontSize.size900, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh900, letterSpacing: -0.6 },
  callingCard: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.gray100, borderRadius: Radius.r300, paddingHorizontal: Space.s200, paddingTop: Space.s300, paddingBottom: Space.s200, gap: Space.s300, marginTop: Space.s300, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  callingCardResult: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.gray100, borderRadius: Radius.r300, paddingHorizontal: Space.s200, paddingTop: Space.s300, paddingBottom: Space.s200, gap: Space.s300, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  avatarWrap: { alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.pink400 },
  avatarSmall: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.pink400 },
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
  feedSection: { paddingBottom: Space.s900 },
  feedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: Space.s050, paddingBottom: Space.s300 },
  feedTitle: { fontSize: FontSize.size600, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh600, letterSpacing: -0.4 },
  feedItem: { backgroundColor: Colors.blue100, borderRadius: Radius.r200, flexDirection: 'row', alignItems: 'center', paddingLeft: Space.s200, paddingRight: Space.s250, paddingVertical: Space.s250, gap: Space.s200, marginBottom: Space.s200, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  feedAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.pink400 },
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
  input: { backgroundColor: Colors.gray050, borderWidth: 1, borderColor: Colors.opacityBlack200, borderRadius: Radius.r100, padding: Space.s200, fontSize: FontSize.size300, color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.6 },
  primaryBtn: { backgroundColor: Colors.blue500, borderRadius: Radius.r100, paddingHorizontal: Space.s300, paddingVertical: Space.s150, alignItems: 'center' },
  primaryBtnText: { fontSize: FontSize.size400, fontWeight: '600', color: Colors.white, lineHeight: LineHeight.lh400, letterSpacing: -0.2 },
  bottomBtnWrap: { paddingHorizontal: Space.s200, paddingBottom: Space.s500 },
  anywayTextWrap: { alignItems: 'center' },
  anywayText: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.blue400, lineHeight: LineHeight.lh500, letterSpacing: -0.2, textAlign: 'center' },
  textRows: { gap: Space.s200, paddingLeft: Space.s050 },
  textRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.s300 },
  textRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Space.s100 },
  textRowLabel: { fontSize: FontSize.size300, fontWeight: '600', color: Colors.gray900, lineHeight: LineHeight.lh300, letterSpacing: -0.6, width: 68 },
  textRowValue: { flex: 1, fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6, textAlign: 'right' },
  cardBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: Space.s150 },
  cardBtn: { backgroundColor: Colors.blue200, borderWidth: 1, borderColor: Colors.opacityBlack100, borderRadius: Radius.r100, paddingHorizontal: Space.s150, paddingVertical: Space.s075, flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardBtnText: { fontSize: FontSize.size200, color: Colors.blue700, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  settingSection: { paddingBottom: Space.s300 },
  settingTitle: { fontSize: FontSize.size500, fontWeight: '700', color: Colors.gray900, lineHeight: LineHeight.lh500, letterSpacing: -0.2, paddingLeft: Space.s050, paddingBottom: Space.s200 },
  chipRow: { flexDirection: 'row', gap: Space.s150, flexWrap: 'wrap' },
  chip: { borderRadius: Radius.r999, paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  chipActive: { backgroundColor: Colors.pink400 },
  chipInactive: { backgroundColor: Colors.pink050, borderWidth: 1, borderColor: Colors.opacityBlack100 },
  chipText: { fontSize: FontSize.size200, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
  chipTextActive: { color: Colors.white },
  chipTextInactive: { color: Colors.gray500 },
  feedGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  feedImgCard: { width: '47%', aspectRatio: 1, borderWidth: 1, borderColor: Colors.gray300, borderRadius: Radius.r300, paddingHorizontal: Space.s150, paddingTop: Space.s200, paddingBottom: Space.s150, justifyContent: 'space-between', backgroundColor: Colors.gray100, shadowColor: Colors.black, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  feedImgMeta: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 4 },
  feedImgName: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  feedImgTime: { fontSize: FontSize.size100, color: Colors.gray700, lineHeight: LineHeight.lh100, letterSpacing: -0.2 },
  feedImgBottom: { gap: Space.s100 },
  feedAnywayLabel: { fontSize: FontSize.size050, fontWeight: '300', color: Colors.gray700, lineHeight: LineHeight.lh050, letterSpacing: -0.2 },
  feedAnywayContent: { fontSize: FontSize.size200, color: Colors.gray900, lineHeight: LineHeight.lh200, letterSpacing: -0.6 },
});
