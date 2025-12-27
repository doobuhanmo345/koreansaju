import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지가 바뀔 때마다 스크롤을 (0, 0) 위치로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
