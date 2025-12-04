import { StyleSheet } from 'react-native-unistyles';

// Configure Unistyles theme - must run before any StyleSheet.create()
// This file is imported at the entry point (index.js) to ensure proper initialization order
StyleSheet.configure({
  themes: {
    dark: {
      colors: {
        bg: '#1a1a1a',
        statusBg: '#141414',
        border: '#333',
        text: '#888',
        placeholder: '#666',
        connected: '#4ade80',
      },
    },
  },
  settings: {
    initialTheme: 'dark',
  },
});

