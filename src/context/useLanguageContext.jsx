import { createContext, useContext } from 'react';
import { useLanguageLogic } from '../hooks/useLanguage'; // 위에서 만든 로직 훅

const LanguageContext = createContext();

export function LanguageContextProvider({ children }) {
  // 전역 상태로 관리될 언어 로직 호출
  const [language, setLanguage] = useLanguageLogic();

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 컴포넌트에서 사용할 전역 훅
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageContextProvider');
  }
  return context;
}
