import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Gemini에 텍스트 요청하는 기본 함수
const askGemini = async (prompt: string): Promise<string> => {
  try {
    console.log('API KEY 확인:', GEMINI_API_KEY);
    console.log('요청 시작...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    console.log('응답 상태:', response.status);
    const data = await response.json();
    console.log('응답 데이터:', JSON.stringify(data));

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '문구를 생성할 수 없었어요.';
  } catch (error) {
    console.log('Gemini 에러 상세:', JSON.stringify(error));
    return '문구를 생성할 수 없었어요.';
  }
};

// ANYWAY 문구 생성
export const generateAnywayText = async (goal: string, done: string): Promise<string> => {
  const prompt = `
너는 사용자의 노력을 따뜻하고 유쾌하게 응원해주는 친구야.
사용자가 오늘의 목표와 실제로 한 것을 입력했어.
목표를 다 이루지 못했더라도, '그래도 뭔가를 했다'는 사실에 집중해서
짧고 유쾌하게 칭찬하는 문구를 1줄로 만들어줘.

규칙:
- 반드시 1줄로 작성
- 각 줄은 10자 이내
- "그래도"라는 표현 뒤에 올 형식으로 제작
- 따뜻하고 유쾌한 톤
- 조언이나 평가 금지
- 오직 칭찬과 공감만

목표: ${goal}
한 것: ${done}

문구만 출력해. 다른 설명 없이.
`;
  return await askGemini(prompt);
};

// 월간 리캡 총평 생성
export const generateMonthlyRecap = async (anywayTexts: string[]): Promise<string> => {
  const textList = anywayTexts.join('\n');
  const prompt = `
너는 사용자의 한 달을 따뜻하게 돌아봐주는 친구야.
이번 달 사용자가 받았던 ANYWAY 문구들이야:

${textList}

이 문구들을 바탕으로 이번 달을 한 문장으로 총평해줘.
규칙:
- 한 문장으로 작성
- 20자 이내
- 따뜻하고 유쾌한 톤
- "그래도 ~" 형식으로 시작

총평만 출력해. 다른 설명 없이.
`;
  return await askGemini(prompt);
};
