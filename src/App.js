import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import MainMenuView from './views/MainMenuView';
import ProjectManageView from './views/ProjectManageView';
import IssueRegisterView from './views/IssueRegisterView';
import LedgerView from './views/LedgerView';
import { INITIAL_PROJECTS, INITIAL_ISSUES, getKakaoRedirectUri } from './constants/config';
import { authenticateWithKakao } from './api';
import { getAutoWeather } from './api/weather';

export default function App() {
  const [currentView, setCurrentView] = useState('menu');
  const [currentUser, setCurrentUser] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState({ condition: '조회 중...', high: '-', low: '-' });
  const isAuthProcessingRef = useRef(false);

  // 로컬스토리지 연동을 통한 데이터 영속화
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('site_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem('site_issues');
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  useEffect(() => {
    localStorage.setItem('site_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('site_issues', JSON.stringify(issues));
  }, [issues]);

  // 실시간 날씨 연동 (GPS 기반 또는 부산 기준 실시간 날씨 API)
  useEffect(() => {
    getAutoWeather((weather) => {
      setWeatherInfo(weather);
    });

    const savedUser = localStorage.getItem('kakao_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('kakao_user');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !isAuthProcessingRef.current) {
      isAuthProcessingRef.current = true;
      window.history.replaceState({}, document.title, '/');

      authenticateWithKakao(code, getKakaoRedirectUri())
        .then((data) => {
          if (data.success) {
            localStorage.setItem('kakao_user', JSON.stringify(data.user));
            setCurrentUser(data.user);
          } else {
            alert(`카카오 로그인 처리 실패: ${data.error || '알 수 없는 오류'}`);
          }
        })
        .catch((err) => {
          console.error('로그인 통신 에러:', err);
          alert('백엔드 서버가 켜져 있는지 확인해주세요.');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kakao_user');
    setCurrentUser(null);
    setCurrentView('menu');
  };

  const handleSaveProject = (projectData) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === projectData.id);
      if (exists) {
        return prev.map((p) => (p.id === projectData.id ? projectData : p));
      }
      return [...prev, projectData];
    });
  };

  const handleSubmitIssue = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setCurrentView('ledger');
  };

  const handleUpdateIssue = (updatedIssue) => {
    setIssues((prev) => prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item)));
  };

  // 로그인하지 않은 경우
  if (!currentUser) {
    return <LoginView />;
  }

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
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          minHeight: '880px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '6px solid #1e293b',
        }}
      >
        <Navbar
          currentView={currentView}
          onBackToMenu={() => setCurrentView('menu')}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
          {currentView === 'menu' && <MainMenuView onNavigate={setCurrentView} />}

          {currentView === 'project_new' && (
            <ProjectManageView
              projects={projects}
              onSaveProject={handleSaveProject}
              currentUser={currentUser}
            />
          )}

          {currentView === 'issue_new' && (
            <IssueRegisterView
              projects={projects}
              weatherInfo={weatherInfo}
              currentUser={currentUser}
              onSubmitIssue={handleSubmitIssue}
            />
          )}

          {currentView === 'ledger' && (
            <LedgerView
              issues={issues}
              projects={projects}
              onUpdateIssue={handleUpdateIssue}
            />
          )}
        </div>
      </div>
    </div>
  );
}
