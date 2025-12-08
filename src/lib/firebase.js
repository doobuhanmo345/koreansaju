import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged, // ⭐️ 인증 지속성 관련 모듈 추가
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// ✨ Vite 환경 변수 불러오기 (import.meta.env 사용 필수!)
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

// --- 🔑 인증 지속성 설정 (Persistence) ---
// signInWithPopup/Redirect 전에 실행되어야 합니다.
// browserSessionPersistence는 브라우저 세션이 종료될 때까지 (창을 닫거나 탭을 닫을 때까지)
// 인증 정보를 유지하도록 설정합니다.
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('인증 지속성 설정 완료: browserSessionPersistence 적용'); // 성공적으로 설정되면 다음 작업을 계속합니다.
  })
  .catch((error) => {
    console.error('인증 지속성 설정 오류:', error); // 오류가 발생해도 앱이 동작하도록 예외 처리를 합니다.
  });
// ------------------------------------------

// 구글 로그인 설정
const provider = new GoogleAuthProvider();

// 로그인 함수
export const login = () =>
  signInWithPopup(auth, provider).catch((error) => {
    console.error('로그인 에러:', error); // 에러 핸들링 로직은 그대로 유지
    // alert(
    //   "로그인 중 오류가 발생했습니다. Firebase 콘솔 설정을 확인하거나, 브라우저의 '교차 사이트 추적 방지' 설정을 해제해보세요.",
    // );
  });

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
