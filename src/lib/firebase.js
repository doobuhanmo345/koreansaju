import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence, // LocalStorage만 사용
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// ✨ Vite 환경 변수 불러오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 DB 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);

// ❌ 삭제: 전역에서 SessionStorage를 설정하던 코드를 삭제합니다.
// setPersistence(auth, browserSessionPersistence)... 부분 삭제
// 이유: 이 부분이 실행될 때 브라우저가 sessionStorage 접근을 막으면 에러가 터집니다.

// 구글 로그인 설정
const provider = new GoogleAuthProvider();

export async function login() {
  try {
    // 1. Persistence를 LocalStorage로 강제 설정
    // 로그인 시점에 명확하게 LocalStorage를 사용하도록 지정합니다.
    await setPersistence(auth, browserLocalPersistence);

    // 2. 팝업 로그인 실행
    const result = await signInWithPopup(auth, provider);

    console.log('로그인 성공:', result.user);
    return result.user;
  } catch (error) {
    console.error('로그인 실패:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      console.log('사용자가 팝업을 닫았습니다.');
    }
    // "missing initial state" 에러도 여기서 잡히게 됩니다.

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
