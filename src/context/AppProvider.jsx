import { ThemeContextProvider } from './useThemeContext';
import { LanguageContextProvider } from './useLanguageContext';

// AppProvider는 단순히 "설정(Provider)"들을 감싸주는 역할만 합니다.
// ❌ 절대 여기서 useTheme()이나 useLanguage()를 호출하지 마세요!
export function AppProvider({ children }) {
  return (
    <LanguageContextProvider>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </LanguageContextProvider>
  );
}
