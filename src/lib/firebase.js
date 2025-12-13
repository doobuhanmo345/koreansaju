import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged, // ⭐️ 인증 지속성 관련 모듈 추가
  setPersistence,
  browserLocalPersistence, // 👈 이걸 추가해야 합니다 (LocalStorage 사용)
  browserSessionPersistence, // (혹시 필요하다면 SessionStorage 사용)
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

export async function login() {
  try {
    // 💡 [핵심 수정 부분]
    // 1. Persistence를 LocalStorage로 설정:
    //    SessionStorage에서 발생하는 문제를 해결하기 위해 LocalStorage를 사용합니다.
    await setPersistence(auth, browserLocalPersistence);

    // 2. 팝업 로그인 실행 (Redirect 대신 Popup 사용)
    const result = await signInWithPopup(auth, provider);

    // 로그인 성공 로그
    console.log('로그인 성공 (Popup with Local Persistence):', result.user);
    return result.user;
  } catch (error) {
    // 에러 처리
    console.error('로그인 실패:', error);

    // 팝업 차단, 사용자에 의한 팝업 닫기 등 특정 에러 코드를 처리할 수 있습니다.
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('사용자가 팝업을 닫았습니다.');
    }

    throw error; // 에러를 호출자(useAuthContext)에게 다시 던짐
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
