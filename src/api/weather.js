/**
 * Open-Meteo 무료 기상 API를 통한 실시간 기상 조회 (API 키 불필요)
 * 기본 위치: 부산광역시 (위도 35.1796, 경도 129.0756)
 */

const WMO_WEATHER_MAP = {
  0: '맑음',
  1: '대체로 맑음',
  2: '구름 조금',
  3: '흐림',
  45: '안개',
  48: '짙은 안개',
  51: '약한 이슬비',
  53: '이슬비',
  55: '강한 이슬비',
  61: '약한 비',
  63: '비',
  65: '강한 비',
  66: '진눈깨비',
  67: '진눈깨비',
  71: '약한 눈',
  73: '눈',
  75: '강한 눈',
  77: '싸락눈',
  80: '약한 소나기',
  81: '소나기',
  82: '강한 소나기',
  85: '눈 소나기',
  86: '강한 눈 소나기',
  95: '뇌우',
  96: '뇌우(우박)',
  99: '강한 뇌우',
};

export async function fetchLiveWeather(lat = 35.1796, lon = 129.0756) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia%2FSeoul`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('날씨 API 응답 실패');

    const data = await response.json();
    const todayWeatherCode =
      data.daily?.weather_code?.[0] ?? data.current?.weather_code ?? 0;
    const maxTemp = Math.round(data.daily?.temperature_2m_max?.[0] ?? 16);
    const minTemp = Math.round(data.daily?.temperature_2m_min?.[0] ?? 5);

    const condition = WMO_WEATHER_MAP[todayWeatherCode] || '맑음';

    return {
      condition,
      high: String(maxTemp),
      low: String(minTemp),
    };
  } catch (error) {
    console.warn('실시간 날씨 조회 실패, 기본값 반환:', error);
    return {
      condition: '흐림',
      high: '16',
      low: '5',
    };
  }
}

/**
 * 브라우저 GPS 위치를 기반으로 하거나, 거부 시 부산 기준 실시간 날씨 반환
 */
export function getAutoWeather(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const weather = await fetchLiveWeather(pos.coords.latitude, pos.coords.longitude);
        callback(weather);
      },
      async () => {
        // 위치 권한 거부 시 기본 부산 날씨
        const weather = await fetchLiveWeather(35.1796, 129.0756);
        callback(weather);
      },
      { timeout: 4000 }
    );
  } else {
    fetchLiveWeather(35.1796, 129.0756).then(callback);
  }
}
