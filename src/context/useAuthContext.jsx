import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
// 👇 경로 확인: firebase 파일 위치에 맞춰 점 개수(.. 또는 .) 조정하세요
import { login, logout, onUserStateChange, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // 1️⃣ 첫 번째 Effect: 인앱 브라우저 감지 + 로그인 상태 감지
  useEffect(() => {
    // 🔥 [추가된 부분] 카카오톡/인앱 브라우저 감지 및 외부 브라우저 띄우기 시작
    const userAgent = navigator.userAgent.toLowerCase();
    const isInApp =
      userAgent.indexOf('kakaotalk') > -1 ||
      userAgent.indexOf('instagram') > -1 ||
      userAgent.indexOf('naver') > -1;
    const currentUrl = window.location.href;

    if (isInApp) {
      // 1. 안드로이드: 크롬으로 강제 전환
      if (userAgent.match(/android/)) {
        const intentUrl = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return; // 리액트 앱 실행 중단하고 크롬으로 이동
      }
      // 2. 아이폰(iOS): 안내 메시지 띄우기
      else if (userAgent.match(/iphone|ipad|ipod/)) {
        alert(
          'Google 로그인은 카카오톡 인앱 브라우저 보안 정책상 제한됩니다.\n\n화면의 [더보기(...)] 버튼을 눌러 [Safari로 열기]를 선택해주세요.',
        );
        // 아이폰은 강제로 닫을 수 없으므로 여기서 로직이 계속 흐를 수 있지만, 유저가 브라우저를 옮겨야 함을 알게 됩니다.
      }
    }
    // 🔥 [추가된 부분] 끝

    // 👇 기존 로그인 상태 감지 로직 (그대로 유지)
    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // 2️⃣ 두 번째 Effect: 유저가 있을 때만 DB 데이터 실시간 동기화 (Firestore)
  useEffect(() => {
    let unsubscribeSnapshot;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);

      // DB 실시간 구독 시작
      unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // [일일 초기화 로직] 날짜가 바뀌었으면 카운트 리셋
          const todayStr = new Date().toLocaleDateString('en-CA');

          if (!data.lastLoginDate || data.lastLoginDate !== todayStr) {
            try {
              // DB 업데이트
              await updateDoc(userDocRef, {
                lastLoginDate: todayStr,
                editCount: 0,
              });
            } catch (e) {
              console.error('Daily reset failed:', e);
            }
          } else {
            // 날짜가 같으면 데이터 상태 업데이트
            setUserData(data);
          }
        } else {
          // 문서가 없는 경우 (신규 유저 등)
          setUserData({});
        }
      });
    } else {
      // 로그아웃 상태면 데이터 비움
      setUserData(null);
    }

    // Cleanup
    return () => {
      if (typeof unsubscribeSnapshot === 'function') {
        unsubscribeSnapshot();
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
