import React, { useState } from 'react';
import { IoShareOutline } from 'react-icons/io5';
import sajaProfile from '../assets/sajaProfile.png';
// --- 스타일 정의 ---
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
  // 👇 말풍선 관련 스타일 👇
  speechBubbleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
  },
  characterImage: {
    width: '80px', // 캐릭터 이미지 크기
    height: '80px',
    borderRadius: '50%', // 원형 이미지
    objectFit: 'cover',
    border: '2px solid #ddd',
    marginTop: '20px',
  },
  speechBubble: {
    position: 'relative',
    backgroundColor: '#e9f7ff', // 말풍선 배경색
    borderRadius: '15px',
    padding: '15px 20px',
    maxWidth: '85%',
    textAlign: 'center',
    color: '#333',
    fontSize: '16px',
    lineHeight: '1.4',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: '-10px', // 말풍선 이미지 아래쪽에 위치
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid #e9f7ff', // 말풍선 배경색과 동일하게
  },
  // 👆 말풍선 관련 스타일 끝 👆
};

// --- 다국어 콘텐츠 정의 ---
const messages = {
  ko: {
    metaNotice: '안전한 사용 환경을 위한 안내',
    noticeTitle: '외부 브라우저 사용 안내',
    mainTitle: '서비스 이용을 위해 이동합니다', // 이 부분은 이제 캐릭터 말풍선으로 대체되므로 사용하지 않을 수 있음
    mainText: '원활한 서비스 이용을 위해 외부 브라우저(Safari/Chrome)로 이동해주세요!', // 말풍선 내용
    buttonText: '외부 브라우저에서 계속 진행',
    failTitle: '자동 전환 실패 시 (iOS 사용자):',
    step1: '1. 화면 우측 하단의 [공유 아이콘]을 눌러주세요.',
    step2: '2. 열린 메뉴에서 [Safari로 열기]를 선택해 주세요.',
    openInSafari: 'Safari로 열기',
    alertFail:
      "자동 전환이 실패했습니다. 화면 하단의 메뉴를 눌러 'Safari로 열기'를 직접 선택해주세요。",
    characterName: '안내 캐릭터', // 캐릭터 이름 (선택 사항)
    characterImageSrc: 'https://via.placeholder.com/80/007aff/FFFFFF?text=Char', // 🚨 실제 캐릭터 이미지 경로로 교체해주세요
  },
  en: {
    metaNotice: 'Notice for Secure Usage Environment',
    noticeTitle: 'External Browser Required',
    mainTitle: 'Redirecting for Service Access', // 이 부분은 이제 캐릭터 말풍선으로 대체되므로 사용하지 않을 수 있음
    mainText: 'Please switch to an external browser (Safari/Chrome) for smooth service!', // 말풍선 내용
    buttonText: 'Continue in External Browser',
    failTitle: 'If Auto-Switch Fails (iOS Users):',
    step1: '1. Please tap the [Share Icon] located at the bottom right.',
    step2: '2. Select [Open in Safari] from the opened menu.',
    openInSafari: 'Open in Safari',
    alertFail:
      "Automatic switch failed. Please manually select 'Open in Safari' from the menu at the bottom of your screen.",
    characterName: 'Guide Character', // 캐릭터 이름 (선택 사항)
    characterImageSrc: 'https://via.placeholder.com/80/007aff/FFFFFF?text=Char', // 🚨 실제 캐릭터 이미지 경로로 교체해주세요
  },
};

// HighlightedText 헬퍼 컴포넌트 (Safari로 열기 처리)
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
  const searchTag = lang === 'ko' ? '[공유 아이콘]' : '[Share Icon]';

  const [before, after] = text.split(searchTag);

  if (!after) return <span>{text}</span>;

  const Icon = iconComponent;
  const highlightText = lang === 'ko' ? '공유 아이콘' : 'Share Icon';

  return (
    <span>
      {before}
      <span
        style={{
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        {highlightText}
        <Icon style={iconStyle} />
      </span>
      {after}
    </span>
  );
}

export default function OpenInBrowserPage() {
  const [lang, setLang] = useState('en');
  const t = messages[lang];

  const handleOpenExternal = () => {
    const baseUrl = window.location.origin;
    const encodedUrl = encodeURIComponent(baseUrl);
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
          {/* 2. 메인 안내 제목 (말풍선으로 대체) */}
          {/* 기존 h2 태그는 주석 처리하거나 삭제합니다. */}
          {/* <h2 style={{ fontSize: '24px', margin: '5px 0 20px 0' }}>{t.mainTitle}</h2> */}

          {/* 👇 캐릭터 말풍선 섹션 👇 */}
          <div style={styles.speechBubbleContainer}>
            <div style={styles.speechBubble}>
              {t.mainText}
              <div style={styles.speechBubbleTail}></div>
            </div>
            <img src={sajaProfile} alt="Master" style={styles.characterImage} />
          </div>
          {/* 👆 캐릭터 말풍선 섹션 끝 👆 */}

          {/* 기존 p 태그는 제거하거나 주석 처리합니다. */}
          {/* <p style={{ marginBottom: '10px', color: '#555555' }}>{t.mainText}</p> */}

          {/* 3. 자동 전환 시도 버튼 */}
          <button onClick={handleOpenExternal} style={styles.button}>
            {t.buttonText}
          </button>

          {/* 4. 수동 전환 안내 블록 */}
          <div style={styles.instructionBlock}>
            <p style={{ fontWeight: 'bold' }}>{t.failTitle}</p>

            <ol style={{ paddingLeft: '5px', margin: '10px 0 0' }}>
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
