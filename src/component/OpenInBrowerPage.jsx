// OpenInBrowserPage.jsx

import React from 'react';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
  textAlign: 'center',
  backgroundColor: '#f8f8f8',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  maxWidth: '400px',
  width: '100%',
};

const warningStyle = {
  color: '#e74c3c',
  fontSize: '24px',
  marginBottom: '15px',
};

const instructionStyle = {
  marginTop: '20px',
  textAlign: 'left',
  lineHeight: '1.6',
};

const highlightStyle = {
  fontWeight: 'bold',
  color: '#2980b9',
};

export default function OpenInBrowserPage() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={warningStyle}>🚨 잠시 멈춰주세요! 🚨</div>
        <h2>외부 브라우저 열기 유도</h2>

        <p>
          Google 로그인 및 데이터 보안을 위해, 현재 페이지를 **인앱 브라우저**가 아닌 외부
          브라우저(Safari/Chrome)에서 열어주세요.
        </p>

        <div style={instructionStyle}>
          <p>
            <span style={highlightStyle}>✅ 아이폰(iOS) 사용자 행동 요약:</span>
          </p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>
              <span style={highlightStyle}>현재 화면의 오른쪽 상단</span> 또는 **하단**을
              확인합니다.
            </li>
            <li>**점 세 개 (...)** 아이콘 또는 **공유 아이콘**을 클릭합니다.</li>
            <li>
              나타나는 메뉴에서 <span style={highlightStyle}>**[Safari로 열기]**</span> 또는
              **[Chrome으로 열기]**를 선택합니다.
            </li>
          </ol>
        </div>

        <p style={{ marginTop: '30px', fontSize: '14px', color: '#7f8c8d' }}>
          **이 작업은 고객님의 안전한 서비스 이용을 위해 필수입니다.**
        </p>

        {/* iOS에서는 버튼으로 외부 브라우저를 강제 실행할 수 없으므로, 시각적 안내에 집중합니다. */}
      </div>
    </div>
  );
}
