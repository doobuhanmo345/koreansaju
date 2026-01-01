import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db } from '../lib/firebase';
import { useLanguage } from './useLanguageContext';
import { getRomanizedIlju } from '../data/sajuInt';
import { calculateSaju } from '../utils/sajuCalculator';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const { language } = useLanguage();
  // 1. 안전하게 변수 계산 (userData가 있을 때만)

  const iljuImagePath = useMemo(() => {
    if (!userData || !userData.saju) return '/images/ilju/default.png'; // 기본값 설정
    const data = calculateSaju(
      userData?.birthDate,
      userData?.gender,
      userData?.isTimeUnknown,
      language,
    );
    const safeIlju = data?.sky1 ? getRomanizedIlju(data?.sky1 + data?.grd1) : 'gapja';

    const safeGender = userData.gender ? userData.gender.toLowerCase() : 'male';

    return `/images/ilju/${safeIlju}_${safeGender}.png`;
  }, [userData]); // userData가 바뀔 때만 다시 계산
  const status = useMemo(() => {
    if (!userData)
      return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };

    const todayStr = new Date().toLocaleDateString('en-CA');
    const nextYear = '2026';
    const gender = userData.gender;

    // 1️⃣ 사주 정보 일치 확인 헬퍼 함수 (필드별 직접 비교)
    const checkSajuMatch = (prevSaju, targetSaju) => {
      if (!prevSaju || !targetSaju) return false;
      const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
      // 인자로 받은 두 객체의 값을 직접 비교
      return sajuKeys.every((k) => prevSaju[k] === targetSaju[k]);
    };

    return {
      isMainDone: !!(
        userData?.usageHistory?.ZApiAnalysis &&
        userData.usageHistory?.ZApiAnalysis.language === language &&
        userData.usageHistory?.ZApiAnalysis.gender === gender &&
        checkSajuMatch(userData.usageHistory?.ZApiAnalysis.saju, userData.saju)
      ),

      isYearDone: !!(
        userData?.usageHistory?.ZLastNewYear &&
        String(userData.usageHistory?.ZLastNewYear.year) === nextYear &&
        userData.usageHistory?.ZLastNewYear.language === language &&
        userData.usageHistory?.ZLastNewYear.gender === gender &&
        checkSajuMatch(userData.usageHistory?.ZLastNewYear.saju, userData.saju)
      ),

      isDailyDone: !!(
        userData?.usageHistory?.ZLastDaily &&
        userData.usageHistory?.ZLastDaily.date === todayStr &&
        userData.usageHistory?.ZLastDaily.gender === gender &&
        checkSajuMatch(userData.usageHistory?.ZLastDaily.saju, userData.saju) &&
        userData.usageHistory?.ZLastDaily.language === language
      ),

      isCookieDone: !!(
        userData?.usageHistory?.ZCookie && userData.usageHistory?.ZCookie.today === todayStr
      ),
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
  // 4️⃣ 두 번째 Effect: 유저 데이터 실시간 동기화 및 초기화 로직
  useEffect(() => {
    let unsubscribeSnapshot;

    const setupUser = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const todayStr = new Date().toLocaleDateString('en-CA');

        try {
          // 1. 우선 데이터를 한 번만 가져와서 리셋이나 생성이 필요한지 확인
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // [일일 리셋 로직] 날짜가 다를 때만 업데이트 (onSnapshot 밖이라서 무한루프 안 생김)
            if (!data.lastLoginDate || data.lastLoginDate !== todayStr) {
              await updateDoc(userDocRef, {
                lastLoginDate: todayStr,
                editCount: 0,
                updatedAt: new Date().toISOString(),
              });
              console.log('Daily reset successful');
            }
          } else {
            // [신규 유저 생성] 요청하신 모든 필드 누락 없이 셋업
            const initialData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '사용자',
              photoURL: user.photoURL || '',
              role: 'user',
              status: 'active',
              editCount: 0,
              lastLoginDate: todayStr,
              gender: 'female', // 기본값
              birthDate: '',
              isTimeUnknown: false,
              saju: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              // 기록용 객체 (절대 누락 금지)
              usageHistory: {
                ZLastNewYear: null,
                lastDailyFortune: null,
                lastWealthFortune: null,
                lastMatchFortune: null,
              },
              question_history: [],
              dailyUsage: {},
            };

            await setDoc(userDocRef, initialData);
            console.log('New user created with full fields');
          }
        } catch (e) {
          console.error('User setup failed:', e);
        }

        // 2. 실시간 동기화 (onSnapshot) - 여기서는 업데이트 로직을 제거하여 깜빡임 방지
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
      } else {
        // 유저 로그아웃 시 데이터 초기화
        setUserData(null);
      }
    };

    setupUser();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [user]); // 오직 로그인 상태(user)가 변할 때만 실행

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
    <AuthContext.Provider
      value={{ user, userData, iljuImagePath, login, logout, updateProfileData, ...status }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
