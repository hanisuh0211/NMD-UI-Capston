import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
// getReactNativePersistence는 firebase 버전/번들 해석에 따라 누락될 수 있어 동적으로 가져옴
import * as firebaseAuth from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
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

// 플랫폼별 인증 영속성 분기
// - web: 브라우저 localStorage (browserLocalPersistence)
// - native: AsyncStorage (getReactNativePersistence), 없으면 기본 폴백
let _auth: Auth;
try {
  if (Platform.OS === 'web') {
    _auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } else {
    const getRNPersistence = (firebaseAuth as any).getReactNativePersistence;
    if (typeof getRNPersistence === 'function') {
      _auth = initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) });
    } else {
      _auth = getAuth(app);
    }
  }
} catch {
  _auth = getAuth(app);
}

export const auth = _auth;

// Firestore: 웹/제한 네트워크에서 WebChannel이 막히면 읽기가 멈추므로
// long-polling 자동감지를 켜서 안정적으로 연결되게 함
export const db = initializeFirestore(app, {
  // 웹에서는 WebChannel이 자주 막히므로 long-polling을 강제, 네이티브는 자동감지
  ...(Platform.OS === 'web'
    ? { experimentalForceLongPolling: true }
    : { experimentalAutoDetectLongPolling: true }),
});
