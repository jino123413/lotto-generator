import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@toss/tds-react-native';

type Props = {
  games: number[][];
};

const GAME_LABELS = ['A', 'B', 'C', 'D', 'E'];

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

export default function GameResult({ games }: Props) {
  if (games.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text typography="body1" fontWeight="bold" style={styles.title}>생성된 번호</Text>
      {games.map((game, idx) => (
        <View key={idx} style={styles.gameRow}>
          <View style={styles.labelContainer}>
            <Text typography="body2" fontWeight="bold" style={styles.label}>
              {GAME_LABELS[idx]}
            </Text>
          </View>
          <View style={styles.ballsContainer}>
            {game.map((num, numIdx) => (
              <View key={numIdx} style={[styles.ball, { backgroundColor: getBallColor(num) }]}>
                <Text typography="body2" fontWeight="bold" style={styles.ballText}>
                  {num}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    marginBottom: 16,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  labelContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    color: '#6B7684',
    fontSize: 13,
  },
  ballsContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  ball: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
