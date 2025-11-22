/**
 * Simple Markdown Renderer for StreamdownRN
 * 
 * Clean, basic markdown rendering with proper theming
 */

import React from 'react';
import Markdown from 'react-native-markdown-display';

// Fix for TS2786: 'Markdown' cannot be used as a JSX component.
const MarkdownComponent = Markdown as any;

interface MarkdownRendererProps {
  children: string;
  theme?: 'dark' | 'light';
  style?: any;
  rules?: any;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  style,
  rules = {},
}) => {
  return (
    <MarkdownComponent
      style={style}
      rules={rules}
    >
      {children}
    </MarkdownComponent>
  );
};

export default MarkdownRenderer;
