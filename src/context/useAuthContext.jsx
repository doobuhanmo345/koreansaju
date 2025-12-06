import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
// 👇 경로 확인: firebase 파일 위치에 맞춰 점 개수(.. 또는 .) 조정하세요
import { login, logout, onUserStateChange, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // 1️⃣ 첫 번째 Effect: 로그인 상태 감지 (User Auth)
  useEffect(() => {
    // onUserStateChange가 unsubscribe 함수를 반환하지 않을 수도 있으므로 변수에 담음
    const unsubscribe = onUserStateChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => {
      // 🟢 안전장치: unsubscribe가 진짜 '함수'일 때만 실행 (에러 해결 핵심)
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
              // DB 업데이트 -> 이게 완료되면 다시 onSnapshot이 실행됨
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

    // Cleanup: 유저가 바뀌거나 컴포넌트 해제될 때 DB 구독 취소
    return () => {
      if (typeof unsubscribeSnapshot === 'function') {
        unsubscribeSnapshot();
      }
    };
  }, [user]); // 👈 user 상태가 변할 때마다 실행됨

  return (
    <AuthContext.Provider value={{ user, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
