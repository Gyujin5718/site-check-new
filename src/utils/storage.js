/**
 * IndexedDB 기반 영구 저장소 유틸리티
 * - 브라우저 localStorage의 5MB 용량 한계를 극복하고 수백 MB~수 GB까지 도면/사진 영구 저장
 * - 기존 localStorage 데이터가 남아있는 경우 최초 1회 자동 마이그레이션
 */

const DB_NAME = 'SiteCheckDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('현재 브라우저가 IndexedDB를 지원하지 않습니다.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * IndexedDB에서 key에 해당하는 데이터 조회
 */
export async function idbGet(key) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[IndexedDB get '${key}' 오류]:`, err);
    return null;
  }
}

/**
 * IndexedDB에 key-value 데이터 저장
 */
export async function idbSet(key, value) {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`[IndexedDB set '${key}' 오류]:`, err);
  }
}

/**
 * 프로젝트 데이터 초기 로드 및 localStorage 자동 마이그레이션
 */
export async function loadInitialProjects(defaultProjects = []) {
  try {
    const idbData = await idbGet('site_projects');
    if (Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }

    // IndexedDB에 없으면 localStorage 마이그레이션 시도
    const legacy = localStorage.getItem('site_projects');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await idbSet('site_projects', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('localStorage 현장 데이터 파싱 오류:', e);
      }
    }
  } catch (err) {
    console.error('현장 데이터 로드 실패, 기본값 사용:', err);
  }

  // 기본값 저장 및 반환
  await idbSet('site_projects', defaultProjects);
  return defaultProjects;
}

/**
 * 지적사항 대장 초기 로드 및 localStorage 자동 마이그레이션
 */
export async function loadInitialIssues(defaultIssues = []) {
  try {
    const idbData = await idbGet('site_issues');
    if (Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }

    // IndexedDB에 없으면 localStorage 마이그레이션 시도
    const legacy = localStorage.getItem('site_issues');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await idbSet('site_issues', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('localStorage 지적사항 데이터 파싱 오류:', e);
      }
    }
  } catch (err) {
    console.error('지적사항 데이터 로드 실패, 기본값 사용:', err);
  }

  // 기본값 저장 및 반환
  await idbSet('site_issues', defaultIssues);
  return defaultIssues;
}

/**
 * AI 설정 초기 로드
 */
export async function loadInitialAiSettings(defaultSettings = { tone: 'polite', customPrompt: '' }) {
  try {
    const idbData = await idbGet('ai_settings');
    if (idbData) return idbData;

    const legacy = localStorage.getItem('ai_settings');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        await idbSet('ai_settings', parsed);
        return parsed;
      } catch (e) {}
    }
  } catch (err) {
    console.error('AI 설정 로드 실패:', err);
  }
  return defaultSettings;
}
