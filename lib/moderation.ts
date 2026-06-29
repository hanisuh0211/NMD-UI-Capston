import {
  collection, addDoc, doc, updateDoc, getDoc, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 신고 사유
export const REPORT_REASONS = ['스팸/광고', '욕설/혐오 발언', '부적절한 콘텐츠', '기타'];

// 게시물 신고 → reports 컬렉션에 기록
export const reportAnyway = async (
  reporterId: string,
  anywayId: string,
  authorId: string,
  reason: string,
) => {
  try {
    await addDoc(collection(db, 'reports'), {
      reporterId, anywayId, authorId, reason,
      createdAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 사용자 차단 → 내 프로필 blockedUsers 배열에 추가
export const blockUser = async (uid: string, targetId: string) => {
  try {
    await updateDoc(doc(db, 'users', uid), { blockedUsers: arrayUnion(targetId) });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 내가 차단한 사용자 목록
export const getBlockedUsers = async (uid: string) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    const data = snap.data() as { blockedUsers?: string[] } | undefined;
    return { blocked: data?.blockedUsers ?? [], error: null };
  } catch (error: any) {
    return { blocked: [] as string[], error: error.message };
  }
};
