import { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { LegendList } from '@legendapp/list';
import { StreamdownRN } from 'streamdown-rn';
import { debugComponentRegistry } from '@darkresearch/debug-components';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
};

// Pre-populated chat history (simulating loading from database)
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What is React Native?',
  },
  {
    id: '2',
    role: 'assistant',
    content: `### React Native

React Native is a **framework** for building native mobile apps using JavaScript and React.

**Key Features:**
- Cross-platform development
- Native performance
- Large ecosystem
- Hot reloading

It was created by Facebook and is now used by companies like:
- Instagram
- Airbnb
- Discord
- Shopify`,
  },
  {
    id: '3',
    role: 'user',
    content: 'How does it compare to Flutter?',
  },
  {
    id: '4',
    role: 'assistant',
    content: `### React Native vs Flutter

**When to choose React Native:**
- You have JavaScript/React experience
- You need to share code with web
- You want native look and feel

**When to choose Flutter:**
- You want pixel-perfect UI control
- Performance is critical
- You're starting fresh
`,
  },
  {
    id: '5',
    role: 'user',
    content: 'Can you show me a code example?',
  },
  {
    id: '6',
    role: 'assistant',
    content: `### Simple React Native Component

Here's a basic example:

\`\`\`typescript
import { View, Text, StyleSheet } from 'react-native';

export function Greeting({ name }: { name: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Hello, {name}!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
\`\`\`

This creates a simple greeting component with styling!`,
  },
  {
    id: '7',
    role: 'user',
    content: 'What about state management?',
  },
  {
    id: '8',
    role: 'assistant',
    content: `### State Management in React Native

There are several popular options:

**Built-in:**
- \`useState\` - Simple local state
- \`useReducer\` - Complex local state
- \`Context API\` - Prop drilling solution

**Third-party libraries:**

1. **Redux** - The classic choice
   - Predictable state
   - Great devtools
   - Large ecosystem

2. **Zustand** - Modern and simple
   - Minimal boilerplate
   - TypeScript friendly
   - Small bundle size

3. **Legend State** - High performance
   - Fine-grained reactivity
   - Persistence built-in
   - Great for large apps

4. **Jotai** - Atomic approach
   - Bottom-up state
   - Minimal API
   - Good for React devs`,
  },
  {
    id: '9',
    role: 'user',
    content: 'Tell me about navigation',
  },
  {
    id: '10',
    role: 'assistant',
    content: `### Navigation in React Native

The most popular solution is **React Navigation**.

**Installation:**
\`\`\`bash
npm install @react-navigation/native
npm install @react-navigation/stack
\`\`\`

**Navigator Types:**

- **Stack Navigator** - Screen stacking
- **Tab Navigator** - Bottom/top tabs
- **Drawer Navigator** - Side menu
- **Native Stack** - Native animations

**Example Setup:**

\`\`\`typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\``,
  },
  // Add more messages to test scrolling with many items
  {
    id: '11',
    role: 'user',
    content: 'What about animations?',
  },
  {
    id: '12',
    role: 'assistant',
    content: `### Animations in React Native

**Options:**

1. **Animated API** (Built-in)
   - Good for simple animations
   - JS-driven

2. **Reanimated** (Recommended)
   - Runs on UI thread
   - 60fps performance
   - Gesture handling

**Example with Reanimated:**

\`\`\`typescript
import Animated, { 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

function AnimatedBox() {
  const offset = useSharedValue(0);
  
  return (
    <Animated.View 
      style={{ transform: [{ translateX: offset }] }}
    />
  );
}
\`\`\``,
  },
  {
    id: '13',
    role: 'user',
    content: 'How do I handle forms?',
  },
  {
    id: '14',
    role: 'assistant',
    content: `### Form Handling in React Native

**Libraries:**
- \`react-hook-form\` - Best performance
- \`formik\` - Popular, feature-rich
- \`react-native-form-validator\` - Simple validation

**react-hook-form Example:**

\`\`\`typescript
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native';

function LoginForm() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </>
  );
}
\`\`\`

**Validation** is built-in with rules prop!`,
  },
  {
    id: '15',
    role: 'user', 
    content: 'What testing tools are available?',
  },
  {
    id: '16',
    role: 'assistant',
    content: `### Testing React Native Apps

**Unit Testing:**
- Jest (included by default)
- React Native Testing Library

**E2E Testing:**
- Detox (by Wix)
- Maestro (newer, simpler)
- Appium (cross-platform)

**Example Test:**

\`\`\`typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Counter } from './Counter';

test('increments counter', () => {
  const { getByText } = render(<Counter />);
  
  const button = getByText('Increment');
  fireEvent.press(button);
  
  expect(getByText('Count: 1')).toBeTruthy();
});
\`\`\`

> **Tip:** Use \`jest.mock()\` for native modules!`,
  },
];

