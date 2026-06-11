import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontSize, LineHeight, Space, Radius } from '../theme';

const SPARKLE = require('../assets/images/deco_sparkle.png');

type Page = {
  title: string;
  subtitle: string;
  sample?: string;
  image: any;
  starLeft: number; // 제목 끝 부근에 별을 두기 위한 좌측 오프셋 (Figma 기준)
};

const PAGES: Page[] = [
  {
    title: '목표와 달성을 입력하세요!',
    subtitle: '목표는 없어도 괜찮아요.\n‘그래도 내가 해낸 것, 오늘 한 것’을 알려주세요.',
    sample: '“버스를 놓쳤지만, 택시는 안 탔어”\n“영단어 100개 외우기. 하지만 5개 외웠어”',
    image: require('../assets/images/onboarding_1.png'),
    starLeft: 246,
  },
  {
    title: 'ANYWAY 카드를 저장하세요!',
    subtitle: '오늘 한 것을 입력하면 ANYWAY가 카드를 생성해요.\n‘그래도’ 한 것에 집중해 실패도 긍정적으로 바라볼 수 있어요.',
    image: require('../assets/images/onboarding_2.png'),
    starLeft: 310,
  },
  {
    title: '통계에서 모아보세요!',
    subtitle: '통계에서 ANYWAY 카드를 모아볼 수 있어요.\n한 달의 기록이 누적되면 이번 달의 ‘다시보기’가 활성화돼요.\n\n한 달 간의 기록을 모아보고, 유쾌한 기억을 떠올려 보세요.\n공유하고, 저장할 수 있어요.',
    image: require('../assets/images/onboarding_3.png'),
    starLeft: 204,
  },
];

// 목업에서 보여줄 세로 비율 (와이어프레임 기준 상단 ~72%)
const PHONE_VISIBLE = 0.72;
const PHONE_RATIO = 900 / 1840;

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [phoneH, setPhoneH] = useState(0);
  const listRef = useRef<FlatList>(null);

  // 세로(보이는 영역) 기준으로 목업 크기 결정 → 기기가 달라도 세로 내용은 동일하게 노출
  const imgH = phoneH > 0 ? phoneH / PHONE_VISIBLE : 0;
  const imgW = imgH * PHONE_RATIO;

  const finish = () => router.replace('/(tabs)');

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={s.root}>
      {/* 배경: 위 파랑 → 분홍 → 하양 */}
      <LinearGradient
        colors={[Colors.blue200, Colors.pink050, Colors.white]}
        locations={[0, 0.22, 0.5]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={s.safe}>
        {/* 상단 우측: 건너뛰기 / (마지막) 시작하기 */}
        <View style={s.header}>
          <TouchableOpacity onPress={finish} hitSlop={8}>
            <Text style={s.skip}>{page === PAGES.length - 1 ? '시작하기' : '건너뛰기'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={PAGES}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          renderItem={({ item, index }) => (
            <View style={[s.page, { width }]}>
              {/* 제목 (별이 텍스트 뒤에 겹침) */}
              <View style={s.titleWrap}>
                <Image source={SPARKLE} style={[s.titleStar, { left: item.starLeft }]} resizeMode="contain" />
                <Text style={s.title}>{item.title}</Text>
              </View>
              <Text style={s.subtitle}>{item.subtitle}</Text>

              {/* 페이지 인디케이터 */}
              <View style={s.dots}>
                {PAGES.map((_, i) => (
                  <View key={i} style={[s.dot, i === index ? s.dotActive : s.dotInactive]} />
                ))}
              </View>

              {/* 예시 말풍선 (1페이지) — 꼬리 포함 */}
              {item.sample ? (
                <View style={s.bubbleWrap}>
                  <View style={s.bubble}>
                    <Text style={s.bubbleText}>{item.sample}</Text>
                  </View>
                  <View style={s.bubbleTail} />
                </View>
              ) : null}

              {/* 폰 목업: 세로 표시량 기준으로 크기 결정, 아래쪽은 잘림 */}
              <View
                style={s.phoneWrap}
                onLayout={(e) => setPhoneH(e.nativeEvent.layout.height)}
              >
                {imgH > 0 && (
                  <Image
                    source={item.image}
                    style={{ width: imgW, height: imgH }}
                    resizeMode="stretch"
                  />
                )}
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  safe: { flex: 1 },
  header: { alignItems: 'flex-end', paddingHorizontal: Space.s200, paddingVertical: Space.s100 },
  skip: { fontSize: FontSize.size300, color: Colors.gray700, letterSpacing: -0.6 },
  page: { flex: 1, paddingHorizontal: Space.s200 },
  // 제목 + 별
  titleWrap: { width: '100%', marginTop: Space.s100, justifyContent: 'center' },
  title: { fontSize: FontSize.size700, fontWeight: '700', color: Colors.gray900, lineHeight: 38, letterSpacing: -0.2 },
  titleStar: { position: 'absolute', top: -24, width: 62, height: 71, transform: [{ rotate: '15deg' }] },
  subtitle: { fontSize: FontSize.size300, color: Colors.gray700, lineHeight: LineHeight.lh300, letterSpacing: -0.6, marginTop: Space.s200 },
  // 페이지 닷
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Space.s150, marginTop: Space.s400 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.blue500 },
  dotInactive: { backgroundColor: Colors.gray200 },
  // 말풍선
  bubbleWrap: { width: '100%', alignItems: 'center', marginTop: Space.s300 },
  bubble: { backgroundColor: Colors.pink100, borderRadius: Radius.r200, paddingVertical: Space.s200, paddingHorizontal: Space.s200, width: '100%' },
  bubbleText: { fontSize: FontSize.size200, color: Colors.gray700, lineHeight: LineHeight.lh200, letterSpacing: -0.6, textAlign: 'center' },
  bubbleTail: {
    width: 0, height: 0, marginTop: -1,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.pink100,
  },
  // 폰 목업
  phoneWrap: { flex: 1, width: '100%', overflow: 'hidden', alignItems: 'center', marginTop: Space.s300 },
});
