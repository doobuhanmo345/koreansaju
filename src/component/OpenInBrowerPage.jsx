import React from 'react';
import { IoShareOutline } from 'react-icons/io5';
import sajaProfile from '../assets/sajaProfile.png';
import { useLanguage } from '../context/useLanguageContext';

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
    marginTop: '20px',
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
  // 🚀 [수정] 언어 선택 버튼을 훨씬 더 눈에 띄게 변경
  langSelector: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    fontSize: '15px',
    fontWeight: '900', // 아주 두껍게
    cursor: 'pointer',
    color: '#ffffff', // 흰색 글자
    backgroundColor: '#007aff', // 파란색 배경 (강조)
    padding: '10px 20px',
    borderRadius: '50px',
    boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)', // 강한 파란색 그림자
    border: '2px solid #ffffff', // 흰색 테두리로 가독성 확보
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
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
  shareIcon: {
    verticalAlign: 'middle',
    marginLeft: '5px',
    marginRight: '5px',
    fontSize: '1.1em',
    color: '#007aff',
  },
  speechBubbleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
  },
  characterImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #ddd',
    marginTop: '20px',
  },
  speechBubble: {
    position: 'relative',
    backgroundColor: '#e9f7ff',
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
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid #e9f7ff',
  },
};

const messages = {
  ko: {
    metaNotice: '안전한 사용 환경을 위한 안내',
    noticeTitle: '외부 브라우저 사용 안내',
    mainText: '원활한 서비스 이용을 위해 외부 브라우저(Safari/Chrome)로 이동해주세요!',
    buttonText: '외부 브라우저에서 계속 진행',
    failTitle: '자동 전환 실패 시 (iOS 사용자):',
    step1: '1. 화면 우측 하단의 [공유 아이콘]을 눌러주세요.',
    step2: '2. 열린 메뉴에서 [Safari로 열기]를 선택해 주세요.',
    openInSafari: 'Safari로 열기',
    alertFail:
      "자동 전환이 실패했습니다. 화면 하단의 메뉴를 눌러 'Safari로 열기'를 직접 선택해주세요。",
    langToggle: 'Switch to English',
  },
  en: {
    metaNotice: 'Notice for Secure Usage Environment',
    noticeTitle: 'External Browser Required',
    mainText: 'Please switch to an external browser (Safari/Chrome) for smooth service!',
    buttonText: 'Continue in External Browser',
    failTitle: 'If Auto-Switch Fails (iOS Users):',
    step1: '1. Please tap the [Share Icon] located at the bottom right.',
    step2: '2. Select [Open in Safari] from the opened menu.',
    openInSafari: 'Open in Safari',
    alertFail:
      "Automatic switch failed. Please manually select 'Open in Safari' from the menu at the bottom of your screen.",
    langToggle: '한국어로 전환',
  },
};

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
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = messages[lang];

  const handleOpenExternal = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const hostUrl = window.location.origin;
    const encodedUrl = encodeURIComponent(hostUrl);

    // 1. 안드로이드 (인스타/페이스북 유입의 50~60%)
    // 이건 무조건 됩니다. 클릭하면 크롬으로 바로 쏴버립니다.
    if (userAgent.includes('android')) {
      const intentUrl = `intent://${hostUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    }

    // 2. 카카오톡 (이미 검증됨)
    if (userAgent.includes('kakaotalk')) {
      window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;
      return;
    }

    // 3. 아이폰 (인스타/페이스북 유입의 나머지 절반)
    // 애플이 막아놔서 원클릭은 죽어도 안 됩니다.
    // 대신 버튼 누르면 "아래 메뉴 눌러라"라고 경고창을 아주 자극적으로 띄워야 합니다.
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      const guide = document.getElementById('ios-guide');
      if (guide) {
        guide.scrollIntoView({ behavior: 'smooth' });
        guide.style.border = '5px solid #ff3b30'; // 빨간색 왕테두리
        guide.style.backgroundColor = '#fff0f0';
      }

      // 유저가 무시 못 하게 알림을 아주 강하게 띄웁니다.
      alert(
        lang === 'ko'
          ? '⚠️ [중요] 아이폰은 시스템 보안상 자동 이동이 안 됩니다!\n\n화면 하단 [공유] -> [Safari로 열기]를 눌러야 사주를 볼 수 있어요!'
          : "⚠️ [Action Required] iPhone security blocks auto-redirect.\n\nTap 'Share' -> 'Open in Safari' at the bottom to continue!",
      );
    }
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <div style={styles.container}>
      {/* 🌟 시각적으로 크게 강조된 언어 선택 버튼 🌟 */}
      <button
        style={styles.langSelector}
        onClick={toggleLang}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: '18px' }}>🌐</span>
        {t.langToggle}
      </button>

      <div style={styles.card}>
        <div style={styles.headerBlock}>
          <p style={styles.headerText}>🛡️ {t.metaNotice}</p>
        </div>

        <div style={styles.contentArea}>
          <div style={styles.speechBubbleContainer}>
            <div style={styles.speechBubble}>
              {t.mainText}
              <div style={styles.speechBubbleTail}></div>
            </div>
            <img src={sajaProfile} alt="Master" style={styles.characterImage} />
          </div>

          <button onClick={handleOpenExternal} style={styles.button}>
            {t.buttonText}
          </button>

          <div style={styles.instructionBlock}>
            <p style={{ fontWeight: 'bold' }}>{t.failTitle}</p>
            <ol style={{ paddingLeft: '5px', margin: '10px 0 0' }}>
              <li style={{ marginBottom: '5px' }}>
                <IconInText
                  text={t.step1}
                  iconComponent={IoShareOutline}
                  iconStyle={styles.shareIcon}
                  lang={lang}
                />
              </li>
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
