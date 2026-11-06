import React from 'react';

export default function MainMenuView({ onNavigate }) {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        onClick={() => onNavigate('project_new')}
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800' }}>
          1. 현장 목록 및 관리
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          현장명, 공사감독자 등록 및 기존 현장과 도면을 관리합니다.
        </p>
      </div>

      <div
        onClick={() => onNavigate('issue_new')}
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '18px',
          border: '2px solid #4f46e5',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(79,70,229,0.12)',
          transition: 'all 0.2s ease',
        }}
      >
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#4f46e5' }}>
          2. 현장 지적사항 등록
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          현장 사진, 도면 핀 지정, 음성 메모 (날씨 자동 입력)
        </p>
      </div>

      <div
        onClick={() => onNavigate('ledger')}
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800' }}>
          3. 대장 조회 및 발송
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          A4 공사감독일지 확인, 서명 결재 및 PDF 발송
        </p>
      </div>
    </div>
  );
}
