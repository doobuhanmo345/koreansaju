import useLocalStorage from './useLocalStorage';
import { useEffect } from 'react';

/**
 * 언어 상태(ko/en)를 로컬 스토리지에 저장하고, HTML lang 속성을 설정합니다.
 * 초기값이 로컬 스토리지에 없으면 브라우저 시스템 언어를 따릅니다.
 */
export function useLanguage() {
  // 1. 초기 시스템 언어 감지 로직
  const getInitialLanguage = () => {
    // 1. 선호 언어 배열이 있으면 첫 번째 것을 사용, 없으면 단일 언어 속성 사용
    const systemLang =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages[0]
        : navigator.language || navigator.userLanguage || 'en';

    return systemLang.startsWith('ko') ? 'ko' : 'en';
  };

  // 2. useLocalStorage를 사용하여 상태 관리
  // 'userLanguage' 키에 저장된 값이 없으면 getInitialLanguage()의 결과가 초기값이 됩니다.
  const [language, setLanguage] = useLocalStorage('userLanguage', getInitialLanguage());

  // 3. 언어 상태가 변경될 때마다 HTML lang 속성 업데이트
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return [language, setLanguage];
}
