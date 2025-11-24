import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Mask, Path, Rect, Circle } from 'react-native-svg';
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
  // Extract width and height from style
  const flattenedStyle = StyleSheet.flatten(style || {});
  const width = (flattenedStyle.width as number) || 100;
  const height = (flattenedStyle.height as number) || 100;
  
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
  
  // Separate style properties - remove width/height as they're handled by the container
  const { width: _, height: __, backgroundColor, ...restStyle } = flattenedStyle;
  
  return (
    <View style={[{ width, height }, restStyle]} {...props}>
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <Mask id={maskId}>
            <Rect width={width} height={height} fill="black" />
            <Path d={pathData} fill="white" />
          </Mask>
        </Defs>
        <Rect
          width={width}
          height={height}
          fill={backgroundColor || '#000'}
          mask={`url(#${maskId})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {children}
      </View>
    </View>
  );
}

