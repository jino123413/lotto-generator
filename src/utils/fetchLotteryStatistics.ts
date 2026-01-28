export type StatisticsData = {
  frequencies: Record<number, number>;
  hotNumbers: number[];
  coldNumbers: number[];
  normalNumbers: number[];
  latestDraw: number;
  recentDraws: number;
};

type LottoResponse = {
  returnValue: string;
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
};

const API_BASE = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';

async function getLatestDrawNumber(): Promise<number> {
  // 동행복권 API는 존재하지 않는 회차 요청 시 returnValue: 'fail' 반환
  // 현재 날짜 기반으로 대략적인 최신 회차 추정 후 정확한 번호 탐색
  const now = new Date();
  // 로또 1회: 2002-12-07, 매주 토요일 추첨
  const firstDraw = new Date(2002, 11, 7);
  const weeksDiff = Math.floor((now.getTime() - firstDraw.getTime()) / (7 * 24 * 60 * 60 * 1000));
  let estimated = weeksDiff + 1;

  // 추정 회차부터 역방향 탐색
  for (let i = estimated + 2; i >= estimated - 5; i--) {
    try {
      const res = await fetch(`${API_BASE}${i}`);
      const data: LottoResponse = await res.json();
      if (data.returnValue === 'success') {
        return data.drwNo;
      }
    } catch {
      continue;
    }
  }

  return estimated;
}

export async function fetchLotteryStatistics(drawCount: number = 20): Promise<StatisticsData> {
  const latestDraw = await getLatestDrawNumber();

  // 최근 N회 병렬 조회
  const promises: Promise<LottoResponse | null>[] = [];
  for (let i = 0; i < drawCount; i++) {
    const drwNo = latestDraw - i;
    if (drwNo < 1) break;
    promises.push(
      fetch(`${API_BASE}${drwNo}`)
        .then(res => res.json())
        .catch(() => null)
    );
  }

  const results = await Promise.all(promises);

  // 번호별 출현 빈도 집계
  const frequencies: Record<number, number> = {};
  for (let n = 1; n <= 45; n++) {
    frequencies[n] = 0;
  }

  results.forEach(data => {
    if (data && data.returnValue === 'success') {
      const nums = [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6];
      nums.forEach(num => {
        frequencies[num] = (frequencies[num] || 0) + 1;
      });
    }
  });

  // 빈도순 정렬 후 핫/콜드/보통 분류
  const sorted = Object.entries(frequencies)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => b.count - a.count);

  const third = Math.floor(sorted.length / 3);
  const hotNumbers = sorted.slice(0, third).map(e => e.num).sort((a, b) => a - b);
  const coldNumbers = sorted.slice(-third).map(e => e.num).sort((a, b) => a - b);
  const normalNumbers = sorted.slice(third, sorted.length - third).map(e => e.num).sort((a, b) => a - b);

  return {
    frequencies,
    hotNumbers,
    coldNumbers,
    normalNumbers,
    latestDraw,
    recentDraws: drawCount,
  };
}
