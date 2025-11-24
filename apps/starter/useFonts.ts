// Native version - loads Satoshi OTF fonts
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.otf'),
  });
}

