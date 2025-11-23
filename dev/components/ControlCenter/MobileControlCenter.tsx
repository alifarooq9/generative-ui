import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Modal, Portal } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Settings01Icon } from '@hugeicons/core-free-icons';
import { ControlsTab } from './tabs/ControlsTab';
import { DebugTab } from './tabs/DebugTab';
import { ComponentsTab } from './tabs/ComponentsTab';

interface MobileControlCenterProps {
  // Controls Tab Props
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  streamSpeed: number;
  onSpeedChange: (speed: number) => void;
  isStreaming: boolean;
  isPaused: boolean;
  streamingLength: number;
  markdownLength: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export function MobileControlCenter(props: MobileControlCenterProps) {
  console.log('📱 MobileControlCenter rendered');
  const [isOpen, setIsOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'controls', title: 'Controls' },
    { key: 'debug', title: 'Debug' },
    { key: 'components', title: 'Components' },
  ]);

  const renderScene = SceneMap({
    controls: () => (
      <ControlsTab
        selectedPreset={props.selectedPreset}
        onPresetChange={props.onPresetChange}
        theme={props.theme}
        onThemeChange={props.onThemeChange}
        streamSpeed={props.streamSpeed}
        onSpeedChange={props.onSpeedChange}
        isStreaming={props.isStreaming}
        isPaused={props.isPaused}
        streamingLength={props.streamingLength}
        markdownLength={props.markdownLength}
        onStart={props.onStart}
        onPause={props.onPause}
        onResume={props.onResume}
        onReset={props.onReset}
        onStepBackward={props.onStepBackward}
        onStepForward={props.onStepForward}
      />
    ),
    debug: () => <DebugTab />,
    components: () => <ComponentsTab />,
  });

  const renderTabBar = (tabBarProps: any) => (
    <TabBar
      {...tabBarProps}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#494C53"
      inactiveColor="#737373"
    />
  );

  console.log('📱 MobileControlCenter - isOpen:', isOpen);

  return (
    <Portal>
      {/* FAB Button */}
      {!isOpen && (
        <FAB
          icon={() => (
            <HugeiconsIcon
              icon={Settings01Icon}
              size={24}
              color="#FFFFFF"
              strokeWidth={1.5}
            />
          )}
          style={styles.fab}
          onPress={() => {
            console.log('🔘 FAB clicked!');
            setIsOpen(true);
          }}
        />
      )}

      {/* Modal */}
      <Modal
        visible={isOpen}
        onDismiss={() => {
          console.log('🔘 Modal dismissed');
          setIsOpen(false);
        }}
        contentContainerStyle={styles.modalContent}
      >
        <TabView
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          renderTabBar={renderTabBar}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 10000,
    elevation: 8,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: '20%',
    marginBottom: '10%',
    borderRadius: 12,
    height: '70%',
    padding: 0,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  tabIndicator: {
    backgroundColor: '#494C53',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'none',
  },
});
