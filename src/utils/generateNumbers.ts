import type { StatisticsData } from './fetchLotteryStatistics';

export type GenerationMode = 'random' | 'hot' | 'cold' | 'balanced';

export function generateNumbers(
  gameCount: number,
  mode: GenerationMode,
  excludedNumbers: number[],
  includedNumbers: number[],
  statisticsData?: StatisticsData | null,
): number[][] {
  const excludedSet = new Set(excludedNumbers);
  const includedSet = new Set(includedNumbers);
  const games: number[][] = [];

  for (let g = 0; g < gameCount; g++) {
    const game: number[] = [...includedNumbers.filter(n => !excludedSet.has(n))];

    // 사용 가능한 번호 풀 생성 (이미 포함된 번호 제외)
    const available: number[] = [];
    for (let n = 1; n <= 45; n++) {
      if (!excludedSet.has(n) && !game.includes(n)) {
        available.push(n);
      }
    }

    const remaining = 6 - game.length;
    if (remaining <= 0) {
      games.push(game.slice(0, 6).sort((a, b) => a - b));
      continue;
    }

    // 모드에 따라 가중치 풀 구성
    let weightedPool: number[];

    if (mode === 'random' || !statisticsData) {
      weightedPool = available;
    } else {
      const hotSet = new Set(statisticsData.hotNumbers);
      const coldSet = new Set(statisticsData.coldNumbers);

      const hotAvail = available.filter(n => hotSet.has(n));
      const coldAvail = available.filter(n => coldSet.has(n));
      const normalAvail = available.filter(n => !hotSet.has(n) && !coldSet.has(n));

      if (mode === 'hot') {
        // 핫 번호 가중치 3배
        weightedPool = [...hotAvail, ...hotAvail, ...hotAvail, ...normalAvail, ...coldAvail];
      } else if (mode === 'cold') {
        // 콜드 번호 가중치 3배
        weightedPool = [...coldAvail, ...coldAvail, ...coldAvail, ...normalAvail, ...hotAvail];
      } else {
        // balanced: 균등 분배
        weightedPool = [...hotAvail, ...hotAvail, ...normalAvail, ...normalAvail, ...coldAvail, ...coldAvail];
      }

      if (weightedPool.length === 0) {
        weightedPool = available;
      }
    }

    // 나머지 번호 선택
    const selected = new Set(game);
    let attempts = 0;
    while (game.length < 6 && attempts < 1000) {
      const idx = Math.floor(Math.random() * weightedPool.length);
      const num = weightedPool[idx];
      if (!selected.has(num)) {
        game.push(num);
        selected.add(num);
      }
      attempts++;
    }

    // 풀에서 못 채운 경우 available에서 직접 선택
    if (game.length < 6) {
      const shuffled = available.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
      for (const n of shuffled) {
        if (game.length >= 6) break;
        game.push(n);
      }
    }

    games.push(game.sort((a, b) => a - b));
  }

  return games;
}
