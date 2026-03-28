import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';
import { Trophy, Activity, Edit2, Save, Check, History } from 'lucide-react-native';
import { Mission } from '../types';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ProfileScreen() {
  const { userProfile, missions, streak, xpTotal, setUserProfile, resetJourneyWithNewGoal } = useAppStore();
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState(userProfile.goal);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(userProfile.name);

  // History Toggle
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const completedMissions = missions.filter(m => m.completed);
  
  const handleSaveGoal = () => {
    if (draftGoal.trim() === userProfile.goal) {
      setIsEditingGoal(false);
      return;
    }

    Alert.alert(
      "CONFIRM OVERRIDE",
      "Changing your core vector will permanently reset your current active mission progress and wipe the board clean to start Day 1.",
      [
        { text: "CANCEL", style: "cancel" },
        { 
          text: "EXECUTE RESET", 
          style: "destructive",
          onPress: () => {
             resetJourneyWithNewGoal(draftGoal.trim());
             setIsEditingGoal(false);
          }
        }
      ]
    );
  };

  const handleSaveName = () => {
    if (draftName.trim() !== userProfile.name && draftName.trim().length > 0) {
       setUserProfile({ name: draftName.trim() });
    } else {
       setDraftName(userProfile.name);
    }
    setIsEditingName(false);
  };

  const toggleHistory = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistoryExpanded(!historyExpanded);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{(draftName || userProfile.name).charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.nameRow}>
        {isEditingName ? (
           <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              selectionColor={COLORS.primaryFixed}
              onSubmitEditing={handleSaveName}
           />
        ) : (
           <Text style={styles.name}>{userProfile.name.toUpperCase()}</Text>
        )}
        <TouchableOpacity style={{ marginLeft: SIZES.sm, marginTop: -SIZES.xl }} onPress={isEditingName ? handleSaveName : () => setIsEditingName(true)}>
           {isEditingName ? <Save color={COLORS.primaryFixed} size={20} /> : <Edit2 color={COLORS.onSurfaceVariant} size={20} />}
        </TouchableOpacity>
      </View>
      
      {/* GOAL SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>VECTOR \> PRIMARY GOAL</Text>
          <TouchableOpacity onPress={isEditingGoal ? handleSaveGoal : () => setIsEditingGoal(true)}>
             {isEditingGoal ? <Save color={COLORS.primaryFixed} size={16} /> : <Edit2 color={COLORS.onSurfaceVariant} size={16} />}
          </TouchableOpacity>
        </View>

        {isEditingGoal ? (
           <TextInput
              style={styles.goalInput}
              value={draftGoal}
              onChangeText={setDraftGoal}
              multiline
              autoFocus
              selectionColor={COLORS.primaryFixed}
           />
        ) : (
           <Text style={styles.goalText}>{userProfile.goal}</Text>
        )}
      </View>

      {/* COACHING MODE */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>AI COACHING PROTOCOL</Text>
        <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, userProfile.aiMode === 'Aggressive' && styles.segmentBtnActive]}
              onPress={() => setUserProfile({ aiMode: 'Aggressive' })}
            >
              <Text style={[styles.segmentText, userProfile.aiMode === 'Aggressive' && styles.segmentTextActive]}>AGGRESSIVE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.segmentBtn, userProfile.aiMode === 'Calm' && styles.segmentBtnActive]}
              onPress={() => setUserProfile({ aiMode: 'Calm' })}
            >
              <Text style={[styles.segmentText, userProfile.aiMode === 'Calm' && styles.segmentTextActive]}>CALM</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.modeSubtext}>
          {userProfile.aiMode === 'Aggressive' 
            ? "BRUTALIST TONE. NO EXCUSES ACCEPTED. HIGH ACCOUNTABILITY."
            : "STOIC & RATIONAL. ENCOURAGING PROGRESS OVER PERFECTION."}
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Activity color={COLORS.primaryFixed} size={20} />
          <Text style={styles.statValue}>{streak}🔥</Text>
          <Text style={styles.statLabel}>STREAK</Text>
        </View>
        <View style={styles.statBox}>
           <Trophy color={COLORS.primaryFixed} size={20} />
          <Text style={styles.statValue}>{xpTotal}</Text>
          <Text style={styles.statLabel}>TOTAL XP</Text>
        </View>
      </View>

      {/* BADGES */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ACHIEVEMENT LOG (BADGES)</Text>
        {xpTotal === 0 ? (
          <Text style={styles.emptyText}>NO DATA. EXECUTE MISSIONS TO UNLOCK.</Text>
        ) : (
          <View style={styles.badgeRow}>
            {xpTotal > 0 && <View style={styles.badge}><Text style={styles.badgeText}>INITIATE</Text></View>}
            {xpTotal >= 500 && <View style={[styles.badge, {borderColor: COLORS.primaryFixed}]}><Text style={[styles.badgeText, {color: COLORS.primaryFixed}]}>GRINDER</Text></View>}
            {streak >= 7 && <View style={[styles.badge, {borderColor: COLORS.success}]}><Text style={[styles.badgeText, {color: COLORS.success}]}>UNBREAKABLE</Text></View>}
            {xpTotal >= 1500 && <View style={[styles.badge, {borderColor: COLORS.onSurface}]}><Text style={[styles.badgeText, {color: COLORS.onSurface}]}>VANGUARD</Text></View>}
          </View>
        )}
      </View>

      {/* HABIT HISTORY */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.historyHeaderRow} onPress={toggleHistory}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <History color={COLORS.onSurfaceVariant} size={16} />
               <Text style={[styles.sectionHeader, {marginBottom: 0, marginLeft: SIZES.sm}]}>OPERATIONAL HISTORY</Text>
            </View>
            <Text style={styles.historyCount}>{completedMissions.length} COMPLETED</Text>
        </TouchableOpacity>
        
        {historyExpanded && (
          <View style={styles.historyList}>
            {completedMissions.length === 0 ? (
              <Text style={styles.emptyText}>YOUR RECORD IS EMPTY.</Text>
            ) : (
              completedMissions.map((mission: Mission, index: number) => (
                <View key={index} style={styles.historyItem}>
                  <Check color={COLORS.success} size={14} />
                  <View style={styles.historyBody}>
                     <Text style={styles.historyTitle}>{mission.title}</Text>
                     <Text style={styles.historyDay}>Day 0{mission.dayAssigned} • +{mission.xpValue} XP</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

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
    marginBottom: SIZES.sm,
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
    marginBottom: SIZES.xl,
    letterSpacing: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  nameInput: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.primaryFixed,
    fontSize: 24,
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryFixed,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    minWidth: 150,
  },
  section: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionHeader: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    fontSize: SIZES.xs,
    letterSpacing: 1,
  },
  goalText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.onSurface,
    lineHeight: 22,
  },
  goalInput: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.primaryFixed,
    backgroundColor: COLORS.surfaceContainerHighest,
    padding: SIZES.md,
    lineHeight: 22,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryFixed,
  },

  segmentContainer: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHighest,
    marginBottom: SIZES.sm,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primaryFixed,
  },
  segmentText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.xs,
    letterSpacing: 1,
  },
  segmentTextActive: {
    color: COLORS.surface,
  },
  modeSubtext: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: SIZES.xs,
    fontStyle: 'italic',
  },

  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  statBox: {
    backgroundColor: COLORS.surfaceContainerLowest,
    width: '48%',
    padding: SIZES.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.surfaceContainerHighest,
  },
  statValue: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 32,
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
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.xs,
    letterSpacing: 1,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.sm,
    paddingVertical: SIZES.md,
  },

  historyHeaderRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
  },
  historyCount: {
     fontFamily: TYPOGRAPHY.label,
     color: COLORS.primaryFixed,
     fontSize: 10,
     letterSpacing: 1,
  },
  historyList: {
    marginTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHighest,
    paddingTop: SIZES.md,
  },
  historyItem: {
     flexDirection: 'row',
     alignItems: 'flex-start',
     marginBottom: SIZES.md,
  },
  historyBody: {
     marginLeft: SIZES.sm,
     flex: 1,
  },
  historyTitle: {
     fontFamily: TYPOGRAPHY.bodyMedium,
     color: COLORS.onSurface,
     fontSize: SIZES.sm,
  },
  historyDay: {
     fontFamily: TYPOGRAPHY.label,
     color: COLORS.onSurfaceVariant,
     fontSize: 10,
     marginTop: 4,
  }
});
