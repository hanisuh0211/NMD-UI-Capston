// 표정(리액션) 종류 정의 — 카드 제작 칩 / 피드 리액션 공통 사용
// key: Firestore 저장용 안정 키, label: 화면 표기, icon: 파란 아이콘(리액션 줄·팝업),
// moodIcon: 선택된 mood 버튼(파란 별+흰 표정), 기본 mood 버튼은 별도.

export type ExpressionKey = 'lol' | 'cool' | 'surprised' | 'wink' | 'confused';

export const EXPRESSIONS: {
  key: ExpressionKey;
  label: string;
  icon: any;      // 파란 표정 아이콘
  moodIcon: any;  // 선택된 mood 버튼(파란 별 + 흰 표정)
}[] = [
  { key: 'lol', label: '재밌어요', icon: require('../assets/images/emoji_lol.png'), moodIcon: require('../assets/images/mood_btn_lol.png') },
  { key: 'cool', label: '멋있어요', icon: require('../assets/images/emoji_cool.png'), moodIcon: require('../assets/images/mood_btn_cool.png') },
  { key: 'surprised', label: '놀랐어요', icon: require('../assets/images/emoji_surprised.png'), moodIcon: require('../assets/images/mood_btn_surprised.png') },
  { key: 'wink', label: '같이 힘내요', icon: require('../assets/images/emoji_wink.png'), moodIcon: require('../assets/images/mood_btn_wink.png') },
  { key: 'confused', label: '분발해요', icon: require('../assets/images/emoji_confused.png'), moodIcon: require('../assets/images/mood_btn_confused.png') },
];

export const MOOD_BTN_DEFAULT = require('../assets/images/mood_btn_default.png');

const BY_KEY: Record<string, (typeof EXPRESSIONS)[number]> = {};
const BY_LABEL: Record<string, (typeof EXPRESSIONS)[number]> = {};
EXPRESSIONS.forEach((e) => { BY_KEY[e.key] = e; BY_LABEL[e.label] = e; });

export const getExpression = (key: string) => BY_KEY[key];

// 구버전 데이터(emotion 라벨)·키 혼용 대비: 라벨이면 키로 환산
export const toExpressionKey = (v: string): ExpressionKey | null => {
  if (BY_KEY[v]) return v as ExpressionKey;
  if (BY_LABEL[v]) return BY_LABEL[v].key;
  return null;
};

// 카드에 허용된 표정 키 목록 산출 (expressions 우선, 없으면 emotion 환산, 그래도 없으면 전체)
export const resolveCardExpressions = (a: { expressions?: string[]; emotion?: string }): ExpressionKey[] => {
  if (a.expressions && a.expressions.length > 0) {
    const keys = a.expressions.map(toExpressionKey).filter(Boolean) as ExpressionKey[];
    if (keys.length > 0) return keys;
  }
  if (a.emotion) {
    const k = toExpressionKey(a.emotion);
    if (k) return [k];
  }
  return EXPRESSIONS.map((e) => e.key);
};
