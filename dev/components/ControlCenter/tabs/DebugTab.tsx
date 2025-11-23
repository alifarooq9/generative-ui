import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useDebugData } from '../../../contexts/DebugContext';

// Color mapping for tag types
const TAG_COLORS: Record<string, string> = {
  bold: '#FF6B6B',
  italic: '#4ECDC4',
  code: '#FFE66D',
  codeBlock: '#95E1D3',
  link: '#A8E6CF',
  component: '#C7CEEA',
};

export function DebugTab() {
  const { debugState: state, currentText } = useDebugData();
  if (!state) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No debug data available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats Card */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Text Length</Text>
              <Text variant="bodyLarge">{currentText.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Stack Depth</Text>
              <Text variant="bodyLarge">{state.stack.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Earliest Position</Text>
              <Text variant="bodyLarge">{state.earliestPosition}</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>Processing Length</Text>
              <Text variant="bodyLarge">{currentText.length - state.earliestPosition}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Tag Stack */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Tag Stack ({state.stack.length})
          </Text>
          {state.stack.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>No incomplete tags</Text>
          ) : (
            <View style={styles.stackContainer}>
              {state.stack.map((tag, index) => (
                <Card key={index} mode="outlined" style={styles.stackItem}>
                  <Card.Content>
                    <View style={styles.stackItemHeader}>
                      <Chip 
                        mode="flat" 
                        style={{ backgroundColor: TAG_COLORS[tag.type] || '#ccc' }}
                        textStyle={styles.chipText}
                      >
                        {tag.type}
                      </Chip>
                      <Text variant="bodySmall">pos: {tag.position}</Text>
                    </View>
                    {tag.openingText && (
                      <Text variant="bodySmall" numberOfLines={1} style={styles.openingText}>
                        "{tag.openingText}"
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Tag Counts */}
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Tag Counts</Text>
          <View style={styles.tagCountsGrid}>
            {Object.entries(state.tagCounts).map(([type, count]) => (
              <View key={type} style={styles.tagCountItem}>
                <Chip 
                  mode="flat" 
                  style={{ backgroundColor: TAG_COLORS[type] || '#ccc' }}
                  textStyle={styles.chipText}
                >
                  {type}
                </Chip>
                <Text variant="bodyLarge">{count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  cardTitle: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  stackContainer: {
    gap: 8,
  },
  stackItem: {
    marginBottom: 0,
  },
  stackItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
  },
  openingText: {
    fontFamily: 'monospace',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  tagCountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tagCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

