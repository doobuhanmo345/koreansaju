import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';
import { useLanguage } from './useLanguageContext';
import { getRomanizedIlju } from '../data/sajuInt';
import { calculateSaju } from '../utils/sajuCalculator';
import { DateService } from '../utils/dateService';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { language } = useLanguage();

  // 1️⃣ 사주 기반 이미지 경로 계산 (Memoization)
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
      console.error('Image Path calculation error:', e);
      return '/images/ilju/default.png';
    }
  }, [userData, language]);

  // 2️⃣ 사용자의 서비스 이용 상태 계산 (Memoization)
  const status = useMemo(() => {
    if (!userData)
      return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };

    const todayStr = new Date().toLocaleDateString('en-CA');
    const nextYear = '2027';
    const gender = userData.gender;
    const currentSaju = userData.saju;

    const checkSajuMatch = (historySaju, userSaju) => {
      if (!historySaju || !userSaju) return false;
      const keys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
      return keys.every((k) => historySaju[k] === userSaju[k]);
    };

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

  // 3️⃣ 인앱 브라우저 체크 및 유저 상태 감시
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAdPage = window.location.pathname.startsWith('/ad');
    const isInApp = /kakaotalk|instagram|naver/.test(userAgent);
    const currentUrl = window.location.href;

    if (isInApp && !isAdPage) {
      if (/android/.test(userAgent)) {
        window.location.href = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        return;
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        if (!currentUrl.includes('/open-in-browser')) {
          window.location.href = '/open-in-browser';
          return;
        }
      }
    }

    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoadingUser(false);
      }
    });

    return () => unsubscribe?.();
  }, []);

  // 4️⃣ 유저 데이터 실시간 동기화 및 자동 업데이트 로직 (핵심 최적화)
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    // [병목 제거] 실시간 리스너를 먼저 연결하여 UI를 즉시 띄움
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setLoadingUser(false);

          // 백그라운드 로직: 오늘 날짜 리셋이 필요한 경우에만 조용히 업데이트
          const todayStr = new Date().toLocaleDateString('en-CA');
          if (data.lastLoginDate !== todayStr) {
            updateDoc(userDocRef, {
              lastLoginDate: todayStr,
              editCount: 0,
              updatedAt: new Date().toISOString(),
            }).catch((err) => console.error('Daily Reset Error:', err));
          }
        } else {
          // 신규 유저 생성 (한 번만 실행됨)
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '사용자',
            photoURL: user.photoURL || '',
            role: 'user',
            status: 'active',
            editCount: 0,
            lastLoginDate: new Date().toLocaleDateString('en-CA'),
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
        console.error('Firestore Snapshot Error:', error);
        setLoadingUser(false);
      },
    );

    return () => unsubscribeSnapshot?.();
  }, [user]);

  // 5️⃣ 프로필 업데이트 헬퍼
  const updateProfileData = async (newData) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { ...newData, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error('Update profile failed:', e);
      throw e;
    }
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
