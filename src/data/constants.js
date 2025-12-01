// src/data/constants.js

export const DEFAULT_INSTRUCTION = `너는 한국의 최고 능력을 지닌 사주 전문가야. 
나는 의뢰인의 사주 평가와 재물 & 커리어 및 연애운을 봐주고자 해.
이 사주를 보고 아래와 같이 리포트를 작성해줘. 아래 지시에 따라줘.

리포트 작성시 반드시 지켜야 할 점: 
- 무언가 강조할 때 **마크를 넣지 말기, 제목에도 ** 마크 사용 금지
- 이모티콘 사용 금지. 
- 의뢰자와 직접 이야기하는 느낌으로 2인칭으로 작성
- 말투는 전문가다운 격식있는 말투이면서도 신비로운 말투로 작성.
- '2. 5각형 밸런스'의 총합이 18점~22점 사이에서 유지되도록 작성 (너무 낮으면 안됨)

1. 의뢰자 정보
- 의뢰자 생년월일, 태어난 시간
- 의뢰자 만세력

2. 전체 요약
1) 2 문단으로 요약
2) 핵심 정체성
- 천간이름 / 천간에 대한 1문장 해석
- 지지 이름/ 지지에 대한 1문장 해석
- 정체성 키워드 (키워드별로 #으로 구분)
- 키워드에 맞는 격언

3. 5각형 밸런스
- 학업운, 재물운, 건강운, 연애운, 사업운
(각각 5점 척도로 점수 표기 하고 총점도 계산.)
- 중제목 포함
- 2 문단으로 밸런스 운세 요약

4. 재물 & 커리어 상세 내용
1) 1문단 요약
2) 키워드 3개 도출
- 재물과 커리어에 있어 3개 키워드 도출
- 키워드별 2문장 설명

5. 연애운 상세 내용
1) 1문단 요약
2) 키워드 3개 도출
- 연애&결혼운 3개 키워드 도출
- 키워드별 2문장 설명

6. 스트레스 & 정신건강 상세 내용
1) 1문단 요약
2) 키워드 3개 도출
- 정신건강 3개 키워드 도출
- 키워드별 2문장 설명

. 사주의 주제어
- 의뢰자의 사주를 나타낼 수 있는 주제어
- 주제어는 신비스럽고 웅장한 느낌으로 설정 (EX. 질주하는 백호, 태평양의 진주, 구국의 대장군)
- 주제어는 한 단어, 또는 두 단어로 나타내야 함. 너무 길면 안됨
- 주제어를 한 문장으로 풀어쓴 해석`;
export const DAILY_FORTUNE_PROMPT = {
  ko: `다음 사주 정보와 현재 날짜를 기준일로 하여, 해당 사주를 가진 사람의 운세를 아래 두 가지 항목으로 나누어 분석해 주세요.

1. [오늘의 운세]: 오늘 날짜(일진)와 사주의 관계에 초점을 맞춰서 당일의 운세를 상세하게 분석해 주세요. (500자 이내)
2. [내일의 운세]: 내일 날짜(기준일의 다음날)와 사주의 관계에 초점을 맞춰서 다음날의 운세를 상세하게 분석해 주세요. (500자 이내)

각 항목은 명확하게 구분하여 답변해 주세요.`,

  en: `Based on the provided Saju information and the current date, please analyze the daily fortune in the following two sections:

1. [Today's Fortune]: Analyze today's fortune in detail, focusing on the relationship between today's date (daily pillar) and the user's Saju. (Under 500 characters)
2. [Tomorrow's Fortune]: Analyze the fortune for tomorrow (the day after the current date) in detail, focusing on the relationship between tomorrow's date and the user's Saju. (Under 500 characters)

Please keep the two sections clearly separated.`,
};
// 💡 [추가] 신년 운세 프롬프트
export const NEW_YEAR_FORTUNE_PROMPT = {
  ko: `다음 사주 정보를 바탕으로, 해당 사주를 가진 사람의 2026년(병오년) 운세를 종합적으로 분석해 주세요. 500자 이내로 핵심만 요약해 주세요. 
  그 후, 
  1. 1월 운세 : 을사년 기축월의 운세 100자 이내
  2. 2월 운세 : 을사년 경인월의 운세 100자 이내
  3. 3월 운세 : 을사년 신묘월의 운세 100자 이내
  4. 4월 운세 : 을사년 임진월의 운세 100자 이내
  5. 5월 운세 : 을사년 계사월의 운세 100자 이내
  6. 6월 운세 : 을사년 갑오월의 운세 100자 이내
  7. 7월 운세 : 을사년 을미월의 운세 100자 이내
  8. 8월 운세 : 을사년 병신월의 운세 100자 이내
  9. 9월 운세 : 을사년 정유월의 운세 100자 이내
  10. 10월 운세 : 을사년 무술월의 운세 100자 이내
  11. 11월 운세 : 을사년 기해월의 운세 100자 이내
  12. 12월 운세 : 을사년 경자월의 운세 100자 이내
`,
  en: `Based on the provided Saju information, please provide a comprehensive analysis of the fortune for the year 2026 (Byeong-o Year). Summarize the key points within 500 characters.

Then, please provide the fortune for each month as follows (keep each under 100 characters):
1. January Fortune: Fortune for Gichuk Month of Eulsa Year
2. February Fortune: Fortune for Gyeongin Month of Eulsa Year
3. March Fortune: Fortune for Sinmyo Month of Eulsa Year
4. April Fortune: Fortune for Imjin Month of Eulsa Year
5. May Fortune: Fortune for Gyesa Month of Eulsa Year
6. June Fortune: Fortune for Gabo Month of Eulsa Year
7. July Fortune: Fortune for Eulmi Month of Eulsa Year
8. August Fortune: Fortune for Byeongshin Month of Eulsa Year
9. September Fortune: Fortune for Jeongyu Month of Eulsa Year
10. October Fortune: Fortune for Musul Month of Eulsa Year
11. November Fortune: Fortune for Gihae Month of Eulsa Year
12. December Fortune: Fortune for Gyeongja Month of Eulsa Year
`,
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
export const BD_EDIT_UI = {
  cancel: { en: 'Cancel Edit Birthday', ko: '생일 수정 취소' },
  complete: { en: 'Complete Edit Birthday', ko: '생일 수정 완료' },
  edit: { en: 'Edit Birthday', ko: '생일 수정하기' },
};
export const UI_TEXT = {
  title: { ko: '🔮 만세력 분석기', en: '🔮 Saju Analyzer' },

  // --- 로그인 및 저장 관련 텍스트 ---
  welcome: { ko: '환영합니다!', en: 'Welcome!' },
  logout: { ko: '로그아웃', en: 'Logout' },
  saveAndAnalyze: { ko: '정보 저장하고 결과 보기', en: 'Save Info' },
  updateInfo: { ko: '정보 수정하기', en: 'Update Info' },
  saved: { ko: '저장 완료', en: 'Saved' },
  googleLogin: { ko: '구글로 시작하기', en: 'Continue with Google' },
  loginMsg: { ko: '로그인하고 내 사주 저장하기', en: 'Login to save your Saju' },

  // --- 알림 메시지 ---
  loginReq: { ko: '로그인이 필요합니다!', en: 'Login is required!' },
  saveConfirm: {
    ko: '정보를 저장하시겠습니까?\n(하루에 최대 3회까지 수정 가능합니다.)',
    en: 'Do you want to save?\n(You can edit up to 3 times a day.)',
  },
  saveSuccess: {
    ko: '저장되었습니다! 이제 사주를 볼 수 있습니다.',
    en: 'Saved successfully! You Decoding is availiable.',
  },
  saveFail: { ko: '저장에 실패했습니다.', en: 'Failed to save.' },
  limitReached: {
    ko: '오늘 수정 횟수(3회)를 모두 소모했습니다.\n내일 다시 시도해주세요.',
    en: 'Daily edit limit (3 times) reached.\nPlease try again tomorrow.',
  },
  saveFirst: { ko: '내 정보를 먼저 저장해주세요.', en: 'Please save your info first.' },
  lockedMsg: { ko: '일일 한도 초과', en: 'Limit Reached' },
  // --- 채팅 기록 관련 텍스트 ---
  historyTitle: { ko: '최근 분석 기록', en: 'Recent Decoding History' },
  historyQ: { ko: '질문:', en: 'Q:' },
  historyA: { ko: '답변:', en: 'A:' },
  noHistory: { ko: '아직 저장된 분석 기록이 없습니다.', en: 'No analysis history found.' },

  // --- 기본 라벨 ---
  birthLabel: { ko: '생년월일시 입력', en: 'Date of Birth & Time' },
  unknownTime: { ko: '생시 모름', en: 'Unknown Time' },
  genderLabel: { ko: '성별', en: 'Gender' },
  male: { ko: '남성 👨', en: 'Male 👨' },
  female: { ko: '여성 👩', en: 'Female 👩' },
  promptLabel: {
    ko: 'AI 분석 프롬프트 직접 수정하기 (고급)',
    en: 'Customize AI Prompt (Advanced)',
  },
  resetPrompt: { ko: '기본값으로 초기화', en: 'Reset to Default' },
  analyzeBtn: {
    ko: '사주 풀이 보기',
    en: ' Life Path Decoding',
  },
  shareBtn: { ko: '사이트 공유하기', en: 'Share this Site' },
  modalTitle: {
    ko: '🔮  분석 결과',
    en: '🔮  Decoding Result',
  },
  copyBtn: { ko: '📋 복사', en: '📋 Copy' },
  copiedBtn: { ko: '✔️ 완료', en: '✔️ Copied' },
  confirmBtn: { ko: '확인했습니다', en: 'Confirm' },
  year: { ko: '년', en: 'Year' },
  month: { ko: '월', en: 'Month' },
  day: { ko: '일', en: 'Day' },
  hour: { ko: '시', en: 'Hour' },

  // ✨ [추가] 캐시 로딩 멘트
  loadingCached: { ko: '기존 분석 결과 불러오는 중...', en: 'Loading saved result...' },
};

export const HANJA_MAP = {
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
};

export const ENG_MAP = {
  갑: 'Gap',
  을: 'Eul',
  병: 'Byeong',
  정: 'Jeong',
  무: 'Mu',
  기: 'Gi',
  경: 'Gyeong',
  신: 'Sin',
  임: 'Im',
  계: 'Gye',
  자: 'Ja',
  축: 'Chuk',
  인: 'In',
  묘: 'Myo',
  진: 'Jin',
  사: 'Sa',
  오: 'O',
  미: 'Mi',
  유: 'Yu',
  술: 'Sul',
  해: 'Hae',
};
export const HANJA_ENG_MAP = {
  甲: 'Gap',
  乙: 'Eul',
  丙: 'Byeong',
  丁: 'Jeong',
  戊: 'Mu',
  己: 'Gi',
  庚: 'Gyeong',
  辛: 'Sin',
  壬: 'Im',
  癸: 'Gye',
  子: 'Ja',
  丑: 'Chuk',
  寅: 'In',
  卯: 'Myo',
  辰: 'Jin',
  巳: 'Sa',
  午: 'O',
  未: 'Mi',
  申: 'Sin',
  酉: 'Yu',
  戌: 'Sul',
  亥: 'Hae',
};

export const SAJU_DATA = {
  sky: [
    {
      id: 0,
      color: 'bg-red-500',
      sub: {
        sky: ['', '-', '-'],
        grd: [
          ['', '-', '-', [0, 0, 0]],
          ['', '-', '-', [0, 0, 0]],
        ],
      },
      relation: { 인수: [0, 0], 식상: [0, 0], 관성: [0, 0], 재성: [0, 0] },
      grd1: { 인수: [0], 식상: [0], 관성: [0], 재성: [0], 비겁: [0] },
      sky2: { 인수: [0, 0], 식상: [0, 0], 관성: [0, 0], 재성: [0, 0], 비겁: [0, 0] },
    },
    {
      id: 1,
      color: 'bg-lime-500',
      sub: {
        sky: ['갑', '\u7532', '🌳'],
        grd: [
          ['인', '\u5bc5', '🐯', [5, 3, 1]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6] },
      grd1: { 인수: [9], 식상: [3], 관성: [7], 재성: [5], 비겁: [1] },
      sky2: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6], 비겁: [1, 2] },
    },
    {
      id: 2,
      color: 'bg-lime-500',
      sub: {
        sky: ['을', '\u4e59', '🌱'],
        grd: [
          ['묘', '\u536f', '🐰', [1, 2]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [9, 10], 식상: [3, 4], 관성: [7, 8], 재성: [5, 6] },
    },
    {
      id: 3,
      color: 'bg-red-300',
      sub: {
        sky: ['병', '\u4e19', '☀️'],
        grd: [
          ['사', '\u5df3', '🐍', [5, 7, 3]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [1, 2], 식상: [5, 6], 관성: [9, 10], 재성: [7, 8] },
    },
    {
      id: 4,
      color: 'bg-red-300',
      sub: {
        sky: ['정', '\u4e01', '🔥'],
        grd: [
          ['오', '\u5348', '🐴', [3, 6, 4]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [1, 2], 식상: [5, 6], 관성: [9, 10], 재성: [7, 8] },
    },
    {
      id: 5,
      color: 'bg-orange-300',
      sub: {
        sky: ['무', '\u620a', '🏔'],
        grd: [
          ['진', '\u8fb0', '🐲', [2, 10, 5]],
          ['술', '\u620c', '🐶', [8, 4, 5]],
        ],
      },
      relation: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10], 비겁: [5, 6] },
      grd1: { 인수: [3], 식상: [7], 관성: [1], 재성: [9], 비겁: [5] },
      sky2: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10], 비겁: [5, 6] },
    },
    {
      id: 6,
      color: 'bg-orange-300',
      sub: {
        sky: ['기', '\u5df1', '🪹'],
        grd: [
          ['축', '\u4e11', '🐮', [10, 8, 6]],
          ['미', '\u672a', '🐑', [4, 2, 6]],
        ],
      },
      relation: { 인수: [3, 4], 식상: [7, 8], 관성: [1, 2], 재성: [9, 10] },
    },
    {
      id: 7,
      color: 'bg-gray-300',
      sub: {
        sky: ['경', '\u5e9a', '🔨'],
        grd: [
          ['신', '\u7533', '🐵', [5, 9, 7]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [5, 6], 식상: [9, 10], 관성: [3, 4], 재성: [1, 2] },
    },
    {
      id: 8,
      color: 'bg-gray-300',
      sub: {
        sky: ['신', '\u8f9b', '🖊'],
        grd: [
          ['유', '\u9149', '🐔', [7, 8]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [5, 6], 식상: [9, 10], 관성: [3, 4], 재성: [1, 2] },
    },
    {
      id: 9,
      color: 'bg-blue-300',
      sub: {
        sky: ['임', '\u58ec', '💧'],
        grd: [
          ['해', '\u4ea5', '🐷', [5, 1, 9]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [7, 8], 식상: [1, 2], 관성: [5, 6], 재성: [3, 4] },
    },
    {
      id: 10,
      color: 'bg-blue-300',
      sub: {
        sky: ['계', '\u7678', '🌧'],
        grd: [
          ['자', '\u5b50', '🐭', [9, 10]],
          ['', '', '', ''],
        ],
      },
      relation: { 인수: [7, 8], 식상: [1, 2], 관성: [5, 6], 재성: [3, 4] },
    },
    {
      id: 11,
      sub: { sky: ['', '', ''], grd: [['', '', '', '']] },
      relation: { 인수: [11, 11], 식상: [11, 11], 관성: [11, 11], 재성: [11, 11] },
    },
  ],
};

export const GONGMANG_DATA = [
  ['갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유'],
  ['갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미'],
  ['갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사'],
  ['갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘'],
  ['갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축'],
  ['갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해'],
];

export const CHUNEUL = {
  갑: ['축', '미'],
  을: ['자', '신'],
  병: ['유', '해'],
  정: ['유', '해'],
  무: ['축', '미'],
  기: ['자', '신'],
  경: ['축', '미'],
  신: ['인', '오'],
  임: ['묘', '사'],
  계: ['묘', '사'],
};

export const SKY_CH_TEXT = ['갑경', '을신', '병임', '정계'];
export const GRD_CH_TEXT = ['자오', '축미', '인신', '묘유', '진술', '사해'];
export const BANGHAP_TEXT = ['해자축', '인묘진', '사오미', '유술해'];
export const HAP3_TEXT = ['인오술', '신자진', '해묘미', '사유축'];
export const HAP6_TEXT = ['자축', '인해', '묘술', '진유', '사신', '오미'];
export const GRD_BANHAP_TEXT = ['오술', '오인', '자신', '자진', '묘해', '묘미', '유사', '유축'];
export const SKY_HAP_TEXT = ['갑기', '을경', '병신', '정임', '무계'];

export const BANGHAP_EXP = {
  해자축: { text: '수', color: 'bg-blue-300' },
  인묘진: { text: '목', color: 'bg-lime-500' },
  사오미: { text: '화', color: 'bg-red-300' },
  유술해: { text: '금', color: 'bg-gray-300' },
};
export const HAP3_EXP = {
  인오술: { text: '화', color: 'bg-red-300' },
  신자진: { text: '수', color: 'bg-blue-300' },
  해묘미: { text: '목', color: 'bg-lime-500' },
  사유축: { text: '금', color: 'bg-gray-300' },
};
export const HAP6_EXP = {
  자축: { text: '수', str: 'h-8 w-8 text-yellow-200', color: 'bg-blue-600' },
  인해: { text: '목', str: 'h-7 w-7 text-yellow-200', color: 'bg-lime-500' },
  묘술: { text: '화', str: 'h-6 w-6 text-yellow-200', color: 'bg-red-400' },
  진유: { text: '금', str: 'h-6 w-6 text-yellow-200', color: 'bg-gray-400' },
  사신: { text: '수', str: 'h-7 w-7 text-yellow-200', color: 'bg-blue-500' },
  오미: { text: '화', str: 'h-8 w-8 text-yellow-200', color: 'bg-red-600' },
};
export const GRD_BANHAP_EXP = {
  오술: { text: '화', color: 'bg-red-300', def: '인' },
  오인: { text: '화', color: 'bg-red-300', def: '술' },
  자진: { text: '수', color: 'bg-blue-300', def: '신' },
  자신: { text: '수', color: 'bg-blue-300', def: '진' },
  묘미: { text: '목', color: 'bg-lime-500', def: '해' },
  묘해: { text: '목', color: 'bg-lime-500', def: '미' },
  유축: { text: '금', color: 'bg-gray-300', def: '사' },
  유사: { text: '금', color: 'bg-gray-300', def: '축' },
};
export const SKY_HAP_EXP = {
  갑기: { text: '토', color: 'bg-orange-300' },
  을경: { text: '금', color: 'bg-gray-300' },
  병신: { text: '수', color: 'bg-blue-300' },
  정임: { text: '목', color: 'bg-lime-500' },
  무계: { text: '화', color: 'bg-red-300' },
};
