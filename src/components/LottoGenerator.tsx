import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button } from '@toss/tds-react-native';
import { GoogleAdMob } from '@apps-in-toss/framework';
import NumberSelector from './NumberSelector';
import StatisticsPanel from './StatisticsPanel';
import GameResult from './GameResult';
import { fetchLotteryStatistics, type StatisticsData } from '../utils/fetchLotteryStatistics';
import { generateNumbers, type GenerationMode } from '../utils/generateNumbers';

const INTERSTITIAL_AD_ID = 'ait.v2.live.d3ee57bf5ef34285';

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

  const adLoadedRef = useRef(false);
  const adAvailableRef = useRef(false);

  // 광고 로드
  const loadAd = () => {
    try {
      if (!GoogleAdMob || typeof GoogleAdMob.loadAppsInTossAdMob !== 'function') {
        adAvailableRef.current = false;
        return;
      }
      adAvailableRef.current = true;

      GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_ID },
        onEvent: (event: any) => {
          if (event.type === 'loaded') {
            adLoadedRef.current = true;
          }
        },
        onError: () => {
          adLoadedRef.current = false;
        },
      });
    } catch {
      adAvailableRef.current = false;
    }
  };

  useEffect(() => {
    loadAd();
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
    if (!adAvailableRef.current || !adLoadedRef.current) {
      performGeneration();
      return;
    }

    try {
      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_ID },
        onEvent: (event: any) => {
          if (event.type === 'dismissed') {
            performGeneration();
            adLoadedRef.current = false;
            loadAd();
          }
        },
        onError: () => {
          performGeneration();
          adLoadedRef.current = false;
          loadAd();
        },
      });
    } catch {
      performGeneration();
    }
  };

  const handleNumberApply = (excluded: number[], included: number[]) => {
    setExcludedNumbers(excluded);
    setIncludedNumbers(included);
  };

  const filterCount = excludedNumbers.length + includedNumbers.length;

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text typography="h4" fontWeight="bold" style={styles.headerTitle}>
          로또메이트
        </Text>
        <Text typography="body3" style={styles.headerSub}>
          행운의 번호를 생성해보세요
        </Text>
      </View>

      {/* 통계 패널 */}
      <StatisticsPanel statisticsData={statisticsData} isLoading={isLoading} />

      {/* 설정 카드 */}
      <View style={styles.card}>
        {/* 게임 수 선택 */}
        <Text typography="body2" fontWeight="bold" style={styles.sectionLabel}>게임 수</Text>
        <View style={styles.gameCountRow}>
          {[1, 2, 3, 4, 5].map(count => (
            <TouchableOpacity
              key={count}
              style={[styles.countButton, gameCount === count && styles.countButtonActive]}
              onPress={() => setGameCount(count)}
              activeOpacity={0.7}
            >
              <Text
                typography="body2"
                fontWeight={gameCount === count ? 'bold' : 'regular'}
                style={[styles.countText, gameCount === count && styles.countTextActive]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 생성 모드 선택 */}
        <Text typography="body2" fontWeight="bold" style={[styles.sectionLabel, { marginTop: 20 }]}>
          생성 방식
        </Text>
        <View style={styles.modeRow}>
          {MODE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.modeButton, mode === opt.key && styles.modeButtonActive]}
              onPress={() => setMode(opt.key)}
              activeOpacity={0.7}
            >
              <Text
                typography="body3"
                fontWeight={mode === opt.key ? 'bold' : 'regular'}
                style={[styles.modeText, mode === opt.key && styles.modeTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {mode !== 'random' && !statisticsData && !isLoading && (
          <Text typography="body3" style={styles.warningText}>
            통계 데이터가 없어 랜덤으로 생성됩니다
          </Text>
        )}

        {/* 번호 필터 */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowNumberSelector(true)}
          activeOpacity={0.7}
        >
          <Text typography="body2" style={styles.filterLabel}>번호 필터</Text>
          <View style={styles.filterRight}>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text typography="body3" fontWeight="bold" style={styles.filterBadgeText}>
                  {filterCount}
                </Text>
              </View>
            )}
            <Text typography="body2" style={styles.filterArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 필터 요약 */}
        {(excludedNumbers.length > 0 || includedNumbers.length > 0) && (
          <View style={styles.filterSummary}>
            {excludedNumbers.length > 0 && (
              <Text typography="body3" style={styles.filterSummaryText}>
                제외: {excludedNumbers.sort((a, b) => a - b).join(', ')}
              </Text>
            )}
            {includedNumbers.length > 0 && (
              <Text typography="body3" style={styles.filterIncludeText}>
                포함: {includedNumbers.sort((a, b) => a - b).join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 생성 버튼 */}
      <View style={styles.generateWrapper}>
        <Button size="large" onPress={handleGenerate}>
          번호 생성하기
        </Button>
      </View>

      {/* 결과 */}
      <GameResult games={generatedGames} />

      {/* 안내 */}
      <View style={styles.notice}>
        <Text typography="body3" style={styles.noticeText}>
          로또 번호는 순수 확률에 의해 결정되며, 통계 기반 추천은 참고용입니다.
        </Text>
        <Text typography="body3" style={styles.noticeText}>
          당첨을 보장하지 않습니다. 책임감 있는 구매를 권장합니다.
        </Text>
      </View>

      {/* 번호 선택 모달 */}
      <NumberSelector
        visible={showNumberSelector}
        excludedNumbers={excludedNumbers}
        includedNumbers={includedNumbers}
        onClose={() => setShowNumberSelector(false)}
        onApply={handleNumberApply}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  gameCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
  },
  countButtonActive: {
    backgroundColor: '#FF6B35',
  },
  countText: {
    color: '#6B7684',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  modeText: {
    color: '#6B7684',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#F04452',
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  filterLabel: {
    color: '#333',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  filterArrow: {
    color: '#999',
    fontSize: 20,
  },
  filterSummary: {
    paddingTop: 4,
  },
  filterSummaryText: {
    color: '#999',
    fontSize: 12,
  },
  filterIncludeText: {
    color: '#3182F6',
    fontSize: 12,
    marginTop: 2,
  },
  generateWrapper: {
    marginBottom: 12,
  },
  notice: {
    paddingHorizontal: 4,
    marginTop: 4,
  },
  noticeText: {
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 18,
  },
});
