import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';
import { useLanguage } from './useLanguageContext';
import { getRomanizedIlju } from '../data/sajuInt';
import { calculateSaju } from '../utils/sajuCalculator';
import { specialPaths } from '../main';

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
  const pathname = window.location.pathname.trim(); // 공백 제거

  // 1️⃣ 일주 이미지 경로 계산
  const iljuImagePath = useMemo(() => {
    // [보안/에러 방지] 함수 초기화 여부와 데이터 존재 여부를 동시에 체크
    if (!userData || !userData.saju || !userData.birthDate || typeof calculateSaju !== 'function') {
      return '/images/ilju/default.png';
    }

    try {
      const data = calculateSaju(
        userData.birthDate,
        userData.gender,
        userData.isTimeUnknown,
        language,
      );

      const safeIlju =
        data?.sky1 && typeof getRomanizedIlju === 'function'
          ? getRomanizedIlju(data.sky1 + data.grd1)
          : 'gapja';

      const safeGender = userData.gender ? userData.gender.toLowerCase() : 'male';
      return `/images/ilju/${safeIlju}_${safeGender}.png`;
    } catch (e) {
      console.error('Ilju image path error:', e);
      return '/images/ilju/default.png';
    }
  }, [userData, language]);

  // 2️⃣ 서비스 이용 상태 계산
  const status = useMemo(() => {
    if (!userData || typeof checkSajuMatch !== 'function')
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
        String(hist.ZNewYear?.year) === nextYear &&
        hist.ZNewYear?.language === language &&
        checkSajuMatch(hist.ZNewYear?.saju, currentSaju)
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
    const isSpecialPage = specialPaths.some((path) => pathname.startsWith(path));
    const isInApp = /kakaotalk|instagram|naver/.test(userAgent);

    if (!isSpecialPage && !!isInApp) {
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

  // 4️⃣ 데이터 실시간 동기화 및 로그인 날짜/신규유저 업데이트
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const todayStr = new Date().toLocaleDateString('en-CA');

    // [A] 실시간 데이터 감시 (순수하게 읽기만 수행하여 무한루프 방지)
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
        setLoadingUser(false);
      },
      (error) => {
        console.error('Firestore Snapshot Error:', error);
        setLoadingUser(false);
      },
    );

    // [B] 로그인 날짜 업데이트 및 초기 데이터 생성 (비동기로 1회 실행)
    const initializeUserData = async () => {
      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // 날짜가 다를 때만 업데이트 (깜빡임 최소화)
          if (data.lastLoginDate !== todayStr) {
            await updateDoc(userDocRef, {
              lastLoginDate: todayStr,
              editCount: 0,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // 신규 유저 초기 생성
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
            birthCity: '',
            isTimeUnknown: false,
            saju: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageHistory: {
              ZNewYear: null,
              ZLastDaily: null,
              ZCookie: null,
              ZApiAnalysis: null,
            },
            question_history: [],
            dailyUsage: {},
          };
          await setDoc(userDocRef, initialData);
        }
      } catch (error) {
        console.error('User Initialization Error:', error);
      }
    };

    initializeUserData();

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
