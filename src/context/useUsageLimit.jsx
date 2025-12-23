import { useState, useEffect, useMemo } from 'react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UI_TEXT } from '../data/constants';

export const useUsageLimit = (user, userData, language) => {
  const [editCount, setEditCount] = useState(0);

  // 1. user.uid가 변경될 때만 다시 계산하도록 수정
  const MAX_EDIT_COUNT = useMemo(() => {
    // [디버깅용] 이 로그가 콘솔에 찍히는지 확인해주세요.
    // console.log("🔍 Limit Check - UID:", user?.uid);

    // user가 없으면 기본값 3
    if (userData?.role === 'admin') return 10;

    if (!user || !user.uid) return 3;

    return 3;
  }, [user?.uid, userData]); // 👈 핵심: user 객체 대신 uid 문자열을 감지

  const isLocked = editCount >= MAX_EDIT_COUNT;

  // 초기 데이터 동기화
  useEffect(() => {
    if (user && userData) {
      setEditCount(userData.editCount || 0);
    } else {
      setEditCount(0);
    }
  }, [user, userData]);

  const incrementUsage = async (additionalData = {}) => {
    if (!user) return;

    const newCount = editCount + 1;
    const todayDate = new Date().toLocaleDateString('en-CA');

    const baseData = {
      editCount: newCount,
      lastEditDate: todayDate,
      dailyUsage: {
        [todayDate]: increment(1),
      },
    };

    await setDoc(doc(db, 'users', user.uid), { ...baseData, ...additionalData }, { merge: true });

    setEditCount(newCount);
    return newCount;
  };

  const checkLimit = () => {
    if (isLocked) {
      alert(UI_TEXT.limitReached[language]);
      return false;
    }
    return true;
  };

  return {
    editCount,
    setEditCount,
    MAX_EDIT_COUNT,
    isLocked,
    incrementUsage,
    checkLimit,
  };
};
