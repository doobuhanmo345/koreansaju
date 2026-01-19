// services/SajuAnalysisService.js

import { doc, setDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';
import { ref, get, child } from 'firebase/database';
import { db, database } from '../lib/firebase';
import { fetchGeminiAnalysis } from '../api/gemini';
import { createPromptForGemini } from '../utils/sajuLogic';
import { getPillars } from '../utils/sajuCalculator';
import { DateService } from '../utils/dateService';
class SajuAnalysisService {
  static SAJU_KEYS = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  constructor(context) {
    this.user = context.user;
    this.userData = context.userData;
    this.language = context.language;
    this.maxEditCount = context.maxEditCount;
    this.uiText = context.uiText;
    this.langPrompt = context.langPrompt;
    this.hanja = context.hanja;
    this.relationTypes = context.relationTypes;
    this.qTypes = context.qTypes;
    this.subQTypes = context.subQTypes;

    this.setEditCount = context.setEditCount;
    this.setLoading = context.setLoading;
    this.setLoadingType = context.setLoadingType;
    this.setAiResult = context.setAiResult;
    this.setAiAnalysis = context.setAiAnalysis;
    this.setStep = context.setStep;
  }

  static compareSaju(source, target) {
    if (!source || !target) return false;
    return this.SAJU_KEYS.every((key) => source[key] === target[key]);
  }

  static sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
  }

  getDisplayName() {
    return this.userData?.displayName || (this.language === 'ko' ? '선생님' : 'User');
  }

  getSajuString(saju) {
    return `${JSON.stringify(saju)} - sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야`;
  }

  // async 키워드는 함수 이름 앞에 와야 합니다.
  async getTodayDate() {
    return await DateService.getTodayDate();
  }

  getSafeDate() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  async fetchPrompts(paths) {
    const dbRef = ref(database);
    const snapshots = await Promise.all(paths.map((path) => get(child(dbRef, path))));
    return snapshots.reduce((acc, snap, i) => ({ ...acc, [paths[i]]: snap.val() || '' }), {});
  }

  replaceVariables(template, vars) {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.split(key).join(value || '');
    });
    return result;
  }

  async checkGuestDuplicate(guestId, saju) {
    if (!guestId) return false;
    const docRef = doc(db, 'sazatalkad_logs', guestId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      if (
        JSON.stringify(SajuAnalysisService.sortObject(existingData.saju)) ===
        JSON.stringify(SajuAnalysisService.sortObject(saju))
      ) {
        const msg =
          this.language === 'en'
            ? 'Visit our website! Log in to get 3 premium reports daily for free.'
            : '사자사주 홈페이지에 방문해 보세요! 로그인만 하면 무료로 하루에 세 개씩 프리미엄 리포트를 확인할 수 있어요.';
        alert(msg);
        return true;
      }
    }
    return false;
  }

  async analyze(config) {
    const {
      type,
      params,
      cacheKey = null,
      validateCache,
      promptPaths,
      buildPromptVars,
      buildSaveData,
      useCustomPromptBuilder = false,
      customPromptBuilder = null,
      customValidation,
      loadingType = null,
      skipUsageCheck = false,
      isGuestMode = false,
      guestId = null,
      guestCollection = null,
      onComplete,
    } = config;

    if (!isGuestMode && !this.user) {
      alert(this.uiText?.loginReq?.[this.language] || 'Please login');
      return null;
    }

    if (customValidation && !customValidation(params, this)) {
      return null;
    }

    this.setLoading?.(true);
    this.setLoadingType?.(loadingType);
    this.setAiResult?.('');

    try {
      const usageData = this.userData?.usageHistory || {};

      // 캐시 체크
      if (cacheKey && usageData[cacheKey]) {
        const cached = usageData[cacheKey];
        if (validateCache?.(cached, params)) {
          console.log(`✅ ${type} 캐시 사용`);
          this.setAiResult?.(cached.result);
          this.setAiAnalysis?.(cached.result);
          this.setLoading?.(false);
          this.setLoadingType?.(null);
          onComplete?.(cached.result);
          return cached.result;
        }
      }

      // 사용량 체크
      if (!skipUsageCheck && !isGuestMode) {
        const currentCount = usageData.editCount || 0;
        if (currentCount >= this.maxEditCount) {
          this.setLoading?.(false);
          alert(this.uiText?.limitReached?.[this.language] || 'Limit reached');
          return null;
        }
      }

      console.log(`🚀 ${type} API 호출`);

      // 프롬프트 생성
      let fullPrompt;
      if (useCustomPromptBuilder && customPromptBuilder) {
        fullPrompt = await customPromptBuilder(params, this);
        if (!fullPrompt) {
          alert('데이터베이스에서 프롬프트를 불러오지 못했습니다.');
          return null;
        }
      } else {
        const prompts = await this.fetchPrompts(promptPaths);
        if (!prompts[promptPaths[0]]) {
          throw new Error(`${type} 템플릿이 DB에 없습니다.`);
        }
        const vars = buildPromptVars(prompts, params, this);
        fullPrompt = this.replaceVariables(prompts[promptPaths[0]], vars);
      }

      // API 호출
      const result = await fetchGeminiAnalysis(fullPrompt);

      // DB 저장
      if (buildSaveData) {
        const saveData = buildSaveData(result, params, this);
        if (isGuestMode && guestId && guestCollection) {
          await setDoc(doc(db, guestCollection, guestId), saveData, { merge: true });
        } else if (this.user) {
          await setDoc(doc(db, 'users', this.user.uid), saveData, { merge: true });
          this.setEditCount?.((prev) => prev + 1);
        }
      }

      this.setAiResult?.(result);
      this.setAiAnalysis?.(result);
      onComplete?.(result);

      return result;
    } catch (error) {
      console.error('발생한 에러:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    } finally {
      this.setLoading?.(false);
      this.setLoadingType?.(null);
    }
  }
}

