/**
 * StableBlock Renderer
 * 
 * Renders completed, immutable blocks using cached HAST.
 * Memoized to prevent re-renders — once a block is stable, it never changes.
 */

import React from 'react';
import type {
  StableBlock as StableBlockType,
  ThemeConfig,
  ComponentRegistry,
  HastComponentMap,
} from '../core/types';
import type { MarkdownProcessor } from '../core/processor';
import { ASTRenderer, ComponentBlock } from './ASTRenderer';

interface StableBlockProps {
  block: StableBlockType;
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  processor: MarkdownProcessor;
  components?: HastComponentMap;
  renderMath?: (latex: string, displayMode: boolean) => React.ReactNode;
}

/**
 * StableBlock component — renders finalized blocks from cached HAST.
 * 
 * Uses React.memo with contentHash comparison for efficient updates.
 * The block prop is immutable — once finalized, content never changes.
 */
export const StableBlock: React.FC<StableBlockProps> = React.memo(
  ({ block, theme, componentRegistry, processor, components, renderMath }) => {
    // Component blocks don't have AST (custom syntax, not markdown)
    if (block.type === 'component') {
      return (
        <ComponentBlock
          block={block}
          theme={theme}
          componentRegistry={componentRegistry}
        />
      );
    }
    
    const ast = block.ast ?? processor.toHast(block.content);

    return (
      <ASTRenderer
        root={ast}
        theme={theme}
        componentRegistry={componentRegistry}
        components={components}
        renderMath={renderMath}
      />
    );
  },
  // Only re-render if the block's content hash changes (which shouldn't happen for stable blocks)
  (prev, next) => prev.block.contentHash === next.block.contentHash
);

StableBlock.displayName = 'StableBlock';
