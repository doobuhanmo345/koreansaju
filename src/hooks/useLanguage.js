import useLocalStorage from './useLocalStorage';
import { useEffect } from 'react';

/**
 * 언어 상태(ko/en)를 로컬 스토리지에 저장하고, HTML lang 속성을 설정합니다.
 * 초기값이 로컬 스토리지에 없으면 브라우저 시스템 언어를 따릅니다.
 */
export function useLanguage() {
  // 1. 초기 시스템 언어 감지 로직
  const getInitialLanguage = () => {
    // 브라우저 설정 언어 확인 (기본값 'ko')
    const systemLang = navigator.language || navigator.userLanguage || 'ko';

    // 언어 코드가 'ko'로 시작하면 'ko', 아니면 'en'으로 설정 (원하는 언어 범위를 지정하세요)
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
