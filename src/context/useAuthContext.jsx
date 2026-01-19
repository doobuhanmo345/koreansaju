import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';
import { useLanguage } from './useLanguageContext';
import { getRomanizedIlju } from '../data/sajuInt';
import { calculateSaju } from '../utils/sajuCalculator';

const AuthContext = createContext();

// 헬퍼 함수: 사주 데이터 비교 (컴포넌트 외부로 빼서 성능 최적화)
const checkSajuMatch = (prevSaju, targetSaju) => {
  if (!prevSaju || !targetSaju) return false;
  const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
  return sajuKeys.every((k) => prevSaju[k] === targetSaju[k]);
};

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { language } = useLanguage();

  // 1️⃣ 일주 이미지 경로 계산
  const iljuImagePath = useMemo(() => {
    if (!userData || !userData.saju || !userData.birthDate) return '/images/ilju/default.png';
    try {
      const data = calculateSaju(
        userData.birthDate,
        userData.gender,
        userData.isTimeUnknown,
        language,
      );
      const safeIlju = data?.sky1 ? getRomanizedIlju(data.sky1 + data.grd1) : 'gapja';
      const safeGender = userData.gender ? userData.gender.toLowerCase() : 'male';
      return `/images/ilju/${safeIlju}_${safeGender}.png`;
    } catch (e) {
      return '/images/ilju/default.png';
    }
  }, [userData, language]);

  // 2️⃣ 서비스 이용 상태 계산 (이전 코드의 중복 로직 제거)
  const status = useMemo(() => {
    if (!userData)
      return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };

    const todayStr = new Date().toLocaleDateString('en-CA');
    const nextYear = '2027';
    const gender = userData.gender;
    const currentSaju = userData.saju;
    const hist = userData.usageHistory || {};

    return {
      isMainDone: !!(
        hist.ZApiAnalysis?.language === language &&
        hist.ZApiAnalysis?.gender === gender &&
        checkSajuMatch(hist.ZApiAnalysis?.saju, currentSaju)
      ),
      isYearDone: !!(
        String(hist.ZLastNewYear?.year) === nextYear &&
        hist.ZLastNewYear?.language === language &&
        checkSajuMatch(hist.ZLastNewYear?.saju, currentSaju)
      ),
      isDailyDone: !!(
        hist.ZLastDaily?.date === todayStr &&
        hist.ZLastDaily?.language === language &&
        checkSajuMatch(hist.ZLastDaily?.saju, currentSaju)
      ),
      isCookieDone: !!(hist.ZCookie?.today === todayStr),
    };
  }, [userData, language]);

  // 3️⃣ 인앱 브라우저 체크 및 로그인 감시
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAdPage = window.location.pathname.startsWith('/ad');
    const isInApp = /kakaotalk|instagram|naver/.test(userAgent);

    if (isInApp && !isAdPage) {
      const currentUrl = window.location.href;
      if (/android/.test(userAgent)) {
        window.location.href = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        return;
      } else if (/iphone|ipad|ipod/.test(userAgent) && !currentUrl.includes('/open-in-browser')) {
        window.location.href = '/open-in-browser';
        return;
      }
    }

    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) setLoadingUser(false);
    });
    return () => unsubscribe?.();
  }, []);

  // 4️⃣ 데이터 실시간 동기화 (가장 큰 병목 해결)
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const todayStr = new Date().toLocaleDateString('en-CA');

    // [최적화] 즉시 Snapshot 연결하여 로딩 제거
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setLoadingUser(false);

          // 백그라운드에서 조용히 리셋 업데이트 (화면 로딩 방해 안 함)
          if (data.lastLoginDate !== todayStr) {
            updateDoc(userDocRef, {
              lastLoginDate: todayStr,
              editCount: 0,
              updatedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        } else {
          // 신규 유저 생성
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '사용자',
            photoURL: user.photoURL || '',
            role: 'user',
            status: 'active',
            editCount: 0,
            lastLoginDate: todayStr,
            gender: 'female',
            birthDate: '',
            isTimeUnknown: false,
            saju: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageHistory: {
              ZLastNewYear: null,
              ZLastDaily: null,
              ZCookie: null,
              ZApiAnalysis: null,
            },
            question_history: [],
            dailyUsage: {},
          };
          await setDoc(userDocRef, initialData);
          setLoadingUser(false);
        }
      },
      (error) => {
        console.error(error);
        setLoadingUser(false);
      },
    );

    return () => unsubscribeSnapshot?.();
  }, [user]);

  const updateProfileData = async (newData) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { ...newData, updatedAt: new Date().toISOString() });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loadingUser,
        iljuImagePath,
        login,
        logout,
        updateProfileData,
        ...status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
