import { ThemeContextProvider } from './useThemeContext';
import { LanguageContextProvider } from './useLanguageContext';
export function AppProvider({ children }) {
  return (
    <LanguageContextProvider>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </LanguageContextProvider>
  );
}
