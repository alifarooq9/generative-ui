import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Defs, Mask, Path, Rect, ClipPath } from 'react-native-svg';
import type { ViewProps } from 'react-native';

interface SquircleProps extends ViewProps {
  cornerSmoothing?: number; // Kept for API compatibility but not used (true squircle uses n=4)
  cornerRadius?: number; // This is actually the radius 'r' in the squircle equation
  children?: React.ReactNode;
}

/**
 * Squircle View Component
 * 
 * Implements a true squircle based on the mathematical definition:
 * |x|^4 + |y|^4 = r^4
 * 
 * Reference: https://en.wikipedia.org/wiki/Squircle
 * 
 * Uses SVG clipping to create the squircle shape.
 */
export function Squircle({ 
  cornerSmoothing, // Kept for API compatibility but not used
  cornerRadius,
  children,
  style,
  ...props 
}: SquircleProps) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:28',message:'Squircle render entry',data:{hasStyle:!!style,propsKeys:Object.keys(props)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Extract width and height from style
  const flattenedStyle = StyleSheet.flatten(style || {});
  const width = (flattenedStyle.width as number) || 100;
  const height = (flattenedStyle.height as number) || 100;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:35',message:'After flatten style',data:{flattenedStyle,width,height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // The radius 'r' in the squircle equation |x|^4 + |y|^4 = r^4
  // For a squircle centered at (width/2, height/2), we use half the smaller dimension
  const r = cornerRadius || Math.min(width, height) / 2;
  
  // Generate squircle path points
  // For a squircle: |x|^4 + |y|^4 = r^4
  // We'll generate points parametrically
  const generateSquirclePath = (r: number, centerX: number, centerY: number): string => {
    const points: Array<[number, number]> = [];
    const numPoints = 64; // Number of points for smooth curve
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      
      // Parametric form for squircle (superellipse with n=4)
      // x = r * sign(cos t) * |cos t|^(1/2)
      // y = r * sign(sin t) * |sin t|^(1/2)
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      
      const x = r * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.5);
      const y = r * Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.5);
      
      points.push([centerX + x, centerY + y]);
    }
    
    // Create SVG path
    const pathData = points.map(([x, y], i) => 
      `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    ).join(' ') + ' Z';
    
    return pathData;
  };
  
  const centerX = width / 2;
  const centerY = height / 2;
  const pathData = generateSquirclePath(r, centerX, centerY);
  const maskId = `squircle-mask-${r}-${width}-${height}`;
  const clipPathId = `squircle-clip-${r}-${width}-${height}`;
  
  // Separate style properties - remove width/height as they're handled by the container
  // Also explicitly remove backgroundColor to ensure no background is applied
  const { width: _, height: __, backgroundColor, ...restStyle } = flattenedStyle;
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:85',message:'Before render - style analysis',data:{extractedBackgroundColor:backgroundColor,restStyleKeys:Object.keys(restStyle),restStyle,propsStyle:(props as any).style},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Explicitly set backgroundColor to rgba(0,0,0,0) to override React Native Web CSS class defaults
  // React Native Web ignores undefined values, so we must use an explicit transparent color
  const finalStyle = [
    { width, height, backgroundColor: 'rgba(0,0,0,0)' },
    restStyle
  ];
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:94',message:'Final style array',data:{finalStyle},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const viewRef = useRef<View>(null);
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined' && viewRef.current) {
      setTimeout(() => {
        // Try multiple ways to access the DOM element in React Native Web
        // @ts-ignore - accessing web-specific properties
        const element = viewRef.current._nativeNode || (viewRef.current as any)._node || viewRef.current;
        if (element && element.parentElement) {
          const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
          const parentComputedStyle = window.getComputedStyle ? window.getComputedStyle(element.parentElement) : null;
          const beforeStyle = window.getComputedStyle ? window.getComputedStyle(element, '::before') : null;
          const afterStyle = window.getComputedStyle ? window.getComputedStyle(element, '::after') : null;
          const inlineBg = element.style?.backgroundColor;
          const allStyles: Record<string, string> = {};
          if (element.style) {
            for (let i = 0; i < element.style.length; i++) {
              const prop = element.style[i];
              allStyles[prop] = element.style.getPropertyValue(prop);
            }
          }
          const children: any[] = [];
          if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
              const child = element.children[i];
              const childStyle = window.getComputedStyle ? window.getComputedStyle(child) : null;
              children.push({
                tagName: child.tagName,
                className: child.className,
                backgroundColor: childStyle?.backgroundColor,
                hasWhiteBg: childStyle?.backgroundColor?.includes('255') || childStyle?.backgroundColor === 'white' || childStyle?.backgroundColor === '#fff' || childStyle?.backgroundColor === '#ffffff'
              });
            }
          }
          // Check CSS rules from stylesheets
          const cssRules: string[] = [];
          try {
            const sheets = document.styleSheets;
            for (let i = 0; i < sheets.length; i++) {
              try {
                const rules = sheets[i].cssRules || sheets[i].rules;
                if (rules) {
                  for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j] as CSSStyleRule;
                    if (rule.selectorText && element.matches && element.matches(rule.selectorText)) {
                      cssRules.push(`${rule.selectorText}: {background-color: ${rule.style.backgroundColor}}`);
                    }
                    if (rule.selectorText && element.className && rule.selectorText.includes(element.className)) {
                      cssRules.push(`${rule.selectorText}: {background-color: ${rule.style.backgroundColor}}`);
                    }
                  }
                }
              } catch (e) {
                // Cross-origin stylesheet, skip
              }
            }
          } catch (e) {
            // Could not access stylesheets
          }
          fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:107',message:'Web computed styles after mount - comprehensive',data:{computedBackgroundColor:computedStyle?.backgroundColor,computedOpacity:computedStyle?.opacity,computedDisplay:computedStyle?.display,parentBackgroundColor:parentComputedStyle?.backgroundColor,beforeBackgroundColor:beforeStyle?.backgroundColor,afterBackgroundColor:afterStyle?.backgroundColor,inlineStyleBg:inlineBg,allInlineStyles:allStyles,elementTagName:element.tagName,elementClassName:element.className,childrenCount:element.children?.length,children,matchedCssRules:cssRules},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        } else {
          fetch('http://127.0.0.1:7242/ingest/ba72c841-4600-456b-adad-25adf0868af7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'squircle-view.tsx:145',message:'Could not access DOM element',data:{hasRef:!!viewRef.current,hasElement:!!element},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'C'})}).catch(()=>{});
        }
      }, 100);
    }
  }, []);
  // #endregion

  const mobileStyles = {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  };
  const shadowStyles = Platform.select({
    ios: mobileStyles,
    android: mobileStyles,
  });
  
  return (
    <View 
      ref={viewRef}
      style={[
        ...finalStyle,
        shadowStyles,
      ]}
      {...props}
    >
      {/* Always render SVG with mask to create squircle shape */}
      <Svg
        width={width}
        height={height}
        pointerEvents="none"
      >
        <Defs>
          <Mask id={maskId}>
            <Rect width={width} height={height} fill="black" />
            <Path d={pathData} fill="white" />
          </Mask>
        </Defs>
        {/* Render background Rect with mask - always render to define squircle shape */}
        {/* When transparent, use a very subtle fill so the mask creates visible shape */}
        {/* The mask will make corners transparent, but we need something to mask */}
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          mask={`url(#${maskId})`}
        />
      </Svg>
      {/* Children container - use border radius approximation for clipping */}
      {/* Note: React Native Views can't be clipped by SVG masks, so we use border radius */}
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { 
            overflow: 'hidden',
            // Approximate squircle with border radius (squircle radius is typically ~70% of corner radius)
            borderRadius: r * 0.7,

            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }
        ]} 
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );
}
