import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { FAB, Bug } from '@darkresearch/design-system';
import { CardDialog } from './CardDialog';

function DebugFABDialog() {
  return (
    <CardDialog 
      title="Controls"
      description="Manage playback configuration"
    >
      <Text>Test</Text>
    </CardDialog>
  );
}

export function DebugFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <FAB
        icon={<Bug size={20} color="#EEEDED" strokeWidth={1.5} />}
        onPress={handlePress}
      />
      {isOpen && <DebugFABDialog />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    ...(Platform.OS === 'web' && {
      overflow: 'visible',
    }),
  },
});