// Streaming demo content
const STREAMING_RESPONSE = `### Great question!

Here's what I think about that:

**Key Points:**
- First, consider your use case
- Then evaluate the trade-offs
- Finally, prototype and test

The most important thing is to **start building** and iterate from there. 

Don't let analysis paralysis hold you back! 🚀`;

export function ChatHistoryTest({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const addUserMessage = useCallback(() => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate assistant response with streaming
    setTimeout(() => {
      simulateStreaming();
    }, 500);
  }, [inputText, isStreaming]);

  const simulateStreaming = useCallback(() => {
    const assistantId = (Date.now() + 1).toString();
    let currentIndex = 0;

    setIsStreaming(true);

    // Add empty assistant message
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', isStreaming: true },
    ]);

    // Stream characters
    const interval = setInterval(() => {
      currentIndex++;
      const currentContent = STREAMING_RESPONSE.slice(0, currentIndex);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: currentContent, isStreaming: currentIndex < STREAMING_RESPONSE.length }
            : m
        )
      );

      if (currentIndex >= STREAMING_RESPONSE.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15); // 15ms per character for smooth streaming
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === 'user';

      return (
        <View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          { /* Test role label */}
          {/* <View style={styles.roleLabel}>
            <Text style={styles.roleLabelText}>
              {isUser ? '👤 You' : '🤖 Assistant'}
            </Text>
          </View> */}
          {isUser ? (
            <Text style={styles.userText}>{item.content}</Text>
          ) : (
            <StreamdownRN componentRegistry={debugComponentRegistry}>
              {item.content}
              {/* "Hello, world!" */}
            </StreamdownRN>
          )}
          {item.isStreaming && (
            <Text style={styles.streamingIndicator}>●</Text>
          )}
        </View>
      );
    },
    []
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Chat History Test</Text>
        <Text style={styles.messageCount}>{messages.length} msgs</Text>
      </View>

      {/* Chat List */}
      <LegendList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        alignItemsAtEnd
        maintainScrollAtEnd
        maintainVisibleContentPosition
        recycleItems={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addUserMessage}
          editable={!isStreaming}
        />
        <Pressable
          onPress={addUserMessage}
          style={[styles.sendButton, isStreaming && styles.sendButtonDisabled]}
          disabled={isStreaming}
        >
          <Text style={styles.sendButtonText}>
            {isStreaming ? '...' : 'Send'}
          </Text>
        </Pressable>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    color: '#4ade80',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageCount: {
    color: theme.colors.text,
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    width: '90%',
    flexShrink: 0,
  },
  userMessage: {
    backgroundColor: '#1e3a5f',
    alignSelf: 'flex-end',
    marginLeft: '10%',
  },
  assistantMessage: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'flex-start',
    marginRight: '10%',
  },
  roleLabel: {
    marginBottom: 6,
  },
  roleLabelText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  streamingIndicator: {
    color: '#4ade80',
    fontSize: 10,
    marginTop: 4,
    animationDuration: '1s',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.statusBg,
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#4ade80',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
  },
}));

