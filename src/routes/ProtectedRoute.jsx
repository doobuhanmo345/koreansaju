import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { userData, user } = useAuthContext();

  // 로그인 로딩 중일 때 처리
  if (user === undefined) return <div>Loading...</div>;

  // 로그인 안 되어 있으면 로그인 페이지로
  if (!user) return <Navigate to="/login" replace />;

  // 권한 체크 (userData가 로드된 후)
  if (userData && allowedRoles && !allowedRoles.includes(userData.role)) {
    alert('접근 권한이 없습니다.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
