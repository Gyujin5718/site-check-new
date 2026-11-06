import { API_BASE_URL } from '../constants/config';

/**
 * 카카오 인가 코드를 백엔드로 전달하여 로그인 처리
 */
export async function authenticateWithKakao(code, redirectUri) {
  const response = await fetch(`${API_BASE_URL}/api/auth/kakao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri }),
  });
  return response.json();
}

/**
 * 음성/메모 원문을 AI를 통해 공문서 지적사항 양식으로 정제
 */
export async function refineIssueMemoWithAi(category, memo) {
  const response = await fetch(`${API_BASE_URL}/api/ai-refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, memo }),
  });
  return response.json();
}

/**
 * 생성된 A4 PDF와 지적 정보를 현장소장 이메일로 전송
 */
export async function sendIssueEmail(payload) {
  const response = await fetch(`${API_BASE_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

/**
 * 중앙 서버의 최신 현장 및 지적사항 데이터 일괄 조회 (PC-모바일 동기화)
 */
export async function fetchServerData() {
  const response = await fetch(`${API_BASE_URL}/api/data`);
  return response.json();
}

/**
 * 현장 정보 서버에 저장/동기화
 */
export async function saveProjectToServer(project) {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  return response.json();
}

/**
 * 지적사항 서버에 저장/동기화
 */
export async function saveIssueToServer(issue) {
  const response = await fetch(`${API_BASE_URL}/api/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(issue),
  });
  return response.json();
}

/**
 * 현장 정보 서버에서 삭제/동기화
 */
export async function deleteProjectFromServer(projectId) {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
    method: 'DELETE',
  });
  return response.json();
}
