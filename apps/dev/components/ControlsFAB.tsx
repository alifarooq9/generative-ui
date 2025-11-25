import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { FAB, Settings } from '@darkresearch/design-system';
import { CardDialog } from './CardDialog';

function ControlsFABDialog() {
  return (
    <CardDialog 
      title="Controls"
      description="Manage playback configuration"
    >
      <Text>Test</Text>
    </CardDialog>
  );
}

export function ControlsFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <FAB
        icon={<Settings size={20} color="#EEEDED" strokeWidth={1.5} />}
        onPress={handlePress}
      />
      {isOpen && <ControlsFABDialog />
      }
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

