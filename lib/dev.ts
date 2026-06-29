import { auth } from '../firebaseConfig';

// 개발자 계정 — 이 계정으로 로그인했을 때만 개발용 버튼이 보인다
export const DEV_EMAILS = ['hanisuh0211@gmail.com'];

export const isDevUser = () =>
  DEV_EMAILS.includes((auth.currentUser?.email ?? '').toLowerCase());
