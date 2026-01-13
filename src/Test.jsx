import { useState, useRef } from 'react';
import dayStem from '../src/data/dayStem.json';
import dayBranch from '../src/data/dayBranch.json';
import { useLanguage } from './context/useLanguageContext';
import SajuReport from './test/SajuReport';
import LoadingFourPillar from './component/LoadingFourPillar';
import { useAuthContext } from './context/useAuthContext';
export default function Test() {
  const { userData } = useAuthContext();
  console.log(userData?.saju);
  return <>dd</>;
}
