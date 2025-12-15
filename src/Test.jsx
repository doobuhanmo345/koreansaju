import React, { useMemo, useState } from 'react';
import { Solar } from 'lunar-javascript';
import { ILJU_INTERPRETATION, calculateShinsal } from './data/sajuInt';
import { HANJA_MAP } from './data/constants';

// --- 1. 합충(Chemistry) 데이터 ---
const RELATION_RULES = {
  자축: { type: '합', name: '자축합(土)', desc: '믿음직하고 끈끈한 결속력을 가집니다' },
  인해: { type: '합', name: '인해합(木)', desc: '먼저 베풀고 화합하는 따뜻한 기운이 있습니다' },
  묘술: { type: '합', name: '묘술합(火)', desc: '예술적 감각과 뜨거운 열정이 결합된 형태입니다' },
  진유: { type: '합', name: '진유합(金)', desc: '의리와 원칙을 중요시하며 맺고 끊음이 확실합니다' },
  사신: { type: '합', name: '사신합(水)', desc: '현실적인 지혜와 변화를 추구하는 성향이 강합니다' },
  오미: { type: '합', name: '오미합(火)', desc: '화려함 속에 실속을 챙기는 조화로움이 있습니다' },
  자오: {
    type: '충',
    name: '자오충',
    desc: '물과 불이 만나 강한 에너지와 역동적인 변화를 만듭니다',
  },
  축미: {
    type: '충',
    name: '축미충',
    desc: '끈기와 고집이 부딪히니 형제나 지인 간의 갈등을 조심해야 합니다',
  },
  인신: {
    type: '충',
    name: '인신충',
    desc: '시작과 끝이 부딪히는 형상이라 이동수가 많고 매우 바쁩니다',
  },
  묘유: {
    type: '충',
    name: '묘유충',
    desc: '환경의 변화가 잦고 예민해질 수 있으니 마음을 잘 다스려야 합니다',
  },
  진술: {
    type: '충',
    name: '진술충',
    desc: '고독할 수 있으나 투쟁심과 개성이 매우 강하여 리더가 되기도 합니다',
  },
  사해: {
    type: '충',
    name: '사해충',
    desc: '쓸데없는 잡념이 많을 수 있으나 해외나 원거리 이동을 통해 해소됩니다',
  },
};

// --- 2. 천을귀인 매핑 ---
const GWIN_MAP = {
  갑: ['축', '미'],
  무: ['축', '미'],
  경: ['축', '미'],
  을: ['자', '신'],
  기: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  신: ['인', '오'],
  임: ['사', '묘'],
  계: ['사', '묘'],
};

// 오행 매핑
const OHAENG_MAP = {
  갑: 'wood',
  을: 'wood',
  인: 'wood',
  묘: 'wood',
  병: 'fire',
  정: 'fire',
  사: 'fire',
  오: 'fire',
  무: 'earth',
  기: 'earth',
  진: 'earth',
  술: 'earth',
  축: 'earth',
  미: 'earth',
  경: 'metal',
  신: 'metal',
  유: 'metal',
  임: 'water',
  계: 'water',
  해: 'water',
  자: 'water',
};

