import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// getReactNativePersistence는 firebase 버전/번들 해석에 따라 누락될 수 있어 동적으로 가져옴
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBHmaIyAB9Vmv2UnFMb471He32tMryUINg",
  authDomain: "anyway-59380.firebaseapp.com",
  projectId: "anyway-59380",
  storageBucket: "anyway-59380.firebasestorage.app",
  messagingSenderId: "416845901835",
  appId: "1:416845901835:web:eef4532e99ed762aa2170e",
  measurementId: "G-DPSMCF9RPT"
};

const app = initializeApp(firebaseConfig);

// RN 영구 로그인(getReactNativePersistence)이 가능하면 사용,
// 번들 해석 문제로 없으면 기본 인증으로 폴백 → 앱이 항상 정상 구동
const getRNPersistence = (firebaseAuth as any).getReactNativePersistence;
let _auth: Auth;
try {
  if (typeof getRNPersistence === 'function') {
    _auth = initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) });
  } else {
    _auth = getAuth(app);
  }
} catch {
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
