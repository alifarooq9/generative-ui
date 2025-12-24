/**
 * AST Renderer
 *
 * HAST -> React Native renderer with tag mapping and component overrides.
 * Runs after remark + rehype processing.
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { Text, View, ScrollView, Image, Platform, Linking } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import type {
  Root as HastRoot,
  Content as HastContent,
  Parent as HastParent,
  Element as HastElement,
  Properties as HastProperties,
} from 'hast';
import type {
  ThemeConfig,
  ComponentRegistry,
  StableBlock,
  HastComponentMap,
} from '../core/types';
import { getTextStyles, getBlockStyles } from '../themes';
import { extractComponentData, type ComponentData } from '../core/componentParser';
import { sanitizeURL, sanitizeProps } from '../core/sanitize';
import { findComponentCloseIndex } from '../core/splitter/blockClosers';

// ============================================================================
// Syntax Highlighting Utilities
// ============================================================================

/**
 * Map common language aliases to Prism language names
 */
function normalizeLanguage(lang: string): string {
  const aliases: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    json5: 'json',
    dockerfile: 'docker',
  };
  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}

/**
 * Create Prism syntax style from theme colors
 */
function createSyntaxStyle(theme: ThemeConfig) {
  return {
    'pre[class*="language-"]': {
      color: theme.colors.syntaxDefault,
      background: 'transparent',
    },
    token: { color: theme.colors.syntaxDefault },
    keyword: { color: theme.colors.syntaxKeyword },
    builtin: { color: theme.colors.syntaxOperator },
    'class-name': { color: theme.colors.syntaxClass },
    function: { color: theme.colors.syntaxFunction },
    string: { color: theme.colors.syntaxString },
    number: { color: theme.colors.syntaxNumber },
    operator: { color: theme.colors.syntaxOperator },
    comment: { color: theme.colors.syntaxComment },
    punctuation: { color: theme.colors.syntaxDefault },
    property: { color: theme.colors.syntaxClass },
    constant: { color: theme.colors.syntaxNumber },
    boolean: { color: theme.colors.syntaxNumber },
    tag: { color: theme.colors.syntaxKeyword },
    'attr-name': { color: theme.colors.syntaxString },
    'attr-value': { color: theme.colors.syntaxString },
    selector: { color: theme.colors.syntaxClass },
    regex: { color: theme.colors.syntaxString },
  };
}

// ============================================================================
// Component Extraction (re-export for backwards compatibility)
// ============================================================================

export { extractComponentData, type ComponentData };

// ============================================================================
// Renderer Types
// ============================================================================

type InlineComponentMap = Record<string, ComponentData>;

interface RenderContext {
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  components?: HastComponentMap;
  renderMath?: (latex: string, displayMode: boolean) => ReactNode;
  isStreaming?: boolean;
  inlineComponentMap?: InlineComponentMap;
}

interface RenderState {
  parentIsText: boolean;
  inCode: boolean;
}

const INLINE_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'code',
  'del',
  'em',
  'i',
  'kbd',
  'mark',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
  'input',
]);

// ============================================================================
// Main Component
// ============================================================================

export interface ASTRendererProps {
  /** HAST root to render */
  root: HastRoot;
  /** Theme configuration */
  theme: ThemeConfig;
  /** Component registry for custom components */
  componentRegistry?: ComponentRegistry;
  /** Custom tag overrides */
  components?: HastComponentMap;
  /** Optional math renderer */
  renderMath?: (latex: string, displayMode: boolean) => ReactNode;
  /** Whether this is streaming (for components) */
  isStreaming?: boolean;
  /** Inline component placeholders for streaming */
  inlineComponentMap?: InlineComponentMap;
}

/**
 * Main AST Renderer Component
 */
export const ASTRenderer: React.FC<ASTRendererProps> = ({
  root,
  theme,
  componentRegistry,
  components,
  renderMath,
  isStreaming = false,
  inlineComponentMap,
}) => {
  const ctx: RenderContext = {
    theme,
    componentRegistry,
    components,
    renderMath,
    isStreaming,
    inlineComponentMap,
  };

  return <>{renderChildren(root, ctx, { parentIsText: false, inCode: false })}</>;
};

