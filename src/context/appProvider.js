// src/context/AppProvider.js

import React, { createContext, useContext } from 'react';
import { useTheme } from './useThemeContext';
import { useLanguage } from '../hooks/useLanguage';

// 필요한 다른 훅들도 여기에 임포트합니다.

// 1. Context 객체 생성 (초기값은 null 또는 기본값)
const AppContext = createContext(null);

// 2. Provider 컴포넌트 정의
export function AppProvider({ children }) {
  // 훅을 호출하여 상태와 Setter 함수를 가져옵니다.
  const [theme, setTheme] = useTheme();
  const [language, setLanguage] = useLanguage();

  // 모든 전역 상태를 하나의 객체로 묶습니다.
  const contextValue = {
    theme,
    setTheme,
    language,
    setLanguage,
    // 여기에 user, setUser 등 다른 전역 상태를 추가할 수 있습니다.
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// 3. Custom Hook을 사용하여 Context 값을 쉽게 사용하는 함수 생성
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
