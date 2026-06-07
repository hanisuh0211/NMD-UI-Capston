import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 월간 리캡 총평을 사용자×월 단위로 1회 생성 후 고정 저장
// 문서 ID: `${uid}_${ym}` (ym = "YYYY-MM")

export const getRecapReview = async (uid: string, ym: string): Promise<string | null> => {
  try {
    const snap = await getDoc(doc(db, 'recaps', `${uid}_${ym}`));
    if (snap.exists()) return (snap.data().text as string) ?? null;
    return null;
  } catch {
    return null;
  }
};

export const saveRecapReview = async (uid: string, ym: string, text: string) => {
  try {
    await setDoc(doc(db, 'recaps', `${uid}_${ym}`), {
      uid, ym, text, createdAt: serverTimestamp(),
    });
  } catch {
    // 저장 실패는 무시 (다음 진입 시 재생성)
  }
};
