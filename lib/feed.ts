import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Anyway } from './anyway';

// 전체 공개 피드 불러오기 (최신순, 페이지네이션)
export const getPublicFeed = async (lastDoc?: DocumentSnapshot, pageSize = 10) => {
  try {
    let q = query(
      collection(db, 'anyways'),
      where('visibility', '==', '전체 공개'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'anyways'),
        where('visibility', '==', '전체 공개'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const feed: Anyway[] = [];
    querySnapshot.forEach((doc) => {
      feed.push({ id: doc.id, ...doc.data() } as Anyway);
    });

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    return { feed, lastVisible, error: null };
  } catch (error: any) {
    return { feed: [], lastVisible: null, error: error.message };
  }
};

// 특정 유저의 공개 ANYWAY 불러오기
export const getUserPublicFeed = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'anyways'),
      where('userId', '==', userId),
      where('visibility', '==', '전체 공개'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const feed: Anyway[] = [];
    querySnapshot.forEach((doc) => {
      feed.push({ id: doc.id, ...doc.data() } as Anyway);
    });
    return { feed, error: null };
  } catch (error: any) {
    return { feed: [], error: error.message };
  }
};
