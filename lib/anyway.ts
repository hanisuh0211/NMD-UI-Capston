import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// ANYWAY 타입 정의
export type Anyway = {
  id?: string;
  userId: string;
  goal: string;
  done: string;
  anywayText: string;
  date: string;
  visibility: '전체 공개' | '친구 공개' | '나만 보기';
  emotion: string;
  createdAt?: any;
};

// ANYWAY 생성
export const createAnyway = async (data: Omit<Anyway, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'anyways'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// 내 ANYWAY 목록 불러오기
// where(userId)만 사용하고 정렬은 클라이언트에서 → 복합 색인 불필요
export const getMyAnyways = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'anyways'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const anyways: Anyway[] = [];
    querySnapshot.forEach((doc) => {
      anyways.push({ id: doc.id, ...doc.data() } as Anyway);
    });
    // 최신순 정렬 (createdAt 우선, 없으면 date)
    anyways.sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.date).getTime();
      const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.date).getTime();
      return tb - ta;
    });
    return { anyways, error: null };
  } catch (error: any) {
    console.log('getMyAnyways 에러:', error.message);
    return { anyways: [], error: error.message };
  }
};

// 오늘 이미 카드를 만들었는지 확인 (하루 1회 제한용)
export const getTodayAnyway = async (userId: string): Promise<Anyway | null> => {
  const { anyways } = await getMyAnyways(userId);
  const now = new Date();
  return (
    anyways.find((a) => {
      let d: Date | null = null;
      if (a.createdAt?.toDate) d = a.createdAt.toDate();
      else if (a.date) d = new Date(a.date);
      return (
        !!d && !isNaN(d.getTime()) &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }) ?? null
  );
};

// ANYWAY 단건 불러오기
export const getAnyway = async (anywayId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'anyways', anywayId));
    if (docSnap.exists()) {
      return { anyway: { id: docSnap.id, ...docSnap.data() } as Anyway, error: null };
    }
    return { anyway: null, error: '찾을 수 없습니다.' };
  } catch (error: any) {
    return { anyway: null, error: error.message };
  }
};

// ANYWAY 수정
export const updateAnyway = async (anywayId: string, data: Partial<Anyway>) => {
  try {
    await updateDoc(doc(db, 'anyways', anywayId), data);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 연속 작성일 계산
export const calculateStreak = (anyways: Anyway[]): number => {
  if (anyways.length === 0) return 0;

  const dates = anyways
    .map((a) => new Date(a.date).toDateString())
    .filter((v, i, arr) => arr.indexOf(v) === i) // 중복 제거
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diff = (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
