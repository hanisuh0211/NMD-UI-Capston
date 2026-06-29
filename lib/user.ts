import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// 이메일 마스킹: 앞 2글자만 남기고 가림 (예: hanisuh@swu.ac.kr → ha*****@swu.ac.kr)
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const head = local.slice(0, 2);
  const stars = '*'.repeat(Math.max(local.length - 2, 1));
  return `${head}${stars}@${domain}`;
};

// 이메일(아이디) 가입 여부 확인
export const emailExists = async (email: string) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.trim()));
    const snapshot = await getDocs(q);
    return { exists: !snapshot.empty, error: null };
  } catch (error: any) {
    return { exists: false, error: error.message };
  }
};

// 닉네임으로 가입 이메일(원본) 목록 조회 — 내부 본인확인용
export const getEmailsByNickname = async (nickname: string) => {
  try {
    const q = query(collection(db, 'users'), where('nickname', '==', nickname.trim()));
    const snapshot = await getDocs(q);
    const emails: string[] = [];
    snapshot.forEach((d) => {
      const e = (d.data() as UserProfile).email;
      if (e) emails.push(e);
    });
    return { emails, error: null };
  } catch (error: any) {
    return { emails: [], error: error.message };
  }
};

// 유저 타입 정의
export type UserProfile = {
  uid: string;
  email: string;
  nickname: string;
  character: string;
  keywords: string[];
  profileImage?: string;
  createdAt?: any;
};

// 유저 프로필 생성 (회원가입 시)
export const createUserProfile = async (uid: string, data: Omit<UserProfile, 'uid' | 'createdAt'>) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid,
      createdAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 유저 프로필 불러오기
export const getUserProfile = async (uid: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { profile: docSnap.data() as UserProfile, error: null };
    }
    return { profile: null, error: '유저를 찾을 수 없습니다.' };
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

// 유저 프로필 수정
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 유저 프로필 삭제 (Firestore 문서)
export const deleteUserProfile = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
