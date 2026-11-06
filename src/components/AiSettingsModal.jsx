import React, { useState } from 'react';

const PRESETS = [
  {
    id: 'polite',
    badge: '🌟 기본 권장',
    name: '정중한 표준 공문형',
    desc: '과도한 위압감이나 행정처분 위협 없이, 객관적 미흡 사실과 시정 조치를 품격 있고 정중하게 전달 (~하여 주시기 바랍니다, ~보완 요망)',
    color: '#3b82f6',
  },
  {
    id: 'cooperative',
    badge: '🤝 상호 협력',
    name: '부드러운 협력형',
    desc: '현장 소장 및 관계자와 원활히 소통할 수 있도록 상호 존중과 협조를 구하는 부드러운 어조 (~협조 부탁드립니다, ~확인 바랍니다)',
    color: '#059669',
  },
  {
    id: 'strict',
    badge: '⚠️ 안전/단호',
    name: '엄격한 감독관형',
    desc: '긴급한 안전 위험이나 중대 하자 발생 시 명확하고 단호한 지시 어조 (~지시함, ~즉시 조치 요망)',
    color: '#e11d48',
  },
];

const TEMPLATES = [
  { label: '🛡️ 위협적 표현 금지', text: '과도하게 위협적이거나 강압적인 표현(공사 중지, 행정 조치 등)은 일체 사용하지 말고 상호 존중하는 어조로 작성해줘.' },
  { label: '🧹 청소/환경 정비 강조', text: '작업 구역 주변 비산먼지 차단 및 작업 완료 후 청소·환경 정비 조치를 항상 명시해줘.' },
  { label: '📋 사전 검측 확인 요청', text: '후속 공정 진행 전 감독관 사전 검측 및 승인을 득한 후 작업할 것을 포함해줘.' },
];

export default function AiSettingsModal({ isOpen, onClose, settings, onSaveSettings }) {
  const [tone, setTone] = useState(settings?.tone || 'polite');
  const [customPrompt, setCustomPrompt] = useState(settings?.customPrompt || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      tone,
      customPrompt: customPrompt.trim(),
    });
    onClose();
  };

  const handleInsertTemplate = (tText) => {
    setCustomPrompt((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n- ${tText}` : `- ${tText}`;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          borderRadius: '20px',
          padding: '22px',
          boxSizing: 'border-box',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              🤖 AI 답변 스타일 및 프롬프트 설정
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              현장 메모를 일지 문장으로 바꿀 때 AI의 말투와 규칙을 설정합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '16px',
              fontWeight: '700',
            }}
          >
            ✕
          </button>
        </div>

        {/* 1. 어조 프리셋 선택 */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'block' }}>
            1. 어조 스타일 프리셋 선택
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRESETS.map((p) => {
              const isSelected = tone === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setTone(p.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${p.color}` : '1.5px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: isSelected ? `4px solid ${p.color}` : '2px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          display: 'inline-block',
                          boxSizing: 'border-box',
                        }}
                      />
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: isSelected ? p.color : '#1e293b' }}>
                        {p.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '700',
                        color: p.color,
                        backgroundColor: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 20px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.45' }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. 맞춤 지침 및 프롬프트 직접 작성 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              2. 맞춤 지침 / 프롬프트 직접 작성 (선택)
            </label>
            {customPrompt && (
              <button
                type="button"
                onClick={() => setCustomPrompt('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                지침 초기화
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748b' }}>
            여기에 작성된 지침은 프리셋보다 <strong>최우선으로 AI에 반영</strong>됩니다.
          </p>

          <textarea
            rows="4"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="예시)&#10;- 위협적이거나 강압적인 표현(공사 중지, 강력한 행정 조치 등)은 절대 사용하지 말 것&#10;- 시정 요구 시 반드시 '조치하여 주시기 바랍니다' 체를 사용할 것&#10;- 분진이나 소음 발생 시 사전 통보 및 청소·보양 조치를 포함할 것"
            style={{
              width: '100%',
              padding: '10px',
              boxSizing: 'border-box',
              fontSize: '12px',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
            }}
          />

          {/* 원클릭 추천 템플릿 태그 */}
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginRight: '6px' }}>
              💡 빠른 추가:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertTemplate(tmpl.text)}
                  style={{
                    backgroundColor: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    color: '#4338ca',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              padding: '12px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
            }}
          >
            스타일 저장 및 적용
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