// ============================================================================
// Node Rendering
// ============================================================================

function renderChildren(
  node: HastParent,
  ctx: RenderContext,
  state: RenderState
): ReactNode {
  if (!node.children || node.children.length === 0) {
    return null;
  }

  return node.children.map((child, index) =>
    renderNode(child as HastContent, ctx, state, index)
  );
}

function renderNode(
  node: HastContent | HastRoot,
  ctx: RenderContext,
  state: RenderState,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(ctx.theme);
  const blockStyles = getBlockStyles(ctx.theme);

  switch (node.type) {
    case 'text': {
      if (!state.parentIsText) {
        return (
          <Text key={key} style={styles.body}>
            {node.value}
          </Text>
        );
      }
      if (
        !state.inCode &&
        shouldRenderInlineComponents(node.value, ctx.inlineComponentMap)
      ) {
        return renderTextWithComponents(
          node.value,
          ctx.theme,
          ctx.componentRegistry,
          ctx.isStreaming,
          key,
          ctx.inlineComponentMap
        );
      }
      return node.value;
    }
    case 'root':
      return renderChildren(node, ctx, state);
    case 'element': {
      const tag = node.tagName;
      const inline = INLINE_TAGS.has(tag);

      if (state.parentIsText && !inline) {
        return getNodeText(node);
      }

      const className = normalizeClassName(node.properties);
      const override = ctx.components?.[tag];
      const children = renderChildren(node, ctx, {
        parentIsText: inline,
        inCode: state.inCode || tag === 'code',
      });

      if (override) {
        const overrideProps = normalizeProps(node.properties, className);
        return React.createElement(
          override,
          {
            ...overrideProps,
            key,
            node,
            inline,
            className,
          },
          children
        );
      }

      // Math/Katex handling
      if (isMathElement(tag, className)) {
        return renderMathElement(node, ctx, state, className, key);
      }

      switch (tag) {
        case 'p':
          return (
            <Text key={key} style={styles.paragraph}>
              {children}
            </Text>
          );
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6': {
          const headingStyle =
            styles[`heading${tag.slice(1)}` as keyof typeof styles];
          return (
            <Text key={key} style={headingStyle}>
              {children}
            </Text>
          );
        }
        case 'strong':
        case 'b':
          return (
            <Text key={key} style={styles.bold}>
              {children}
            </Text>
          );
        case 'em':
        case 'i':
          return (
            <Text key={key} style={styles.italic}>
              {children}
            </Text>
          );
        case 'del':
        case 's':
          return (
            <Text key={key} style={styles.strikethrough}>
              {children}
            </Text>
          );
        case 'code':
          return (
            <Text key={key} style={styles.code}>
              {getNodeText(node)}
            </Text>
          );
        case 'a': {
          const href = getStringProperty(node.properties, 'href');
          const safeUrl = href ? sanitizeURL(href) : null;
          if (!safeUrl) {
            return <Text key={key}>{children}</Text>;
          }
          const handlePress = () => {
            void Linking.openURL(safeUrl);
          };
          return (
            <Text
              key={key}
              style={styles.link}
              accessibilityRole="link"
              onPress={handlePress}
            >
              {children}
            </Text>
          );
        }
        case 'blockquote':
          return (
            <View key={key} style={blockStyles.blockquote}>
              {renderBlockquoteChildren(node, ctx)}
            </View>
          );
        case 'ul':
        case 'ol':
          return renderList(node, ctx, tag === 'ol', key);
        case 'li':
          return (
            <View key={key} style={{ marginBottom: 4 }}>
              {children}
            </View>
          );
        case 'hr':
          return <View key={key} style={blockStyles.horizontalRule} />;
        case 'br':
          return state.parentIsText ? '\n' : <Text key={key}>{'\n'}</Text>;
        case 'pre':
          return renderCodeBlock(node, ctx.theme, key);
        case 'img':
          return renderImage(node, ctx.theme, key);
        case 'table':
          return renderTable(node, ctx, key);
        case 'thead':
        case 'tbody':
        case 'tr':
        case 'th':
        case 'td':
          return null;
        case 'input':
          return renderTaskCheckbox(node, ctx.theme, key);
        case 'span':
          return (
            <Text key={key} style={styles.body}>
              {children}
            </Text>
          );
        case 'div':
        default:
          if (inline) {
            return (
              <Text key={key} style={styles.body}>
                {children}
              </Text>
            );
          }
          return (
            <View key={key} style={{ marginBottom: ctx.theme.spacing.inline }}>
              {children}
            </View>
          );
      }
    }
    case 'raw': {
      const value = (node as unknown as { value?: string }).value ?? '';
      return (
        <Text key={key} style={[styles.code, { color: ctx.theme.colors.muted }]}>
          {value}
        </Text>
      );
    }
    case 'comment':
    case 'doctype':
    default:
      return null;
  }
}

