/**
 * ActiveBlock Renderer
 * 
 * Renders the currently streaming block with format-as-you-type UX.
 * 
 * Flow:
 * 1. Fix incomplete markdown tags (auto-close for preview)
 * 2. Parse with unified to get HAST
 * 3. Render HAST with ASTRenderer
 */

import React from 'react';
import type {
  ActiveBlock as ActiveBlockType,
  ThemeConfig,
  ComponentRegistry,
  IncompleteTagState,
  HastComponentMap,
} from '../core/types';
import { fixIncompleteMarkdown } from '../core/incomplete';
import type { MarkdownProcessor } from '../core/processor';
import { ASTRenderer, ComponentBlock, extractComponentData } from './ASTRenderer';
import { isComponentClosed } from '../core/splitter/blockClosers';
import type { ComponentData } from '../core/componentParser';

interface ActiveBlockProps {
  block: ActiveBlockType | null;
  tagState: IncompleteTagState;
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  processor: MarkdownProcessor;
  components?: HastComponentMap;
  renderMath?: (latex: string, displayMode: boolean) => React.ReactNode;
}

/**
 * ActiveBlock component — renders the currently streaming block.
 * 
 * This component INTENTIONALLY re-renders on each token.
 * It applies "format-as-you-type" by auto-closing incomplete tags.
 */
export const ActiveBlock: React.FC<ActiveBlockProps> = ({
  block,
  tagState,
  theme,
  componentRegistry,
  processor,
  components,
  renderMath,
}) => {
  // No active block — nothing to render
  if (!block || !block.content.trim()) {
    return null;
  }
  
  // Special handling for component blocks (don't use remark)
  if (block.type === 'component') {
    const { name, props } = extractComponentData(block.content);
    return (
      <ComponentBlock
        componentName={name}
        props={props}
        isStreaming={true}
        theme={theme}
        componentRegistry={componentRegistry}
      />
    );
  }
  
  // Fix incomplete markdown for format-as-you-type UX
  let fixedContent = fixIncompleteMarkdown(block.content, tagState);
  const trailingComponent = findTrailingIncompleteComponent(block.content, tagState);
  let inlineComponentMap: Record<string, ComponentData> | undefined;

  if (trailingComponent?.name) {
    const token = '[[SD_COMPONENT_0]]';
    fixedContent = insertBeforeTrailingWhitespace(fixedContent, token);
    inlineComponentMap = { [token]: trailingComponent };
  }
  
  // Parse with unified to HAST
  const ast = processor.toHast(fixedContent);
  
  // Render from AST
  return (
    <ASTRenderer
      root={ast}
      theme={theme}
      componentRegistry={componentRegistry}
      components={components}
      renderMath={renderMath}
      isStreaming={true}
      inlineComponentMap={inlineComponentMap}
    />
  );
  
};

ActiveBlock.displayName = 'ActiveBlock';

function findTrailingIncompleteComponent(
  content: string,
  tagState: IncompleteTagState
): ComponentData | null {
  if (tagState.inCodeBlock || tagState.inInlineCode) {
    return null;
  }

  let idx = content.lastIndexOf('[{');
  while (idx !== -1) {
    const tail = content.slice(idx);
    if (isComponentStart(tail) && !isComponentClosed(tail)) {
      return extractComponentData(tail);
    }
    idx = content.lastIndexOf('[{', idx - 1);
  }

  return null;
}

function isComponentStart(value: string): boolean {
  return /^\[\{\s*c\s*:/.test(value);
}

function insertBeforeTrailingWhitespace(value: string, token: string): string {
  const match = value.match(/([ \t]+)$/);
  if (!match) {
    return value + token;
  }
  return value.slice(0, -match[1].length) + token + match[1];
}
