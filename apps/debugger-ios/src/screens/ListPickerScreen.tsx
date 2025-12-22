import { View, Text, Pressable } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

export type ListType = 'flashlist' | 'legendlist';

type ListPickerScreenProps = {
  onSelect: (listType: ListType) => void;
  onBack: () => void;
};

export function ListPickerScreen({ onSelect, onBack }: ListPickerScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Test Chats</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Select List Component</Text>
        <Text style={styles.instructionText}>
          Choose which list implementation to test with StreamdownRN
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <Pressable
          style={styles.optionCard}
          onPress={() => onSelect('flashlist')}
        >
          <Text style={styles.optionIcon}>⚡</Text>
          <Text style={styles.optionTitle}>FlashList</Text>
          <Text style={styles.optionDescription}>
            @shopify/flash-list v2{'\n'}
            High-performance list with recycling
          </Text>
        </Pressable>

        <Pressable
          style={styles.optionCard}
          onPress={() => onSelect('legendlist')}
        >
          <Text style={styles.optionIcon}>📜</Text>
          <Text style={styles.optionTitle}>LegendList</Text>
          <Text style={styles.optionDescription}>
            @legendapp/list{'\n'}
            FlashList fork with extra features
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: UnistylesRuntime.insets.top,
    paddingBottom: UnistylesRuntime.insets.bottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    color: '#4ade80',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  optionsContainer: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
}));