// ============================================================================
// Specialized Renderers
// ============================================================================

function renderBlockquoteChildren(node: HastElement, ctx: RenderContext): ReactNode {
  const styles = getTextStyles(ctx.theme);
  return node.children?.map((child, index) => {
    if (isElement(child, 'p')) {
      return (
        <Text key={index} style={[styles.body, { marginBottom: 0 }]}>
          {renderChildren(child, ctx, { parentIsText: true, inCode: false })}
        </Text>
      );
    }
    return renderNode(child as HastContent, ctx, { parentIsText: false, inCode: false }, index);
  });
}

function renderList(
  node: HastElement,
  ctx: RenderContext,
  ordered: boolean,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(ctx.theme);
  const items = (node.children || []).filter(child => isElement(child, 'li')) as HastElement[];

  return (
    <View key={key} style={{ marginBottom: ctx.theme.spacing.block }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[styles.body, { width: 24 }]}>
            {ordered ? `${index + 1}.` : '-'}
          </Text>
          <View style={{ flex: 1 }}>
            {renderListItemChildren(item, ctx)}
          </View>
        </View>
      ))}
    </View>
  );
}

function renderListItemChildren(node: HastElement, ctx: RenderContext): ReactNode {
  const styles = getTextStyles(ctx.theme);

  return node.children?.map((child, index) => {
    if (isElement(child, 'p')) {
      return (
        <Text key={index} style={[styles.body, { marginBottom: 0 }]}>
          {renderChildren(child, ctx, { parentIsText: true, inCode: false })}
        </Text>
      );
    }

    if (isElement(child, 'ul') || isElement(child, 'ol')) {
      return (
        <View key={index} style={{ marginTop: 4, marginBottom: 0 }}>
          {renderList(child, ctx, child.tagName === 'ol')}
        </View>
      );
    }

    return renderNode(child as HastContent, ctx, { parentIsText: false, inCode: false }, index);
  });
}

function renderCodeBlock(
  node: HastElement,
  theme: ThemeConfig,
  key?: string | number
): ReactNode {
  const blockStyles = getBlockStyles(theme);
  const codeElement = findFirstElement(node, 'code');
  const codeText = codeElement ? getNodeText(codeElement) : getNodeText(node);
  const language = codeElement ? getCodeLanguage(codeElement.properties) : '';
  const normalizedLanguage = language ? normalizeLanguage(language) : 'text';
  const syntaxStyle = createSyntaxStyle(theme);

  return (
    <View key={key} style={blockStyles.codeBlock}>
      {language && (
        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 12,
            marginBottom: 8,
            fontFamily: theme.fonts.mono,
          }}
        >
          {language}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={syntaxStyle}
          highlighter="prism"
          customStyle={{
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
          }}
          fontSize={14}
          fontFamily={Platform.select({
            ios: 'Menlo',
            android: 'monospace',
            web: 'monospace',
            default: 'monospace',
          })}
          PreTag={View as any}
          CodeTag={Text as any}
        >
          {codeText.replace(/\n+$/, '')}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
}

function renderTaskCheckbox(
  node: HastElement,
  theme: ThemeConfig,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const type = getStringProperty(node.properties, 'type');
  if (type !== 'checkbox') {
    return null;
  }
  const checked = Boolean(node.properties?.checked);
  return (
    <Text key={key} style={styles.body}>
      {checked ? '[x] ' : '[ ] '}
    </Text>
  );
}

/**
 * Auto-sized image component that fetches dimensions and renders with correct aspect ratio
 */
function AutoSizedImage({
  uri,
  alt,
  theme,
}: {
  uri: string;
  alt?: string;
  theme: ThemeConfig;
}) {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    Image.getSize(
      uri,
      (width, height) => {
        if (mounted && width && height) {
          setAspectRatio(width / height);
          setLoaded(true);
        }
      },
      () => {
        if (mounted) {
          setLoaded(true);
        }
      }
    );

    return () => {
      mounted = false;
    };
  }, [uri]);

  return (
    <Image
      source={{ uri }}
      style={{
        width: '100%',
        aspectRatio,
        borderRadius: 8,
        backgroundColor: theme.colors.codeBackground,
        opacity: loaded ? 1 : 0.5,
      }}
      resizeMode="cover"
      accessibilityLabel={alt || 'Image'}
    />
  );
}

