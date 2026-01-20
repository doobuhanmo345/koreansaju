import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { log } from 'firebase/firestore/pipelines';

export function useLanguageLogic() {
  console.log(localStorage.getItem('userLanguage'));
  const determineDefaultLanguage = () => {
    try {
      const savedRaw = localStorage.getItem('userLanguage');
      if (savedRaw) {
        const saved = savedRaw.replace(/"/g, '');
        if (saved === 'ko' || saved === 'en') return saved;
      }

      const browserLang = (
        navigator.languages && navigator.languages.length > 0
          ? navigator.languages[0]
          : navigator.language || 'en'
      ).toLowerCase();

      return browserLang.startsWith('ko') ? 'ko' : 'en';
    } catch (e) {
      return 'en';
    }
  };

  const [language, setLanguage] = useLocalStorage('userLanguage', determineDefaultLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return [language, setLanguage];
}
