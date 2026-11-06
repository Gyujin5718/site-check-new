import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * A4 규격 PDF 변환 및 다운로드를 처리하는 커스텀 훅
 */
export function usePdfGenerator() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generateA4Pdf = useCallback(async (element) => {
    if (!element) return null;
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 5, pdfWidth, Math.min(pdfHeight, 287));
      return pdf;
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 외부 이미지 접근 권한(CORS)을 확인해주세요.');
      return null;
    } finally {
      setIsGeneratingPdf(false);
    }
  }, []);

  const downloadPdf = useCallback(async (element, filename) => {
    const pdf = await generateA4Pdf(element);
    if (pdf) {
      pdf.save(filename || '공사감독일지.pdf');
      return true;
    }
    return false;
  }, [generateA4Pdf]);

  return {
    isGeneratingPdf,
    generateA4Pdf,
    downloadPdf,
  };
}
