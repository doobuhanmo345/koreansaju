import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // 1️⃣ [전역 상태 계산] 사주 정보가 일치하는지 확인하는 헬퍼 함수
  const checkSajuMatch = (prevSaju, currentSaju) => {
    if (!prevSaju || !currentSaju) return false;
    return JSON.stringify(prevSaju) === JSON.stringify(currentSaju);
  };

  // 2️⃣ [전역 상태 계산] 각 운세 서비스의 완료 여부를 실시간으로 계산
  const status = useMemo(() => {
    if (!userData)
      return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };

    const todayStr = new Date().toLocaleDateString('en-CA');
    const nextYear = '2025'; // 2025년 을사년 기준 (필요시 2026으로 수정)
    const language = userData.language || 'ko';
    const gender = userData.gender;

    // 현재 유저의 최신 사주 정보 (ZApiAnalysis 등에 저장된 사주와 비교용)
    const currentSaju = userData.saju || null;

    return {
      isMainDone: !!(
        userData?.ZApiAnalysis &&
        userData.ZApiAnalysis.language === language &&
        userData.ZApiAnalysis.gender === gender &&
        checkSajuMatch(userData.ZApiAnalysis.saju, currentSaju)
      ),

      isYearDone: !!(
        userData?.ZLastNewYear &&
        String(userData.ZLastNewYear.year) === nextYear &&
        userData.ZLastNewYear.language === language &&
        userData.ZLastNewYear.gender === gender &&
        checkSajuMatch(userData.ZLastNewYear.saju, currentSaju)
      ),

      isDailyDone: !!(
        userData?.ZLastDaily &&
        userData.ZLastDaily.date === todayStr &&
        userData.ZLastDaily.language === language &&
        userData.ZLastDaily.gender === gender &&
        checkSajuMatch(userData.ZLastDaily.saju, currentSaju)
      ),

      isCookieDone: !!(userData?.ZCookie && userData.ZCookie.today === todayStr),
    };
  }, [userData]);

  // 3️⃣ 첫 번째 Effect: 인앱 브라우저 감지 + 로그인 상태 감지
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

  // 4️⃣ 두 번째 Effect: 유저 데이터 실시간 동기화 및 초기화 로직
  useEffect(() => {
    let unsubscribeSnapshot;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);

      unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
        const todayStr = new Date().toLocaleDateString('en-CA');

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
            role: 'user',
            status: 'active',
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

  // 5️⃣ 프로필 정보 업데이트 함수
  const updateProfileData = async (newData) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, newData);
    } catch (e) {
      console.error('Update profile failed:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, login, logout, updateProfileData, ...status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
