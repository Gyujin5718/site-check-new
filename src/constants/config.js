// 환경 변수 및 설정 상수

export const KAKAO_CLIENT_ID =
  process.env.REACT_APP_KAKAO_CLIENT_ID || 'b1788a69ad40e17245ccac45a2f9cd12';

export const getKakaoRedirectUri = () => {
  return `${window.location.origin}/auth/kakao/callback`;
};

export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

export const CATEGORIES = ['안전 관리', '품질 관리', '환경 관리', '공정 관리', '기타'];

export const INITIAL_PROJECTS = [
  {
    id: 1,
    name: '토성초등학교 공간재구조화 및 리모델링공사',
    managerEmail: 'site_toseong@example.com',
    supervisorName: '홍길동',
    plans: [
      {
        floor: '1층',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        filename: 'plan_1f.jpg',
      },
      {
        floor: '2층',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        filename: 'plan_2f.jpg',
      },
    ],
  },
];

export const INITIAL_ISSUES = [
  {
    id: 101,
    projectId: 1,
    projectName: '토성초등학교 공간재구조화 및 리모델링공사',
    supervisorName: '홍길동',
    category: '품질 관리',
    floor: '2층',
    floorPlanUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    // 백분율(%) 단위로 저장된 좌표 (가로 45%, 세로 35%)
    pin: { x: 45, y: 35 },
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    content: '2층 복도 단차 부위 마감 몰탈 불량 및 재료분리대 수평 오차 발생. 전면 재시공 요망.',
    createdAt: '2026-11-04 (수)',
    weather: { condition: '맑음', high: '19', low: '9' },
    isSent: false,
  },
];
