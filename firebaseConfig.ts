import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
