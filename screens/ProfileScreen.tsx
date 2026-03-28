import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES, RADIUS } from '../constants/theme';
import { Trophy, Activity, Target } from 'lucide-react-native';

export default function ProfileScreen() {
  const { userProfile, alignmentScore, missions } = useAppStore();

  const completedCount = missions.filter(m => m.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{userProfile.name.charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.name}>{userProfile.name.toUpperCase()}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>VECTOR \> 10-YEAR OBJECTIVE</Text>
        <Text style={styles.goalText}>{userProfile.tenYearGoal}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Target color={COLORS.onSurfaceVariant} size={20} />
          <Text style={styles.statValue}>{alignmentScore}</Text>
          <Text style={styles.statLabel}>ALIGNMENT</Text>
        </View>
        <View style={styles.statBox}>
          <Activity color={COLORS.onSurfaceVariant} size={20} />
          <Text style={styles.statValue}>{missions.length}</Text>
          <Text style={styles.statLabel}>DIRECTIVES</Text>
        </View>
        <View style={styles.statBox}>
          <Trophy color={COLORS.onSurfaceVariant} size={20} />
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>ACHIEVEMENTS</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ACHIEVEMENT LOG (BADGES)</Text>
        {completedCount === 0 ? (
          <Text style={styles.emptyText}>NO DATA. EXECUTE MISSIONS TO UNLOCK.</Text>
        ) : (
          <View style={styles.badgeRow}>
            {completedCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>INIT</Text></View>}
            {completedCount >= 3 && <View style={[styles.badge, {borderColor: COLORS.primaryFixed}]}><Text style={[styles.badgeText, {color: COLORS.primaryFixed}]}>SENTINEL</Text></View>}
            {completedCount >= 10 && <View style={[styles.badge, {borderColor: COLORS.success}]}><Text style={[styles.badgeText, {color: COLORS.success}]}>MASTER</Text></View>}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.dangerButton}>
        <Text style={styles.dangerText}>SYSTEM.RESET()</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SIZES.lg,
    alignItems: 'center',
    paddingBottom: 100,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceContainerHighest,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  avatarInitial: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 40,
  },
  name: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.primaryFixed,
    fontSize: 24,
    marginBottom: SIZES.xxl,
    letterSpacing: 2,
  },
  section: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    fontSize: SIZES.xs,
    letterSpacing: 1,
    marginBottom: SIZES.md,
  },
  goalText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.onSurface,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  statBox: {
    backgroundColor: COLORS.surfaceContainerLowest,
    width: '31%',
    padding: SIZES.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.surfaceContainerHighest,
  },
  statValue: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 24,
    marginVertical: SIZES.xs,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.xs,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.sm,
  },
  dangerButton: {
    marginTop: SIZES.xl,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error,
  },
  dangerText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.error,
    letterSpacing: 2,
  },
});
