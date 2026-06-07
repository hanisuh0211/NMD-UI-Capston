import React from 'react';
import { Text, View, StyleSheet, ImageSourcePropType } from 'react-native';

export type CardData = {
  yymmdd: string;  // 6자리 (YYMMDD)
  goal: string;
  done: string;
  anyway: string;
};

export type CardTemplate = {
  image: ImageSourcePropType;
  // 286×476 기준 좌표를 scale 배율로 그림
  renderOverlay: (d: CardData, scale: number) => React.ReactNode;
};

const st = StyleSheet.create({
  date: { fontFamily: 'AVALADO-Sick', color: '#000000', includeFontPadding: false },
  value: { fontFamily: 'Pretendard-Regular', color: '#23232B' },
});

// ── 카드 0: 기본 카드 (YYMMDD 한 줄, -7.09° 회전) ──
const card0: CardTemplate = {
  image: require('../assets/images/card_template.png'),
  renderOverlay: (d, sc) => (
    <>
      <View style={{
        position: 'absolute', left: 19 * sc, top: 68 * sc,
        width: 183.914 * sc, height: 88.327 * sc,
        alignItems: 'center', justifyContent: 'center', overflow: 'visible',
      }}>
        <View style={{ transform: [{ rotate: '-7.09deg' }] }}>
          <Text style={[st.date, { fontSize: 56 * sc, letterSpacing: -2.24 * sc }]}>{d.yymmdd}</Text>
        </View>
      </View>
      <Text style={[st.value, { position: 'absolute', left: 31 * sc, top: 181 * sc, width: 220 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.goal}</Text>
      <Text style={[st.value, { position: 'absolute', left: 31 * sc, top: 247 * sc, width: 220 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.done}</Text>
      <Text style={[st.value, { position: 'absolute', left: 31 * sc, top: 313 * sc, width: 220 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.anyway}</Text>
    </>
  ),
};

// ── 카드 1: 별 카드 (YY/MMDD 두 줄, 우측 정렬) ──
const card1: CardTemplate = {
  image: require('../assets/images/card2.png'),
  renderOverlay: (d, sc) => {
    const yy = d.yymmdd.slice(0, 2);
    const mmdd = d.yymmdd.slice(2);
    return (
      <>
        {/* 날짜: 우측 끝 x=216, top=121, 58px, leading 0.9, 우측 정렬 */}
        <View style={{
          position: 'absolute', left: 0, top: 121 * sc, width: 216 * sc,
          alignItems: 'flex-end',
        }}>
          <Text style={[st.date, { fontSize: 58 * sc, lineHeight: 58 * 0.9 * sc, textAlign: 'right' }]}>{yy}</Text>
          <Text style={[st.date, { fontSize: 58 * sc, lineHeight: 58 * 0.9 * sc, textAlign: 'right' }]}>{mmdd}</Text>
        </View>
        <Text style={[st.value, { position: 'absolute', left: 26 * sc, top: 268 * sc, width: 230 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.goal}</Text>
        <Text style={[st.value, { position: 'absolute', left: 26 * sc, top: 334 * sc, width: 230 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.done}</Text>
        <Text style={[st.value, { position: 'absolute', left: 26 * sc, top: 400 * sc, width: 230 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.anyway}</Text>
      </>
    );
  },
};

// ── 카드 2: 행성 카드 (YYMMDD 한 줄, -7.09° 회전, left=35 top=108) ──
const card2: CardTemplate = {
  image: require('../assets/images/card3.png'),
  renderOverlay: (d, sc) => (
    <>
      <View style={{
        position: 'absolute', left: 35 * sc, top: 108 * sc,
        width: 183.914 * sc, height: 88.327 * sc,
        alignItems: 'center', justifyContent: 'center', overflow: 'visible',
      }}>
        <View style={{ transform: [{ rotate: '-7.09deg' }] }}>
          <Text style={[st.date, { fontSize: 56 * sc, letterSpacing: -2.24 * sc }]}>{d.yymmdd}</Text>
        </View>
      </View>
      <Text style={[st.value, { position: 'absolute', left: 48 * sc, top: 211 * sc, width: 215 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.goal}</Text>
      <Text style={[st.value, { position: 'absolute', left: 48 * sc, top: 277 * sc, width: 215 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.done}</Text>
      <Text style={[st.value, { position: 'absolute', left: 48 * sc, top: 343 * sc, width: 215 * sc, fontSize: 16 * sc, letterSpacing: -0.64 * sc }]}>{d.anyway}</Text>
    </>
  ),
};

export const CARD_TEMPLATES: CardTemplate[] = [card0, card1, card2];

// 카드 생성 시 디자인 무작위 선택
export const pickCardStyle = () => Math.floor(Math.random() * CARD_TEMPLATES.length);

// 안전하게 템플릿 가져오기 (범위 밖이면 0번)
export const getCardTemplate = (idx?: number): CardTemplate =>
  CARD_TEMPLATES[idx ?? 0] ?? CARD_TEMPLATES[0];
