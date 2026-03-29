import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';
import { Activity, Target, ShieldAlert, Award } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const { missions, streak, restTokens, perfectDaysCount } = useAppStore();

  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  const currentDay = Math.max(...missions.map(m => m.dayAssigned), 7);
  
  let last7DaysCompletions = [0,0,0,0,0,0,0];
  for(let i=0; i<7; i++) {
     const d = currentDay - 6 + i;
     const dayMissions = missions.filter(m => m.dayAssigned === d);
     const completed = dayMissions.filter(m => m.completed).length;
     const rate = dayMissions.length > 0 ? (completed / dayMissions.length) * 100 : 0;
     last7DaysCompletions[i] = rate;
  }

  return (
     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
           <Text style={styles.title}>COMMAND CENTER</Text>
           <Text style={styles.subtitle}>Analysis of operational efficiency.</Text>
        </View>

        <View style={styles.summaryGrid}>
           <View style={styles.gridBox}>
              <Activity color={COLORS.primaryFixed} size={24} style={{marginBottom: 8}}/>
              <Text style={styles.boxVal}>{Math.round(completionRate)}%</Text>
              <Text style={styles.boxLabel}>COMPLETION RATE</Text>
           </View>
           <View style={styles.gridBox}>
              <ShieldAlert color={COLORS.primaryFixed} size={24} style={{marginBottom: 8}}/>
              <Text style={styles.boxVal}>{restTokens}</Text>
              <Text style={styles.boxLabel}>REST TOKENS</Text>
           </View>
           <View style={styles.gridBox}>
              <Award color={COLORS.primaryFixed} size={24} style={{marginBottom: 8}}/>
              <Text style={styles.boxVal}>{streak}</Text>
              <Text style={styles.boxLabel}>ACTIVE FIRE</Text>
           </View>
           <View style={styles.gridBox}>
              <Target color={COLORS.primaryFixed} size={24} style={{marginBottom: 8}}/>
              <Text style={styles.boxVal}>{totalMissions}</Text>
              <Text style={styles.boxLabel}>TOTAL MISSIONS</Text>
           </View>
        </View>

        <View style={styles.chartContainer}>
           <Text style={styles.chartTitle}>7-DAY TRAJECTORY (COMPLETION %)</Text>
           <View style={styles.barGraph}>
              {last7DaysCompletions.map((rate, idx) => (
                 <View key={idx} style={styles.barWrapper}>
                    <View style={styles.barBg}>
                       <View style={[styles.barFill, { height: `${rate}%` }]} />
                    </View>
                    <Text style={styles.dayLabel}>-{6-idx}D</Text>
                 </View>
              ))}
           </View>
        </View>

        <View style={styles.infoBox}>
           <Text style={styles.infoTitle}>SYSTEM INTEGRITY</Text>
           <Text style={styles.infoText}>
              • Avoid streak resets by earning Rest Tokens. 
              {'\n'}• 1 Token is granted for every 7 consecutive days of logging operations.
              {'\n'}• Current Perfect Days: {perfectDaysCount}/7.
           </Text>
        </View>
     </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: SIZES.lg, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: SIZES.xl },
  title: { fontFamily: TYPOGRAPHY.display, color: COLORS.onSurface, fontSize: 32 },
  subtitle: { fontFamily: TYPOGRAPHY.body, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm },
  
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SIZES.xl },
  gridBox: { width: '48%', backgroundColor: COLORS.surfaceContainerLowest, padding: SIZES.md, alignItems: 'center', marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.surfaceContainerHighest },
  boxVal: { fontFamily: TYPOGRAPHY.display, color: COLORS.onSurface, fontSize: 28, marginBottom: 4 },
  boxLabel: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: 10, letterSpacing: 1 },

  chartContainer: { backgroundColor: COLORS.surfaceContainerLow, padding: SIZES.lg, marginBottom: SIZES.xl },
  chartTitle: { fontFamily: TYPOGRAPHY.label, color: COLORS.primaryFixed, fontSize: SIZES.xs, letterSpacing: 2, marginBottom: SIZES.lg },
  barGraph: { flexDirection: 'row', justifyContent: 'space-between', height: 150, alignItems: 'flex-end', paddingTop: 20 },
  barWrapper: { alignItems: 'center', width: '14%' },
  barBg: { height: 100, width: 10, backgroundColor: COLORS.surfaceContainerHighest, justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: COLORS.primaryFixed },
  dayLabel: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: 10, marginTop: SIZES.sm },

  infoBox: { backgroundColor: COLORS.surfaceContainerLowest, padding: SIZES.lg, borderLeftWidth: 4, borderLeftColor: COLORS.onSurfaceVariant },
  infoTitle: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurface, fontSize: SIZES.sm, letterSpacing: 1, marginBottom: SIZES.sm },
  infoText: { fontFamily: TYPOGRAPHY.body, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm, lineHeight: 22 }
});