function renderImage(
  node: HastElement,
  theme: ThemeConfig,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const src = getStringProperty(node.properties, 'src');
  const alt = getStringProperty(node.properties, 'alt');

  if (!src) {
    return null;
  }

  const safeUrl = sanitizeURL(src);
  if (!safeUrl) {
    if (alt) {
      return (
        <View key={key} style={{ marginVertical: theme.spacing.block }}>
          <Text style={[styles.body, { color: theme.colors.muted, textAlign: 'center' }]}>
            [Image: {alt}]
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View key={key} style={{ marginVertical: theme.spacing.block }}>
      <AutoSizedImage uri={safeUrl} alt={alt ?? undefined} theme={theme} />
    </View>
  );
}

function renderTable(
  node: HastElement,
  ctx: RenderContext,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(ctx.theme);
  const rows = collectTableRows(node);
  if (!rows.header && rows.body.length === 0) {
    return null;
  }

  return (
    <View key={key} style={{ marginBottom: ctx.theme.spacing.block }}>
      {rows.header && (
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 2,
            borderBottomColor: ctx.theme.colors.border,
            paddingBottom: 8,
            marginBottom: 8,
          }}
        >
          {rows.header.map((cell, index) => (
            <View key={index} style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={[styles.bold, { fontSize: 14 }]}>
                {renderChildren(cell, ctx, { parentIsText: true, inCode: false })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {rows.body.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: ctx.theme.colors.border,
            paddingVertical: 8,
          }}
        >
          {row.map((cell, cellIndex) => (
            <View key={cellIndex} style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={styles.body}>
                {renderChildren(cell, ctx, { parentIsText: true, inCode: false })}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function collectTableRows(node: HastElement): {
  header: HastElement[] | null;
  body: HastElement[][];
} {
  let headerRows: HastElement[] = [];
  let bodyRows: HastElement[][] = [];

  node.children?.forEach(child => {
    if (!isElement(child)) return;
    if (child.tagName === 'thead') {
      child.children?.forEach(row => {
        if (isElement(row, 'tr')) {
          const cells = row.children?.filter(c => isElement(c, 'th') || isElement(c, 'td')) as HastElement[];
          if (headerRows.length === 0) {
            headerRows.push(...cells);
          }
        }
      });
    } else if (child.tagName === 'tbody') {
      child.children?.forEach(row => {
        if (isElement(row, 'tr')) {
          const cells = row.children?.filter(c => isElement(c, 'th') || isElement(c, 'td')) as HastElement[];
          bodyRows.push(cells);
        }
      });
    } else if (child.tagName === 'tr') {
      const cells = child.children?.filter(c => isElement(c, 'th') || isElement(c, 'td')) as HastElement[];
      bodyRows.push(cells);
    }
  });

  if (headerRows.length === 0 && bodyRows.length > 0) {
    const firstRow = bodyRows[0];
    if (firstRow.some(cell => cell.tagName === 'th')) {
      headerRows = firstRow;
      bodyRows = bodyRows.slice(1);
    }
  }

  return {
    header: headerRows.length > 0 ? headerRows : null,
    body: bodyRows,
  };
}

// ============================================================================
// Math Handling
// ============================================================================

function isMathElement(tag: string, className: string[]): boolean {
  if (tag === 'math') return true;
  return className.some(name => name.includes('katex') || name.includes('math'));
}

function renderMathElement(
  node: HastElement,
  ctx: RenderContext,
  state: RenderState,
  className: string[],
  key?: string | number
): ReactNode {
  const displayMode = className.some(name => name.includes('display')) || node.tagName === 'div';
  const latex = extractKatexSource(node) || getNodeText(node);

  if (ctx.renderMath) {
    const rendered = ctx.renderMath(latex, displayMode);
    if (state.parentIsText && !displayMode) {
      return ensureInlineNode(rendered, latex);
    }
    if (state.parentIsText && displayMode) {
      return latex;
    }
    return (
      <View key={key} style={{ marginBottom: ctx.theme.spacing.block }}>
        {rendered}
      </View>
    );
  }

  const styles = getTextStyles(ctx.theme);
  if (displayMode) {
    return (
      <View key={key} style={{ marginBottom: ctx.theme.spacing.block }}>
        <Text style={styles.code}>{latex}</Text>
      </View>
    );
  }
  return (
    <Text key={key} style={styles.code}>
      {latex}
    </Text>
  );
}

function extractKatexSource(node: HastElement): string | null {
  let result: string | null = null;
  walkHast(node, child => {
    if (isElement(child, 'annotation')) {
      const encoding = getStringProperty(child.properties, 'encoding');
      if (encoding && encoding.includes('application/x-tex')) {
        result = getNodeText(child);
        return false;
      }
    }
    return true;
  });
  return result;
}

function ensureInlineNode(node: ReactNode, fallback: string): ReactNode {
  if (typeof node === 'string' || typeof node === 'number') {
    return node;
  }
  if (React.isValidElement(node) && node.type === Text) {
    return node;
  }
  return fallback;
}

// ============================================================================
// Inline Component Rendering
// ============================================================================

function renderTextWithComponents(
  text: string,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number,
  inlineComponentMap?: InlineComponentMap
): ReactNode {
  const match = findNextInlineComponent(text, inlineComponentMap);
  if (!match) {
    return text;
  }

  const before = text.slice(0, match.index);
  const after = text.slice(match.end);
  const rendered = renderInlineComponent(
    match.data,
    componentRegistry,
    isStreaming,
    key
  );
  const fallback = match.data.name ? (
    <Text style={{ color: theme.colors.muted }}>[{match.data.name}]</Text>
  ) : null;

  return (
    <>
      {before}
      {rendered ?? fallback}
      {renderTextWithComponents(
        after,
        theme,
        componentRegistry,
        isStreaming,
        `${key}-after`,
        inlineComponentMap
      )}
    </>
  );
}

function shouldRenderInlineComponents(
  text: string,
  inlineComponentMap?: InlineComponentMap
): boolean {
  if (inlineComponentMap) {
    for (const token of Object.keys(inlineComponentMap)) {
      if (text.includes(token)) return true;
    }
  }
  return text.includes('[{');
}

function findNextInlineComponent(
  text: string,
  inlineComponentMap?: InlineComponentMap
): { index: number; end: number; data: ComponentData } | null {
  const tokenMatch = findNextInlineToken(text, inlineComponentMap);
  const syntaxMatch = findNextComponentSyntax(text);

  if (!tokenMatch && !syntaxMatch) {
    return null;
  }

  if (tokenMatch && (!syntaxMatch || tokenMatch.index <= syntaxMatch.index)) {
    return {
      index: tokenMatch.index,
      end: tokenMatch.index + tokenMatch.token.length,
      data: tokenMatch.data,
    };
  }

  if (!syntaxMatch) {
    return null;
  }

  return {
    index: syntaxMatch.index,
    end: syntaxMatch.end,
    data: extractComponentData(syntaxMatch.raw),
  };
}

function findNextInlineToken(
  text: string,
  inlineComponentMap?: InlineComponentMap
): { index: number; token: string; data: ComponentData } | null {
  if (!inlineComponentMap) return null;

  let bestIndex = -1;
  let bestToken: string | null = null;
  for (const token of Object.keys(inlineComponentMap)) {
    const idx = text.indexOf(token);
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx;
      bestToken = token;
    }
  }

  if (bestToken === null) return null;

  return {
    index: bestIndex,
    token: bestToken,
    data: inlineComponentMap[bestToken],
  };
}

function findNextComponentSyntax(
  text: string
): { index: number; end: number; raw: string } | null {
  let idx = text.indexOf('[{');
  while (idx !== -1) {
    const tail = text.slice(idx);
    if (isComponentStart(tail)) {
      const endOffset = findComponentCloseIndex(tail);
      if (endOffset > 0) {
        const end = idx + endOffset;
        return { index: idx, end, raw: text.slice(idx, end) };
      }
    }
    idx = text.indexOf('[{', idx + 2);
  }
  return null;
}

function isComponentStart(value: string): boolean {
  return /^\[\{\s*c\s*:/.test(value);
}

function renderInlineComponent(
  data: ComponentData,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  if (!data.name) {
    return null;
  }

  if (!componentRegistry) {
    return null;
  }

  const componentDef = componentRegistry.get(data.name);
  if (!componentDef) {
    return null;
  }

  const renderedChildren = data.children?.length
    ? data.children.map((child, index) =>
        renderInlineComponent(
          child,
          componentRegistry,
          isStreaming,
          `${key}-child-${index}`
        )
      )
    : undefined;

  const mergedStyle = mergeComponentStyles(data.props, data.style);
  const Component =
    isStreaming && componentDef.skeletonComponent
      ? componentDef.skeletonComponent
      : componentDef.component;

  return (
    <Component
      key={key}
      {...data.props}
      style={mergedStyle}
      _isInline={true}
      _isStreaming={isStreaming}
    >
      {renderedChildren}
    </Component>
  );
}

// ============================================================================
// Block-level Component Renderer (for StableBlock with type='component')
// ============================================================================

export interface ComponentBlockProps {
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct component name (when not using block) */
  componentName?: string;
  /** Direct props (when not using block) */
  props?: Record<string, unknown>;
  /** CSS Grid-like style for layout positioning */
  style?: Record<string, unknown>;
  /** Direct children (when not using block) */
  children?: ComponentData[];
  /** Whether streaming (for active blocks) */
  isStreaming?: boolean;
}

function renderComponentError(theme: ThemeConfig, message: string): ReactNode {
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: theme.colors.codeBackground,
        borderRadius: 8,
        marginBottom: theme.spacing.block,
      }}
    >
      <Text style={{ color: theme.colors.muted }}>{message}</Text>
    </View>
  );
}

export const ComponentBlock: React.FC<ComponentBlockProps> = React.memo(
  ({
    theme,
    componentRegistry,
    block,
    componentName: directName,
    props: directProps,
    style: directStyle,
    children: directChildren,
    isStreaming = false,
  }) => {
    let componentName: string;
    let props: Record<string, unknown>;
    let style: Record<string, unknown> | undefined;
    let children: ComponentData[] | undefined;

    if (block) {
      const extracted = extractComponentData(block.content);
      const meta = block.meta as { type: 'component'; name: string; props: Record<string, unknown> };
      componentName = extracted.name || meta.name;
      props = extracted.name ? extracted.props : meta.props || {};
      style = extracted.style;
      children = extracted.children;
    } else {
      componentName = directName ?? '';
      props = directProps ?? {};
      style = directStyle;
      children = directChildren;
    }

    if (!componentName) {
      return null;
    }

    if (!componentRegistry) {
      return renderComponentError(theme, 'No component registry provided');
    }

    const componentDef = componentRegistry.get(componentName);
    if (!componentDef) {
      return renderComponentError(theme, `Unknown component: ${componentName}`);
    }

    const renderedChildren = children?.length ? (
      children.map((child, index) => (
        <ComponentBlock
          key={index}
          theme={theme}
          componentRegistry={componentRegistry}
          componentName={child.name}
          props={child.props}
          style={child.style}
          children={child.children}
          isStreaming={isStreaming}
        />
      ))
    ) : undefined;

    const mergedStyle = mergeComponentStyles(props, style);

    if (isStreaming && componentDef.skeletonComponent) {
      const SkeletonComponent = componentDef.skeletonComponent;
      return (
        <View style={{ marginBottom: theme.spacing.block }}>
          <SkeletonComponent {...props} style={mergedStyle} _isStreaming={true}>
            {renderedChildren}
          </SkeletonComponent>
        </View>
      );
    }

    const Component = componentDef.component;
    return (
      <View style={{ marginBottom: theme.spacing.block }}>
        <Component {...props} style={mergedStyle} _isStreaming={isStreaming}>
          {renderedChildren}
        </Component>
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return (
      prev.componentName === next.componentName &&
      prev.isStreaming === next.isStreaming &&
      JSON.stringify(prev.props) === JSON.stringify(next.props) &&
      JSON.stringify(prev.children) === JSON.stringify(next.children)
    );
  }
);

ComponentBlock.displayName = 'ComponentBlock';

// ============================================================================
// Utility Helpers
// ============================================================================

function normalizeProps(
  properties: HastProperties | undefined,
  className: string[]
): Record<string, unknown> {
  const props: Record<string, unknown> = { ...(properties ?? {}) };
  if (className.length > 0) {
    props.className = className;
  }
  if (typeof props.style === 'string') {
    delete props.style;
  }
  return sanitizeProps(props);
}

function normalizeClassName(properties?: HastProperties): string[] {
  const className = properties?.className;
  if (Array.isArray(className)) {
    return className.filter((name): name is string => typeof name === 'string');
  }
  if (typeof className === 'string') {
    return className.split(/\s+/).filter(Boolean);
  }
  return [];
}

function getStringProperty(
  properties: HastProperties | undefined,
  key: string
): string | undefined {
  const value = properties ? (properties as Record<string, unknown>)[key] : undefined;
  return typeof value === 'string' ? value : undefined;
}

function getCodeLanguage(properties: HastProperties | undefined): string {
  const className = normalizeClassName(properties);
  const classMatch = className.find(name => name.startsWith('language-') || name.startsWith('lang-'));
  if (classMatch) {
    return classMatch.replace(/^language-/, '').replace(/^lang-/, '');
  }
  const dataLang = getStringProperty(properties, 'data-language');
  if (dataLang) return dataLang;
  const lang = getStringProperty(properties, 'lang');
  if (lang) return lang;
  return '';
}

function getNodeText(node: HastContent): string {
  if (node.type === 'text') {
    return node.value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(child => getNodeText(child as HastContent)).join('');
  }
  return '';
}

function mergeComponentStyles(
  props: Record<string, unknown>,
  style?: Record<string, unknown>
): Record<string, unknown> | undefined {
  const propStyle = props.style;
  const safePropStyle =
    typeof propStyle === 'object' && propStyle !== null && !Array.isArray(propStyle)
      ? (propStyle as Record<string, unknown>)
      : undefined;

  if (!safePropStyle && !style) {
    return undefined;
  }

  return {
    ...(safePropStyle ?? {}),
    ...(style ?? {}),
  };
}

function walkHast(node: HastContent, visitor: (node: HastContent) => boolean | void) {
  const shouldContinue = visitor(node);
  if (shouldContinue === false) return;
  if ('children' in node && Array.isArray(node.children)) {
    node.children.forEach(child => walkHast(child as HastContent, visitor));
  }
}

function findFirstElement(node: HastContent, tagName: string): HastElement | null {
  let result: HastElement | null = null;
  walkHast(node, current => {
    if (isElement(current, tagName)) {
      result = current;
      return false;
    }
    return true;
  });
  return result;
}

function isElement<TagName extends string>(
  node: HastContent,
  tagName: TagName
): node is HastElement & { tagName: TagName };
function isElement(node: HastContent, tagName?: string): node is HastElement;
function isElement(node: HastContent, tagName?: string): node is HastElement {
  if (node.type !== 'element') return false;
  if (tagName) return (node as HastElement).tagName === tagName;
  return true;
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Render a complete HAST tree (for testing)
 */
export function renderHAST(
  root: HastRoot,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  components?: HastComponentMap,
  renderMath?: (latex: string, displayMode: boolean) => ReactNode,
  isStreaming = false,
  inlineComponentMap?: InlineComponentMap
): ReactNode {
  const ctx: RenderContext = {
    theme,
    componentRegistry,
    components,
    renderMath,
    isStreaming,
    inlineComponentMap,
  };
  return renderChildren(root, ctx, { parentIsText: false, inCode: false });
}
