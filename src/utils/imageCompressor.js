/**
 * 도면 및 현장 사진 캔버스 기반 자동 리사이징 & 고효율 압축 유틸리티
 * - 대용량 원본(10MB~30MB)을 시인성 손상 없이 300KB~700KB 고화질 Data URL로 압축
 * - IndexedDB와 결합하여 수백 장의 도면/사진도 쾌적하게 보관 가능
 */

export function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('이미지 파일이 없습니다.'));
      return;
    }

    // 만약 이미 Base64 문자열인 경우
    if (typeof file === 'string' && file.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        const { width, height } = calculateAspectSize(img.width, img.height, maxWidth, maxHeight);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = file;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = calculateAspectSize(img.width, img.height, maxWidth, maxHeight);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // 부드러운 이미지 리샘플링 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function calculateAspectSize(srcWidth, srcHeight, maxWidth, maxHeight) {
  let width = srcWidth;
  let height = srcHeight;

  if (width > maxWidth || height > maxHeight) {
    if (width / maxWidth > height / maxHeight) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    } else {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  return { width, height };
}