class AnalysisPresets {
  static basic(params, sajuData) {
    return {
      type: 'basic',
      params,
      cacheKey: 'ZApiAnalysis',
      loadingType: 'main',
      useCustomPromptBuilder: true,

      customValidation: (p, service) => {
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        cached.result,

      customPromptBuilder: async (p, service) => {
        return await createPromptForGemini(sajuData, p.language);
      },

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZApiAnalysis: {
              result,
              date: todayDate,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
            },
          },
          dailyUsage: { [todayDate]: increment(1) },
        };
      },
    };
  }

  static saza(params) {
    return {
      type: 'saza',
      params,
      promptPaths: ['prompt/saza_basic', 'prompt/saza_strict', 'prompt/saza_format'],

      customValidation: (p) => {
        if (!p.question?.trim()) {
          alert('질문을 입력해주세요.');
          return false;
        }
        return true;
      },

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_PROMPT}}': prompts['prompt/saza_strict'],
        '{{SAZA_FORMAT}}': prompts['prompt/saza_format'],
        '{{myQuestion}}': p.question,
        '{{sajuInfo}}': `성별:${p.gender}, 생년월일:${p.inputDate}, 팔자:${JSON.stringify(p.saju)} (sky3+grd3=연주, sky2+grd2=월주, sky1+grd1=일주, sky0+grd0=시주). 호칭:${service.getDisplayName()}님.`,
        '{{todayInfo}}': `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `,
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            question_history: arrayUnion({
              question: p.question,
              sajuKey: p.saju,
              timestamp: new Date().toISOString(),
              id: Date.now(),
            }),
          },
          dailyUsage: { [todayDate]: increment(1) },
        };
      },
    };
  }

  static sazaGuest(params, guestId) {
    return {
      type: 'saza_guest',
      params,
      isGuestMode: true,
      guestId,
      guestCollection: 'sazatalkad_logs',
      skipUsageCheck: true,
      promptPaths: ['prompt/saza_basic', 'prompt/saza_strict', 'prompt/saza_format'],

      customValidation: (p) => {
        if (!p.question?.trim()) {
          alert('질문을 입력해주세요.');
          return false;
        }
        return true;
      },

      buildPromptVars: (prompts, p, service) => {
        const displayName =
          service.userData?.displayName || (service.language === 'ko' ? '의뢰자' : 'guest');
        return {
          '{{STRICT_PROMPT}}': prompts['prompt/saza_strict'],
          '{{SAZA_FORMAT}}': prompts['prompt/saza_format'],
          '{{myQuestion}}': p.question,
          '{{sajuInfo}}': `성별:${p.gender}, 생년${p.birthData.year} 생월${p.birthData.month} 생일${p.birthData.day}, 팔자:${JSON.stringify(p.saju)} (sky3+grd3=연주, sky2+grd2=월주, sky1+grd1=일주, sky0+grd0=시주). 호칭:${displayName}`,
          '{{todayInfo}}': `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `,
          '{{langPrompt}}': '**한국어로 150~200 단어로**',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: (result, p, service) => ({
        id: guestId,
        date: service.getSafeDate(),
        user: !!service.user,
        saju: p.saju,
        usageHistory: {
          question_history: arrayUnion({
            question: p.question,
        
            timestamp: new Date().toISOString(),
            id: Date.now(),
          }),
        },
      }),
    };
  }

  static match(params) {
    return {
      type: 'match',
      params,
      cacheKey: 'ZMatchAnalysis',
      promptPaths: ['prompt/match_basic', 'prompt/match_strict', 'prompt/match_specific'],

      customValidation: (p) => {
        if (!p.saju2?.sky1) {
          alert('상대방 정보를 입력해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.relationship === p.relationship &&
        cached.gender === p.gender &&
        cached.gender2 === p.gender2 &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        SajuAnalysisService.compareSaju(cached.saju2, p.saju2) &&
        cached.result,

      buildPromptVars: (prompts, p, service) => {
        const relationLabel =
          service.relationTypes?.find((r) => r.id === p.relationship)?.label || 'Unknown';
        return {
          '{{STRICT_PROMPT}}': prompts['prompt/match_strict'],
          '{{SPECIFIC_PROMPT}}': prompts['prompt/match_specific'],
          '{{relationLabel}}': `${relationLabel} (${p.relationship})`,
          '{{gender}}': p.gender,
          '{{displayName}}': service.getDisplayName(),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{partnerGender}}': p.gender2,
          '{{partnerSajuStr}}': service.getSajuString(p.saju2),
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          dailyUsage: { [todayDate]: increment(1) },
          usageHistory: {
            ZMatchAnalysis: {
              result,
              saju: p.saju,
              saju2: p.saju2,
              gender: p.gender,
              gender2: p.gender2,
              relationship: p.relationship,
              language: p.language,
              inputDate: p.inputDate,
              inputDate2: p.inputDate2,
            },
          },
        };
      },
    };
  }

  static newYear(params) {
    const nextYear = new Date().getFullYear() + 1;
    return {
      type: 'newYear',
      params,
      cacheKey: 'ZLastNewYear',
      loadingType: 'year',
      promptPaths: [
        'prompt/new_year_basic',
        'prompt/default_instruction',
        `prompt/new_year_format_${params.language}`,
      ],

      customValidation: (p, service) => {
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        String(cached.year) === String(nextYear) &&
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        cached.result,

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
        '{{NEW_YEAR_FORMAT}}': prompts[`prompt/new_year_format_${p.language}`],
        '{{gender}}': p.gender,
        '{{birthDate}}': service.userData?.birthDate || '미입력',
        '{{sajuJson}}': service.getSajuString(p.saju),
        '{{displayName}}': service.getDisplayName(),
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        console.log('저장할 saju:', p.saju); // 디버그
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZLastNewYear: {
              result,
              year: nextYear,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
            },
          },
          dailyUsage: { [todayDate]: increment(1) },
        };
      },
    };
  }

  static newYearGuest(params, guestId) {
    return {
      type: 'newYear_guest',
      params,
      isGuestMode: true,
      guestId,
      guestCollection: 'newyearad_logs',
      skipUsageCheck: true,
      promptPaths: ['prompt/new_year_basic', 'prompt/default_instruction'],

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
        '{{NEW_YEAR_FORMAT}}':
          '2026년 병오년의 운세를 개략적으로 말해줘. 시작은 <b>태그로 시작해줘. 인사하지 말고 소제목부터. 소제목은 <b>로 감싸주고 질문 형식으로 해줘. 예를 들면 나의 올 한해는? 이렇게  내용은 <p> 내용은 세 문장 정도로.  그렇게 한거를 세개정도 만들어줘.',
        '{{gender}}': p.gender,
        '{{sajuJson}}': service.getSajuString(p.saju),
        '{{displayName}}': service.getDisplayName(),
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: (result, p, service) => ({
        id: guestId,
        date: service.getSafeDate(),
        user: !!service.user,
        saju: p.saju,
      }),
    };
  }

  static daily(params) {
    return {
      type: 'daily',
      params,
      cacheKey: 'ZLastDaily',
      loadingType: 'daily',
      promptPaths: [
        'prompt/daily_basic',
        'prompt/default_instruction',
        `prompt/daily_format_${params.language}`,
      ],

      customValidation: (p, service) => {
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.date === (p.selectedDate || new Date()) &&
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        cached.result,

      buildPromptVars: (prompts, p, service) => {
        // selectedDate가 있으면 그 날짜 사용, 없으면 오늘
        let today = new Date();
        if (p.selectedDate && p.selectedDate instanceof Date) {
          today = new Date(p.selectedDate);
        }

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayPillars = getPillars(today);
        const tomorrowPillars = getPillars(tomorrow);

        const userSajuText = `${p.saju.sky3}${p.saju.grd3}년 ${p.saju.sky2}${p.saju.grd2}월 ${p.saju.sky1}${p.saju.grd1}일 ${p.saju.sky0}${p.saju.grd0}시`;
        const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년 ${todayPillars.sky2}${todayPillars.grd2}월 ${todayPillars.sky1}${todayPillars.grd1}일`;
        const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년 ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월 ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일`;

        return {
          '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
          '{{DAILY_FORTUNE_PROMPT}}': prompts[`prompt/daily_format_${p.language}`],
          '{{gender}}': p.gender,
          '{{userSajuText}}': userSajuText,
          '{{todayDate}}': todayPillars.date,
          '{{todaySajuText}}': todaySajuText,
          '{{tomorrowDate}}': tomorrowPillars.date,
          '{{tomorrowSajuText}}': tomorrowSajuText,
          '{{displayName}}': service.getDisplayName(),
          '{{question}}': p.question || '', // 질문 추가
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZLastDaily: {
              result,
              date: p.selectedDate || new Date(),
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              question: p.question || '', // 질문 저장
            },
          },
          dailyUsage: { [todayDate]: increment(1) },
        };
      },
    };
  }
  static dailySpecific(params) {
    return {
      type: 'dailySpecific',
      params,
      cacheKey: 'ZDailySpecific',
      loadingType: 'daily',
      promptPaths: [
        'prompt/daily_s_basic',
        'prompt/default_instruction',
        `prompt/daily_s_${params.language}`,
      ],

      customValidation: (p, service) => {
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.date === (p.selectedDate || new Date()) &&
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.sajuDate, p.sajuDate) &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        cached.result,

      buildPromptVars: (prompts, p, service) => {
        // selectedDate가 있으면 그 날짜 사용, 없으면 오늘
        let today = new Date();
        if (p.selectedDate && p.selectedDate instanceof Date) {
          today = new Date(p.selectedDate);
        }

        const todayPillars = getPillars(today);

        const userSajuText = `${p.saju.sky3}${p.saju.grd3}년 ${p.saju.sky2}${p.saju.grd2}월 ${p.saju.sky1}${p.saju.grd1}일 ${p.saju.sky0}${p.saju.grd0}시`;
        const todaySajuText = `${p.sajuDate.sky3}${p.sajuDate.grd3}년 ${p.sajuDate.sky2}${p.sajuDate.grd2}월 ${p.sajuDate.sky1}${p.sajuDate.grd1}일`;

        return {
          '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
          '{{DAILY_S_PROMPT}}': prompts[`prompt/daily_s_${p.language}`],
          '{{gender}}': p.gender,
          '{{userSajuText}}': userSajuText,
          '{{todayDate}}': todayPillars.date,
          '{{todaySajuText}}': todaySajuText,
          '{{displayName}}': service.getDisplayName(),
          '{{question}}': p.question || '', // 질문 추가
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          usageHistory: {
            ZDailySpecific: {
              result,
              date: p.selectedDate || new Date(),
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              sajuDate: p.sajuDate,
              question: p.question || '', // 질문 저장
            },
          },
          dailyUsage: { [todayDate]: increment(1) },
        };
      },
    };
  }

  static wealth(params) {
    return {
      type: 'wealth',
      params,
      cacheKey: 'ZWealthAnalysis',
      promptPaths: ['prompt/wealth_basic', 'prompt/wealth_strict'],

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.ques === p.selectedQ &&
        cached.ques2 === p.selectedSubQ &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        cached.result,

      buildPromptVars: (prompts, p, service) => {
        const qLabel = service.qTypes?.find((r) => r.id === p.selectedQ)?.label || 'General Wealth';
        const subQDetail =
          service.subQTypes?.[p.selectedQ]?.find((i) => i.id === p.selectedSubQ)?.prompt || '';

        return {
          '{{STRICT_PROMPT}}': prompts['prompt/wealth_strict'],
          '{{qLabel}}': qLabel,
          '{{subQuestion}}': subQDetail,
          '{{gender}}': p.gender,
          '{{todayStr}}': new Date().toLocaleDateString('en-CA'),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{displayName}}': service.getDisplayName(),
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        };
      },

      buildSaveData: (result, p, service) => {
        const todayDate = service.getTodayDate();
        return {
          saju: p.saju,
          editCount: increment(1),
          lastEditDate: todayDate,
          dailyUsage: { [todayDate]: increment(1) },
          usageHistory: {
            ZWealthAnalysis: {
              result,
              saju: p.saju,
              gender: p.gender,
              ques: p.selectedQ,
              ques2: p.selectedSubQ,
              language: p.language,
            },
          },
        };
      },
    };
  }
}

export { SajuAnalysisService, AnalysisPresets };
