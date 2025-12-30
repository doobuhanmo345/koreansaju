import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

export default function AdminRoute({ children }) {
  const { user, userData } = useAuthContext();

  // 🔹 아직 로그인 상태 로딩 중
  if (!user || !userData) {
    return null; // 또는 로딩 스피너
  }

  // 🔹 관리자 아님 → 접근 차단
  if (userData.role !== 'admin' && userData.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  // 🔹 관리자 통과
  return children;
}
