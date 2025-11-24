import React from 'react';
import { View, Text } from 'react-native';
import { FAB } from './fab';

export default {
  title: 'Components/FAB',
  component: FAB,
};

export const Primary = () => (
  <View style={{ padding: 20, backgroundColor: '#EEEDED', height: 200 }}>
    <FAB
      icon={<Text style={{ fontSize: 24 }}>⚙️</Text>}
      onPress={() => console.log('FAB pressed')}
    />
  </View>
);

export const Secondary = () => (
  <View style={{ padding: 20, backgroundColor: '#EEEDED', height: 200 }}>
    <FAB
      icon={<Text style={{ fontSize: 24 }}>⚙️</Text>}
      onPress={() => console.log('FAB pressed')}
      variant="secondary"
    />
  </View>
);

export const Sizes = () => (
  <View style={{ padding: 20, backgroundColor: '#EEEDED', flexDirection: 'row', gap: 16 }}>
    <FAB
      icon={<Text style={{ fontSize: 16 }}>⚙️</Text>}
      onPress={() => console.log('Small')}
      size="small"
    />
    <FAB
      icon={<Text style={{ fontSize: 20 }}>⚙️</Text>}
      onPress={() => console.log('Medium')}
      size="medium"
    />
    <FAB
      icon={<Text style={{ fontSize: 24 }}>⚙️</Text>}
      onPress={() => console.log('Large')}
      size="large"
    />
  </View>
);

export const Disabled = () => (
  <View style={{ padding: 20, backgroundColor: '#EEEDED', height: 200 }}>
    <FAB
      icon={<Text style={{ fontSize: 24 }}>⚙️</Text>}
      onPress={() => console.log('Should not fire')}
      disabled
    />
  </View>
);

