export const STRICT_INSTRUCTION = `### Role & Persona
당신은 사용자의 사주팔자를 분석하여 실생활에 도움이 되는 조언을 주는 친근한 '인생 상담가'입니다. 전문적인 점술가보다는 이해하기 쉬운 멘토처럼 행동하세요.

### 🚫 Critical Style Rules (절대적 서식 규칙)
이 규칙들은 답변의 내용보다 우선순위가 높으며, 반드시 지켜야 합니다.
1. **[Plain Text Only]**: 볼드(**), 이탤릭(*), 리스트 기호 등 어떠한 마크다운(Markdown) 강조 문법도 절대 사용하지 마십시오. 오직 순수한 텍스트와 줄바꿈(Enter)만 사용하세요.
2. **[No Hanja]**: 한자(Chinese characters)는 절대 출력하지 마십시오. (예: '甲' -> 제거 혹은 '갑목'으로 표기)
3.  **[No Greetings]**: "안녕하세요", "반갑습니다" 같은 상투적인 인사말로 시작하지 마십시오. 이름 부르면서 시작하지 말고 바로 본문으로.
### 🗣️ Language & Terminology Guidelines
1. **용어 순화 (Translation Layer)**
   - 전문 용어(식신, 상관, 재성, 비겁, 관성 등)를 절대 직접 언급하지 마십시오.
   - 대신 이를 일상 용어로 풀어서 설명하세요.
     - (예: 재성 -> 재물운, 결실 / 관성 -> 직장운, 명예 / 식상 -> 표현력, 손재주)
2. **언어별 규칙**
   - **한국어 답변 시:** 모든 한자는 삭제하고 순수 한글로만 작성하세요.
   - **영어 답변 시:**
     - 사주 용어를 그대로 영문 음차(Pyeon-gwan)하지 말고 의미를 번역(Pressure, Challenge)하세요.
     - 'Year/Month/Day/Time Pillar'라는 단어 대신 'Year/Month/Day/Time Energy' 또는 'Your born characteristics' 등으로 표현하세요. 'Pillar' 단어 사용을 금지합니다.

### 🎯 Content Scope & Balance 
1. 사용자가 이해하기 힘든 복잡한 이론적 배경(신강/신약 계산 과정 등)은 생략하세요. 
2. [Constructive Caution]: 부정적인 답변은 "당신은 이게 나쁘다"고 지적하는 것이 아니라, "이 약점만 보완하면 운의 흐름이 2배 좋아진다"**는 식의 '개선 포인트(Quest)'로 전달하세요. 
3. [중요] 오직 RAW HTML 코드만 출력해야 합니다. 그 어떤 설명이나 마크다운 코드 블록('''html)도 포함하지 마십시오. 첫 번째 문자는 반드시 <h2>나 <div> 태그여야 합니다. 그리고 <>태그들과 class를 절대 생략하지 마세요.

`;
export const DEFAULT_FORMAT = {
  ko: `

<div class="report-container">
  <h2 class="section-title-h2">1. 의뢰자 정보</h2>
  <ul class="info-list">
<li>생년월일 및 태어난 시간: [입력된 생년월일 시간]</li>
<li>성별: [입력된 만세력 정보 단순 기재]</li>
    <li>만세력 주요 구성: [입력된 만세력 정보 단순 기재]</li>
  </ul>

  <h2 class="section-title-h2">2. 사주 정체성 요약</h2>
  <p class="report-text">
    </p>
  <p class="report-text">
    </p>
  
  <div class="keyword-summary">
    <p>정체성 키워드:</p>
    <div class="keyword-list">
      <span class="keyword-tag"></span>
      <span class="keyword-tag"></span>
      <span class="keyword-tag"></span>
    </div>
    <p style="margin-top:15px; font-style:italic;">
      격언: </p>
  </div>

  <h2 class="section-title-h2">3. 현재 대운 운세</h2>
  <p class="report-text">
    </p>
  <p class="report-text">
    </p>

  <h2 class="section-title-h2">4. 주제별 운세 상세 해석</h2>
 <p class="report-text">[주제별 운세 개요]
    </p>
  <h3 class="section-title-h3">4.1. 재물운</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">핵심 키워드: (키워드 1), (키워드 2), (키워드 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <h3 class="section-title-h3">4.2. 직업/커리어</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">핵심 키워드: (키워드 1), (키워드 2), (키워드 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <h3 class="section-title-h3">4.3. 연애운</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">핵심 키워드: (키워드 1), (키워드 2), (키워드 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>
  
  <h3 class="section-title-h3">4.4. 건강운</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">핵심 키워드: (키워드 1), (키워드 2), (키워드 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <h2 class="section-title-h2">5. 인생의 대운 흐름 (Click Tabs)</h2>
  
  <div class="subTitle-scroll-container">
      <div class="subTitle-tile active" onclick="handleSubTitleClick(0)"><span style="font-size:10px">{{D0_AGE}}</span><span style="font-weight:bold">{{D0_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(1)"><span style="font-size:10px">{{D1_AGE}}</span><span style="font-weight:bold">{{D1_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(2)"><span style="font-size:10px">{{D2_AGE}}</span><span style="font-weight:bold">{{D2_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(3)"><span style="font-size:10px">{{D3_AGE}}</span><span style="font-weight:bold">{{D3_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(4)"><span style="font-size:10px">{{D4_AGE}}</span><span style="font-weight:bold">{{D4_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(5)"><span style="font-size:10px">{{D5_AGE}}</span><span style="font-weight:bold">{{D5_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(6)"><span style="font-size:10px">{{D6_AGE}}</span><span style="font-weight:bold">{{D6_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(7)"><span style="font-size:10px">{{D7_AGE}}</span><span style="font-weight:bold">{{D7_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(8)"><span style="font-size:10px">{{D8_AGE}}</span><span style="font-weight:bold">{{D8_NAME}}</span></div>
      <div class="subTitle-tile" onclick="handleSubTitleClick(9)"><span style="font-size:10px">{{D9_AGE}}</span><span style="font-weight:bold">{{D9_NAME}}</span></div>
  </div>

  <div class="report-card active" id="card-0">
      <h3 class="section-title-h3">{{D0_NAME}} 대운</h3>
      <p class="report-text">{{D0_DESC}}</p>
  </div>

  <div class="report-card" id="card-1">
      <h3 class="section-title-h3">{{D1_NAME}} 대운</h3>
      <p class="report-text">{{D1_DESC}}</p>
  </div>

  <div class="report-card" id="card-2">
      <h3 class="section-title-h3">{{D2_NAME}} 대운</h3>
      <p class="report-text">{{D2_DESC}}</p>
  </div>

  <div class="report-card" id="card-3">
      <h3 class="section-title-h3">{{D3_NAME}} 대운</h3>
      <p class="report-text">{{D3_DESC}}</p>
  </div>

  <div class="report-card" id="card-4">
      <h3 class="section-title-h3">{{D4_NAME}} 대운</h3>
      <p class="report-text">{{D4_DESC}}</p>
  </div>

  <div class="report-card" id="card-5">
      <h3 class="section-title-h3">{{D5_NAME}} 대운</h3>
      <p class="report-text">{{D5_DESC}}</p>
  </div>

  <div class="report-card" id="card-6">
      <h3 class="section-title-h3">{{D6_NAME}} 대운</h3>
      <p class="report-text">{{D6_DESC}}</p>
  </div>

  <div class="report-card" id="card-7">
      <h3 class="section-title-h3">{{D7_NAME}} 대운</h3>
      <p class="report-text">{{D7_DESC}}</p>
  </div>

  <div class="report-card" id="card-8">
      <h3 class="section-title-h3">{{D8_NAME}} 대운</h3>
      <p class="report-text">{{D8_DESC}}</p>
  </div>

  <div class="report-card" id="card-9">
      <h3 class="section-title-h3">{{D9_NAME}} 대운</h3>
      <p class="report-text">{{D9_DESC}}</p>
  </div>

  <p class="final-conclusion">
    </p>
</div>`,
  en: `
 
<div class="report-container">

  <h2 class="section-title-h2">1. Client Information</h2>
  <ul class="info-list">
<li>Date and Time of Birth: [INPUT DATE AND TIME]</li>
<li>Gender: [INPUT DATE AND TIME]</li>
    <li>Main Saju Composition: [INPUT SAJU DATA SUMMARY]</li>
  </ul>

  <h2 class="section-title-h2">2. Saju Identity Summary</h2>
  <p class="report-text">
    </p>
  <p class="report-text">
    </p>
  
  <div class="keyword-summary">
    <p>Identity Keywords:</p>
    <div class="keyword-list">
      <span class="keyword-tag">#KEYWORD1</span>
      <span class="keyword-tag">#KEYWORD2</span>
      <span class="keyword-tag">#KEYWORD3</span>
    </div>
    <p style="margin-top:15px; font-style:italic;">
      Aphorism: </p>
  </div>

  <h2 class="section-title-h2">3. Overview of Destiny by Topic</h2>
  <p class="report-text">
    </p>
  <p class="report-text">
    </p>

  <h2 class="section-title-h2">4. Detailed Interpretation by Topic</h2>

  <h3 class="section-title-h3">4.1. Wealth</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">Key Keywords: (KEYWORD 1), (KEYWORD 2), (KEYWORD 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <h3 class="section-title-h3">4.2. Career/Profession</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">Key Keywords: (KEYWORD 1), (KEYWORD 2), (KEYWORD 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <h3 class="section-title-h3">4.3. Love Life</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">Key Keywords: (KEYWORD 1), (KEYWORD 2), (KEYWORD 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>
  
  <h3 class="section-title-h3">4.4. Health</h3>
  <p class="report-text">
    </p>
  <p style="font-size:14px; color:#777; margin-bottom:10px;">Key Keywords: (KEYWORD 1), (KEYWORD 2), (KEYWORD 3)</p>
  <div class="keyword-explanation-block">
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
    <div class="explanation-item"></div>
  </div>

  <p class="final-conclusion">
    </p>
</div>`,
};
export const aiSajuStyle = `<style>
@import url('https://fonts.googleapis.com/css2?family=Song+Myung&display=swap');  
/* =================================================== */
  /* 1. 기본 스타일 (라이트 모드 / Light Mode Defaults) */
  /* =================================================== */

  .report-container {

    background-color: transparent; /* 배경 투명 강제 적용 */
    color: #333344; /* 짙은 인디고/회색 텍스트 (튀지 않음) */
    padding: 15px;
    line-height: 1.8;
    max-width: 100%;
  

  }
  .section-title-h2 {
    font-size: 22px;
    color: #4B0082; /* Main Indigo */
    margin-top: 40px;
    margin-bottom: 20px;
    border-bottom: 1px solid #B0B0D8;
    padding-bottom: 5px;
    font-weight: 400;
  }
  .section-title-h3 {
    font-size: 18px;
    color: #555577;
    margin-top: 25px;
    margin-bottom: 15px;
    border-left: 4px solid #4B0082; /* Main Indigo accent */
    padding-left: 10px;
    font-weight: 600;
  }
     .report-summary {
    font-size: 18px;
    text-align: justify;
    margin-bottom: 15px;
    color: #333344; /* 짙은 인디고/회색 - 튀지 않는 일반 텍스트 */
    font-weight: 400;
  }
  .report-text {
    font-size: 15px;
    text-align: justify;
    margin-bottom: 15px;
    color: #333344; /* 짙은 인디고/회색 - 튀지 않는 일반 텍스트 */
    font-weight: 300;
  }
  .info-list {
    list-style: none;
    padding: 0;
    margin: 10px 0;
    font-size: 15px;
  }
  .info-list li {
    margin-bottom: 8px;
    padding-left: 15px;
    text-indent: -15px;
  }
  .info-list li::before {
    content: "•";
    color: #6A5ACD; /* Medium Slate Blue/Indigo point */
    margin-right: 8px;
  }
  .keyword-summary {
    font-size: 15px;
    margin-top: 15px;
    margin-bottom: 25px;
  }
  .keyword-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .keyword-tag {
    background-color: #E6E6FA; /* Lavender (Light Indigo) */
    color: #4B0082; /* Main Indigo Text */
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 14px;
    font-weight: 400;
 
 
  }
  .keyword-explanation-block {
    margin-bottom: 15px;
    border: 1px solid #E0E0F0;
    padding: 15px;
    background-color: #F8F8FF; /* Ghost White (흰색에 가까운 톤 유지) */
  }
  .explanation-item {
    margin-bottom: 10px;
    padding-left: 10px;
    font-size: 12px;
  }
  .explanation-item::before {
    content: "◇";
    color: #6A5ACD; /* Medium Slate Blue/Indigo point */
    margin-right: 5px;
  }
  .final-conclusion {
    font-size: 18px;
    text-align: center;
    margin-top: 60px;
    padding-top: 20px;
    border-top: 2px solid #4B0082; /* Main Indigo line */
    font-style: italic;
    color: #4B0082;
  }
  .report-keyword {
    font-weight: 600;
    margin-bottom: 5px;
    color: #4B0082;
    line-height: 2;
  }

  /* ======================================================= */
  /* 2. 다크 모드 오버라이드 (React 상태 기반 - html.dark)  */
  /* ======================================================= */

  /* html 태그에 .dark 클래스가 있을 때만 아래 스타일이 적용됩니다. */
  html.dark .report-container {
    background-color: transparent; /* 배경 투명 */
    color: #F0F0FF; /* Very Light Indigo Text for readability */

  }
  html.dark .section-title-h2 {
    color: #E6E6FA; /* Lavender for contrast */
    border-bottom: 1px solid #4B0082;
  }
  html.dark .section-title-h3 {
    color: #F0F0FF;
    border-left: 4px solid #7B68EE; /* Medium Slate Blue accent */
  }
  html.dark .report-text {
    color: #F0F0FF; /* Very Light Indigo - 다크 모드 텍스트 */
  }
  html.dark .info-list li {
    color: #F0F0FF;
  }
  html.dark .info-list li::before {
    content: "•";
    color: #7B68EE; /* Medium Slate Blue point */
  }
  html.dark .keyword-summary {
    color: #F0F0FF;
  }
  html.dark .keyword-tag {
    background-color: #2E0854; /* Darker Indigo */
    color: #E6E6FA; /* Light Indigo Text */
  }
  html.dark .keyword-explanation-block {
    border: 1px solid #4B0082;
    background-color: #1A0033; /* Very Dark Indigo BG */
   
  }
  html.dark .explanation-item {
    color: #F0F0FF;
  }
  html.dark .explanation-item::before {
    content: "◇";
    color: #7B68EE;
  }
  html.dark .final-conclusion {
    border-top: 2px solid #7B68EE;
    color: #E6E6FA;
  }
  html.dark .report-keyword {
    color: #7B68EE;
  }
/* 스타일2 */
/* 스타일2 */
/* 스타일2 */
        :root {
            --primary: #4f46e5;
            --bg-page: #ffffff;
            --bg-sub-container: #f8fafc;
            --bg-card: #ffffff;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --tile-bg: #ffffff;
        }

        /* 2. 시스템 설정이 다크 모드일 때만 자동 전환 */
       html.dark {
            --bg-page: #0f172a;
            --bg-sub-container: #1e293b;
            --bg-card: #1e293b;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --border-color: #334155;
            --tile-bg: #1e293b;
        }

        body { 
            font-family: sans-serif; 
            margin: 0; 
            line-height: 1.6; 
            background-color: var(--bg-page); 
            color: var(--text-main); 
            transition: background-color 0.3s, color 0.3s;
        }

        .subTitle-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            padding: 0 8px;
        }

        .subTitle-title {
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: bold;
        }

        /* 상단 탭 스크롤 영역 */
        .subTitle-scroll-container {
            background: var(--bg-sub-container);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 16px;
            overflow-x: auto;
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
        }
        
        .subTitle-tile {
            min-width: 60px;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            background: var(--tile-bg);
            color: var(--text-main);
            transition: all 0.2s ease;
        }
        
        .subTitle-tile.active {
            background: var(--primary);
            color: white !important;
            border-color: var(--primary);
        }

        /* 초기 상태: 내용 숨김 */
        .report-card {
            display: none; 
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* 클릭 시 활성화 */
        .report-card.active {
            display: block !important;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .section-title-h3 {
            color: var(--text-main);
            font-size: 1.125rem;
            font-weight: bold;
            margin: 0 0 8px 0;
        }

        .report-keyword {
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 12px;
        }

        .report-text {
            color: var(--text-main);
            font-size: 0.875rem;
            text-align: justify;
        }

  </style>`;
