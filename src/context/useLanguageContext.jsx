import { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const LanguageContext = createContext();

export function LanguageContextProvider({ children }) {
  // 여기서 useLocalStorage로 언어를 관리합니다.
  const [language, setLanguage] = useLocalStorage('userLanguage', 'en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
