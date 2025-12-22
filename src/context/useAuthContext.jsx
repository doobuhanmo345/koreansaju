import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // 1️⃣ 첫 번째 Effect: 인앱 브라우저 감지 + 로그인 상태 감지 (기존 유지)
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isInApp =
      userAgent.includes('kakaotalk') ||
      userAgent.includes('instagram') ||
      userAgent.includes('naver');
    const currentUrl = window.location.href;

    if (isInApp) {
      if (userAgent.match(/android/)) {
        const intentUrl = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return;
      } else if (userAgent.match(/iphone|ipad|ipod/)) {
        const noticePath = '/open-in-browser';
        if (!currentUrl.includes(noticePath)) {
          window.location.href = noticePath;
          return;
        }
      }
    }

    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2️⃣ 두 번째 Effect: 유저 데이터 실시간 동기화 및 초기화 로직
  useEffect(() => {
    let unsubscribeSnapshot;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);

      unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

        if (docSnap.exists()) {
          const data = docSnap.data();

          // [일일 초기화 로직] 날짜가 바뀌었으면 카운트 리셋
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
            setUserData(data);
          }
        } else {
          // [신규 유저 생성] 문서가 없으면 기본 데이터셋 생성
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user', // ✅ 추가
            status: 'active', // ✅ 추가 (차단/승인용)
            editCount: 0,
            lastLoginDate: todayStr,
            gender: 'female',
            birthDate: '',
            birthTime: '',
            createdAt: new Date().toISOString(),
          };

          await setDoc(userDocRef, initialData);
          setUserData(initialData);
        }
      });
    } else {
      setUserData(null);
    }

    return () => {
      if (typeof unsubscribeSnapshot === 'function') unsubscribeSnapshot();
    };
  }, [user]);

  // 3️⃣ 프로필 정보 업데이트 함수 추가 (EditProfile에서 호출)
  const updateProfileData = async (newData) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, newData);
      // onSnapshot이 실시간으로 감지하므로 setUserData를 직접 할 필요는 없음
    } catch (e) {
      console.error('Update profile failed:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, login, logout, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
