import React, { useState } from 'react';
import {
  Zap,
  Brain,
  ChevronRight,
  Search,
  Database,
  Users,
  Calendar,
  AlertTriangle,
  Coins,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  AlertCircle,
  Flame,
  Puzzle,
  Lock,
} from 'lucide-react';
import AdHid from '../component/AdHid';
import AdReview from '../component/AdReview';

export default function NewYearKr({ setStep }) {
  const handleSubmit = (e) => {
    
    setStep(1);
  };
  const [activeMonth, setActiveMonth] = useState(1);
  return (
    <div className="min-h-screen bg-[#F9F3EE] text-[#4A3428] font-sans pb-20">
      <>
        <div className="w-full min-h-screen bg-[#FDF5F0] text-[#4A3428] font-sans flex flex-col items-center">
          <div className=" w-full py-10 flex flex-col items-center">
            {/* 1. 상단 로고 */}
            <div className="flex items-center gap-1.5 mb-8">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                🦁
              </div>
              <span className="text-xl font-bold tracking-tight text-[#333]">사자사주</span>
            </div>
            {/* 2. 메인 타이틀 */}
            <div className="text-center mb-10">
              <h1 className="text-[28px] font-black leading-tight mb-4 break-keep">
                2026년 병오년
                <br />
                당신의 한 해를 분석해 드립니다.
              </h1>
              <p className="text-[15px] text-gray-500 font-medium leading-relaxed break-keep px-4">
                2026년 당신의 운세를
                <br />
                사자사주에서 무료로 봐드려요!
              </p>
            </div>
            <div className="w-full">
              <img
                src="images/adImage/newyear/main.png"
                className="w-full my-6 object-cover [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
                alt="사자사주 메인"
              />
            </div>
            <div className="w-full p-6">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-[#F47521] text-white font-bold py-5 rounded-full text-[18px] shadow-[0_4px_15px_rgba(244,117,33,0.3)] flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-[#e0661a]"
              >
                2026년 전체 흐름 보기 <ChevronRight size={22} strokeWidth={3} />
              </button>
            </div>
            {/* 5. 하단 3단 정보 바 */}
            <div className="w-full flex items-center mt-12 px-2 py-4 border-t border-[#E8DCCF]">
              {/* 첫 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Users size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  27명 명리학자 참여
                  <br />
                  <span className="font-medium text-[9px]">직접 검증 데이터 기반</span>
                </span>
              </div>

              {/* 구분선 - shrink-0 추가해서 찌그러지지 않게 방지 */}
              <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

              {/* 두 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Database size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  수만 건 해석 데이터 구조화
                  <br />
                  <span className="font-medium text-[9px]">방대한 DB 활용 분석</span>
                </span>
              </div>

              {/* 구분선 */}
              <div className="h-8 w-[1px] bg-[#E8DCCF] shrink-0"></div>

              {/* 세 번째 아이템 - flex-1 추가 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Brain size={18} className="text-[#F47521]" />
                <span className="text-[10px] font-black text-gray-500 leading-tight text-center">
                  질문 맞춤
                  <br />
                  <span className="font-bold">AI 분석</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* 더미포멧 */}
      <div className="mx-6">
        {/* 세련된 안내 배너 디자인 */}
        <div className="mx-4  my-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50/50 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-[11px] font-bold text-orange-600 tracking-tight uppercase">
              Preview Mode
            </span>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              사자의 눈으로 바라본 2026년 프리뷰
            </h3>

            <div className="space-y-3">
              <p className="text-sm text-slate-500 leading-relaxed">
                2026년에 작용할 운의 흐름과 <br />
                주요 포인트를 간단히 요약해드려요
              </p>

              {/* 현재 페이지 상태를 알려주는 디바이더 겸 안내 */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-slate-200"></div>
                <p className="text-[13px] font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
                  본 페이지에서 신청하는 신년 운세는 맛보기 버전입니다. <br />
                  월별 운세와 놓치기 아쉬운 디테일 등 정식 리포트는
                  <br />
                  <span className="text-slate-800 font-semibold underline underline-offset-4 decoration-orange-300">
                    사자사주 페이지
                  </span>
                  에서 확인해보세요
                </p>
                <div className="h-[1px] w-8 bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="sjsj-report-container">
          <div></div>
          <header className="sjsj-header">
            <h1 className="sjsj-main-title">2026년 병오년 종합 리포트</h1>

            <p className="sjsj-header-sub">
              병오년은 불의 기운이 강하게 작동하는 해로, 선택과 속도가 삶의 흐름을 좌우하는
              시기입니다. 본 페이지는 실제 개인 맞춤 리포트의 일부 흐름을 체험할 수 있는 무료 맛보기
              리포트입니다.
            </p>

            <div className="sjsj-badge-summary">1분 핵심 요약</div>
          </header>
          <section className="relative sjsj-section">
            <div className="sjsj-section-label">
              <h2 className="sjsj-subTitle">책임과 도전 속에서 빛나는 성장과 변화의 해</h2>
              <p className="sjsj-label-main">
                열정적인 불꽃이 두부한모삼님을 단련하여 새로운 가치를 창조하는 한 해가 될 것입니다.
              </p>
            </div>

            <div className="sjsj-grid">
              <div className="sjsj-premium-card">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="sjsj-icon">
                  <path
                    d="M12 2C12 2 7 8 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 8 12 2 12 2Z"
                    fill="#E65100"
                  />
                  <path
                    d="M12 6C12 6 9 10 9 13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13C15 10 12 6 12 6Z"
                    fill="#FFB74D"
                  />
                </svg>
                <div className="sjsj-card-title">속도</div>
                <div className="sjsj-card-desc">
                  병오년은 기회가 빠르게 지나가며, 망설임이 곧 손실이 되는 흐름을 만듭니다.
                </div>
              </div>

              <div className="sjsj-premium-card">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8D6E63"
                  strokeWidth="1.2"
                  className="sjsj-icon"
                >
                  <path d="M3 7h18M12 3v18M7 7l-2 10h4l-2-10zm12 0l-2 10h4l-2-10z" />
                </svg>
                <div className="sjsj-card-title">선택</div>
                <div className="sjsj-card-desc">
                  여러 갈래가 동시에 열리지만, 모든 길을 다 잡을 수는 없습니다.
                </div>
              </div>

              <div className="sjsj-premium-card">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#BF360C"
                  strokeWidth="1.2"
                  className="sjsj-icon"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M16.2426 7.75736L10.5858 10.5858L7.75736 16.2426L13.4142 13.4142L16.2426 7.75736Z"
                    fill="#BF360C"
                  />
                </svg>
                <div className="sjsj-card-title">방향성</div>
                <div className="sjsj-card-desc">
                  올해의 핵심은 노력보다 ‘어디로 가는가’에 있습니다.
                </div>
              </div>
            </div>
            <AdHid
              title={
                <>
                  2026년 병오년을 관통하는 <span className="text-[#F47521]">세개의 키워드</span>
                </>
              }
              des={
                <>
                  병오년의 강렬한 에너지가 삶에 작용하여 만들어낼 올해. <br />
                  당신의 올 해의 운세를 세개의 키워드로 정리해 드려요.
                </>
              }
              badge={['1', '키워드']}
            />
          </section>

          <div className="sjsj-content-inner">
            <section className="relative sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">2026년 병오년 종합 분석</h2>
              </div>

              <div className="sjsj-info-banner">
                불의 기운은 기회를 만들지만, 동시에 과열과 소진을 부릅니다.
              </div>

              <div className="sjsj-analysis-box">
                <div className="">
                  <div className="">
                    <div className="sjsj-col-title text-fire">🔥 성장의 키워드</div>
                    <ul className="sjsj-list">
                      <li>결단력</li>
                      <li>속도감</li>
                    </ul>
                  </div>

                  <div className="">
                    <div className="sjsj-col-title text-earth">💡 활용할 요소</div>
                    <ul className="sjsj-list">
                      <li>
                        <span className="sjsj-check">✓</span> 빠른 판단
                      </li>
                      <li>
                        <span className="sjsj-check">✓</span> 우선순위 설정
                      </li>
                    </ul>
                  </div>

                  <div className="">
                    <div className="sjsj-col-title text-earth">⚠️ 주의할 요소</div>
                    <ul className="sjsj-list">
                      <li>
                        <span className="sjsj-delta">△</span> 과도한 확장
                      </li>
                      <li>
                        <span className="sjsj-delta">△</span> 감정적 결정
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="sjsj-main-content">
                  이 요약은 병오년의 전체적인 분위기와 흐름만을 담고 있습니다. 실제 리포트에서는
                  개인의 사주 구조에 따라 작용 시점과 강도가 달라집니다. 지금 느껴지는 공기감이
                  있다면, 그것이 올해의 핵심 신호입니다.
                </p>
              </div>
              <AdHid
                title={
                  <>
                    연간 운세에서
                    <span className="text-[#F47521]"> 전체 흐름</span>을 종합 분석
                  </>
                }
                des={
                  <>
                    올해의 키워드·운세 활용법·주의 요소와 올해의 총운을 전체적으로 정리해 드려요.
                    연애와 금전, 직장/사업운의 디테일까지 꼼꼼하게 챙겨보세요.
                  </>
                }
                badge={['2', '종합분석']}
              />
            </section>
            <section className="relative sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">월별 운세 상세 분석</h2>
              </div>

              <div className="sjsj-month-card">
                <div className="sjsj-month-header">
                  <div className="sjsj-month-title">
                    <h3>
                      1월 <span className="sjsj-sub-month">기축월</span>
                    </h3>
                    <div className="sjsj-progress-bar">
                      <div className="sjsj-progress-fill" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div className="sjsj-star-rating">★★★☆☆</div>
                </div>

                <div className="sjsj-month-summary-chips">
                  <div>
                    <span className="sjsj-check">✓</span> 방향: 정비
                  </div>
                  <div>
                    <span className="sjsj-check">✓</span> 주의: 무리
                  </div>
                  <div>▷ 활용: 흐름 관찰</div>
                </div>

                <p className="sjsj-long-text">
                  새해의 시작인 1월은 안정과 내실을 다지기에 좋은 시기입니다. 연초의 분위기 속에서
                  차분하게 한 해의 계획을 세우고, 부족한 부분을 보완하는 데 집중하는 것이 좋습니다.
                  기축월의 기운은 두부한모삼님의 마음을 평온하게 만들고, 현실적인 판단력을 높여줄
                  것입니다. 과거의 경험을 바탕으로 미래를 설계하고, 불필요한 것들을 정리하는 시간을
                  가지세요. 특히 재물적인 면에서는 보수적인 자세를 유지하며, 충동적인 소비나 투자를
                  자제하는 것이 중요합니다. 주변 사람들과의 관계에서는 묵묵히 자신의 역할을 수행하는
                  것이 좋지만, 때로는 자신의 의견을 분명하게 표현할 필요도 있습니다. 너무 자기
                  생각에만 갇히지 않도록 유연한 사고방식을 가지려 노력해 보세요. 건강적인 측면에서는
                  규칙적인 생활 습관을 유지하고, 충분한 휴식을 취하는 것이 중요합니다. 새로운 것을
                  시작하기보다는 기존의 것을 점검하고 다지는 데 힘쓰세요. 새로운 인연보다는 오랜
                  친구나 가족과의 유대감을 강화하는 것이 심리적 안정감을 가져다줄 것입니다. 이
                  시기는 앞으로의 활발한 활동을 위한 준비 단계이니, 서두르지 말고 차분하게 자신의
                  길을 모색하는 것이 현명합니다. 직업적으로는 새로운 프로젝트의 시작보다는 기존
                  업무의 마무리에 집중하며 성과를 내는 것이 유리합니다. 자신의 내면을 들여다보고
                  성장할 기회를 만드세요.
                </p>

                <div className="sjsj-card-footer">
                  <div className="sjsj-footer-msg">
                    차분하게 기반을 다지고 계획을 세우는 데 집중하세요.
                  </div>
                </div>
              </div>

              <div className="sjsj-month-card">
                <div className="sjsj-month-header">
                  <div className="sjsj-month-title">
                    <h3>
                      2월 <span className="sjsj-sub-month">경인월</span>
                    </h3>
                    <div className="sjsj-progress-bar">
                      <div className="sjsj-progress-fill" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div className="sjsj-star-rating">★★★☆☆</div>
                </div>

                <div className="sjsj-month-summary-chips">
                  <div>
                    <span className="sjsj-check">✓</span> 방향: 시동
                  </div>
                  <div>
                    <span className="sjsj-check">✓</span> 주의: 조급
                  </div>
                  <div>▷ 활용: 선택 보류</div>
                </div>

                <p className="sjsj-long-text">
                  새로운 기회가 보이기 시작하지만 아직은 확정 구간이 아닙니다. 움직일 수는 있으나
                  확신을 갖기에는 정보가 부족합니다. 방향을 정하기보다는 가능성을 비교하는 시기로
                  보는 것이 적절합니다. 실제 리포트에서는 개인별로 작동 시점이 달라집니다.
                </p>

                <div className="sjsj-card-footer">
                  <div className="sjsj-footer-msg">아직은 탐색</div>
                </div>
              </div>
              <AdHid
                title={
                  <>
                    한달을 미리
                    <span className="text-[#F47521]"> 설계</span>할 수 있는 청사진
                  </>
                }
                des={
                  <>
                    월별 총운을 바탕으로 연애, 금전, 비즈니스 운의 디테일을 풀어드립니다. <br />한
                    달을 미리 준비할 수 있는 상세 분석 리포트를 만나보세요.
                  </>
                }
                badge={['3', '월별 운세']}
              />
            </section>
            <section className="relative sjsj-section">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">주의할 점</h2>
                <p className="sjsj-label-main">
                  병오년은 흐름이 빠른 만큼, 특정 시기에는 조절이 필요합니다.
                </p>
              </div>

              <div className="sjsj-grid sjsj-grid-2">
                <div className="sjsj-premium-card">
                  <div className="sjsj-card-title">활용하면 좋은 달</div>
                  <div className="sjsj-premium-card">
                    <ul>
                      <li className="sjsj-check">
                        <strong>6월</strong>
                        <p className="sjsj-long-text">
                          이 달은 두부한모삼님의 리더십과 추진력이 최고조에 달하여 중요한 성과를 낼
                          수 있습니다. 새로운 프로젝트를 과감하게 시작하고, 자신의 아이디어를 현실로
                          만들어보세요.
                        </p>
                        <strong>2월</strong>
                        <p className="sjsj-long-text">
                          이 달은 활발한 활동과 새로운 기회가 찾아와 두부한모삼님의 에너지가 넘칠
                          것입니다. 적극적으로 움직이며 새로운 기회를 포착하고, 자신의 역량을 마음껏
                          펼치세요.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="sjsj-premium-card">
                  <div className="sjsj-card-title">주의해야 할 달</div>
                  <div className="sjsj-premium-card">
                    <ul>
                      <li className="sjsj-check">
                        <strong>9월</strong>
                        <p className="sjsj-long-text">
                          판단이 흔들리기 쉬운 시기입니다. 중요한 결정은 미루는 전략이 유리합니다.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <AdHid
                title={
                  <>
                    활용하면 <span className="text-[#F47521]">좋은 </span> 달과{' '}
                    <span className="text-[#F47521]">주의 </span>해야 하는 달
                  </>
                }
                des={
                  <>
                    한 해의 흐름 중 유리한 시기와 주의가 필요한 시기를 정리하고, 각 시기에 필요한
                    조언을 드려요.
                  </>
                }
                badge={['4', '주의할 점']}
              />
            </section>
          </div>
        </div>
      </div>
      <AdReview />
      {/* 전송 버튼 */}
      <div className="w-full px-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-[#F47521] text-white font-bold py-5 rounded-full text-[18px] shadow-[0_4px_15px_rgba(244,117,33,0.3)] flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-[#e0661a]"
        >
          2026년 전체 흐름 보기 <ChevronRight size={22} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
