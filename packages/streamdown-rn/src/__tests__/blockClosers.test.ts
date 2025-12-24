/**
 * Component block closer tests
 */

import { describe, it, expect } from 'bun:test';
import { isComponentClosed } from '../core/splitter/blockClosers';

describe('isComponentClosed', () => {
  it('detects complete component blocks', () => {
    expect(isComponentClosed('[{c:"Card",p:{"title":"Hello"}}]')).toBe(true);
    expect(isComponentClosed('[{c:"Stack",p:{},children:[{c:"Card",p:{}}]}]')).toBe(true);
  });

  it('rejects incomplete component blocks', () => {
    expect(isComponentClosed('[{c:"Card",p:{"title":"Hel')).toBe(false);
    expect(isComponentClosed('[{c:"Card",p:{}}] trailing')).toBe(false);
  });

  it('ignores braces and brackets inside strings', () => {
    const input = '[{c:"Card",p:{"title":"Value with } ] { [ inside"}}]';
    expect(isComponentClosed(input)).toBe(true);
  });

  it('handles escaped quotes inside strings', () => {
    const input = '[{c:"Card",p:{"title":"She said \\"hi\\""}}]';
    expect(isComponentClosed(input)).toBe(true);
  });

  it('handles nested objects and arrays', () => {
    const input = '[{c:"Card",p:{"data":{"x":[1,2,{"y":"z"}]}}}]';
    expect(isComponentClosed(input)).toBe(true);
  });
});
