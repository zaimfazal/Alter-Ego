import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';
import { UserProfile } from '../types';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [duration, setDuration] = useState('30');
  const [aiMode, setAiMode] = useState<'Aggressive' | 'Calm'>('Aggressive');
  
  const { setUserProfile, completeOnboarding } = useAppStore();

  const handleComplete = () => {
    if (!name.trim() || !goal.trim() || !currentStatus.trim()) return;
    
    // Validate duration is a number
    const durationDays = parseInt(duration) || 30;

    setUserProfile({ 
      name: name.trim(), 
      goal: goal.trim(),
      currentStatus: currentStatus.trim(),
      durationDays: durationDays,
      aiMode: aiMode
    });
    completeOnboarding();
  };

  const isFormValid = name.trim() && goal.trim() && currentStatus.trim() && parseInt(duration) > 0;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Define Your Journey</Text>
          <Text style={styles.subtitle}>Set your target. Your Alter Ego will guide you.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHAT SHOULD WE CALL YOU?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHAT IS THE EXACT GOAL?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lose 10kg, Launch Startup..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={goal}
              onChangeText={setGoal}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHERE ARE YOU NOW? (CURRENT STATUS)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Be honest. E.g. I am procrastinating, out of shape..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={currentStatus}
              onChangeText={setCurrentStatus}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DURATION IN DAYS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30, 60, 90"
              placeholderTextColor={COLORS.onSurfaceVariant}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SELECT AI COACHING STYLE</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, aiMode === 'Aggressive' && styles.toggleActive]}
                onPress={() => setAiMode('Aggressive')}
              >
                <Text style={[styles.toggleText, aiMode === 'Aggressive' && styles.toggleTextActive]}>Aggressive</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, aiMode === 'Calm' && styles.toggleActive]}
                onPress={() => setAiMode('Calm')}
              >
                <Text style={[styles.toggleText, aiMode === 'Calm' && styles.toggleTextActive]}>Calm & Steady</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modeDescription}>
              {aiMode === 'Aggressive' 
                ? "Brutally honest, demanding, and uncompromising. Designed to trigger you into action."
                : "Rational, stoic, and highly supportive. Designed to steadily build compounding habits."}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, !isFormValid && styles.buttonDisabled]} 
          onPress={handleComplete}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>COMMIT TO THIS FUTURE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SIZES.lg,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 36,
    lineHeight: 44,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.md,
    lineHeight: 24,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  inputGroup: {
    marginBottom: SIZES.md,
  },
  label: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    fontSize: SIZES.sm,
    letterSpacing: 1,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLowest,
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.body,
    padding: SIZES.md,
    fontSize: SIZES.md,
    borderRadius: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: SIZES.xs,
  },
  toggleBtn: {
    flex: 1,
    padding: SIZES.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    borderRadius: SIZES.xs,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primaryFixed,
    borderColor: COLORS.primaryFixed,
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  modeDescription: {
    marginTop: SIZES.sm,
    fontFamily: TYPOGRAPHY.body,
    fontSize: SIZES.xs,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.primaryFixed,
    padding: SIZES.lg,
    alignItems: 'center',
    borderRadius: SIZES.xs,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.headline,
    color: COLORS.primary,
    fontSize: SIZES.md,
    letterSpacing: 1,
  },
});
