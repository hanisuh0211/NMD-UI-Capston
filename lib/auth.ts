import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getEmailsByNickname, maskEmail } from './user';

// 아이디 찾기: 닉네임 + 비밀번호로 본인 확인 후 마스킹된 이메일 반환
// 비밀번호는 Auth에만 해시 저장되므로, 후보 이메일에 로그인 시도해 일치 여부를 확인한다.
export const findIdByNicknameAndPassword = async (nickname: string, password: string) => {
  const { emails } = await getEmailsByNickname(nickname);
  for (const email of emails) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await signOut(auth); // 확인만 하고 바로 로그아웃
      return { email: maskEmail(email), error: null };
    } catch {
      // 비밀번호 불일치 → 다음 후보
    }
  }
  return { email: null, error: null };
};

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

// 비밀번호 재설정 메일 발송
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { error: null };
  } catch (error: any) {
    return { error: error.code || error.message };
  }
};

// 현재 로그인된 유저 감지
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
