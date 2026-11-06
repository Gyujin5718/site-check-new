import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../constants/config';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { refineIssueMemoWithAi } from '../api';

export default function IssueRegisterView({ projects, weatherInfo, currentUser, onSubmitIssue }) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFloorPlan, setSelectedFloorPlan] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [pin, setPin] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const imageRef = useRef(null);
  const { isRecording, memo, setMemo, interimMemo, toggleRecording, stopRecording } =
    useSpeechRecognition();

  // 사진 업로드 및 이전 ObjectURL 해제 (메모리 누수 방지)
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setPhotoUrl(newUrl);
  };

  // 컴포넌트 언마운트 시 생성했던 Blob URL 정리
  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  // 도면 클릭 시 백분율(%) 좌표로 계산하여 저장 (반응형 및 A4 인쇄 위치 완벽 일치)
  const handlePlanClick = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPin({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  };

  const getFormattedDate = () => {
    const today = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')} (${days[today.getDay()]})`;
  };

  const activeProject = projects.find((p) => p.id === Number(selectedProjectId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('공사 현장을 필수로 선택해주세요.');
      return;
    }

    if (isRecording) {
      stopRecording();
    }

    const fullMemo = `${memo} ${interimMemo}`.trim();
    let refinedContent = fullMemo;

    if (fullMemo) {
      setIsAiProcessing(true);
      try {
        const data = await refineIssueMemoWithAi(category, fullMemo);
        if (data.success && data.text) {
          refinedContent = data.text;
        } else if (data.error) {
          console.warn('AI 정제 실패 응답:', data.error);
          alert(`[AI 자동 정제 실패]\n원인: ${data.error}\n\n(원문 메모 그대로 등록됩니다)`);
        }
      } catch (err) {
        console.warn('AI 서버 미연결 또는 응답 오류, 원문 메모 사용:', err);
        alert(`[AI 서버 연결 오류]\n${err.message || '백엔드 서버 응답 없음'}\n\n(원문 메모 그대로 등록됩니다)`);
      } finally {
        setIsAiProcessing(false);
      }
    }

    const newIssue = {
      id: Date.now(),
      projectId: activeProject.id,
      projectName: activeProject.name,
      supervisorName:
        activeProject.supervisorName || currentUser?.nickname || '공사감독자',
      category,
      floor: selectedFloorPlan ? selectedFloorPlan.floor : '도면 미지정',
      floorPlanUrl: selectedFloorPlan ? selectedFloorPlan.url : null,
      pin,
      photoUrl,
      content: refinedContent || '특이사항 없음',
      createdAt: getFormattedDate(),
      weather: weatherInfo,
      isSent: false,
    };

    onSubmitIssue(newIssue);
    alert('대장 등록 완료. 지적 메모가 저장되었습니다.');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <div
        style={{
          backgroundColor: '#f1f5f9',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
          오늘 날씨 (자동)
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
            {weatherInfo.condition}
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', marginTop: '2px' }}>
            ({weatherInfo.high !== '-' ? `${weatherInfo.high}℃ / ${weatherInfo.low}℃` : '-'})
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '700' }}>공사 현장 선택 *</label>
        <select
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setSelectedFloorPlan(null);
            setPin(null);
          }}
          required
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #6366f1',
            marginTop: '6px',
          }}
        >
          <option value="">-- 점검 현장을 선택하세요 --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {activeProject?.plans?.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <label
            style={{
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '8px',
              display: 'block',
            }}
          >
            층별 도면 위치 지정 (선택)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeProject.plans.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedFloorPlan(p);
                  setPin(null);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border:
                    selectedFloorPlan?.floor === p.floor
                      ? '2px solid #4f46e5'
                      : '1px solid #cbd5e1',
                  backgroundColor:
                    selectedFloorPlan?.floor === p.floor ? '#eef2ff' : '#fff',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {p.floor} 보기
              </button>
            ))}
          </div>

          {selectedFloorPlan && (
            <div
              style={{
                position: 'relative',
                marginTop: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <img
                ref={imageRef}
                src={selectedFloorPlan.url}
                alt="도면"
                crossOrigin="anonymous"
                onClick={handlePlanClick}
                style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
              />
              {pin && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <svg width="22" height="28" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12C0 18.8 10.5 28.8 11.4 29.6C11.7 29.9 12.3 29.9 12.6 29.6C13.5 28.8 24 18.8 24 12C24 5.37 18.63 0 12 0Z"
                      fill="#e11d48"
                    />
                    <circle cx="12" cy="11" r="4.5" fill="#ffffff" />
                    <circle cx="12" cy="11" r="2" fill="#e11d48" />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '5px',
                      height: '5px',
                      backgroundColor: '#e11d48',
                      borderRadius: '50%',
                      border: '1.5px solid #ffffff',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label style={{ fontSize: '13px', fontWeight: '700' }}>분류 구분</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            marginTop: '6px',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
          현장 사진 첨부
        </label>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="photo-upload"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100px',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="미리보기" style={{ height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
              📷 앨범 / 카메라 촬영
            </span>
          )}
        </label>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <label style={{ fontSize: '13px', fontWeight: '700' }}>구두 메모 (AI 자동 정리)</label>
          <button
            type="button"
            onClick={toggleRecording}
            style={{
              padding: '6px 12px',
              backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isRecording ? (
              <>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
                녹음 종료하기
              </>
            ) : (
              '🎙️ 녹음 켜기'
            )}
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            rows="4"
            value={memo + (interimMemo ? (memo ? ' ' : '') + interimMemo : '')}
            onChange={(e) => {
              if (!isRecording) setMemo(e.target.value);
            }}
            placeholder="마이크를 켜서 현장 상황을 말하거나 직접 타이핑하세요."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: isRecording ? '2px solid #ef4444' : '1px solid #cbd5e1',
              boxSizing: 'border-box',
              lineHeight: '1.5',
              fontSize: '14px',
              color: isRecording ? '#475569' : '#000000',
              transition: 'border 0.2s ease',
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isAiProcessing}
        style={{
          padding: '15px',
          backgroundColor: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '800',
          cursor: isAiProcessing ? 'not-allowed' : 'pointer',
        }}
      >
        {isAiProcessing ? 'AI 공문 양식 정리 중...' : '대장 등록'}
      </button>
    </form>
  );
}
