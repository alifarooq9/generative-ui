/**
 * HAST renderer tests
 */

import React from 'react';
import { describe, it, expect, mock, beforeAll } from 'bun:test';
import type { Root as HastRoot } from 'hast';

type MockProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

const Text = ({ children, ...props }: MockProps) =>
  React.createElement('Text', props, children);
const View = ({ children, ...props }: MockProps) =>
  React.createElement('View', props, children);
const ScrollView = ({ children, ...props }: MockProps) =>
  React.createElement('ScrollView', props, children);
const Image = ({ children, ...props }: MockProps) =>
  React.createElement('Image', props, children);
Image.getSize = (_uri: string, success?: (w: number, h: number) => void) => {
  success?.(1, 1);
};

const Platform = {
  select: (options: Record<string, unknown>) => {
    if (options.default !== undefined) return options.default;
    if (options.web !== undefined) return options.web;
    if (options.ios !== undefined) return options.ios;
    if (options.android !== undefined) return options.android;
    return undefined;
  },
};

const Linking = {
  openURL: (_url: string) => Promise.resolve(),
};

mock.module('react-native', () => ({
  Text,
  View,
  ScrollView,
  Image,
  Platform,
  Linking,
}));

mock.module('react-native-syntax-highlighter', () => ({
  default: ({ children, ...props }: MockProps) =>
    React.createElement('SyntaxHighlighter', props, children),
}));

let renderHAST: typeof import('../renderers/ASTRenderer').renderHAST;
let darkTheme: typeof import('../themes').darkTheme;

beforeAll(async () => {
  ({ renderHAST } = await import('../renderers/ASTRenderer'));
  ({ darkTheme } = await import('../themes'));
});

function asArray(node: React.ReactNode): React.ReactNode[] {
  return Array.isArray(node) ? node : [node];
}

describe('HAST renderer', () => {
  it('renders headings and paragraphs as Text', () => {
    const root: HastRoot = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'h1',
          properties: {},
          children: [{ type: 'text', value: 'Title' }],
        },
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: 'Body' }],
        },
      ],
    };

    const rendered = asArray(renderHAST(root, darkTheme));
    expect(rendered.length).toBe(2);
    expect(React.isValidElement(rendered[0])).toBe(true);
    expect((rendered[0] as React.ReactElement).type).toBe(Text);
    expect((rendered[1] as React.ReactElement).type).toBe(Text);
  });

  it('renders code blocks from pre > code', () => {
    const root: HastRoot = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-ts'] },
              children: [{ type: 'text', value: 'const x = 1;' }],
            },
          ],
        },
      ],
    };

    const rendered = asArray(renderHAST(root, darkTheme));
    const view = rendered[0] as React.ReactElement;
    expect(React.isValidElement(view)).toBe(true);
    expect(view.type).toBe(View);
  });

  it('handles unknown tags without throwing', () => {
    const root: HastRoot = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'foo',
          properties: {},
          children: [{ type: 'text', value: 'Custom' }],
        },
      ],
    };

    const rendered = asArray(renderHAST(root, darkTheme));
    const wrapper = rendered[0] as React.ReactElement;
    expect(wrapper.type).toBe(View);
    const children = React.Children.toArray(wrapper.props.children);
    expect(children.length).toBeGreaterThan(0);
  });
});
