import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
// 👇 경로 확인: firebase 파일 위치에 맞춰 점 개수(.. 또는 .) 조정하세요
import { login, logout, onUserStateChange, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // 1️⃣ 첫 번째 Effect: 인앱 브라우저 감지 + 로그인 상태 감지

  useEffect(() => {
    // 🔥 [수정된 부분] 인앱 브라우저 감지 및 처리 시작
    const userAgent = navigator.userAgent.toLowerCase();
    const isInApp =
      userAgent.indexOf('kakaotalk') > -1 ||
      userAgent.indexOf('instagram') > -1 ||
      userAgent.indexOf('naver') > -1;
    const currentUrl = window.location.href;

    if (isInApp) {
      // 1. 안드로이드: Chrome으로 강제 전환
      if (userAgent.match(/android/)) {
        const intentUrl = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return; // 🔥 강제 이동했으므로, Context 로직 실행 중단
      } else if (userAgent.match(/iphone|ipad|ipod/)) {
        // 2. 아이폰(iOS): 주소 복사 후 수동 이동 안내
        // 클립보드 복사 시도
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
              alert(
                'Google 로그인은 인앱 브라우저 보안 정책상 제한됩니다.\n\n' +
                  '✔️ 현재 주소가 클립보드에 복사되었습니다.\n' +
                  '✔️ 화면의 [더보기(...)] 버튼을 눌러 **[Safari로 열기]**를 선택하거나, 새 창에 주소를 붙여넣어 주세요.',
              );
            })
            .catch(() => {
              // 복사 실패 시 일반 안내
              alert(
                'Google 로그인은 인앱 브라우저 보안 정책상 제한됩니다.\n\n' +
                  '화면의 [더보기(...)] 버튼을 눌러 **[Safari로 열기]**를 선택해주세요.',
              );
            });
        } else {
          // 클립보드 API가 없을 경우 일반 안내
          alert(
            'Google 로그인은 인앱 브라우저 보안 정책상 제한됩니다.\n\n' +
              '화면의 [더보기(...)] 버튼을 눌러 **[Safari로 열기]**를 선택해주세요.',
          );
        }
        return; // 🔥 경고 후에도 로그인 시도를 막기 위해 Context 로직 실행 중단
      }
    } // 🔥 [수정된 부분] 인앱 브라우저 감지 및 처리 끝 (인앱이 아닐 경우만 아래로 흐름)
    // 👇 기존 로그인 상태 감지 로직 (인앱 브라우저가 아닐 때만 실행됨)
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
  // ... (기존과 동일)

  return (
    <AuthContext.Provider value={{ user, userData, login, logout }}>
            {children}   {' '}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
