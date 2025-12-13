import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase'; // 경로를 맞게 수정하세요

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // 1️⃣ 첫 번째 Effect: 인앱 브라우저 감지 + 로그인 상태 감지
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isInApp =
      userAgent.includes('kakaotalk') ||
      userAgent.includes('instagram') ||
      userAgent.includes('naver');
    const currentUrl = window.location.href;

    if (isInApp) {
      if (userAgent.match(/android/)) {
        // 1. 안드로이드: 크롬으로 강제 전환
        const intentUrl = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return;
      } else if (userAgent.match(/iphone|ipad|ipod/)) {
        // 2. 아이폰(iOS): 안내 페이지로 리다이렉트
        const noticePath = '/open-in-browser';

        if (!currentUrl.includes(noticePath)) {
          // 무한 루프를 막기 위해 현재 URL이 이미 안내 페이지가 아닌 경우에만 리다이렉트
          window.location.href = noticePath;
          return; // 리다이렉트 후 로그인 로직 실행 중단
        }
      }
    }

    // 👇 인앱 브라우저가 아니거나, iOS 인앱 감지 후 안내 페이지인 경우에만 로그인 상태 감지 로직 실행
    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []); // 의존성 배열은 비워둠

  // 2️⃣ 두 번째 Effect: 유저가 있을 때만 DB 데이터 실시간 동기화 (Firestore)
  useEffect(() => {
    let unsubscribeSnapshot;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);

      unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // [일일 초기화 로직] 날짜가 바뀌었으면 카운트 리셋
          const todayStr = new Date().toLocaleDateString('en-CA');

          if (!data.lastLoginDate || data.lastLoginDate !== todayStr) {
            try {
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
    } // Cleanup

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
