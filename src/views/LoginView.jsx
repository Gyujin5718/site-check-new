import React from 'react';
import { KAKAO_CLIENT_ID, getKakaoRedirectUri } from '../constants/config';

export default function LoginView() {
  const handleKakaoLogin = () => {
    if (!KAKAO_CLIENT_ID) {
      alert('카카오 REST API 키(REACT_APP_KAKAO_CLIENT_ID)가 설정되지 않았습니다.');
      return;
    }
    const redirectUri = getKakaoRedirectUri();
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px',
        fontFamily: '-apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '4px solid #1e293b',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
          공사감독 스마트 시스템
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 28px', lineHeight: '1.4' }}>
          시설공사 감독 업무를 위해<br />
          카카오 계정으로 간편 인증을 진행하세요.
        </p>

        <button
          onClick={handleKakaoLogin}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#FEE500',
            color: '#191919',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(254, 229, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span> 카카오 로그인으로 시작하기
        </button>
      </div>
    </div>
  );
}
