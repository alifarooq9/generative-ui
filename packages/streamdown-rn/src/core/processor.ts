/**
 * Unified Processor
 *
 * Builds a remark -> rehype pipeline that returns HAST.
 * This powers streaming-safe per-block rendering with user plugins.
 */

import { unified, type PluggableList } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype, { type Options as RemarkRehypeOptions } from 'remark-rehype';
import type { Root as HastRoot } from 'hast';

import { escapeSetextUnderlines } from './parser';

export type PluginPreset = 'default' | 'none';

export interface ProcessorOptions {
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
  remarkPluginsPreset?: PluginPreset;
  rehypePluginsPreset?: PluginPreset;
  remarkRehypeOptions?: RemarkRehypeOptions;
}

export interface MarkdownProcessor {
  toHast(markdown: string): HastRoot;
}

export const defaultRemarkPlugins: PluggableList = [remarkGfm];
export const defaultRehypePlugins: PluggableList = [];

function resolvePlugins(
  defaults: PluggableList,
  user: PluggableList | undefined,
  preset: PluginPreset
): PluggableList {
  if (preset === 'none') {
    return user ?? [];
  }
  if (!user || user.length === 0) {
    return defaults;
  }
  return [...defaults, ...user];
}

export function createProcessor(options: ProcessorOptions): MarkdownProcessor {
  const {
    remarkPlugins,
    rehypePlugins,
    remarkPluginsPreset = 'default',
    rehypePluginsPreset = 'default',
    remarkRehypeOptions,
  } = options;

  const resolvedRemark = resolvePlugins(
    defaultRemarkPlugins,
    remarkPlugins,
    remarkPluginsPreset
  );
  const resolvedRehype = resolvePlugins(
    defaultRehypePlugins,
    rehypePlugins,
    rehypePluginsPreset
  );

  const processor = unified()
    .use(remarkParse)
    .use(resolvedRemark)
    .use(remarkRehype, {
      allowDangerousHtml: false,
      ...remarkRehypeOptions,
    })
    .use(resolvedRehype);

  return {
    toHast(markdown: string): HastRoot {
      try {
        const escaped = escapeSetextUnderlines(markdown);
        const mdast = processor.parse(escaped);
        return processor.runSync(mdast) as HastRoot;
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[streamdown-rn] Markdown processing error:', error);
        }
        return { type: 'root', children: [] };
      }
    },
  };
}
