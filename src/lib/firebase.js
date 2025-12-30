import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  indexedDBLocalPersistence, // 추가
  browserLocalPersistence, // LocalStorage만 사용
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// ✨ Vite 환경 변수 불러오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: 'https://korean-saju-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 DB 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

// ❌ 삭제: 전역에서 SessionStorage를 설정하던 코드를 삭제합니다.
// setPersistence(auth, browserSessionPersistence)... 부분 삭제
// 이유: 이 부분이 실행될 때 브라우저가 sessionStorage 접근을 막으면 에러가 터집니다.

// 구글 로그인 설정
const provider = new GoogleAuthProvider();

export async function login() {
  try {
    // 1. Persistence 설정 (표준적인 단일 인자 방식으로 변경)
    // 인자를 배열이 아닌 단일 객체로 넣어야 합니다.
    await setPersistence(auth, browserLocalPersistence);

    // 2. 구글 프로바이더 설정
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // 3. 팝업 실행
    const result = await signInWithPopup(auth, provider);

    console.log('로그인 성공:', result.user);
    return result.user;
  } catch (error) {
    // 에러 메시지가 문자열일 경우를 대비해 상세히 로깅
    console.error('로그인 상세 에러:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      console.log('사용자가 팝업을 닫았습니다.');
    } else if (error.message?.includes('missing initial state')) {
      alert(
        '브라우저 보안 설정으로 인해 로그인이 차단되었습니다. 다른 브라우저(크롬 등)를 사용하거나 사파리 설정을 확인해주세요.',
      );
    }

    throw error;
  }
}

// 로그아웃 함수
export const logout = () => signOut(auth).catch(console.error);

// 유저 감지 함수
export const onUserStateChange = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// DB 헬퍼 함수들
export const getUserData = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveUserData = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};
