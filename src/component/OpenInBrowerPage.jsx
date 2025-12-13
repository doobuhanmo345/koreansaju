import React, { useState } from 'react';
import { IoShareOutline } from 'react-icons/io5';

// --- 스타일 정의 (이전 스타일 유지) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f2f2f7',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '400px',
    width: '100%',
    overflow: 'hidden',
  },
  headerBlock: {
    backgroundColor: '#f0f0f5',
    padding: '15px 30px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e0e0',
  },
  headerText: {
    color: '#555555',
    fontSize: '14px',
    margin: 0,
    fontWeight: 'normal',
  },
  contentArea: {
    padding: '30px',
  },
  notice: {
    color: '#007aff',
    fontSize: '20px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  button: {
    marginTop: '25px',
    padding: '14px 25px',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#007aff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 10px rgba(0, 122, 255, 0.3)',
  },
  instructionBlock: {
    marginTop: '35px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    textAlign: 'left',
    lineHeight: '1.6',
    border: '1px solid #eee',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#343a40',
    whiteSpace: 'nowrap',
  },
  langSelector: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#007aff',
  },
  shareIcon: {
    verticalAlign: 'middle',
    marginLeft: '5px',
    marginRight: '5px',
    fontSize: '1.1em',
    color: '#007aff',
  },
};

// --- 다국어 콘텐츠 정의 (괄호 제거 및 문구 수정) ---
const messages = {
  ko: {
    metaNotice: '안전한 사용 환경을 위한 안내',
    noticeTitle: '💡 외부 브라우저 사용 안내',
    mainTitle: '크롬/사파리로 이용해 주세요',
    mainText:
      'Google 로그인 기능은 현재 인앱 브라우저에서 불안정합니다. 원활한 접속을 위해 Safari 또는 Chrome으로 이동해 주세요.',
    buttonText: '외부 브라우저에서 계속 진행',
    failTitle: '자동 전환 실패 시 (iOS 사용자):',
    // 괄호 제거
    step1: '1. 화면 우측 하단의 [공유 아이콘]을 눌러주세요.',
    step2: '2. 열린 메뉴에서 [Safari로 열기]를 선택해 주세요.',
    openInSafari: 'Safari로 열기',
    alertFail:
      "자동 전환이 실패했습니다. 화면 하단의 메뉴를 눌러 'Safari로 열기'를 직접 선택해주세요。",
  },
  en: {
    metaNotice: 'Notice for Secure Usage Environment',
    noticeTitle: '💡 External Browser Required',
    mainTitle: 'Redirecting for Service Access',
    mainText:
      'Google Sign-in is unstable in this in-app browser. Please proceed in Safari or Chrome for smooth access.',
    buttonText: 'Continue in External Browser',
    failTitle: 'If Auto-Switch Fails (iOS Users):',
    // 괄호 제거
    step1: '1. Please tap the [Share Icon] located at the bottom right.',
    step2: '2. Select [Open in Safari] from the opened menu.',
    openInSafari: 'Open in Safari',
    alertFail:
      "Automatic switch failed. Please manually select 'Open in Safari' from the menu at the bottom of your screen.",
  },
};

// HighlightedText 헬퍼 컴포넌트는 유지 (Safari로 열기 처리)
function HighlightedText({ text, highlight, style }) {
  if (!text || !text.includes(`[${highlight}]`)) return <span>{text}</span>;

  const parts = text.split(`[${highlight}]`);
  return (
    <span>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && <span style={style}>[{highlight}]</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

// React 아이콘을 텍스트에 삽입하기 위한 헬퍼 컴포넌트 (줄바꿈 안정화)
function IconInText({ text, iconComponent, iconStyle, lang }) {
  // 텍스트를 '아이콘 이전'과 '아이콘 이후'로 나누는 태그를 결정 (괄호 포함)
  const searchTag = lang === 'ko' ? '[공유 아이콘]' : '[Share Icon]';

  const [before, after] = text.split(searchTag);

  if (!after) return <span>{text}</span>;

  const Icon = iconComponent;
  const highlightText = lang === 'ko' ? '공유 아이콘' : 'Share Icon';

  // 텍스트 앞뒤의 공백을 살리고, 아이콘 주변 텍스트를 nowrap으로 감싸 줄바꿈 방지
  return (
    <span>
      {before}
      <span style={{ whiteSpace: 'nowrap' }}>
        <span style={{ display: 'flex' }}>
          <span style={{ display: 'flex', fontWeight: 'bold' }}>
            {highlightText}
            <Icon style={iconStyle} />
          </span>

          {after}
        </span>
      </span>
    </span>
  );
}

export default function OpenInBrowserPage() {
  const [lang, setLang] = useState('ko');
  const t = messages[lang];

  const handleOpenExternal = () => {
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;

    setTimeout(() => {
      alert(t.alertFail);
    }, 1000);
  };

  const toggleLang = () => {
    setLang((currentLang) => (currentLang === 'ko' ? 'en' : 'ko'));
  };

  return (
    <div style={styles.container}>
      {/* 언어 선택 토글 */}
      <div style={styles.langSelector} onClick={toggleLang}>
        {lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
      </div>

      <div style={styles.card}>
        {/* 1. 헤더 블록 */}
        <div style={styles.headerBlock}>
          <p style={styles.headerText}>🛡️ {t.metaNotice}</p>
        </div>

        <div style={styles.contentArea}>
          {/* 2. 메인 안내 제목 */}
          <div style={styles.notice}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            {t.noticeTitle}
          </div>

          <h2 style={{ fontSize: '24px', margin: '5px 0 20px 0' }}>{t.mainTitle}</h2>

          <p style={{ marginBottom: '30px', color: '#555555' }}>{t.mainText}</p>

          {/* 3. 자동 전환 시도 버튼 */}
          <button onClick={handleOpenExternal} style={styles.button}>
            {t.buttonText}
          </button>

          {/* 4. 수동 전환 안내 블록 */}
          <div style={styles.instructionBlock}>
            <p style={{ fontWeight: 'bold' }}>{t.failTitle}</p>

            <ol style={{ paddingLeft: '20px', margin: '10px 0 0' }}>
              {/* 첫 번째 단계 (아이콘 포함) */}
              <li style={{ marginBottom: '5px' }}>
                <IconInText
                  text={t.step1}
                  iconComponent={IoShareOutline}
                  iconStyle={styles.shareIcon}
                  lang={lang}
                />
              </li>
              {/* 두 번째 단계 (Safari 열기) */}
              <li>
                <HighlightedText
                  text={t.step2}
                  highlight={t.openInSafari}
                  style={styles.highlight}
                />
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
