/**
 * Unified processor tests
 */

import { describe, it, expect } from 'bun:test';
import type { Root as HastRoot, Element as HastElement, Content as HastContent } from 'hast';
import type { Root as MdastRoot } from 'mdast';

import { createProcessor } from '../core/processor';

function findElement(node: HastContent | HastRoot, tagName: string): HastElement | null {
  if (node.type === 'element' && node.tagName === tagName) {
    return node as HastElement;
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      const match = findElement(child as HastContent, tagName);
      if (match) return match;
    }
  }
  return null;
}

describe('Unified Processor', () => {
  it('applies remark plugins before rehype', () => {
    const remarkAppendParagraph = () => (tree: MdastRoot) => {
      tree.children.push({
        type: 'paragraph',
        children: [{ type: 'text', value: 'from-remark' }],
      });
    };

    const processor = createProcessor({ remarkPlugins: [remarkAppendParagraph] });
    const hast = processor.toHast('Hello') as HastRoot;
    const paragraph = findElement(hast, 'p');
    expect(paragraph).toBeDefined();
    expect((paragraph?.children?.[0] as any)?.value).toBe('Hello');

    const paragraphs = hast.children.filter(node => node.type === 'element' && node.tagName === 'p');
    expect(paragraphs.length).toBe(2);
  });

  it('applies rehype plugins on HAST', () => {
    const rehypeAddDataTest = () => (tree: HastRoot) => {
      const heading = findElement(tree, 'h1');
      if (heading) {
        heading.properties = {
          ...(heading.properties || {}),
          'data-test': 'true',
        };
      }
    };

    const processor = createProcessor({ rehypePlugins: [rehypeAddDataTest] });
    const hast = processor.toHast('# Hello') as HastRoot;
    const heading = findElement(hast, 'h1');
    expect(heading?.properties?.['data-test']).toBe('true');
  });
});
