import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// 회원가입
export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// 로그인
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// 로그아웃
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 비밀번호 변경 (현재 로그인된 유저)
export const updateUserPassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) return { error: 'no-user' };
    await updatePassword(user, newPassword);
    return { error: null };
  } catch (error: any) {
    return { error: error.code || error.message };
  }
};

// 비밀번호 변경 (현재 비밀번호로 재인증 후 변경)
export const changePassword = async (currentPw: string, newPw: string) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return { error: 'no-user' };
    const cred = EmailAuthProvider.credential(user.email, currentPw);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPw);
    return { error: null };
  } catch (error: any) {
    return { error: error.code || error.message };
  }
};

// 현재 로그인된 유저 감지
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
