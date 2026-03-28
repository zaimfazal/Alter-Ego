import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES, RADIUS } from '../constants/theme';
import { generateDailyQuote, generateDynamicMissions, generateMissionAdvice } from '../api/openai';
import { Mission } from '../types';

export default function DashboardScreen() {
  const { userProfile, startDate, streak, xpTotal, missions, addMissions, updateStatsOnDailyLogin } = useAppStore();
  const navigation = useNavigation<any>();
  
  const [quote, setQuote] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate current day relative to start date
  const now = new Date();
  const start = startDate ? new Date(startDate) : now;
  now.setHours(0,0,0,0);
  start.setHours(0,0,0,0);
  let currentDay = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  useFocusEffect(
    React.useCallback(() => {
      updateStatsOnDailyLogin(); 
    }, [])
  );

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);

      // Are there missions for the current week? (Weeks defined in 7 day blocks)
      const currentWeekNumber = Math.ceil(currentDay / 7);
      const isWeekGenerated = missions.some(m => Math.ceil(m.dayAssigned / 7) === currentWeekNumber);

      if (!isWeekGenerated) {
        const newMissions = await generateDynamicMissions(userProfile, currentWeekNumber);
        if (newMissions.length > 0) {
           addMissions(newMissions);
        }
      }

      // Generate daily quote
      if (!quote) {
        const progressPercentage = Math.min(100, Math.max(0, (currentDay / userProfile.durationDays) * 100));
        const newQuote = await generateDailyQuote(userProfile, progressPercentage);
        setQuote(newQuote);
      }

      // Generate mission advice specifically for today
      if (!advice) {
        const todayMissions = useAppStore.getState().missions.filter(m => m.dayAssigned === currentDay);
        if (todayMissions.length > 0) {
           const newAdvice = await generateMissionAdvice(userProfile, todayMissions);
           setAdvice(newAdvice);
        } else {
           setAdvice("No missions generated for today. Await further directives.");
        }
      }
      
      setLoading(false);
    }
    
    initDashboard();
  }, [currentDay, quote, advice]);

  const progressPercentage = Math.min(100, Math.max(0, (currentDay / userProfile.durationDays) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>ID: {userProfile.name.toUpperCase()}</Text>
        <Text style={styles.title}>DAY_0{currentDay}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBoxXP}>
          <Text style={styles.statLabel}>EXPERIENCE</Text>
          <Text style={styles.xpValue}>{xpTotal} <Text style={{fontSize: 20}}>XP</Text></Text>
        </View>
        <View style={styles.statBoxStreak}>
          <Text style={styles.statLabel}>STREAK</Text>
          <Text style={styles.streakValue}>{streak}🔥</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>VECTOR_COMPLETION</Text>
          <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.goalText}>"{userProfile.goal}"</Text>
      </View>

      <View style={styles.transmissionBox}>
        <Text style={styles.transmissionHeader}>TARGET_DIRECTIVE &gt;</Text>
        {loading ? (
          <ActivityIndicator color={COLORS.primaryFixed} size="small" style={{ marginTop: SIZES.md }} />
        ) : (
          <Text style={styles.transmissionBody}>{advice || 'AWAITING_INPUT.'}</Text>
        )}
      </View>

      <View style={styles.quoteBox}>
         {loading ? (
           <ActivityIndicator color={COLORS.onSurfaceVariant} size="small" />
         ) : (
           <Text style={styles.quoteText}>{quote}</Text>
         )}
      </View>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => navigation.navigate('Missions')}
      >
        <Text style={styles.actionButtonText}>ENGAGE_MISSIONS ➔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: SIZES.lg, paddingTop: SIZES.xl, paddingBottom: 100 },
  header: { marginBottom: SIZES.xl },
  greeting: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm, letterSpacing: 2, marginBottom: SIZES.xs },
  title: { fontFamily: TYPOGRAPHY.display, color: COLORS.onSurface, fontSize: 32 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.lg },
  statBoxXP: { backgroundColor: COLORS.surfaceContainerLow, flex: 0.65, padding: SIZES.lg, borderLeftWidth: 4, borderLeftColor: COLORS.primaryFixed },
  statBoxStreak: { backgroundColor: COLORS.surfaceContainerLow, flex: 0.32, padding: SIZES.lg, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: SIZES.xs, letterSpacing: 1, marginBottom: SIZES.sm },
  xpValue: { fontFamily: TYPOGRAPHY.display, color: COLORS.onSurface, fontSize: 40, lineHeight: 44 },
  streakValue: { fontFamily: TYPOGRAPHY.display, color: COLORS.primaryFixed, fontSize: 32, lineHeight: 36 },

  progressContainer: { backgroundColor: COLORS.surfaceContainerHighest, padding: SIZES.lg, marginBottom: SIZES.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  progressLabel: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: SIZES.xs },
  progressValue: { fontFamily: TYPOGRAPHY.label, color: COLORS.primaryFixed, fontSize: SIZES.sm },
  progressBarBg: { height: 8, backgroundColor: COLORS.surfaceContainerLowest, width: '100%', marginBottom: SIZES.md },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primaryFixed },
  goalText: { fontFamily: TYPOGRAPHY.body, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm, fontStyle: 'italic' },
  
  transmissionBox: { backgroundColor: COLORS.surfaceContainerLow, padding: SIZES.lg, marginBottom: SIZES.lg, borderLeftWidth: 2, borderLeftColor: COLORS.onSurfaceVariant },
  transmissionHeader: { fontFamily: TYPOGRAPHY.label, color: COLORS.primaryFixed, fontSize: SIZES.xs, letterSpacing: 1, marginBottom: SIZES.md },
  transmissionBody: { fontFamily: TYPOGRAPHY.bodyMedium, color: COLORS.onSurface, fontSize: SIZES.md, lineHeight: 24 },
  
  quoteBox: { padding: SIZES.lg, marginBottom: SIZES.xl, alignItems: 'center', justifyContent: 'center' },
  quoteText: { fontFamily: TYPOGRAPHY.headline, color: COLORS.onSurfaceVariant, fontSize: SIZES.md, textAlign: 'center', letterSpacing: 1 },

  actionButton: { backgroundColor: COLORS.primaryFixed, padding: SIZES.md, alignItems: 'center' },
  actionButtonText: { fontFamily: TYPOGRAPHY.display, color: COLORS.primary, fontSize: SIZES.md, letterSpacing: 2 },
});
