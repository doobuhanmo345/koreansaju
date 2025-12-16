export const STRICT_INSTRUCTION = {
  ko: `당신은 현대적 감각과 깊은 통찰력을 겸비한 최고의 사주 명리학 전문가이자, 엄격한 규칙 준수 능력을 갖춘 웹 퍼블리셔입니다.

제시된 만세력을 바탕으로 분석을 진행하고, 그 결과를 **아래 제시된 [HTML 출력 템플릿]의 구조와 스타일을 그대로 유지한 채** 내용 부분만 채워서 출력하십시오.

### 1. 절대 준수 사항 (Strict Guidelines)
1. **결과물 형식**: 설명 없이 오직 **HTML 코드만** 출력하십시오. (마크다운 코드 블럭 제외)
2. **서식 제한**:
   - **굵은 글씨(Bold, <b>, <strong>, font-weight: bold)를 절대로 사용하지 마십시오.** 제목, 소제목, 본문 모두 포함입니다.
   - **이모티콘을 절대로 사용하지 마십시오.**
3. **화자 및 어조**:
   - 의뢰인을 "당신"이라고 지칭하며, 신비롭고 예언가적인 '해요체'를 사용하십시오.
   - 전문 용어(식상, 관인 등)는 절대 사용하지 말고 현대적인 언어로 풀어서 설명하십시오.
4. **구조 및 길이 준수**: 각 요약 및 키워드 해설의 문단 및 문장 개수 제한(예: '정확히 2문장')을 철저히 지키십시오.
5. [중요] 오직 RAW HTML 코드만 출력해야 합니다. 그 어떤 설명이나 마크다운 코드 블록('''html)도 포함하지 마십시오. 첫 번째 문자는 반드시 <h2>나 <div>태그여야 합니다.

`,
  en: `
 You are a top-tier Saju (Four Pillars of Destiny) expert with modern sensibility and deep insight, acting as a web publisher with strict adherence to rules.

**[INPUT DATA]**: (Insert the actual Saju Manse-ryok data here)

Analyze the data above, and generate the report result by strictly filling in the content based on the **[HTML Output Template]** provided below. The structure and styling must be maintained exactly.

### 1. Strict Guidelines
1. **Output Format**: Output ONLY the raw HTML code. Do not include any explanations or conversational text outside the HTML block.
2. **Formatting Restrictions**:
   - **ABSOLUTELY DO NOT use bold text** (no '<b>', '<strong>', or 'font-weight: bold'). This applies to all titles and body text.
   - **ABSOLUTELY DO NOT use emojis.**
3. **Voice and Tone**:
   - Address the client as "you" (2nd person).
   - Use a professional, prophetic, and mystical tone.
   - **Crucially**, avoid all complex Saju jargon (e.g., *Sik-sang-saeng-jae*). Translate concepts into modern, easily understandable language.
4. **Structure and Length Compliance**: Strictly adhere to all sentence and paragraph quantity constraints (e.g., 'exactly 2 sentences').
5. [중요] 오직 RAW HTML 코드만 출력해야 합니다. 그 어떤 설명이나 마크다운 코드 블록('''html)도 포함하지 마십시오. 첫 번째 문자는 반드시 <h2>나 <div> 태그여야 합니다.`,
};
export const DEFAULT_INSTRUCTION = {
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

  <h2 class="section-title-h2">3. 주제별 운세 개요</h2>
  <p class="report-text">
    </p>
  <p class="report-text">
    </p>

  <h2 class="section-title-h2">4. 주제별 운세 상세 해석</h2>

  <h3 class="section-title-h3">4.1. 재물</h3>
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
export const DAILY_FORTUNE_PROMPT = {
  ko: `<div class="destiny-container">
  <h2 class="section-title-h3">1. [오늘의 운세] ([오늘 날짜 기재])</h2>
  <h3 class="report-keyword" >[오늘의 일진과 사주 관계를 함축한 명사형 제목]</h3>
   <p class="report-keyword">총점 : [100점 기준의 오늘의 운세 총점]</p>
  <p class="report-text">
    [오늘의 운세 상세 분석 내용을 공백 포함 1000자 이내로 작성. 의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 하루의 흐름, 주의할 점, 긍정적인 요소를 건강운, 연애운, 학업운, 직업운, 금전운 관저에서 서술.]</p>
  <h2 class="section-title-h3">1. [내일의 운세] ([내일 날짜 기재])</h2>
  <h3 class="report-keyword" >[내일의 일진과 사주 관계를 함축한 명사형 제목]</h3>
  <p class="report-keyword">총점 : [100점 기준의 오늘의 운세 총점]</p>
  <p class="report-text">
    [내일의 운세 상세 분석 내용을 공백 포함 1000자 이내로 작성. 의뢰인의 사주와 내일의 일진(간지) 관계를 분석하여 하루의 흐름, 주의할 점, 긍정적인 요소를 건강운, 연애운, 학업운, 직업운, 금전운 관저에서 서술.]</p>  
</div>
`,
  en: `
<div class="destiny-container">
  <h2 class="section-title-h3">1. [Today's Fortune] ([Insert today's date])</h2>
  <h3 class="report-keyword" >[Noun-phrase title summarizing the relationship between today's Iljin and Saju]</h3>
   <p class="report-keyword">Total Score : [Total score for today's fortune out of 100]</p>
  <p class="report-text">
    [Write a detailed analysis of today's fortune within 1000 characters including spaces. Analyze the relationship between the client's Saju and today's Iljin (Ganji) to describe the day's flow, points of caution, and positive elements from the perspectives of Health, Love, Academic, Career, and Wealth luck.]</p>
    
  <h2 class="section-title-h3">1. [Tomorrow's Fortune] ([Insert tomorrow's date])</h2>
  <h3 class="report-keyword" >[Noun-phrase title summarizing the relationship between tomorrow's Iljin and Saju]</h3>
  <p class="report-keyword">Total Score : [Total score for tomorrow's fortune out of 100]</p>
  <p class="report-text">
    [Write a detailed analysis of tomorrow's fortune within 1000 characters including spaces. Analyze the relationship between the client's Saju and tomorrow's Iljin (Ganji) to describe the day's flow, points of caution, and positive elements from the perspectives of Health, Love, Academic, Career, and Wealth luck.]</p>  
</div>`,
};
export const NEW_YEAR_FORTUNE_PROMPT = {
  ko: `<div class="destiny-container">
  
  <h2 class="section-title-h2">종합 분석 (2026년 병오년)</h2>
  <p class="report-text">
    [다음 사주 정보를 바탕으로, 해당 사주를 가진 사람의 2026년(병오년) 운세를 종합적으로 분석해 주세요. 500자 이내로 핵심만 요약해 주세요.]
  </p>

  <h2 class="section-title-h2">월별 운세</h2>
  
  <h3 class="section-title-h3">1. 1월 운세 : 을사년 기축월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 기축월의 운세 총점]</p>
  <p class="report-text">
    [을사년 기축월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>
  
  <h3 class="section-title-h3">2. 2월 운세 : 을사년 경인월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 경인월의 운세 총점]</p>   <p class="report-text">
    [을사년 경인월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">3. 3월 운세 : 을사년 신묘월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 신묘월의 운세 총점]</p>   <p class="report-text">
    [을사년 신묘월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">4. 4월 운세 : 을사년 임진월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 임진월의 운세 총점]</p>   <p class="report-text">
    [을사년 임진월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">5. 5월 운세 : 을사년 계사월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 계사월의 운세 총점]</p>   <p class="report-text">
    [을사년 계사월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">6. 6월 운세 : 을사년 갑오월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 갑오월의 운세 총점]</p>   <p class="report-text">
    [을사년 갑오월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">7. 7월 운세 : 을사년 을미월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 을미월의 운세 총점]</p>   <p class="report-text">
    [을사년 을미월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">8. 8월 운세 : 을사년 병신월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 병신월의 운세 총점]</p>   <p class="report-text">
    [을사년 병신월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">9. 9월 운세 : 을사년 정유월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 정유월의 운세 총점]</p>   <p class="report-text">
    [을사년 정유월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">10. 10월 운세 : 을사년 무술월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 무술월의 운세 총점]</p>   <p class="report-text">
    [을사년 무술월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">11. 11월 운세 : 을사년 기해월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 기해월의 운세 총점]</p>   <p class="report-text">
    [을사년 기해월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>

  <h3 class="section-title-h3">12. 12월 운세 : 을사년 경자월</h3>
  <p class="report-keyword">총점 : [100점 기준의 을사년 경자월의 운세 총점]</p>   <p class="report-text">
    [을사년 경자월의 운세 300자 이내, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
  </p>
</div>


`,
  en: `<div class="destiny-container">
  
  <h2 class="section-title-h2">Comprehensive Analysis (2026, Byeong-o Year)</h2>
  <p class="report-text">
    [Based on the following Saju information, please provide a comprehensive analysis of the fortune for 2026 (Byeong-o Year). Summarize the key points within 500 characters.]
  </p>

  <h2 class="section-title-h2">Monthly Horoscope</h2>
  
  <h3 class="section-title-h3">1. January Fortune : Eulsa Year, Gichuk Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gichuk Month out of 100]</p>
  <p class="report-text">
    [Fortune for Eulsa Year, Gichuk Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>
  
  <h3 class="section-title-h3">2. February Fortune : Eulsa Year, Gyeongin Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gyeongin Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Gyeongin Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">3. March Fortune : Eulsa Year, Sinmyo Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Sinmyo Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Sinmyo Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">4. April Fortune : Eulsa Year, Imjin Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Imjin Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Imjin Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">5. May Fortune : Eulsa Year, Gyesa Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gyesa Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Gyesa Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">6. June Fortune : Eulsa Year, Gabo Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gabo Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Gabo Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">7. July Fortune : Eulsa Year, Eulmi Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Eulmi Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Eulmi Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">8. August Fortune : Eulsa Year, Byeongsin Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Byeongsin Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Byeongsin Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">9. September Fortune : Eulsa Year, Jeongyu Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Jeongyu Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Jeongyu Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">10. October Fortune : Eulsa Year, Musul Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Musul Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Musul Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">11. November Fortune : Eulsa Year, Gihae Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gihae Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Gihae Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>

  <h3 class="section-title-h3">12. December Fortune : Eulsa Year, Gyeongja Month</h3>
  <p class="report-keyword">Total Score : [Total score for Eulsa Year, Gyeongja Month out of 100]</p> 
  <p class="report-text">
    [Fortune for Eulsa Year, Gyeongja Month within 300 characters. Must include Wealth, Health, Career, Academic, and Love luck.]
  </p>
</div>`,
};

export const aiSajuStyle = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400&display=swap');

  /* =================================================== */
  /* 1. 기본 스타일 (라이트 모드 / Light Mode Defaults) */
  /* =================================================== */

  .report-container {
    font-family: 'Nanum Myeongjo', 'Batang', serif;
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
    font-weight: 400;
  }
  .report-text {
    font-size: 15px;
    text-align: justify;
    margin-bottom: 15px;
    color: #333344; /* 짙은 인디고/회색 - 튀지 않는 일반 텍스트 */
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
    margin-top: 15px;
    border: 1px solid #E0E0F0;
    padding: 15px;
    background-color: #F8F8FF; /* Ghost White (흰색에 가까운 톤 유지) */
  }
  .explanation-item {
    margin-bottom: 10px;
    padding-left: 10px;
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
</style>`;
export const koTitle = {
  // === 갑목 (甲木) ===
  갑자: {
    male: {
      title: '심해의 청룡',
      desc: '깊은 지혜를 감추고 때를 기다려 비상하는 우두머리의 기상.',
    },
    female: {
      title: '호수의 월계수',
      desc: '차가운 지성미와 고고한 자존심으로 주변을 압도하는 지혜의 여왕.',
    },
  },
  갑인: {
    male: {
      title: '숲의 제왕',
      desc: '누구에게도 굽히지 않고 자신의 왕국을 건설하는 절대적인 카리스마.',
    },
    female: {
      title: '고원의 거목',
      desc: '홀로 서서 비바람을 견디며 만인을 품어주는 강인한 여장부.',
    },
  },
  갑진: {
    male: {
      title: '황야의 지배자',
      desc: '척박한 땅을 개척하여 비옥한 영토로 만드는 불굴의 개척자.',
    },
    female: {
      title: '대지의 여신',
      desc: '풍요로운 재물과 생명력을 품고 세상을 넉넉하게 만드는 어머니.',
    },
  },
  갑오: {
    male: {
      title: '질주하는 적토마',
      desc: '이상을 향해 멈추지 않고 달려가 세상을 바꾸는 혁명가.',
    },
    female: {
      title: '태양의 무희',
      desc: '화려한 언변과 열정으로 대중의 시선을 한 몸에 받는 스타.',
    },
  },
  갑신: {
    male: {
      title: '절벽의 소나무',
      desc: '위태로운 상황에서도 절개를 지키며 조직을 이끄는 냉철한 리더.',
    },
    female: {
      title: '바위산의 난초',
      desc: '척박한 환경을 극복하고 고귀한 꽃을 피워내는 강단 있는 여성.',
    },
  },
  갑술: {
    male: {
      title: '광야의 늑대',
      desc: '고독하게 자신의 길을 가며 끝내 목표를 쟁취하는 끈기의 승부사.',
    },
    female: {
      title: '사막의 오아시스',
      desc: '메마른 현실 속에서 가족과 주변을 먹여 살리는 생활력의 화신.',
    },
  },

  // === 을목 (乙木) ===
  을축: {
    male: {
      title: '동토의 푸른 솔',
      desc: '차가운 시련을 견디고 묵묵히 실속을 챙겨 거부가 되는 인내자.',
    },
    female: {
      title: '설중매',
      desc: '눈보라 속에서도 향기를 잃지 않고 피어나는 외유내강의 표본.',
    },
  },
  을묘: {
    male: {
      title: '푸른 초원의 바람',
      desc: '자유로운 영혼으로 어디든 뻗어나가며 생명력을 전파하는 방랑자.',
    },
    female: {
      title: '봄의 정원',
      desc: '부드러운 친화력과 끈기로 사람들을 끌어당기는 매력적인 사교가.',
    },
  },
  을사: {
    male: {
      title: '춤추는 금사',
      desc: '화려한 재능과 임기응변으로 난세를 헤쳐 나가는 천재적인 전략가.',
    },
    female: {
      title: '비단 꽃길',
      desc: '타고난 센스와 예술적 감각으로 삶을 아름답게 수놓는 예인.',
    },
  },
  을미: {
    male: {
      title: '사막의 선인장',
      desc: '건조하고 척박한 환경에서도 끝까지 살아남아 결실을 보는 생존자.',
    },
    female: {
      title: '백사장 위의 갈대',
      desc: '바람에 흔들릴지언정 꺾이지 않고 현실을 지켜내는 억척스러운 힘.',
    },
  },
  을유: {
    male: {
      title: '칼날 위의 덩굴',
      desc: '살벌한 바위 틈에서도 뿌리를 내리는 강인한 정신력과 결단력.',
    },
    female: {
      title: '바위 틈의 백합',
      desc: '날카로운 환경 속에서도 순수함과 도도함을 잃지 않는 고결한 영혼.',
    },
  },
  을해: {
    male: {
      title: '강물 위의 부평초',
      desc: '세상의 흐름에 몸을 맡기고 유유자적하며 지혜를 낚는 현자.',
    },
    female: {
      title: '물 위의 연꽃',
      desc: '탁한 세상에 물들지 않고 맑고 깨끗한 마음을 지키는 자애로운 모성.',
    },
  },

  // === 병화 (丙火) ===
  병인: {
    male: {
      title: '새벽의 호랑이',
      desc: '어둠을 찢고 포효하며 새로운 시대를 여는 희망의 선구자.',
    },
    female: {
      title: '숲 속의 아침해',
      desc: '밝고 명랑한 에너지로 주변 사람들에게 활력을 불어넣는 비타민.',
    },
  },
  병진: {
    male: {
      title: '구름 위의 태양',
      desc: '자애로운 빛으로 만물을 기르며 존경받는 덕망 높은 지도자.',
    },
    female: {
      title: '황금 들판의 빛',
      desc: '모든 것을 포용하고 베풀며 식복과 재복을 타고난 여왕.',
    },
  },
  병오: {
    male: {
      title: '제왕의 태양',
      desc: '하늘 정중앙에서 세상을 호령하는 가장 강력하고 독보적인 권력자.',
    },
    female: {
      title: '전장의 잔다르크',
      desc: '누구에게도 지지 않는 승부욕과 열정으로 앞장서서 리드하는 여걸.',
    },
  },
  병신: {
    male: {
      title: '도시의 네온',
      desc: '다재다능한 재주로 세상을 화려하게 비추는 만능 엔터테이너.',
    },
    female: {
      title: '붉은 노을',
      desc: '감상적이고 낭만적인 분위기로 사람을 매료시키는 신비로운 매력.',
    },
  },
  병술: {
    male: {
      title: '산사의 등불',
      desc: '해가 진 산속에서 세상을 위해 홀로 기도하고 봉사하는 철학자.',
    },
    female: {
      title: '가을의 단풍',
      desc: '화려함 뒤에 쓸쓸함을 감추고 예술과 종교에 심취하는 영적인 여인.',
    },
  },
  병자: {
    male: {
      title: '호수의 달빛',
      desc: '태양이지만 달처럼 은은하게, 겉은 화려하나 속은 고뇌하는 지성인.',
    },
    female: {
      title: '밤바다의 등대',
      desc: '어두운 세상에서 원칙을 지키며 길을 밝혀주는 단정한 귀부인.',
    },
  },

  // === 정화 (丁火) ===
  정묘: {
    male: {
      title: '숲 속의 모닥불',
      desc: '은은한 따뜻함과 신비로운 직감으로 사람의 마음을 꿰뚫는 예언자.',
    },
    female: {
      title: '달빛 아래 옥토끼',
      desc: '섬세하고 감각적인 예술성으로 사랑받는 매력적인 소녀.',
    },
  },
  정사: {
    male: {
      title: '용광로의 불꽃',
      desc: '폭발적인 에너지와 집념으로 목표를 향해 돌진하는 뜨거운 야망가.',
    },
    female: {
      title: '붉은 뱀',
      desc: '화려한 언변과 사교성으로 주변을 압도하며 자신의 뜻을 이루는 책략가.',
    },
  },
  정미: {
    male: {
      title: '사막의 별',
      desc: '메마른 땅에서도 꿈을 잃지 않고 묵묵히 타오르는 희생적인 봉사자.',
    },
    female: {
      title: '뜨거운 대지',
      desc: '겉은 부드러우나 속은 누구보다 뜨거운 열정을 품고 있는 강인한 내면.',
    },
  },
  정유: {
    male: {
      title: '어둠 속의 보석',
      desc: '밤에 더욱 빛나는 귀한 존재로, 예리한 분석력을 가진 완벽주의자.',
    },
    female: {
      title: '성전의 촛불',
      desc: '단정하고 기품 있는 모습으로 재물과 인기를 한몸에 받는 귀인.',
    },
  },
  정해: {
    male: {
      title: '밤바다의 별빛',
      desc: '천문과 지리를 통달한 듯한 깊은 지혜와 영감을 가진 선비.',
    },
    female: {
      title: '호수의 반딧불',
      desc: '여리고 섬세한 감성으로 타인의 마음을 치유하는 따뜻한 힐러.',
    },
  },
  정축: {
    male: {
      title: '설원의 화로',
      desc: '차가운 세상 속에서 자신의 재능을 갈고닦아 마침내 드러내는 장인.',
    },
    female: {
      title: '금고 속의 등불',
      desc: '알뜰하고 야무지게 재물을 모으며 가족을 지키는 현명한 관리자.',
    },
  },

  // === 무토 (戊土) ===
  무진: {
    male: {
      title: '태산의 황룡',
      desc: '거대한 스케일과 포용력으로 조직을 장악하고 호령하는 대장군.',
    },
    female: {
      title: '대지의 여왕',
      desc: '굳건한 신뢰와 뚝심으로 흔들림 없이 자신의 영역을 지키는 여장부.',
    },
  },
  무오: {
    male: {
      title: '활화산',
      desc: '내면에 끓어오르는 마그마 같은 열정으로 세상을 뒤흔드는 패왕.',
    },
    female: {
      title: '붉은 야생마',
      desc: '누구의 간섭도 받지 않고 자유롭게 세상을 누비는 정열적인 여인.',
    },
  },
  무신: {
    male: {
      title: '고산의 수도승',
      desc: '세속을 떠난 듯 고독하지만 비범한 재주로 세상을 경영하는 전략가.',
    },
    female: {
      title: '요새의 지휘관',
      desc: '뛰어난 활동력과 생활력으로 가정을 일으키고 재물을 모으는 능력자.',
    },
  },
  무술: {
    male: {
      title: '황금 봉우리',
      desc: '그 무엇으로도 뚫을 수 없는 강한 고집과 신념을 가진 고독한 영웅.',
    },
    female: {
      title: '광야의 수호신',
      desc: '투박하지만 속정이 깊고, 한 번 믿으면 끝까지 의리를 지키는 신의.',
    },
  },
  무자: {
    male: {
      title: '안개 속의 산',
      desc: '겉으로는 묵직하나 속으로는 치밀하게 실속을 챙기는 냉철한 사업가.',
    },
    female: {
      title: '산 아래 보물',
      desc: '다정다감하고 알뜰하여 재물을 산처럼 쌓아 올리는 복덩이.',
    },
  },
  무인: {
    male: {
      title: '백두산 호랑이',
      desc: '험준한 산을 호령하며 명예와 권위를 목숨보다 중시하는 권력자.',
    },
    female: {
      title: '산사의 거목',
      desc: '카리스마와 리더십으로 뭇사람들의 존경을 받는 우두머리.',
    },
  },

  // === 기토 (己土) ===
  기사: {
    male: {
      title: '밭 숲의 뱀',
      desc: '조용히 기회를 엿보다가 순간적인 재치로 큰 성과를 내는 지략가.',
    },
    female: {
      title: '숨겨진 마그마',
      desc: '얌전해 보이나 결정적인 순간에 폭발적인 에너지를 발산하는 반전 매력.',
    },
  },
  기미: {
    male: {
      title: '메마른 대지',
      desc: '어떤 시련에도 굴하지 않고 묵묵히 자신의 길을 가는 은근한 고집쟁이.',
    },
    female: {
      title: '비밀의 정원',
      desc: '신비로운 분위기와 강한 자존심으로 자신의 내면을 쉽게 드러내지 않는 여인.',
    },
  },
  기유: {
    male: { title: '가을 들판', desc: '예리한 직관과 손재주로 무엇이든 만들어내는 만능 재주꾼.' },
    female: {
      title: '옥토의 결실',
      desc: '섬세하고 꼼꼼하게 챙기며 실속 있는 삶을 꾸려가는 현모양처.',
    },
  },
  기해: {
    male: {
      title: '강변의 옥토',
      desc: '유연한 사고와 친화력으로 어디서든 환영받는 처세의 달인.',
    },
    female: {
      title: '바다 속의 진주',
      desc: '겉으로는 유순하나 속은 깊고 넓어 재물과 복을 타고난 귀인.',
    },
  },
  기축: {
    male: {
      title: '겨울 논밭',
      desc: '남들이 모르는 곳에서 끈질기게 노력하여 기어이 성공을 일구는 노력파.',
    },
    female: {
      title: '금광의 흙',
      desc: '보이지 않는 곳에서 묵묵히 내실을 다지며 재물을 모으는 알부자.',
    },
  },
  기묘: {
    male: {
      title: '들판의 토끼',
      desc: '민첩하고 예민한 감각으로 척박한 환경을 개척해 나가는 개척자.',
    },
    female: {
      title: '봄날의 텃밭',
      desc: '싱그러운 생명력으로 주변을 보살피며 키워내는 생활력 강한 여인.',
    },
  },

  // === 경금 (庚金) ===
  경오: {
    male: {
      title: '백마 탄 장군',
      desc: '공명정대하고 반듯한 기품으로 조직을 이끄는 고위 관료.',
    },
    female: {
      title: '제단의 검',
      desc: '화려한 외모와 단호한 결단력으로 자신의 영역을 확실히 지키는 여왕.',
    },
  },
  경신: {
    male: { title: '강철 거인', desc: '천하를 개혁하려는 강력한 힘과 의리로 뭉친 혁명가.' },
    female: {
      title: '무쇠 바위',
      desc: '그 누구에게도 의지하지 않고 스스로 운명을 개척하는 독립적인 여걸.',
    },
  },
  경술: {
    male: {
      title: '무기고의 수호자',
      desc: '투박하고 거칠지만, 내 사람에게는 목숨을 바치는 의리의 사나이.',
    },
    female: {
      title: '황금 사자',
      desc: '압도적인 카리스마와 기개로 남성조차 능가하는 강력한 리더십.',
    },
  },
  경자: {
    male: {
      title: '차가운 종소리',
      desc: '냉철한 비판 의식과 맑은 지성으로 세상을 깨우는 고독한 지성인.',
    },
    female: {
      title: '서리 내린 바위',
      desc: '청아하고 고고한 매력으로 누구와도 타협하지 않는 도도한 예술가.',
    },
  },
  경인: {
    male: {
      title: '숲 속의 백호',
      desc: '거침없이 목표를 향해 돌진하며 큰 판을 벌이는 스케일 큰 사업가.',
    },
    female: {
      title: '전장의 여신',
      desc: '가정에 갇히지 않고 사회에서 당당하게 능력을 발휘하는 활동가.',
    },
  },
  경진: {
    male: {
      title: '강철 비늘의 용',
      desc: '웅장한 포부와 끈기로 권력의 정점에 오르고자 하는 야심가.',
    },
    female: {
      title: '갑옷 입은 무사',
      desc: '강인한 정신력과 투지로 어떤 난관도 돌파해내는 불굴의 여인.',
    },
  },

  // === 신금 (辛金) ===
  신미: {
    male: {
      title: '뜨거운 모래 속 보석',
      desc: '시련 속에서도 날카로운 예리함을 잃지 않고 자신을 단련하는 수행자.',
    },
    female: {
      title: '사막의 진주',
      desc: '은근한 고집과 끈기로 메마른 환경에서도 끝내 빛을 발하는 귀한 존재.',
    },
  },
  신유: {
    male: {
      title: '전설의 명검',
      desc: '타협을 모르는 순수함과 냉혹함으로 한 분야의 정점을 찍는 전문가.',
    },
    female: {
      title: '얼음 공주',
      desc: '차가울 정도로 완벽하고 고귀하여 범접할 수 없는 아름다움.',
    },
  },
  신해: {
    male: {
      title: '씻긴 다이아몬드',
      desc: '뛰어난 언변과 총명한 두뇌로 세상을 유랑하며 재능을 펼치는 천재.',
    },
    female: {
      title: '심연의 보석',
      desc: '감수성이 풍부하고 예민하며, 남다른 예술적 감각을 지닌 뮤즈.',
    },
  },
  신축: {
    male: {
      title: '설원의 은장도',
      desc: '차가운 이성과 날카로운 직관으로 때를 기다리며 준비하는 참모.',
    },
    female: {
      title: '얼어붙은 보석',
      desc: '속마음을 감추고 냉정해 보이지만, 내면에 뜨거운 복수심과 야망을 품은 여인.',
    },
  },
  신묘: {
    male: {
      title: '달빛 어린 칼',
      desc: '예리한 감각과 섬세함으로 틈새를 파고들어 성공하는 전략가.',
    },
    female: {
      title: '하얀 토끼',
      desc: '겉으로는 여리고 순해 보이나 실속을 챙길 줄 아는 외유내강의 실리파.',
    },
  },
  신사: {
    male: {
      title: '불 속의 보석',
      desc: '시련을 통해 더욱 단단해지며 권력과 명예를 지향하는 엘리트.',
    },
    female: {
      title: '지혜의 백사',
      desc: '단정하고 화려한 외모 뒤에 변화무쌍한 지혜를 감춘 매혹적인 여인.',
    },
  },

  // === 임수 (壬水) ===
  임신: {
    male: {
      title: '대하의 원류',
      desc: '끊임없이 솟아나는 아이디어와 지식으로 문명을 이끄는 학자.',
    },
    female: {
      title: '맑은 수원',
      desc: '융통성과 포용력을 갖추고 주변에 지혜를 공급하는 마르지 않는 샘.',
    },
  },
  임술: {
    male: {
      title: '검은 바다의 늑대',
      desc: '거친 파도를 다스리듯 강력한 통제력으로 재물과 권력을 쥐는 제왕.',
    },
    female: {
      title: '산 속의 호수',
      desc: '깊이를 알 수 없는 신비로움과 직관력으로 사람을 끌어당기는 여인.',
    },
  },
  임자: {
    male: {
      title: '북방의 해일',
      desc: '모든 것을 집어삼킬 듯한 압도적인 힘과 배포를 가진 영웅호걸.',
    },
    female: {
      title: '밤의 여신',
      desc: '고요하지만 거대한 에너지를 품고 있어 누구도 함부로 할 수 없는 카리스마.',
    },
  },
  임인: {
    male: {
      title: '강을 건너는 호랑이',
      desc: '지혜와 용맹을 겸비하여 새로운 세상으로 나아가는 위대한 탐험가.',
    },
    female: {
      title: '지혜의 식신',
      desc: '총명한 두뇌와 따뜻한 마음으로 주변을 먹여 살리고 베푸는 큰언니.',
    },
  },
  임진: {
    male: {
      title: '폭풍 속의 흑룡',
      desc: '변화무쌍하고 속을 알 수 없으나, 결정적인 순간 천하를 뒤집는 권력자.',
    },
    female: {
      title: '괴강의 여주인',
      desc: '남자 못지않은 배포와 추진력으로 난세를 평정하고 우뚝 서는 여걸.',
    },
  },
  임오: {
    male: {
      title: '호수의 달빛',
      desc: '물과 불의 조화로움 속에 몽환적인 매력을 발산하는 인기인.',
    },
    female: {
      title: '정열의 바다',
      desc: '부드러움 속에 계산된 치밀함으로 재물과 사랑을 모두 쟁취하는 전략가.',
    },
  },

  // === 계수 (癸水) ===
  계유: {
    male: {
      title: '맑은 옹달샘',
      desc: '티 없이 맑고 순수한 정신으로 한 길을 파고드는 고고한 예술가.',
    },
    female: {
      title: '바위 틈의 샘물',
      desc: '차갑고 도도하지만 누구보다 깨끗하고 결백한 마음을 지닌 여인.',
    },
  },
  계해: {
    male: {
      title: '심연의 바다',
      desc: '우주의 모든 이치를 담고 있는 듯, 깊고 넓은 지혜를 가진 예지자.',
    },
    female: {
      title: '그림자의 강',
      desc: '겉으로는 유순하나 내면에는 거대한 바다와 같은 강한 고집과 승부욕을 감춘 여인.',
    },
  },
  계축: {
    male: {
      title: '얼어붙은 땅의 소',
      desc: '묵묵히 참고 견디며 남들이 포기한 곳에서 싹을 틔우는 인내의 화신.',
    },
    female: {
      title: '겨울비',
      desc: '차가운 지성과 영적인 직감으로 세상을 바라보는 신비로운 예언자.',
    },
  },
  계묘: {
    male: {
      title: '숲 속의 아침이슬',
      desc: '싱그럽고 다정다감하여 누구에게나 사랑받는 순수한 영혼.',
    },
    female: {
      title: '봄비 내리는 정원',
      desc: '섬세하고 여린 감수성으로 타인을 배려하고 기르는 자애로운 어머니.',
    },
  },
  계사: {
    male: {
      title: '안개 낀 화산',
      desc: '차가움과 뜨거움이 공존하는 변덕 속에 천재적인 영감이 번뜩이는 귀재.',
    },
    female: {
      title: '흑진주',
      desc: '조용히 빛나지만 내면에는 강력한 재물운과 활동력을 품고 있는 실속파.',
    },
  },
  계미: {
    male: {
      title: '사막의 단비',
      desc: '메마른 곳을 적셔주듯, 자신을 희생하여 타인을 구원하는 활인업의 성자.',
    },
    female: {
      title: '붉은 대지의 비',
      desc: '예민하고 급한 성격 뒤에 숨겨진 깊은 희생정신과 봉사심을 가진 여인.',
    },
  },
};
export const IljuExp = {
  ko: {
    // === 갑목 (甲木) ===
    갑자: {
      male: {
        title: '심해의 청룡',
        desc: '깊은 지혜를 감추고 때를 기다려 비상하는 우두머리의 기상.',
      },
      female: {
        title: '호수의 월계수',
        desc: '차가운 지성미와 고고한 자존심으로 주변을 압도하는 지혜의 여왕.',
      },
    },
    갑인: {
      male: {
        title: '숲의 제왕',
        desc: '누구에게도 굽히지 않고 자신의 왕국을 건설하는 절대적인 카리스마.',
      },
      female: {
        title: '고원의 거목',
        desc: '홀로 서서 비바람을 견디며 만인을 품어주는 강인한 여장부.',
      },
    },
    갑진: {
      male: {
        title: '황야의 지배자',
        desc: '척박한 땅을 개척하여 비옥한 영토로 만드는 불굴의 개척자.',
      },
      female: {
        title: '대지의 여신',
        desc: '풍요로운 재물과 생명력을 품고 세상을 넉넉하게 만드는 어머니.',
      },
    },
    갑오: {
      male: {
        title: '질주하는 적토마',
        desc: '이상을 향해 멈추지 않고 달려가 세상을 바꾸는 혁명가.',
      },
      female: {
        title: '태양의 무희',
        desc: '화려한 언변과 열정으로 대중의 시선을 한 몸에 받는 스타.',
      },
    },
    갑신: {
      male: {
        title: '절벽의 소나무',
        desc: '위태로운 상황에서도 절개를 지키며 조직을 이끄는 냉철한 리더.',
      },
      female: {
        title: '바위산의 난초',
        desc: '척박한 환경을 극복하고 고귀한 꽃을 피워내는 강단 있는 여성.',
      },
    },
    갑술: {
      male: {
        title: '광야의 늑대',
        desc: '고독하게 자신의 길을 가며 끝내 목표를 쟁취하는 끈기의 승부사.',
      },
      female: {
        title: '사막의 오아시스',
        desc: '메마른 현실 속에서 가족과 주변을 먹여 살리는 생활력의 화신.',
      },
    },

    // === 을목 (乙木) ===
    을축: {
      male: {
        title: '동토의 푸른 솔',
        desc: '차가운 시련을 견디고 묵묵히 실속을 챙겨 거부가 되는 인내자.',
      },
      female: {
        title: '설중매',
        desc: '눈보라 속에서도 향기를 잃지 않고 피어나는 외유내강의 표본.',
      },
    },
    을묘: {
      male: {
        title: '푸른 초원의 바람',
        desc: '자유로운 영혼으로 어디든 뻗어나가며 생명력을 전파하는 방랑자.',
      },
      female: {
        title: '봄의 정원',
        desc: '부드러운 친화력과 끈기로 사람들을 끌어당기는 매력적인 사교가.',
      },
    },
    을사: {
      male: {
        title: '춤추는 금사',
        desc: '화려한 재능과 임기응변으로 난세를 헤쳐 나가는 천재적인 전략가.',
      },
      female: {
        title: '비단 꽃길',
        desc: '타고난 센스와 예술적 감각으로 삶을 아름답게 수놓는 예인.',
      },
    },
    을미: {
      male: {
        title: '사막의 선인장',
        desc: '건조하고 척박한 환경에서도 끝까지 살아남아 결실을 보는 생존자.',
      },
      female: {
        title: '백사장 위의 갈대',
        desc: '바람에 흔들릴지언정 꺾이지 않고 현실을 지켜내는 억척스러운 힘.',
      },
    },
    을유: {
      male: {
        title: '칼날 위의 덩굴',
        desc: '살벌한 바위 틈에서도 뿌리를 내리는 강인한 정신력과 결단력.',
      },
      female: {
        title: '바위 틈의 백합',
        desc: '날카로운 환경 속에서도 순수함과 도도함을 잃지 않는 고결한 영혼.',
      },
    },
    을해: {
      male: {
        title: '강물 위의 부평초',
        desc: '세상의 흐름에 몸을 맡기고 유유자적하며 지혜를 낚는 현자.',
      },
      female: {
        title: '물 위의 연꽃',
        desc: '탁한 세상에 물들지 않고 맑고 깨끗한 마음을 지키는 자애로운 모성.',
      },
    },

    // === 병화 (丙火) ===
    병인: {
      male: {
        title: '새벽의 호랑이',
        desc: '어둠을 찢고 포효하며 새로운 시대를 여는 희망의 선구자.',
      },
      female: {
        title: '숲 속의 아침해',
        desc: '밝고 명랑한 에너지로 주변 사람들에게 활력을 불어넣는 비타민.',
      },
    },
    병진: {
      male: {
        title: '구름 위의 태양',
        desc: '자애로운 빛으로 만물을 기르며 존경받는 덕망 높은 지도자.',
      },
      female: {
        title: '황금 들판의 빛',
        desc: '모든 것을 포용하고 베풀며 식복과 재복을 타고난 여왕.',
      },
    },
    병오: {
      male: {
        title: '제왕의 태양',
        desc: '하늘 정중앙에서 세상을 호령하는 가장 강력하고 독보적인 권력자.',
      },
      female: {
        title: '전장의 잔다르크',
        desc: '누구에게도 지지 않는 승부욕과 열정으로 앞장서서 리드하는 여걸.',
      },
    },
    병신: {
      male: {
        title: '도시의 네온',
        desc: '다재다능한 재주로 세상을 화려하게 비추는 만능 엔터테이너.',
      },
      female: {
        title: '붉은 노을',
        desc: '감상적이고 낭만적인 분위기로 사람을 매료시키는 신비로운 매력.',
      },
    },
    병술: {
      male: {
        title: '산사의 등불',
        desc: '해가 진 산속에서 세상을 위해 홀로 기도하고 봉사하는 철학자.',
      },
      female: {
        title: '가을의 단풍',
        desc: '화려함 뒤에 쓸쓸함을 감추고 예술과 종교에 심취하는 영적인 여인.',
      },
    },
    병자: {
      male: {
        title: '호수의 달빛',
        desc: '태양이지만 달처럼 은은하게, 겉은 화려하나 속은 고뇌하는 지성인.',
      },
      female: {
        title: '밤바다의 등대',
        desc: '어두운 세상에서 원칙을 지키며 길을 밝혀주는 단정한 귀부인.',
      },
    },

    // === 정화 (丁火) ===
    정묘: {
      male: {
        title: '숲 속의 모닥불',
        desc: '은은한 따뜻함과 신비로운 직감으로 사람의 마음을 꿰뚫는 예언자.',
      },
      female: {
        title: '달빛 아래 옥토끼',
        desc: '섬세하고 감각적인 예술성으로 사랑받는 매력적인 소녀.',
      },
    },
    정사: {
      male: {
        title: '용광로의 불꽃',
        desc: '폭발적인 에너지와 집념으로 목표를 향해 돌진하는 뜨거운 야망가.',
      },
      female: {
        title: '붉은 뱀',
        desc: '화려한 언변과 사교성으로 주변을 압도하며 자신의 뜻을 이루는 책략가.',
      },
    },
    정미: {
      male: {
        title: '사막의 별',
        desc: '메마른 땅에서도 꿈을 잃지 않고 묵묵히 타오르는 희생적인 봉사자.',
      },
      female: {
        title: '뜨거운 대지',
        desc: '겉은 부드러우나 속은 누구보다 뜨거운 열정을 품고 있는 강인한 내면.',
      },
    },
    정유: {
      male: {
        title: '어둠 속의 보석',
        desc: '밤에 더욱 빛나는 귀한 존재로, 예리한 분석력을 가진 완벽주의자.',
      },
      female: {
        title: '성전의 촛불',
        desc: '단정하고 기품 있는 모습으로 재물과 인기를 한몸에 받는 귀인.',
      },
    },
    정해: {
      male: {
        title: '밤바다의 별빛',
        desc: '천문과 지리를 통달한 듯한 깊은 지혜와 영감을 가진 선비.',
      },
      female: {
        title: '호수의 반딧불',
        desc: '여리고 섬세한 감성으로 타인의 마음을 치유하는 따뜻한 힐러.',
      },
    },
    정축: {
      male: {
        title: '설원의 화로',
        desc: '차가운 세상 속에서 자신의 재능을 갈고닦아 마침내 드러내는 장인.',
      },
      female: {
        title: '금고 속의 등불',
        desc: '알뜰하고 야무지게 재물을 모으며 가족을 지키는 현명한 관리자.',
      },
    },

    // === 무토 (戊土) ===
    무진: {
      male: {
        title: '태산의 황룡',
        desc: '거대한 스케일과 포용력으로 조직을 장악하고 호령하는 대장군.',
      },
      female: {
        title: '대지의 여왕',
        desc: '굳건한 신뢰와 뚝심으로 흔들림 없이 자신의 영역을 지키는 여장부.',
      },
    },
    무오: {
      male: {
        title: '활화산',
        desc: '내면에 끓어오르는 마그마 같은 열정으로 세상을 뒤흔드는 패왕.',
      },
      female: {
        title: '붉은 야생마',
        desc: '누구의 간섭도 받지 않고 자유롭게 세상을 누비는 정열적인 여인.',
      },
    },
    무신: {
      male: {
        title: '고산의 수도승',
        desc: '세속을 떠난 듯 고독하지만 비범한 재주로 세상을 경영하는 전략가.',
      },
      female: {
        title: '요새의 지휘관',
        desc: '뛰어난 활동력과 생활력으로 가정을 일으키고 재물을 모으는 능력자.',
      },
    },
    무술: {
      male: {
        title: '황금 봉우리',
        desc: '그 무엇으로도 뚫을 수 없는 강한 고집과 신념을 가진 고독한 영웅.',
      },
      female: {
        title: '광야의 수호신',
        desc: '투박하지만 속정이 깊고, 한 번 믿으면 끝까지 의리를 지키는 신의.',
      },
    },
    무자: {
      male: {
        title: '안개 속의 산',
        desc: '겉으로는 묵직하나 속으로는 치밀하게 실속을 챙기는 냉철한 사업가.',
      },
      female: {
        title: '산 아래 보물',
        desc: '다정다감하고 알뜰하여 재물을 산처럼 쌓아 올리는 복덩이.',
      },
    },
    무인: {
      male: {
        title: '백두산 호랑이',
        desc: '험준한 산을 호령하며 명예와 권위를 목숨보다 중시하는 권력자.',
      },
      female: {
        title: '산사의 거목',
        desc: '카리스마와 리더십으로 뭇사람들의 존경을 받는 우두머리.',
      },
    },

    // === 기토 (己土) ===
    기사: {
      male: {
        title: '밭 숲의 뱀',
        desc: '조용히 기회를 엿보다가 순간적인 재치로 큰 성과를 내는 지략가.',
      },
      female: {
        title: '숨겨진 마그마',
        desc: '얌전해 보이나 결정적인 순간에 폭발적인 에너지를 발산하는 반전 매력.',
      },
    },
    기미: {
      male: {
        title: '메마른 대지',
        desc: '어떤 시련에도 굴하지 않고 묵묵히 자신의 길을 가는 은근한 고집쟁이.',
      },
      female: {
        title: '비밀의 정원',
        desc: '신비로운 분위기와 강한 자존심으로 자신의 내면을 쉽게 드러내지 않는 여인.',
      },
    },
    기유: {
      male: { title: '가을 들판', desc: '예리한 직관과 손재주로 무엇이든 만들어내는 만능 재주꾼.' },
      female: {
        title: '옥토의 결실',
        desc: '섬세하고 꼼꼼하게 챙기며 실속 있는 삶을 꾸려가는 현모양처.',
      },
    },
    기해: {
      male: {
        title: '강변의 옥토',
        desc: '유연한 사고와 친화력으로 어디서든 환영받는 처세의 달인.',
      },
      female: {
        title: '바다 속의 진주',
        desc: '겉으로는 유순하나 속은 깊고 넓어 재물과 복을 타고난 귀인.',
      },
    },
    기축: {
      male: {
        title: '겨울 논밭',
        desc: '남들이 모르는 곳에서 끈질기게 노력하여 기어이 성공을 일구는 노력파.',
      },
      female: {
        title: '금광의 흙',
        desc: '보이지 않는 곳에서 묵묵히 내실을 다지며 재물을 모으는 알부자.',
      },
    },
    기묘: {
      male: {
        title: '들판의 토끼',
        desc: '민첩하고 예민한 감각으로 척박한 환경을 개척해 나가는 개척자.',
      },
      female: {
        title: '봄날의 텃밭',
        desc: '싱그러운 생명력으로 주변을 보살피며 키워내는 생활력 강한 여인.',
      },
    },

    // === 경금 (庚金) ===
    경오: {
      male: {
        title: '백마 탄 장군',
        desc: '공명정대하고 반듯한 기품으로 조직을 이끄는 고위 관료.',
      },
      female: {
        title: '제단의 검',
        desc: '화려한 외모와 단호한 결단력으로 자신의 영역을 확실히 지키는 여왕.',
      },
    },
    경신: {
      male: { title: '강철 거인', desc: '천하를 개혁하려는 강력한 힘과 의리로 뭉친 혁명가.' },
      female: {
        title: '무쇠 바위',
        desc: '그 누구에게도 의지하지 않고 스스로 운명을 개척하는 독립적인 여걸.',
      },
    },
    경술: {
      male: {
        title: '무기고의 수호자',
        desc: '투박하고 거칠지만, 내 사람에게는 목숨을 바치는 의리의 사나이.',
      },
      female: {
        title: '황금 사자',
        desc: '압도적인 카리스마와 기개로 남성조차 능가하는 강력한 리더십.',
      },
    },
    경자: {
      male: {
        title: '차가운 종소리',
        desc: '냉철한 비판 의식과 맑은 지성으로 세상을 깨우는 고독한 지성인.',
      },
      female: {
        title: '서리 내린 바위',
        desc: '청아하고 고고한 매력으로 누구와도 타협하지 않는 도도한 예술가.',
      },
    },
    경인: {
      male: {
        title: '숲 속의 백호',
        desc: '거침없이 목표를 향해 돌진하며 큰 판을 벌이는 스케일 큰 사업가.',
      },
      female: {
        title: '전장의 여신',
        desc: '가정에 갇히지 않고 사회에서 당당하게 능력을 발휘하는 활동가.',
      },
    },
    경진: {
      male: {
        title: '강철 비늘의 용',
        desc: '웅장한 포부와 끈기로 권력의 정점에 오르고자 하는 야심가.',
      },
      female: {
        title: '갑옷 입은 무사',
        desc: '강인한 정신력과 투지로 어떤 난관도 돌파해내는 불굴의 여인.',
      },
    },

    // === 신금 (辛金) ===
    신미: {
      male: {
        title: '뜨거운 모래 속 보석',
        desc: '시련 속에서도 날카로운 예리함을 잃지 않고 자신을 단련하는 수행자.',
      },
      female: {
        title: '사막의 진주',
        desc: '은근한 고집과 끈기로 메마른 환경에서도 끝내 빛을 발하는 귀한 존재.',
      },
    },
    신유: {
      male: {
        title: '전설의 명검',
        desc: '타협을 모르는 순수함과 냉혹함으로 한 분야의 정점을 찍는 전문가.',
      },
      female: {
        title: '얼음 공주',
        desc: '차가울 정도로 완벽하고 고귀하여 범접할 수 없는 아름다움.',
      },
    },
    신해: {
      male: {
        title: '씻긴 다이아몬드',
        desc: '뛰어난 언변과 총명한 두뇌로 세상을 유랑하며 재능을 펼치는 천재.',
      },
      female: {
        title: '심연의 보석',
        desc: '감수성이 풍부하고 예민하며, 남다른 예술적 감각을 지닌 뮤즈.',
      },
    },
    신축: {
      male: {
        title: '설원의 은장도',
        desc: '차가운 이성과 날카로운 직관으로 때를 기다리며 준비하는 참모.',
      },
      female: {
        title: '얼어붙은 보석',
        desc: '속마음을 감추고 냉정해 보이지만, 내면에 뜨거운 복수심과 야망을 품은 여인.',
      },
    },
    신묘: {
      male: {
        title: '달빛 어린 칼',
        desc: '예리한 감각과 섬세함으로 틈새를 파고들어 성공하는 전략가.',
      },
      female: {
        title: '하얀 토끼',
        desc: '겉으로는 여리고 순해 보이나 실속을 챙길 줄 아는 외유내강의 실리파.',
      },
    },
    신사: {
      male: {
        title: '불 속의 보석',
        desc: '시련을 통해 더욱 단단해지며 권력과 명예를 지향하는 엘리트.',
      },
      female: {
        title: '지혜의 백사',
        desc: '단정하고 화려한 외모 뒤에 변화무쌍한 지혜를 감춘 매혹적인 여인.',
      },
    },

    // === 임수 (壬水) ===
    임신: {
      male: {
        title: '대하의 원류',
        desc: '끊임없이 솟아나는 아이디어와 지식으로 문명을 이끄는 학자.',
      },
      female: {
        title: '맑은 수원',
        desc: '융통성과 포용력을 갖추고 주변에 지혜를 공급하는 마르지 않는 샘.',
      },
    },
    임술: {
      male: {
        title: '검은 바다의 늑대',
        desc: '거친 파도를 다스리듯 강력한 통제력으로 재물과 권력을 쥐는 제왕.',
      },
      female: {
        title: '산 속의 호수',
        desc: '깊이를 알 수 없는 신비로움과 직관력으로 사람을 끌어당기는 여인.',
      },
    },
    임자: {
      male: {
        title: '북방의 해일',
        desc: '모든 것을 집어삼킬 듯한 압도적인 힘과 배포를 가진 영웅호걸.',
      },
      female: {
        title: '밤의 여신',
        desc: '고요하지만 거대한 에너지를 품고 있어 누구도 함부로 할 수 없는 카리스마.',
      },
    },
    임인: {
      male: {
        title: '강을 건너는 호랑이',
        desc: '지혜와 용맹을 겸비하여 새로운 세상으로 나아가는 위대한 탐험가.',
      },
      female: {
        title: '지혜의 식신',
        desc: '총명한 두뇌와 따뜻한 마음으로 주변을 먹여 살리고 베푸는 큰언니.',
      },
    },
    임진: {
      male: {
        title: '폭풍 속의 흑룡',
        desc: '변화무쌍하고 속을 알 수 없으나, 결정적인 순간 천하를 뒤집는 권력자.',
      },
      female: {
        title: '괴강의 여주인',
        desc: '남자 못지않은 배포와 추진력으로 난세를 평정하고 우뚝 서는 여걸.',
      },
    },
    임오: {
      male: {
        title: '호수의 달빛',
        desc: '물과 불의 조화로움 속에 몽환적인 매력을 발산하는 인기인.',
      },
      female: {
        title: '정열의 바다',
        desc: '부드러움 속에 계산된 치밀함으로 재물과 사랑을 모두 쟁취하는 전략가.',
      },
    },

    // === 계수 (癸水) ===
    계유: {
      male: {
        title: '맑은 옹달샘',
        desc: '티 없이 맑고 순수한 정신으로 한 길을 파고드는 고고한 예술가.',
      },
      female: {
        title: '바위 틈의 샘물',
        desc: '차갑고 도도하지만 누구보다 깨끗하고 결백한 마음을 지닌 여인.',
      },
    },
    계해: {
      male: {
        title: '심연의 바다',
        desc: '우주의 모든 이치를 담고 있는 듯, 깊고 넓은 지혜를 가진 예지자.',
      },
      female: {
        title: '그림자의 강',
        desc: '겉으로는 유순하나 내면에는 거대한 바다와 같은 강한 고집과 승부욕을 감춘 여인.',
      },
    },
    계축: {
      male: {
        title: '얼어붙은 땅의 소',
        desc: '묵묵히 참고 견디며 남들이 포기한 곳에서 싹을 틔우는 인내의 화신.',
      },
      female: {
        title: '겨울비',
        desc: '차가운 지성과 영적인 직감으로 세상을 바라보는 신비로운 예언자.',
      },
    },
    계묘: {
      male: {
        title: '숲 속의 아침이슬',
        desc: '싱그럽고 다정다감하여 누구에게나 사랑받는 순수한 영혼.',
      },
      female: {
        title: '봄비 내리는 정원',
        desc: '섬세하고 여린 감수성으로 타인을 배려하고 기르는 자애로운 어머니.',
      },
    },
    계사: {
      male: {
        title: '안개 낀 화산',
        desc: '차가움과 뜨거움이 공존하는 변덕 속에 천재적인 영감이 번뜩이는 귀재.',
      },
      female: {
        title: '흑진주',
        desc: '조용히 빛나지만 내면에는 강력한 재물운과 활동력을 품고 있는 실속파.',
      },
    },
    계미: {
      male: {
        title: '사막의 단비',
        desc: '메마른 곳을 적셔주듯, 자신을 희생하여 타인을 구원하는 활인업의 성자.',
      },
      female: {
        title: '붉은 대지의 비',
        desc: '예민하고 급한 성격 뒤에 숨겨진 깊은 희생정신과 봉사심을 가진 여인.',
      },
    },
  },

  en: {
    // === GAP (Wood) ===
    갑자: {
      male: {
        title: 'Blue Dragon of the Deep',
        desc: 'The spirit of a leader who hides deep wisdom and waits for the moment to soar.',
      },
      female: {
        title: 'Laurel of the Lake',
        desc: 'A queen of wisdom who overwhelms her surroundings with cool intellect and lofty pride.',
      },
    },
    갑인: {
      male: {
        title: 'King of the Forest',
        desc: 'Absolute charisma that builds its own kingdom without bowing to anyone.',
      },
      female: {
        title: 'Great Tree of the Highland',
        desc: 'A strong heroine who stands alone, enduring storms and embracing everyone.',
      },
    },
    갑진: {
      male: {
        title: 'Ruler of the Wilderness',
        desc: 'An indomitable pioneer who transforms barren land into fertile territory.',
      },
      female: {
        title: 'Goddess of the Earth',
        desc: 'A mother figure who holds abundant wealth and vitality, enriching the world.',
      },
    },
    갑오: {
      male: {
        title: 'Galloping Red Horse',
        desc: 'A revolutionary who runs ceaselessly toward ideals to change the world.',
      },
      female: {
        title: 'Dancer of the Sun',
        desc: 'A star who captures the public eye with brilliant eloquence and passion.',
      },
    },
    갑신: {
      male: {
        title: 'Pine on the Cliff',
        desc: 'A cool-headed leader who keeps integrity and leads the organization even in precarious situations.',
      },
      female: {
        title: 'Orchid on the Rock',
        desc: 'A resilient woman who overcomes harsh environments to bloom a noble flower.',
      },
    },
    갑술: {
      male: {
        title: 'Wolf of the Wilds',
        desc: 'A tenacious victor who walks a lonely path but ultimately achieves the goal.',
      },
      female: {
        title: 'Oasis of the Desert',
        desc: 'The incarnation of vitality who feeds family and surroundings in a dry reality.',
      },
    },

    // === EUL (Wood) ===
    을축: {
      male: {
        title: 'Pine of the Frozen Land',
        desc: 'A patient man who endures cold trials and silently gains substance to become wealthy.',
      },
      female: {
        title: 'Winter Plum Blossom',
        desc: 'A symbol of inner strength, blooming fragrance even in a snowstorm.',
      },
    },
    을묘: {
      male: {
        title: 'Wind of the Green Field',
        desc: 'A wanderer with a free soul who spreads vitality wherever he goes.',
      },
      female: {
        title: 'Garden of Spring',
        desc: 'A charming socialite who attracts people with soft affinity and persistence.',
      },
    },
    을사: {
      male: {
        title: 'Dancing Golden Snake',
        desc: 'A genius strategist who navigates turbulent times with brilliant talent and improvisation.',
      },
      female: {
        title: 'Silk Flower Path',
        desc: 'An artist who beautifully embroiders life with innate sense and artistic taste.',
      },
    },
    을미: {
      male: {
        title: 'Cactus of the Desert',
        desc: 'A survivor who survives to the end and bears fruit even in dry and barren environments.',
      },
      female: {
        title: 'Reed on the White Sand',
        desc: 'A tough power that protects reality without breaking, even if shaken by the wind.',
      },
    },
    을유: {
      male: {
        title: 'Vine on the Blade',
        desc: 'Strong mentality and decisiveness to take root even in sharp rock crevices.',
      },
      female: {
        title: 'Lily in the Cracks',
        desc: 'A noble soul who does not lose purity and haughtiness even in a sharp environment.',
      },
    },
    을해: {
      male: {
        title: 'Duckweed on the River',
        desc: 'A wise man who leaves himself to the flow of the world and fishes for wisdom.',
      },
      female: {
        title: 'Lotus on the Water',
        desc: 'Benevolent motherhood that keeps a clear and clean mind without being stained by the muddy world.',
      },
    },

    // === BYEONG (Fire) ===
    병인: {
      male: {
        title: 'Tiger of the Dawn',
        desc: 'A pioneer of hope who tears through the darkness and roars to open a new era.',
      },
      female: {
        title: 'Sunlight in the Forest',
        desc: 'A vitamin-like presence that breathes vitality into people with bright and cheerful energy.',
      },
    },
    병진: {
      male: {
        title: 'Sun above Clouds',
        desc: 'A highly respected leader who nurtures all things with benevolent light.',
      },
      female: {
        title: 'Light of the Golden Field',
        desc: 'A queen born with blessings of food and wealth, embracing and giving everything.',
      },
    },
    병오: {
      male: {
        title: 'Imperial Sun',
        desc: 'The most powerful and unique authority who commands the world from the center of the sky.',
      },
      female: {
        title: 'Joan of Arc of the Battlefield',
        desc: 'A heroine who takes the lead with competitiveness and passion that loses to no one.',
      },
    },
    병신: {
      male: {
        title: 'Neon of the City',
        desc: 'an all-round entertainer who illuminates the world brilliantly with versatile talents.',
      },
      female: {
        title: 'Red Sunset',
        desc: 'Mysterious charm that fascinates people with a sentimental and romantic atmosphere.',
      },
    },
    병술: {
      male: {
        title: 'Lantern of the Temple',
        desc: 'A philosopher who prays and serves the world alone in the mountain after sunset.',
      },
      female: {
        title: 'Autumn Maple',
        desc: 'A spiritual woman who hides loneliness behind splendor and indulges in art and religion.',
      },
    },
    병자: {
      male: {
        title: 'Moonlight on the Lake',
        desc: 'An intellectual who is like the sun but gentle like the moon, flashy on the outside but agonizing inside.',
      },
      female: {
        title: 'Lighthouse of the Night Sea',
        desc: 'A neat lady who keeps principles in a dark world and lights the way.',
      },
    },

    // === JEONG (Fire) ===
    정묘: {
      male: {
        title: 'Campfire in the Forest',
        desc: "A prophet who penetrates people's hearts with subtle warmth and mysterious intuition.",
      },
      female: {
        title: 'Moonlit Jade Rabbit',
        desc: 'A charming girl loved for her delicate and sensuous artistry.',
      },
    },
    정사: {
      male: {
        title: 'Flame of the Furnace',
        desc: 'A hot ambitious man who rushes toward his goal with explosive energy and tenacity.',
      },
      female: {
        title: 'Red Serpent',
        desc: 'A schemer who overwhelms the surroundings with brilliant eloquence and sociability to achieve her will.',
      },
    },
    정미: {
      male: {
        title: 'Star of the Desert',
        desc: 'A sacrificial volunteer who burns silently without losing his dream even on dry land.',
      },
      female: {
        title: 'Hot Earth',
        desc: 'Strong inner self that is soft on the outside but holds a passion hotter than anyone else inside.',
      },
    },
    정유: {
      male: {
        title: 'Jewel in the Dark',
        desc: 'A precious existence that shines more at night, a perfectionist with keen analytical skills.',
      },
      female: {
        title: 'Candle of the Sanctuary',
        desc: 'A noble person who receives wealth and popularity with a neat and elegant appearance.',
      },
    },
    정해: {
      male: {
        title: 'Starlight on the Sea',
        desc: 'A scholar with deep wisdom and inspiration as if he had mastered astronomy and geography.',
      },
      female: {
        title: 'Firefly of the Lake',
        desc: "A warm healer who heals others' hearts with delicate and fragile emotions.",
      },
    },
    정축: {
      male: {
        title: 'Brazier in the Snowfield',
        desc: 'A craftsman who polishes his talents in a cold world and finally reveals them.',
      },
      female: {
        title: 'Lamp in the Vault',
        desc: 'A wise manager who gathers wealth frugally and protects the family.',
      },
    },

    // === MU (Earth) ===
    무진: {
      male: {
        title: 'Yellow Dragon of the Great Mountain',
        desc: 'A great general who seizes and commands the organization with huge scale and tolerance.',
      },
      female: {
        title: 'Queen of the Earth',
        desc: 'A heroine who protects her territory without wavering with firm trust and perseverance.',
      },
    },
    무오: {
      male: {
        title: 'Active Volcano',
        desc: 'A supreme ruler who shakes the world with magma-like passion boiling inside.',
      },
      female: {
        title: 'Red Wild Horse',
        desc: 'A passionate woman who freely roams the world without interference from anyone.',
      },
    },
    무신: {
      male: {
        title: 'Monk of the High Mountain',
        desc: 'A strategist who manages the world with extraordinary talent, solitary as if he had left the secular world.',
      },
      female: {
        title: 'Commander of the Fortress',
        desc: 'A capable person who raises a family and collects wealth with excellent activity and vitality.',
      },
    },
    무술: {
      male: {
        title: 'Golden Peak',
        desc: 'A lonely hero with strong stubbornness and beliefs that cannot be pierced by anything.',
      },
      female: {
        title: 'Guardian of the Wilderness',
        desc: 'Rough but deep-hearted, a faith that keeps loyalty to the end once trusted.',
      },
    },
    무자: {
      male: {
        title: 'Mountain in the Mist',
        desc: 'A cool-headed businessman who is heavy on the outside but meticulously takes care of substance on the inside.',
      },
      female: {
        title: 'Treasure under the Mountain',
        desc: 'A lucky charm who piles up wealth like a mountain by being affectionate and frugal.',
      },
    },
    무인: {
      male: {
        title: 'Tiger of Baekdu Mountain',
        desc: 'A powerful man who commands rugged mountains and values honor and authority more than life.',
      },
      female: {
        title: 'Great Tree of the Temple',
        desc: 'A boss who is respected by many people for charisma and leadership.',
      },
    },

    // === GI (Earth) ===
    기사: {
      male: {
        title: 'Snake in the Field',
        desc: 'A strategist who quietly waits for an opportunity and achieves great results with momentary wit.',
      },
      female: {
        title: 'Hidden Magma',
        desc: 'Reverse charm that looks quiet but emits explosive energy at decisive moments.',
      },
    },
    기미: {
      male: {
        title: 'Parched Earth',
        desc: 'A subtle stubborn person who silently goes his own way without yielding to any trials.',
      },
      female: {
        title: 'Secret Garden',
        desc: 'A woman who does not easily reveal her inner self with a mysterious atmosphere and strong pride.',
      },
    },
    기유: {
      male: {
        title: 'Autumn Field',
        desc: 'An all-round talent who makes anything with keen intuition and dexterity.',
      },
      female: {
        title: 'Fruit of the Fertile Soil',
        desc: 'A wise mother and good wife who takes care of things delicately and meticulously and leads a substantial life.',
      },
    },
    기해: {
      male: {
        title: 'Fertile Land by the River',
        desc: 'A master of conduct who is welcomed anywhere with flexible thinking and affinity.',
      },
      female: {
        title: 'Pearl in the Sea',
        desc: 'A noble person who is gentle on the outside but deep and wide on the inside, born with wealth and blessings.',
      },
    },
    기축: {
      male: {
        title: 'Winter Field',
        desc: 'A hard worker who persistently tries in places others do not know and eventually cultivates success.',
      },
      female: {
        title: 'Soil of the Gold Mine',
        desc: 'A rich person who silently strengthens internal stability in invisible places and collects wealth.',
      },
    },
    기묘: {
      male: {
        title: 'Rabbit in the Field',
        desc: 'A pioneer who cultivates barren environments with agile and keen senses.',
      },
      female: {
        title: 'Vegetable Garden in Spring',
        desc: 'A woman with strong vitality who takes care of and raises surroundings with fresh vitality.',
      },
    },

    // === GYEONG (Metal) ===
    경오: {
      male: {
        title: 'General on a White Horse',
        desc: 'A high-ranking official who leads the organization with fairness and upright elegance.',
      },
      female: {
        title: 'Sword of the Altar',
        desc: 'A queen who firmly protects her territory with a fancy appearance and decisive determination.',
      },
    },
    경신: {
      male: {
        title: 'Iron Giant',
        desc: 'A revolutionary united with powerful strength and loyalty to reform the world.',
      },
      female: {
        title: 'Iron Rock',
        desc: 'A independent heroine who carves out her own destiny without relying on anyone.',
      },
    },
    경술: {
      male: {
        title: 'Guardian of the Armory',
        desc: 'A crude and rough man of loyalty who dedicates his life to his people.',
      },
      female: {
        title: 'Golden Lion',
        desc: 'Strong leadership that surpasses even men with overwhelming charisma and spirit.',
      },
    },
    경자: {
      male: {
        title: 'Cold Bell Toll',
        desc: 'A solitary intellectual who wakes up the world with cool-headed critical consciousness and clear intellect.',
      },
      female: {
        title: 'Frosted Rock',
        desc: 'A haughty artist who does not compromise with anyone with clear and noble charm.',
      },
    },
    경인: {
      male: {
        title: 'White Tiger in the Forest',
        desc: 'A large-scale businessman who rushes toward the goal without hesitation.',
      },
      female: {
        title: 'Goddess of War',
        desc: 'An activist who demonstrates ability confidently in society without being confined to the home.',
      },
    },
    경진: {
      male: {
        title: 'Dragon of Steel Scales',
        desc: 'An ambitious man who wants to rise to the pinnacle of power with grand aspirations and tenacity.',
      },
      female: {
        title: 'Armored Warrior',
        desc: 'An indomitable woman who breaks through any difficulties with strong mental power and fighting spirit.',
      },
    },

    // === SIN (Metal) ===
    신미: {
      male: {
        title: 'Jewel in Hot Sand',
        desc: 'A practitioner who trains himself without losing sharp keenness even in trials.',
      },
      female: {
        title: 'Pearl of the Desert',
        desc: 'A precious existence that shines in the end even in a dry environment with subtle stubbornness and persistence.',
      },
    },
    신유: {
      male: {
        title: 'Legendary Sword',
        desc: 'An expert who hits the peak of a field with purity and coldness that knows no compromise.',
      },
      female: {
        title: 'Ice Princess',
        desc: 'Beauty that cannot be approached because it is cold enough to be perfect and noble.',
      },
    },
    신해: {
      male: {
        title: 'Washed Diamond',
        desc: 'A genius who wanders the world with excellent eloquence and brilliant brain and unfolds his talents.',
      },
      female: {
        title: 'Jewel of the Abyss',
        desc: 'A muse with rich sensitivity, sensitivity, and extraordinary artistic sense.',
      },
    },
    신축: {
      male: {
        title: 'Silver Knife in Snow',
        desc: 'A staff officer who waits for the time and prepares with cold reason and sharp intuition.',
      },
      female: {
        title: 'Frozen Jewel',
        desc: 'A woman who hides her inner thoughts and looks cold, but harbors hot revenge and ambition inside.',
      },
    },
    신묘: {
      male: {
        title: 'Moonlit Blade',
        desc: 'A strategist who succeeds by digging into gaps with keen senses and delicacy.',
      },
      female: {
        title: 'White Rabbit',
        desc: 'A pragmatist who looks soft and gentle on the outside but knows how to take care of substance.',
      },
    },
    신사: {
      male: {
        title: 'Jewel in the Fire',
        desc: 'An elite who becomes harder through trials and aims for power and honor.',
      },
      female: {
        title: 'White Snake of Wisdom',
        desc: 'A fascinating woman who hides ever-changing wisdom behind a neat and fancy appearance.',
      },
    },

    // === IM (Water) ===
    임신: {
      male: {
        title: 'Source of the Great River',
        desc: 'A scholar who leads civilization with constantly springing ideas and knowledge.',
      },
      female: {
        title: 'Clear Water Source',
        desc: 'A spring that does not dry up, supplying wisdom to the surroundings with flexibility and tolerance.',
      },
    },
    임술: {
      male: {
        title: 'Black Wolf of the Sea',
        desc: 'A king who holds wealth and power with strong control as if controlling rough waves.',
      },
      female: {
        title: 'Lake in the Mountain',
        desc: 'A woman who attracts people with mysteriousness and intuition of unknown depth.',
      },
    },
    임자: {
      male: {
        title: 'Northern Tsunami',
        desc: 'A hero with overwhelming power and boldness that seems to swallow everything.',
      },
      female: {
        title: 'Goddess of the Night',
        desc: 'Charisma that no one can dare to touch because she is quiet but has huge energy.',
      },
    },
    임인: {
      male: {
        title: 'Tiger Crossing the River',
        desc: 'A great explorer who advances to a new world with wisdom and bravery.',
      },
      female: {
        title: 'Goddess of Wisdom and Food',
        desc: 'A big sister who feeds and gives to the surroundings with a brilliant brain and warm heart.',
      },
    },
    임진: {
      male: {
        title: 'Black Dragon in the Storm',
        desc: 'A man of power who is ever-changing and unknown inside, but overturns the world at decisive moments.',
      },
      female: {
        title: 'Mistress of Goegang',
        desc: 'A heroine who calms turbulent times and stands tall with boldness and drive comparable to men.',
      },
    },
    임오: {
      male: {
        title: 'Moonlight on the Lake',
        desc: 'A popular person who exudes mysterious and dreamy charm amidst the harmony of water and fire.',
      },
      female: {
        title: 'Sea of Passion',
        desc: 'A strategist who wins both wealth and love with calculated meticulousness in softness.',
      },
    },

    // === GYE (Water) ===
    계유: {
      male: {
        title: 'Clear Spring Water',
        desc: 'A noble artist who digs one path with a clear and pure spirit.',
      },
      female: {
        title: 'Spring in the Rock',
        desc: 'A woman who is cold and haughty but has a cleaner and more innocent heart than anyone else.',
      },
    },
    계해: {
      male: {
        title: 'Abyssal Ocean',
        desc: 'A prophet with deep and wide wisdom, as if containing all the principles of the universe.',
      },
      female: {
        title: 'River of Shadows',
        desc: 'A woman who is gentle on the outside but hides strong stubbornness and competitive spirit like a huge ocean inside.',
      },
    },
    계축: {
      male: {
        title: 'Ox of Frozen Land',
        desc: 'An incarnation of patience who silently endures and sprouts where others give up.',
      },
      female: {
        title: 'Winter Rain',
        desc: 'A mysterious prophet who looks at the world with cold intelligence and spiritual intuition.',
      },
    },
    계묘: {
      male: {
        title: 'Morning Dew in the Forest',
        desc: 'A pure soul loved by everyone for being fresh and affectionate.',
      },
      female: {
        title: 'Rainy Spring Garden',
        desc: 'A benevolent mother who cares for and raises others with delicate and fragile sensitivity.',
      },
    },
    계사: {
      male: {
        title: 'Volcano in the Mist',
        desc: 'A genius whose brilliant inspiration flashes in the capriciousness where cold and heat coexist.',
      },
      female: {
        title: 'Black Pearl',
        desc: 'A substantial person who shines quietly but harbors strong wealth luck and vitality inside.',
      },
    },
    계미: {
      male: {
        title: 'Rain in the Desert',
        desc: 'A saint of life-saving work who saves others by sacrificing himself, as if wetting a dry place.',
      },
      female: {
        title: 'Rain on Red Earth',
        desc: 'A woman with deep spirit of sacrifice and service hidden behind a sensitive and impatient personality.',
      },
    },
  },
};
