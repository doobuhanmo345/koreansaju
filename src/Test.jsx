export default function Test() {
  return (
    <>
      {' '}
      <div class="subTitle-scroll-container">
        <div class="subTitle-tile active" onclick="handleSubTitleClick(0)">
          <span style="font-size:10px">아이콘</span>
          <span style="font-weight:bold">재물운</span>
        </div>
        <div class="subTitle-tile" onclick="handleSubTitleClick(1)">
          <span style="font-size:10px">아이콘</span>
          <span style="font-weight:bold">연애운</span>
        </div>
        <div class="subTitle-tile" onclick="handleSubTitleClick(2)">
          <span style="font-size:10px">아이콘</span>
          <span style="font-weight:bold">건강운</span>
        </div>
        <div class="subTitle-tile" onclick="handleSubTitleClick(3)">
          <span style="font-size:10px">아이콘</span>
          <span style="font-weight:bold">사업운</span>
        </div>
        <div class="subTitle-tile" onclick="handleSubTitleClick(4)">
          <span style="font-size:10px">아이콘</span>
          <span style="font-weight:bold">학업운</span>
        </div>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">재물운</h3>
        <p class="report-text-summary">[재물운을 한 줄로 요약한 문장만 작성(머릿말 생략)] </p>
        <p class="report-text">
          
          [위 요약과 한 줄 띄우고, 사주 분석을 기반으로 한 재물운 상세 내용을 300~500자로 서술.
          의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 긍정적인 재물운, 주의해야 할 재물운 요소
          서술.]
        </p>
      </div>
      <div class="report-card">
        <h2 class="section-title-h3">연애운</h2>
<p class="report-text-summary">[연애운을 한 줄로 요약한 문장만 작성(머릿말 생략)] </p>
 <p class="report-text">[위 요약과 한 줄 띄우고, 사주 분석을 기반으로 한 연애운 상세 내용을 300~500자로 서술. 의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 가상의 상대와 어떤 형태의 관계 발전이 있을 것인지 서술] </p>

      </div>
      <div class="report-card">
        <h3 class="section-title-h3">건강운</h3>
        <p class="report-text-summary">[건강운을 한 줄로 요약한 문장만 작성(머릿말 생략)] </p>
        <p class="report-text">
          [위 요약과 한 줄 띄우고, 사주 분석을 기반으로 한 건강운 상세 내용을 300~500자로 서술.
          의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 오늘 하루 주의해야 할 건강 서술]{' '}
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">사업운</h3>
        <p class="report-text-summary">[사업운을 한 줄로 요약한 문장만 작성(머릿말 생략)] </p>
        <p class="report-text">
          [위 요약과 한 줄 띄우고, 사주 분석을 기반으로 한 사업운 상세 내용을 300~500자로 서술.
          의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 오늘 사업에 있어 어떤 마음으로 임해야
          하는지 작성]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">학업운</h3>
        <p class="report-text-summary">[학업운을 한 줄로 요약한 문장만 작성(머릿말 생략)] </p>
        <p class="report-text">
          [위 요약과 한 줄 띄우고, 사주 분석을 기반으로 한 학업운 상세 내용을 300~500자로 서술.
          의뢰인의 사주와 오늘의 일진(간지) 관계를 분석하여 오늘 학업에 있어 어떤 마음으로 임해야
          하는지 작성]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">6월 운세 : 을사년 갑오월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 갑오월의 운세 총점]</p>
        <p class="report-text">
          [을사년 갑오월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">7월 운세 : 을사년 을미월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 을미월의 운세 총점]</p>
        <p class="report-text">
          [을사년 을미월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">8월 운세 : 을사년 병신월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 병신월의 운세 총점]</p>
        <p class="report-text">
          [을사년 병신월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">9월 운세 : 을사년 정유월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 정유월의 운세 총점]</p>
        <p class="report-text">
          [을사년 정유월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">10월 운세 : 을사년 무술월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 무술월의 운세 총점]</p>
        <p class="report-text">
          [을사년 무술월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">11월 운세 : 을사년 기해월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 기해월의 운세 총점]</p>
        <p class="report-text">
          [을사년 기해월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
      <div class="report-card">
        <h3 class="section-title-h3">12월 운세 : 을사년 경자월</h3>
        <p class="report-keyword">총점 : [100점 기준의 을사년 경자월의 운세 총점]</p>
        <p class="report-text">
          [을사년 경자월의 운세 300~500자, 재물운, 건강운, 직업운, 학업운, 연애운 반드시 포함]
        </p>
      </div>
    </>
  );
}
