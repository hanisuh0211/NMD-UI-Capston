import { doc, setDoc, updateDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 개발용 샘플 피드 시드 데이터
const SAMPLE_USERS = [
  { uid: 'sample_user_1', nickname: '아침형햄스터', character: 'char1' },
  { uid: 'sample_user_2', nickname: '독서하는곰',   character: 'char3' },
  { uid: 'sample_user_3', nickname: '운동하는강아지', character: 'char2' },
  { uid: 'sample_user_4', nickname: '물마시는토끼', character: 'char4' },
  { uid: 'sample_user_5', nickname: '정리왕고양이', character: 'char1' },
];

const SAMPLE_ANYWAYS = [
  { uid: 'sample_user_1', goal: '아침 7시에 일어나기', done: '7시 30분에 일어남', anywayText: '그래도 알람은 껐잖아!' },
  { uid: 'sample_user_2', goal: '책 50쪽 읽기', done: '12쪽 읽음', anywayText: '그래도 책을 펼쳤다는 게 어디야!' },
  { uid: 'sample_user_3', goal: '헬스장에서 1시간 운동', done: '스트레칭 10분', anywayText: '그래도 몸은 움직였네!' },
  { uid: 'sample_user_4', goal: '물 2L 마시기', done: '한 컵 마심', anywayText: '그래도 목은 축였잖아!' },
  { uid: 'sample_user_5', goal: '방 청소 끝내기', done: '책상만 정리', anywayText: '그래도 책상은 깨끗하다!' },
];

// 5개의 샘플 피드를 Firestore에 생성 (고정 ID라 중복 실행해도 덮어쓰기)
export const seedSampleFeed = async () => {
  try {
    const now = Date.now();

    // 작성자 프로필 (캐릭터 얼굴 표시용)
    await Promise.all(
      SAMPLE_USERS.map((u) =>
        setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: `${u.uid}@sample.com`,
          nickname: u.nickname,
          character: u.character,
          keywords: [],
          createdAt: Timestamp.fromDate(new Date(now - 1000 * 60 * 60 * 24 * 30)),
        })
      )
    );

    // 공개 ANYWAY (시간차를 둬서 상대 시간 표시 다양하게)
    const offsetsMin = [2, 35, 180, 60 * 24, 60 * 24 * 3];
    await Promise.all(
      SAMPLE_ANYWAYS.map((a, i) => {
        const created = new Date(now - offsetsMin[i] * 60000);
        return setDoc(doc(db, 'anyways', `sample_anyway_${i + 1}`), {
          userId: a.uid,
          goal: a.goal,
          done: a.done,
          anywayText: a.anywayText,
          date: created.toISOString(),
          visibility: '전체 공개',
          emotion: '같이 힘내요',
          cardStyle: i % 2,  // 카드 디자인 번갈아
          createdAt: Timestamp.fromDate(created),
        });
      })
    );

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 기존 카드들의 디자인(cardStyle)을 0/1/2로 골고루 재배정 (1회용)
export const reassignCardStyles = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'anyways'));
    let i = 0;
    await Promise.all(
      snapshot.docs.map((d) => {
        const style = i++ % 3; // 0, 1, 2 순환
        return updateDoc(doc(db, 'anyways', d.id), { cardStyle: style });
      })
    );
    return { count: snapshot.size, error: null };
  } catch (error: any) {
    return { count: 0, error: error.message };
  }
};
