import { toPng } from 'html-to-image';
export const saveAsImageSaju = useCallback(async () => {
  const el = document.getElementById('saju-capture');
  if (el) {
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
      style: { margin: '0' },
      backgroundColor: localStorage.theme === 'dark' ? '#1e293b' : '#ffffff',
    });
    const link = document.createElement('a');
    link.download = 'saju.png';
    link.href = dataUrl;
    link.click();
  }
}, []);
export const saveAsImageIlju = useCallback(async () => {
  const el = document.getElementById('day-pillar-capture');
  if (el) {
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
      style: { margin: '0' },
      backgroundColor: localStorage.theme === 'dark' ? '#1e293b' : '#ffffff',
    });
    const link = document.createElement('a');
    link.download = 'ilju.png';
    link.href = dataUrl;
    link.click();
  }
}, []);
