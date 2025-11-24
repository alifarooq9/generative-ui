import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '../../lib/colors';
import { Squircle } from '../squircle/squircle-view';

interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const sizeMap = {
  small: 40,
  medium: 56,
  large: 64,
};

/**
 * Floating Action Button
 * 
 * Part of Dark Design System
 * Uses a true squircle shape based on the mathematical definition: |x|^4 + |y|^4 = r^4
 * Reference: https://en.wikipedia.org/wiki/Squircle
 */
export function FAB({ 
  icon, 
  onPress, 
  size = 'medium',
  disabled = false,
  variant = 'primary',
}: FABProps) {
  const dimension = sizeMap[size];
  
  // Squircle radius 'r' in the equation |x|^4 + |y|^4 = r^4
  // For a squircle that fills the square, r = dimension/2
  const cornerRadius = dimension / 2;
  
  // Flatten styles to prevent NativeWind CssInterop from processing arrays
  const fabStyle = StyleSheet.flatten([
    styles.fab,
    {
      width: dimension,
      height: dimension,
      backgroundColor: variant === 'primary' ? colors.fg : colors.bg,
    },
  ]);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Squircle
        style={fabStyle}
        cornerRadius={cornerRadius}
        cornerSmoothing={0.6}
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
      </Squircle>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

