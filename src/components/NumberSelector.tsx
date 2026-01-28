import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from '@toss/tds-react-native';

type Props = {
  visible: boolean;
  excludedNumbers: number[];
  includedNumbers: number[];
  onClose: () => void;
  onApply: (excluded: number[], included: number[]) => void;
};

const BALL_COLORS: Record<string, string> = {
  '1': '#FBC400', // 1-10: 노랑
  '2': '#69C8F2', // 11-20: 파랑
  '3': '#FF7272', // 21-30: 빨강
  '4': '#AAAAAA', // 31-40: 회색
  '5': '#B0D840', // 41-45: 초록
};

function getBallColorGroup(num: number): string {
  if (num <= 10) return '1';
  if (num <= 20) return '2';
  if (num <= 30) return '3';
  if (num <= 40) return '4';
  return '5';
}

export default function NumberSelector({ visible, excludedNumbers, includedNumbers, onClose, onApply }: Props) {
  const [tempExcluded, setTempExcluded] = useState<Set<number>>(new Set(excludedNumbers));
  const [tempIncluded, setTempIncluded] = useState<Set<number>>(new Set(includedNumbers));

  React.useEffect(() => {
    if (visible) {
      setTempExcluded(new Set(excludedNumbers));
      setTempIncluded(new Set(includedNumbers));
    }
  }, [visible]);

  const handleToggle = (num: number) => {
    const newExcluded = new Set(tempExcluded);
    const newIncluded = new Set(tempIncluded);

    if (newExcluded.has(num)) {
      // 제외 → 포함
      newExcluded.delete(num);
      newIncluded.add(num);
    } else if (newIncluded.has(num)) {
      // 포함 → 일반
      newIncluded.delete(num);
    } else {
      // 일반 → 제외
      const availableCount = 45 - newExcluded.size - 1;
      if (availableCount < 6) return; // 최소 6개 필요
      newExcluded.add(num);
    }

    setTempExcluded(newExcluded);
    setTempIncluded(newIncluded);
  };

  const handleReset = () => {
    setTempExcluded(new Set());
    setTempIncluded(new Set());
  };

  const handleApply = () => {
    onApply(Array.from(tempExcluded), Array.from(tempIncluded));
    onClose();
  };

  const availableCount = 45 - tempExcluded.size;

  const renderBall = (num: number) => {
    const isExcluded = tempExcluded.has(num);
    const isIncluded = tempIncluded.has(num);
    const colorGroup = getBallColorGroup(num);
    const ballColor = BALL_COLORS[colorGroup];

    return (
      <TouchableOpacity
        key={num}
        style={[
          styles.ball,
          isExcluded && styles.ballExcluded,
          isIncluded && { backgroundColor: ballColor, borderColor: ballColor },
          !isExcluded && !isIncluded && styles.ballNormal,
        ]}
        onPress={() => handleToggle(num)}
        activeOpacity={0.7}
      >
        <Text
          typography="body3"
          fontWeight={isIncluded ? 'bold' : 'regular'}
          style={[
            styles.ballText,
            isExcluded && styles.ballTextExcluded,
            isIncluded && styles.ballTextIncluded,
          ]}
        >
          {num}
        </Text>
      </TouchableOpacity>
    );
  };

  // 7열 그리드로 1~45 배치
  const rows: number[][] = [];
  for (let i = 0; i < 45; i += 7) {
    rows.push(Array.from({ length: Math.min(7, 45 - i) }, (_, j) => i + j + 1));
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text typography="h5" fontWeight="bold">번호 선택</Text>
            <TouchableOpacity onPress={onClose}>
              <Text typography="body1" style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E8E8E8' }]} />
              <Text typography="body3" style={styles.legendText}>제외</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FBC400' }]} />
              <Text typography="body3" style={styles.legendText}>포함</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD' }]} />
              <Text typography="body3" style={styles.legendText}>일반</Text>
            </View>
          </View>

          <Text typography="body3" style={styles.hint}>
            탭: 일반 → 제외 → 포함 → 일반 (남은 번호: {availableCount}개)
          </Text>

          <ScrollView style={styles.gridScroll}>
            {rows.map((row, idx) => (
              <View key={idx} style={styles.row}>
                {row.map(num => renderBall(num))}
              </View>
            ))}
          </ScrollView>

          {tempIncluded.size > 0 && (
            <Text typography="body3" style={styles.includedInfo}>
              필수 포함: {Array.from(tempIncluded).sort((a, b) => a - b).join(', ')}
            </Text>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text typography="body2" style={styles.resetText}>초기화</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Button size="large" onPress={handleApply}>적용하기</Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: '#6B7684',
  },
  hint: {
    color: '#999',
    marginBottom: 16,
  },
  gridScroll: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  ball: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballNormal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  ballExcluded: {
    backgroundColor: '#E8E8E8',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  ballText: {
    fontSize: 14,
    color: '#333',
  },
  ballTextExcluded: {
    color: '#BBB',
    textDecorationLine: 'line-through',
  },
  ballTextIncluded: {
    color: '#FFFFFF',
  },
  includedInfo: {
    color: '#3182F6',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
  },
  resetText: {
    color: '#6B7684',
  },
});
