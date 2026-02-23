import React, { useState, useEffect } from 'react';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import NumberSelector from './NumberSelector';
import StatisticsPanel from './StatisticsPanel';
import GameResult from './GameResult';
import BannerAd from './BannerAd';
import { fetchLotteryStatistics, type StatisticsData } from '../utils/fetchLotteryStatistics';
import { generateNumbers, type GenerationMode } from '../utils/generateNumbers';

const INTERSTITIAL_AD_ID = 'ait.v2.live.d3ee57bf5ef34285';
const BANNER_AD_ID = 'ait.v2.live.9a237263c4b742f2';

const MODE_OPTIONS: { key: GenerationMode; label: string; desc: string }[] = [
  { key: 'random', label: '랜덤', desc: '순수 랜덤' },
  { key: 'hot', label: '핫번호', desc: '자주 나온 번호 위주' },
  { key: 'cold', label: '콜드번호', desc: '적게 나온 번호 위주' },
  { key: 'balanced', label: '균형', desc: '골고루 섞어서' },
];

export default function LottoGenerator() {
  const [gameCount, setGameCount] = useState(1);
  const [mode, setMode] = useState<GenerationMode>('random');
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [includedNumbers, setIncludedNumbers] = useState<number[]>([]);
  const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNumberSelector, setShowNumberSelector] = useState(false);

  const { showAd } = useInterstitialAd(INTERSTITIAL_AD_ID);

  useEffect(() => {
    fetchLotteryStatistics(20)
      .then(data => setStatisticsData(data))
      .catch(() => setStatisticsData(null))
      .finally(() => setIsLoading(false));
  }, []);

  const performGeneration = () => {
    const games = generateNumbers(gameCount, mode, excludedNumbers, includedNumbers, statisticsData);
    setGeneratedGames(games);
  };

  const handleGenerate = () => {
    performGeneration();
  };

  const handleReset = () => {
    showAd({
      onDismiss: () => {
        resetAndGenerate();
      },
    });
  };

  const resetAndGenerate = () => {
    setGeneratedGames([]);
    setGameCount(1);
    setMode('random');
    setExcludedNumbers([]);
    setIncludedNumbers([]);
  };

  const handleNumberApply = (excluded: number[], included: number[]) => {
    setExcludedNumbers(excluded);
    setIncludedNumbers(included);
  };

  const filterCount = excludedNumbers.length + includedNumbers.length;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="p-4 pb-10">
        {/* 헤더 */}
        <div className="bg-primary rounded-xl p-5 mb-3 text-center">
          <h1 className="text-xl font-bold text-white">로또메이트</h1>
          <p className="text-white/80 text-sm mt-1">행운의 번호를 생성해보세요</p>
        </div>

        {/* 통계 패널 */}
        <StatisticsPanel statisticsData={statisticsData} isLoading={isLoading} />

        {/* 설정 카드 */}
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          {/* 게임 수 선택 */}
          <p className="text-sm font-bold mb-2.5">게임 수</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(count => (
              <button
                key={count}
                className={`flex-1 py-2.5 rounded-lg text-sm text-center ${
                  gameCount === count
                    ? 'bg-primary text-white font-bold'
                    : 'bg-[#F4F4F4] text-[#6B7684]'
                }`}
                onClick={() => setGameCount(count)}
              >
                {count}
              </button>
            ))}
          </div>

          {/* 생성 모드 선택 */}
          <p className="text-sm font-bold mb-2.5 mt-5">생성 방식</p>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`flex-1 py-2.5 rounded-lg text-xs text-center ${
                  mode === opt.key
                    ? 'bg-primary text-white font-bold'
                    : 'bg-[#F4F4F4] text-[#6B7684]'
                }`}
                onClick={() => setMode(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {mode !== 'random' && !statisticsData && !isLoading && (
            <p className="text-[#F04452] text-xs mt-2">통계 데이터가 없어 랜덤으로 생성됩니다</p>
          )}

          {/* 번호 필터 */}
          <button
            className="flex justify-between items-center w-full py-3.5 mt-5 border-t border-[#F0F0F0]"
            onClick={() => setShowNumberSelector(true)}
          >
            <span className="text-sm text-[#333]">번호 필터</span>
            <div className="flex items-center gap-2">
              {filterCount > 0 && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {filterCount}
                </span>
              )}
              <span className="text-[#999] text-xl">›</span>
            </div>
          </button>

          {/* 필터 요약 */}
          {(excludedNumbers.length > 0 || includedNumbers.length > 0) && (
            <div className="pt-1">
              {excludedNumbers.length > 0 && (
                <p className="text-[#999] text-xs">
                  제외: {[...excludedNumbers].sort((a, b) => a - b).join(', ')}
                </p>
              )}
              {includedNumbers.length > 0 && (
                <p className="text-[#3182F6] text-xs mt-0.5">
                  포함: {[...includedNumbers].sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 생성 버튼 */}
        <div className="mb-3">
          <button
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base"
            onClick={handleGenerate}
          >
            번호 생성하기
          </button>
        </div>

        {/* 결과 */}
        <GameResult games={generatedGames} />

        {/* 배너 광고 */}
        {generatedGames.length > 0 && (
          <div className="mb-3">
            <BannerAd adGroupId={BANNER_AD_ID} />
          </div>
        )}

        {/* 새로 생성하기 버튼 */}
        {generatedGames.length > 0 && (
          <div className="flex flex-col items-center mb-3">
            <button
              className="bg-[#F4F4F4] py-3 px-6 rounded-lg"
              onClick={handleReset}
            >
              <span className="text-[#6B7684] text-sm font-bold">새로 생성하기</span>
            </button>
            <p className="text-[#999] text-xs mt-1.5 flex items-center gap-1">
              <span className="bg-[#999] text-white text-[10px] font-bold px-1 rounded">AD</span>
              광고 시청 후 초기화됩니다
            </p>
          </div>
        )}

        {/* 안내 */}
        <div className="px-1 mt-1">
          <p className="text-[#BBB] text-xs text-center leading-[18px]">
            로또 번호는 순수 확률에 의해 결정되며, 통계 기반 추천은 참고용입니다.
          </p>
          <p className="text-[#BBB] text-xs text-center leading-[18px]">
            당첨을 보장하지 않습니다. 책임감 있는 구매를 권장합니다.
          </p>
        </div>

        {/* 번호 선택 모달 */}
        <NumberSelector
          visible={showNumberSelector}
          excludedNumbers={excludedNumbers}
          includedNumbers={includedNumbers}
          onClose={() => setShowNumberSelector(false)}
          onApply={handleNumberApply}
        />
      </div>
    </div>
  );
}
