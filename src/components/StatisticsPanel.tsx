import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@toss/tds-react-native';
import type { StatisticsData } from '../utils/fetchLotteryStatistics';

type Props = {
  statisticsData: StatisticsData | null;
  isLoading: boolean;
};

const BALL_COLORS: Record<string, string> = {
  '1': '#FBC400',
  '2': '#69C8F2',
  '3': '#FF7272',
  '4': '#AAAAAA',
  '5': '#B0D840',
};

function getBallColor(num: number): string {
  if (num <= 10) return BALL_COLORS['1'];
  if (num <= 20) return BALL_COLORS['2'];
  if (num <= 30) return BALL_COLORS['3'];
  if (num <= 40) return BALL_COLORS['4'];
  return BALL_COLORS['5'];
}

export default function StatisticsPanel({ statisticsData, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text typography="body2" style={styles.loadingText}>당첨 통계 불러오는 중...</Text>
      </View>
    );
  }

  if (!statisticsData) {
    return (
      <View style={styles.card}>
        <Text typography="body2" style={styles.errorText}>통계 데이터를 불러올 수 없습니다</Text>
      </View>
    );
  }

  const renderNumberRow = (numbers: number[], label: string, emoji: string, color: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text typography="body2" fontWeight="bold" style={{ color }}>
          {emoji} {label}
        </Text>
        <Text typography="body3" style={styles.countText}>{numbers.length}개</Text>
      </View>
      <View style={styles.numbersRow}>
        {numbers.map(num => (
          <View key={num} style={[styles.miniball, { backgroundColor: getBallColor(num) }]}>
            <Text typography="body3" fontWeight="bold" style={styles.miniballText}>{num}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <Text typography="body1" fontWeight="bold">
          최근 {statisticsData.recentDraws}회 당첨 통계
        </Text>
        <Text typography="body2" style={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {renderNumberRow(statisticsData.hotNumbers, '자주 나온 번호', '🔥', '#F04452')}
          {renderNumberRow(statisticsData.normalNumbers, '보통 번호', '➖', '#6B7684')}
          {renderNumberRow(statisticsData.coldNumbers, '적게 나온 번호', '❄️', '#3182F6')}

          <View style={styles.drawInfo}>
            <Text typography="body3" style={styles.infoText}>
              분석 범위: 최근 {statisticsData.recentDraws}회 (제{statisticsData.latestDraw - statisticsData.recentDraws + 1}회 ~ 제{statisticsData.latestDraw}회)
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    color: '#999',
  },
  content: {
    marginTop: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countText: {
    color: '#999',
  },
  numbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniball: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniballText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  drawInfo: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoText: {
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    color: '#F04452',
    textAlign: 'center',
  },
});
