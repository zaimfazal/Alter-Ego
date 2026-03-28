import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { chatWithAlterEgo } from '../api/openai';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AlterEgoScreen() {
  const { userProfile, streak, xpTotal, missions, startDate } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `CONNECTION ESTABLISHED. I AM WHO YOU BECOME WHEN YOU STOP MAKING EXCUSES.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const apiHistory = messages.map(m => ({ 
      role: m.role, 
      content: m.content 
    }));

    const now = new Date();
    const start = startDate ? new Date(startDate) : now;
    now.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    const currentDay = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const todaysMissions = missions.filter(m => m.dayAssigned === currentDay && !m.completed).map(m => m.title).join(", ");
    
    const sysContext = `CURRENT STREAK: ${streak} days. XP: ${xpTotal}. UNCOMPLETED MISSIONS FOR TODAY: ${todaysMissions || 'None'}. If they have uncompleted missions, reprimand them if they complain.`;

    const responseMsg = await chatWithAlterEgo(userProfile, apiHistory, userMsg.content, sysContext);

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: responseMsg.content || ''
    }]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>THE_EGO_SYNC</Text>
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.chatContainer} 
        contentContainerStyle={{ paddingBottom: SIZES.lg }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageRow}>
            {msg.role === 'user' ? (
              <Text style={styles.userPrefix}>&gt; USER:</Text>
            ) : null}
            <Text style={[
              styles.messageText, 
              msg.role === 'assistant' ? styles.assistantMessage : styles.userMessage
            ]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && <ActivityIndicator color={COLORS.primaryFixed} style={{ marginTop: SIZES.md, alignSelf: 'flex-start' }}/>}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.inputPrefix}>&gt;</Text>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="ENTER_COMMAND..."
          placeholderTextColor={COLORS.onSurfaceVariant}
          selectionColor={COLORS.primaryFixed}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading || !input.trim()}>
          <Text style={[styles.sendText, (!input.trim() || loading) && { color: COLORS.onSurfaceVariant }]}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest, // The chat is sunken
  },
  header: {
    padding: SIZES.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHighest,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    letterSpacing: 2,
  },
  chatContainer: {
    flex: 1,
    padding: SIZES.md,
  },
  messageRow: {
    flexDirection: 'column',
    marginBottom: SIZES.lg,
  },
  userPrefix: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.xs,
    marginBottom: 4,
  },
  messageText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: SIZES.md,
    lineHeight: 22,
  },
  assistantMessage: {
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headline, // Give future self authoritative font
  },
  userMessage: {
    color: COLORS.onSurfaceVariant,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHighest,
  },
  inputPrefix: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    marginRight: SIZES.sm,
  },
  textInput: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.body,
    fontSize: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  sendButton: {
    marginLeft: SIZES.md,
  },
  sendText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
  },
});
