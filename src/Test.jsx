export default function Test() {
  // AI가 생성해줄 HTML 코드가 이 변수에 들어갑니다.
  const testhtml = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400&display=swap');

  .report-container {
    font-family: 'Nanum Myeongjo', 'Batang', serif;
    background-color: #fcfbf8;
    color: #333333;
    padding: 10px;
    line-height: 1;
    max-width: 100%;
    border: 1px solid #e8e8e8;
  }
  .section-title-h2 {
    font-size: 22px;
    color: #5d4037;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #d4d4d4;
    padding-bottom: 5px;
    font-weight: 400; /* No bold */
  }
  .section-title-h3 {
    font-size: 18px;
    color: #4a4a4a;
    margin-top: 12px;
    margin-bottom: 8px;
    border-left: 4px solid #bcaaa4;
    padding-left:5px;
    font-weight: 400; /* No bold */
  }
  .report-text {
    font-size: 15px;
    text-align: justify;
    margin-bottom: 8px;
    color: #444;
  }
  .info-list {
    list-style: none;
    padding: 0;
    margin: 5px 0;
    font-size: 15px;
  }
  .info-list li {
    margin-bottom: 4px;
    padding-left: 8px;
    text-indent: -15px;
  }
  .info-list li::before {
    content: "•";
    color: #8d6e63;
    margin-right: 4px;
  }
  .keyword-summary {
    font-size: 15px;
    margin-top: 8px;
    margin-bottom: 12px;
  }
  .keyword-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
  .keyword-tag {
    background-color: #eee;
    color: #777;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 14px;
    font-weight: 400;
  }
  .keyword-explanation-block {
    margin-top: 8px;
    border: 1px solid #f0f0f0;
    padding: 8px;
    background-color: #f7f7f7;
  }
  .explanation-item {
    margin-bottom: 5px;
    padding-left: 5px;
  }
  .explanation-item::before {
    content: "◇";
    color: #8d6e63;
    margin-right: 5px;
  }
  .final-conclusion {
    font-size: 9px;
    text-align: center;
    margin-top: 30px;
    padding-top: 10px;
    border-top: 2px solid #a1887f;
    font-style: italic;
    color: #3e3e3e;
  }
</style>

<div class="report-container">

  <h1 style="text-align:center; font-size:28px; margin-bottom:40px; font-weight:400; color:#1a1a1a;">
    </h1>

  <h2 class="section-title-h2">1. Client Information</h2>
  <ul class="info-list">
    <li>Date and Time of Birth: [INPUT DATE AND TIME]</li>
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
</div>`;

  return (
    <div>
      {/* // dangerouslySetInnerHTML을 사용해야 HTML 태그가 먹힙니다. //{' '} */}
      {/* <div dangerouslySetInnerHTML={{ __html: testhtml }} /> */}
    </div>
  );
}
