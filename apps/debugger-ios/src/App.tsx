import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { StreamdownRN } from 'streamdown-rn';

const WS_URL = 'ws://localhost:3001';

// Configure Unistyles
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

export default function App() {
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
          setConnected(true);
          console.log('✅ Connected to debugger');
        };
        
        ws.onclose = () => {
          setConnected(false);
          console.log('❌ Disconnected, reconnecting...');
          reconnectTimeout = setTimeout(connect, 1000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };
        
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            setContent(data.content || '');
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnected(false);
        reconnectTimeout = setTimeout(connect, 1000);
      }
    };
    
    connect();
    
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={[styles.dot, connected && styles.dotConnected]}>●</Text>
        <Text style={styles.statusText}>
          {connected ? 'Connected to debugger' : 'Reconnecting...'}
        </Text>
      </View>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
      >
        {content ? (
          <StreamdownRN>{content}</StreamdownRN>
        ) : (
          <Text style={styles.placeholder}>
            Waiting for content from web debugger...
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: UnistylesRuntime.insets.top,
    paddingBottom: UnistylesRuntime.insets.bottom,
  },
  statusBar: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  dot: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginRight: 8,
  },
  dotConnected: {
    color: theme.colors.connected,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  placeholder: {
    color: theme.colors.placeholder,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
}));
