import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@darkresearch/design-system';
import type { StyleProp, ViewStyle } from 'react-native';

interface CardDialogProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  description?: string;
}

export function CardDialog({ 
  title,
  description,
  children, 
  style 
}: CardDialogProps) {

  return (
    <View style={cardDialogStyles.container}>
      <Card style={{ width: 320, ...(style as object) }}>
        <CardHeader style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, gap: 6 }}>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </View>
        </CardHeader>
        <CardContent>
          {children || <Text>Empty card for now - just testing visibility</Text>}
        </CardContent>
      </Card>
    </View>
  );
}

const cardDialogStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72, // Above the FAB (56px FAB + 16px gap)
    right: 0,
    zIndex: 1000,
    elevation: 1000, // Android
    ...(Platform.OS === 'web' && {
      // Ensure it's visible on web
      pointerEvents: 'auto',
    }),
  },
});

