import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Web Speech API 음성 인식을 제어하는 커스텀 훅
 */
export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [memo, setMemo] = useState('');
  const [interimMemo, setInterimMemo] = useState('');
  const recognitionRef = useRef(null);
  const shouldKeepRecordingRef = useRef(false);

  const stopRecording = useCallback(() => {
    shouldKeepRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // 이미 중지되었거나 에러 무시
      }
    }
    setIsRecording(false);
    setInterimMemo('');
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('현재 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome/Safari 최신 버전을 권장합니다.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsRecording(true);
        shouldKeepRecordingRef.current = true;
        setInterimMemo('');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          setMemo((prev) => (prev ? `${prev.trim()} ${finalText.trim()}` : finalText.trim()));
        }
        setInterimMemo(interimText);
      };

      recognition.onerror = (event) => {
        console.error('음성 인식 에러:', event.error);
        stopRecording();
      };

      recognition.onend = () => {
        if (shouldKeepRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            stopRecording();
          }
        } else {
          setIsRecording(false);
          setInterimMemo('');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('음성 인식 시작 실패:', err);
      stopRecording();
    }
  }, [stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // 컴포넌트 언마운트 시 안전하게 오디오 캡처 종료
  useEffect(() => {
    return () => {
      shouldKeepRecordingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isRecording,
    memo,
    setMemo,
    interimMemo,
    toggleRecording,
    stopRecording,
  };
}
