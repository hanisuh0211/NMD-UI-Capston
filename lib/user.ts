import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

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