const Test = ({}) => {
  //0000000
  const [inputDate, setInputDate] = useState('1990-12-05T10:00');
  const [inputGender, setInputGender] = useState('female');
  // [추가] 입력 폼 컴포넌트
  const SajuInputForm = ({ date, setDate, gender, setGender }) => {
    return (
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-stone-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-stone-700 mb-4 border-b pb-2">정보 입력</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 생년월일 입력 */}
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">
              태어난 날짜와 시간 (양력)
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-stone-700"
            />
          </div>

          {/* 성별 선택 */}
          <div>
            <label className="block text-sm font-medium text-stone-500 mb-2">성별</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                남성 (Male)
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  gender === 'female'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                여성 (Female)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  //00000
  const sajuData = useMemo(() => {
    if (!inputDate || !inputDate.includes('T')) return null;

    try {
      const [datePart, timePart] = inputDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, min] = timePart.split(':').map(Number);

      const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();
      const getKor = (fn) => HANJA_MAP[fn] || '';

      const allChars = [
        getKor(eightChar.getYearGan()),
        getKor(eightChar.getYearZhi()),
        getKor(eightChar.getMonthGan()),
        getKor(eightChar.getMonthZhi()),
        getKor(eightChar.getDayGan()),
        getKor(eightChar.getDayZhi()),
        getKor(eightChar.getTimeGan()),
        getKor(eightChar.getTimeZhi()),
      ];

      // 오행 계산
      const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      allChars.forEach((char) => {
        const type = OHAENG_MAP[char];
        if (type) ohaengCount[type]++;
      });
      const maxOhaeng = Object.entries(ohaengCount).reduce((a, b) => (a[1] >= b[1] ? a : b));

      const branches = {
        year: allChars[1],
        month: allChars[3],
        day: allChars[5],
        time: allChars[7],
      };
      const pillars = {
        year: allChars[0] + allChars[1],
        month: allChars[2] + allChars[3],
        day: allChars[4] + allChars[5],
        time: allChars[6] + allChars[7],
      };
      const dayMaster = allChars[4];
      const ilju = pillars.day;

      // 1. 기본 신살 계산
      let finalShinsal = calculateShinsal(pillars, branches, dayMaster);

      // 2. 천을귀인 추가
      const nobleTargets = GWIN_MAP[dayMaster] || [];
      nobleTargets.forEach((target) => {
        Object.entries(branches).forEach(([pos, branch]) => {
          if (branch === target) {
            const posName = {
              year: '년지(조상자리)',
              month: '월지(사회자리)',
              day: '일지(배우자자리)',
              time: '시지(자식/말년자리)',
            }[pos];
            finalShinsal.push({
              name: '천을귀인',
              type: '대길신',
              desc: `사주의 ${posName}인 '${branch}'에 위치하고 있습니다. 이는 흉을 길로 바꾸고 결정적인 순간에 귀인의 도움을 받는 최고의 길신입니다`,
            });
          }
        });
      });

      // 3. 공망 추가
      const gongmangHanja = lunar.getDayXunKong();
      const gongmangTargets = gongmangHanja.split('').map((h) => HANJA_MAP[h]);

      Object.entries(branches).forEach(([pos, branch]) => {
        if (pos === 'day') return;
        if (gongmangTargets.includes(branch)) {
          const posName = { year: '년지(초년)', month: '월지(청년/사회)', time: '시지(말년)' }[pos];
          finalShinsal.push({
            name: '공망',
            type: '공허',
            desc: `${posName}에 해당하는 '${branch}' 글자가 비어있는 공망입니다. 해당 시기에는 현실적 욕심보다 정신적, 철학적 가치를 추구할 때 마음이 편안해집니다`,
          });
        }
      });

      // 중복 제거
      finalShinsal = [
        ...new Map(finalShinsal.map((item) => [item.name + item.desc, item])).values(),
      ];

      // 4. 합충 계산
      const relations = [];
      const checkPair = (b1, b2, targetName) => {
        const key = [b1, b2].sort().join('');
        const rule = RELATION_RULES[key];
        if (rule) relations.push({ ...rule, target: targetName });
      };
      checkPair(branches.day, branches.month, '월지(사회)');
      checkPair(branches.day, branches.time, '시지(자녀)');
      checkPair(branches.day, branches.year, '년지(조상)');

      const myIljuData = ILJU_INTERPRETATION[ilju] || {
        title: ilju,
        desc: '데이터 없음',
        keywords: [],
      };

      // --- 5. [수정] 대운(DaYun) 계산 (안전하게 처리) ---
      const daewoonList = [];
      let currentDaewoon = null;
      let currentAge = 0;

      try {
        const gender = inputGender === 'male' ? 1 : 0;

        const yun = eightChar.getYun(gender);

        // **[중요] 함수명 getDaYun() (대소문자 주의)**
        // 라이브러리 버전에 따라 getDaYun()이 배열을 반환합니다.
        const daewoonRaw = yun.getDaYun();

        // 한국식 나이(세는 나이) 혹은 만 나이 계산
        currentAge = new Date().getFullYear() - solar.getYear() + 1;

        if (daewoonRaw && Array.isArray(daewoonRaw)) {
          for (let i = 0; i < daewoonRaw.length; i++) {
            const dy = daewoonRaw[i];
            const startAge = dy.getStartAge();
            const endAge = dy.getEndAge();
            const ganHanja = dy.getGanZhi()[0];
            const zhiHanja = dy.getGanZhi()[1];
            const ganKor = HANJA_MAP[ganHanja];
            const zhiKor = HANJA_MAP[zhiHanja];
            const name = ganKor + zhiKor;
            const ganOhaeng = OHAENG_MAP[ganKor];
            const zhiOhaeng = OHAENG_MAP[zhiKor];

            const item = {
              startAge,
              endAge,
              name,
              ganKor,
              zhiKor,
              ganOhaeng,
              zhiOhaeng,
              desc: `${ganKor}(${ganOhaeng}) / ${zhiKor}(${zhiOhaeng})`,
            };

            // 다음 대운 시작 나이
            const nextDy = daewoonRaw[i + 1];
            const nextStartAge = nextDy ? nextDy.getStartAge() : 999;

            if (currentAge >= startAge && currentAge < nextStartAge) {
              item.isCurrent = true;
              currentDaewoon = item;
            } else {
              item.isCurrent = false;
            }

            daewoonList.push(item);
          }
        }
      } catch (e) {
        console.error('대운 계산 중 오류 발생:', e);
      }

      return {
        pillars,
        myShinsal: finalShinsal,
        myIljuData,
        ilju,
        ohaengCount,
        maxOhaeng,
        relations,
        daewoonList,
        currentDaewoon,
        currentAge,
      };
    } catch (err) {
      console.error('사주 계산 전체 오류:', err);
      return null;
    }
  }, [inputDate]);

  // 스토리텔링 함수
  const getAnalysisStory = (iljuData, shinsalList, maxOhaeng, relations) => {
    const ohaengNames = {
      wood: '나무(목)',
      fire: '불(화)',
      earth: '흙(토)',
      metal: '쇠(금)',
      water: '물(수)',
    };
    const dominant = ohaengNames[maxOhaeng[0]];

    let story = `당신은 <span class="text-blue-600 font-bold">'${iljuData.title}'</span>의 형상으로 태어났습니다. `;
    story += `${iljuData.desc} <br/><br/>`;

    story += `사주 전체를 흐르는 기운을 보면 <span class="text-red-600 font-bold">${dominant}</span>의 에너지가 가장 강합니다. `;
    if (maxOhaeng[0] === 'wood')
      story += `이로 인해 성장하고자 하는 욕구가 강하고, 새로운 일을 시작하는 추진력이 돋보입니다. `;
    else if (maxOhaeng[0] === 'fire')
      story += `이로 인해 매사에 열정적이며, 자신을 표현하고 드러내는 능력이 탁월합니다. `;
    else if (maxOhaeng[0] === 'earth')
      story += `이로 인해 주변을 아우르는 포용력이 있고, 누구에게나 믿음을 주는 묵직함이 있습니다. `;
    else if (maxOhaeng[0] === 'metal')
      story += `이로 인해 공과 사를 구분하는 결단력이 있고, 맺고 끊음이 확실하여 실수를 줄입니다. `;
    else if (maxOhaeng[0] === 'water')
      story += `이로 인해 상황에 맞춰 유연하게 대처하는 지혜가 있고, 깊은 통찰력을 가졌습니다. `;
    story += `<br/><br/>`;

    if (relations.length > 0) {
      story += `삶의 흐름 속에서 나타나는 인간관계와 변화를 살펴보면 다음과 같습니다.<br/>`;
      const haps = relations.filter((r) => r.type === '합');
      if (haps.length > 0) {
        story += `먼저 <span class="text-indigo-600 font-bold">합(合)</span>의 기운이 있습니다. `;
        haps.forEach((h) => {
          story += `${h.target}와는 ${h.name}을 이루어 ${h.desc}. `;
        });
      }
      const chungs = relations.filter((r) => r.type === '충');
      if (chungs.length > 0) {
        const intro = haps.length > 0 ? ` 또한 ` : ` `;
        story += `${intro}<span class="text-amber-600 font-bold">충(沖)</span>의 기운도 함께 작용합니다. `;
        chungs.forEach((c) => {
          story += `${c.target}와는 ${c.name}이 되어 ${c.desc}. `;
        });
      }
      story += `<br/><br/>`;
    } else {
      story += `사주 내의 글자들이 서로 크게 부딪히거나 묶이지 않아, <span class="text-green-600 font-bold">평온하고 무난한 흐름</span>을 보입니다. 격렬한 파도보다는 잔잔한 강물처럼 안정적인 삶을 영위할 가능성이 높습니다. <br/><br/>`;
    }

    story += `마지막으로, 당신의 운명에 숨겨진 특별한 무기(신살)들에 대한 상세 분석입니다.<br/>`;
    const gwiins = shinsalList.filter((s) => s.name === '천을귀인');
    const gongmangs = shinsalList.filter((s) => s.name === '공망');
    const others = shinsalList.filter((s) => s.name !== '천을귀인' && s.name !== '공망');

    if (gwiins.length > 0) {
      story += `<br/>✨ <span class="bg-yellow-100 text-yellow-800 font-bold px-1 rounded">천을귀인</span>: `;
      story += gwiins.map((g) => g.desc).join(' 또한 ');
    }
    if (gongmangs.length > 0) {
      story += `<br/>🌫 <span class="text-gray-500 font-bold">공망</span>: `;
      story += gongmangs.map((g) => g.desc).join(' 그리고 ');
    }
    if (others.length > 0) {
      story += `<br/>🔑 <span class="text-indigo-700 font-bold">그 외 신살</span>: `;
      const otherSentences = others.map(
        (sal) => `<b>${sal.name}</b>이(가) 있어 ${sal.desc}하는 경향`,
      );
      story += otherSentences.join(', ');
      story += `이 나타납니다. 이러한 기운들이 어우러져 당신만의 고유한 매력을 형성하고 있습니다.`;
    }

    return story;
  };

  const getDaewoonStory = (currentDaewoon, currentAge) => {
    if (!currentDaewoon) return '현재 대운 정보를 계산할 수 없습니다.';

    const ohaengKorean = {
      wood: '나무(木)',
      fire: '불(火)',
      earth: '흙(土)',
      metal: '쇠(金)',
      water: '물(水)',
    };

    let story = `현재 당신은 <b>${currentDaewoon.startAge}세</b>부터 시작된 <span class="text-indigo-600 font-bold text-xl">'${currentDaewoon.name}'</span> 대운을 지나고 있습니다. (현재 나이: ${currentAge}세)<br/><br/>`;

    story += `이 시기는 천간의 <b>${ohaengKorean[currentDaewoon.ganOhaeng]}</b> 기운과 지지의 <b>${ohaengKorean[currentDaewoon.zhiOhaeng]}</b> 기운이 당신의 인생 배경이 되는 시기입니다. `;

    if (currentDaewoon.ganOhaeng === currentDaewoon.zhiOhaeng) {
      story += `위아래가 같은 오행으로 이루어져 있어, <b>해당 기운의 특성이 매우 강력하게 드러나는 10년</b>입니다. 목표가 명확해지고 한 방향으로 에너지가 쏠리는 경험을 할 수 있습니다.`;
    } else if (
      (currentDaewoon.ganOhaeng === 'water' && currentDaewoon.zhiOhaeng === 'wood') ||
      (currentDaewoon.ganOhaeng === 'wood' && currentDaewoon.zhiOhaeng === 'fire') ||
      (currentDaewoon.ganOhaeng === 'fire' && currentDaewoon.zhiOhaeng === 'earth') ||
      (currentDaewoon.ganOhaeng === 'earth' && currentDaewoon.zhiOhaeng === 'metal') ||
      (currentDaewoon.ganOhaeng === 'metal' && currentDaewoon.zhiOhaeng === 'water')
    ) {
      story += `기운이 순환하는 '상생'의 흐름이라, <b>일의 진행이 비교적 순조롭고 결과물이 자연스럽게 맺어지는 시기</b>입니다.`;
    } else {
      story += `기운이 서로 부딪히거나 제어하는 관계라, <b>변동성이 크고 다이내믹한 변화</b>를 겪을 수 있습니다. 이는 위기가 될 수도 있지만, 큰 도약을 위한 발판이 되기도 합니다.`;
    }

    story += `<br/><br/>대운은 좋고 나쁨(길흉)보다는 <b>'내가 어떤 환경에 놓여있는가'</b>를 말해줍니다. 지금은 <span class="bg-indigo-50 text-indigo-700 font-bold px-1">${currentDaewoon.name}</span>이라는 계절 속에 있음을 인지하고, 그 흐름에 맞춰 나아가는 지혜가 필요합니다.`;

    return story;
  };

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];

  if (!sajuData) return <div className="p-10 text-center">생년월일을 입력해주세요.</div>;

  const {
    pillars,
    myShinsal,
    myIljuData,
    ilju,
    ohaengCount,
    maxOhaeng,
    relations,
    daewoonList,
    currentDaewoon,
    currentAge,
  } = sajuData;
  const analysisStory = getAnalysisStory(myIljuData, myShinsal, maxOhaeng, relations);
  const daewoonStory = getDaewoonStory(currentDaewoon, currentAge);

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-stone-100 flex flex-col items-center">
      {/* 1. 입력 폼 컴포넌트 삽입 */}
      <SajuInputForm
        date={inputDate}
        setDate={setInputDate}
        gender={inputGender}
        setGender={setInputGender}
      />
      {/* 1. 입력 폼 컴포넌트 삽입 */}
      <div className="w-full text-center mb-8 pt-8">
        <p className="text-stone-500 text-sm tracking-widest mb-2">SAJU ANALYSIS</p>
        <h1 className="text-3xl font-serif font-bold text-stone-800">{ilju}일주 운명 분석서</h1>
      </div>

      <div className="bg-white w-full rounded-sm shadow-xl overflow-hidden relative mb-8">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="p-8 md:p-12">
          {/* 사주 기둥 */}
          <div className="flex justify-center gap-4 mb-8 text-stone-400 text-sm border-b border-stone-100 pb-6">
            <div className="flex flex-col items-center">
              <span>시</span>
              <strong className="text-lg text-stone-700">{pillars.time}</strong>
            </div>
            <div className="flex flex-col items-center">
              <span>일</span>
              <strong className="text-lg text-stone-900 border-b-2 border-indigo-500">
                {pillars.day}
              </strong>
            </div>
            <div className="flex flex-col items-center">
              <span>월</span>
              <strong className="text-lg text-stone-700">{pillars.month}</strong>
            </div>
            <div className="flex flex-col items-center">
              <span>년</span>
              <strong className="text-lg text-stone-700">{pillars.year}</strong>
            </div>
          </div>

          {/* 오행 그래프 */}
          <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200">
              {Object.entries(ohaengCount).map(([type, count]) => (
                <div
                  key={type}
                  style={{ width: `${(count / 8) * 100}%` }}
                  className={getBarColor(type)}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1 text-xs text-slate-500">
              <span>목 {ohaengCount.wood}</span>
              <span>화 {ohaengCount.fire}</span>
              <span>토 {ohaengCount.earth}</span>
              <span>금 {ohaengCount.metal}</span>
              <span>수 {ohaengCount.water}</span>
            </div>
          </div>

          {/* 스토리텔링 본문 */}
          <div
            className="prose prose-stone leading-loose text-lg text-stone-700 text-justify"
            dangerouslySetInnerHTML={{ __html: analysisStory }}
          />

          <div className="mt-10 pt-6 border-t border-stone-100 text-right">
            <p className="text-sm text-stone-400 italic">당신의 잠재력을 믿으세요.</p>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* 합충 카드 */}
        {relations.length > 0 && (
          <div>
            <h3 className="text-stone-500 text-sm font-bold mb-3 px-2">
              ⚡ 에너지의 화학 반응 (합/충)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {relations.map((rel, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex items-center justify-between ${rel.type === '합' ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-bold ${rel.type === '합' ? 'text-indigo-700' : 'text-amber-700'}`}
                      >
                        {rel.name}
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">
                        {rel.target}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rel.desc}</p>
                  </div>
                  <span
                    className={`text-xl font-bold ${rel.type === '합' ? 'text-indigo-300' : 'text-amber-300'}`}
                  >
                    {rel.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 신살 상세 카드 */}
        {myShinsal.length > 0 && (
          <div>
            <h3 className="text-stone-500 text-sm font-bold mb-3 px-2">
              🌟 나의 특별한 기운 (신살 & 공망)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {myShinsal.map((sal, idx) => {
                const isNoble = sal.name === '천을귀인';
                const isVoid = sal.name === '공망';
                let cardStyle = 'bg-white border-stone-200';
                let typeStyle = 'bg-stone-100 text-stone-500';

                if (isNoble) {
                  cardStyle = 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200';
                  typeStyle = 'bg-yellow-100 text-yellow-700 font-bold';
                } else if (isVoid) {
                  cardStyle = 'bg-gray-50 border-gray-200 border-dashed';
                  typeStyle = 'bg-gray-200 text-gray-500';
                }

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg shadow-sm border flex items-center justify-between ${cardStyle}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-bold ${isNoble ? 'text-yellow-800' : 'text-stone-800'}`}
                        >
                          {sal.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle}`}>
                          {sal.type}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600">{sal.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 대운 분석 섹션 */}
        {daewoonList.length > 0 && (
          <div className="mt-8">
            <h3 className="text-stone-500 text-sm font-bold mb-3 px-2 flex items-center justify-between">
              <span>🌊 대운의 흐름 (10년마다 바뀌는 운)</span>
              <span className="text-xs font-normal bg-stone-200 px-2 py-1 rounded text-stone-600">
                현재 {currentAge}세
              </span>
            </h3>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                {daewoonList.map((dae, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border 
                      ${
                        dae.isCurrent
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105 transition-all'
                          : 'bg-stone-50 border-stone-100 text-stone-400'
                      }`}
                  >
                    <span className="text-xs mb-1 opacity-80">{dae.startAge}세</span>
                    <span className="font-bold text-lg">{dae.name}</span>
                    {dae.isCurrent && (
                      <span className="text-[10px] mt-1 bg-white/20 px-1 rounded">NOW</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {currentDaewoon && (
              <div className="mt-4 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {currentDaewoon.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                      Current Season
                    </p>
                    <h4 className="text-lg font-bold text-stone-800">
                      {currentDaewoon.name} 대운 ({currentDaewoon.startAge}~
                      {currentDaewoon.endAge || '...'}세)
                    </h4>
                  </div>
                </div>
                <div
                  className="text-stone-700 leading-relaxed text-sm text-justify"
                  dangerouslySetInnerHTML={{ __html: daewoonStory }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;
