import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.woff2'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.woff2'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.woff2'),
  });
}

