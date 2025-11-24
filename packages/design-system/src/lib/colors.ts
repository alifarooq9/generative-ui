/**
 * Dark Design System Colors
 * 
 * Philosophy: 2 base colors + opacity variants
 * - bg: #EEEDED (light gray background)
 * - fg: #262626 (dark gray foreground)
 * - Everything else: opacity modifiers
 */

export const colors = {
  bg: '#EEEDED',
  fg: '#262626',
  
  // Semantic aliases (using opacity)
  border: '#26262610',      // fg at 10% opacity
  muted: '#26262640',       // fg at 40% opacity
  secondary: '#26262660',   // fg at 60% opacity
  disabled: '#26262630',    // fg at 30% opacity
} as const;

export type ColorKey = keyof typeof colors;

