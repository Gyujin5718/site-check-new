import React from 'react';

export default function Navbar({ currentView, onBackToMenu, currentUser, onLogout }) {
  const getTitle = () => {
    switch (currentView) {
      case 'project_new':
        return '1. 현장 목록 및 관리';
      case 'issue_new':
        return '2. 지적사항 등록';
      case 'ledger':
        return '3. 지적사항 대장 (A4)';
      default:
        return '공사 감독 스마트 시스템';
    }
  };

  return (
    <div
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {currentView !== 'menu' && (
          <button
            onClick={onBackToMenu}
            aria-label="메인 메뉴로 이동"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: 0,
              color: '#4f46e5',
              fontWeight: 'bold',
            }}
          >
            ◀
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
          {getTitle()}
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '700' }}>
          {currentUser?.nickname || '감독관'}
        </span>
        <button
          onClick={onLogout}
          style={{
            border: 'none',
            background: '#f1f5f9',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
