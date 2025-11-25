import React from 'react';
import { View, Platform } from 'react-native';
import { InputArea } from './InputArea';
import { OutputArea } from './OutputArea';
import type { ComponentRegistry } from '@darkresearch/streamdown-rn';
import type { IncompleteTagState } from '../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';

interface ContentLayoutProps {
  markdown: string;
  streamingMarkdown?: string;
  onMarkdownChange: (text: string) => void;
  componentRegistry?: ComponentRegistry;
  theme?: 'dark' | 'light';
  safeViewportHeight: number;
  onStateUpdate?: (state: IncompleteTagState) => void;
  onComponentExtractionUpdate?: (state: ComponentExtractionState) => void;
}

export function ContentLayout({
  markdown,
  streamingMarkdown,
  onMarkdownChange,
  componentRegistry,
  theme = 'light',
  safeViewportHeight,
  onStateUpdate,
  onComponentExtractionUpdate,
}: ContentLayoutProps) {
  // Each section gets equal height with 24px gap between them
  const gapBetweenSections = 24;
  const sectionHeight = (safeViewportHeight - gapBetweenSections) / 2;

  // Extract common props to avoid duplication
  const inputAreaProps = {
    markdown,
    onMarkdownChange,
    theme,
  };

  const outputAreaProps = {
    markdown: streamingMarkdown ?? markdown,
    componentRegistry,
    theme,
    onStateUpdate,
    onComponentExtractionUpdate,
  };

  // Web: side-by-side layout
  if (Platform.OS === 'web') {
    return (
      <View 
        style={{ 
          flex: 1, 
          flexDirection: 'row', 
          width: '100%',
        }}
      >
        <View 
          style={{ 
            flex: 1,
            marginRight: 12,
          }}
        >
          <InputArea {...inputAreaProps} />
        </View>
        <View 
          style={{ 
            flex: 1,
            marginLeft: 12,
          }}
        >
          <OutputArea {...outputAreaProps} />
        </View>
      </View>
    );
  }

  // Mobile: stacked layout (input on top, output on bottom)
  return (
    <View style={{ flex: 1, height: safeViewportHeight }}>
      <View style={{ flex: 1, height: sectionHeight, marginBottom: gapBetweenSections }}>
        <InputArea {...inputAreaProps} />
      </View>
      <View style={{ flex: 1, height: sectionHeight }}>
        <OutputArea {...outputAreaProps} />
      </View>
    </View>
  );
}
