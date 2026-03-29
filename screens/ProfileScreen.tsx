import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';
import { Trophy, Activity, Edit2, Save, Check, History, Trash2, Plus, ShieldAlert } from 'lucide-react-native';
import { Mission } from '../types';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ProfileScreen() {
  const { userProfile, customHabits, restTokens, missions, streak, xpTotal, perfectDaysCount, setUserProfile, addGoal, removeGoal, addCustomHabit, removeCustomHabit } = useAppStore();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(userProfile.name);

  const [newGoal, setNewGoal] = useState('');
  const [newHabit, setNewHabit] = useState('');

  // History Toggle
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const completedMissions = missions.filter(m => m.completed);
  
  const handleSaveName = () => {
    if (draftName.trim() !== userProfile.name && draftName.trim().length > 0) {
       setUserProfile({ name: draftName.trim() });
    } else {
       setDraftName(userProfile.name);
    }
    setIsEditingName(false);
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  const handleAddHabit = () => {
    if (newHabit.trim()) {
      addCustomHabit(newHabit.trim());
      setNewHabit('');
    }
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
      
      {/* AI TONE SECTION */}
      <View style={[styles.section, {marginBottom: SIZES.lg}]}>
        <Text style={styles.sectionHeader}>AI COACHING PROTOCOL</Text>
        <View style={styles.toggleRow}>
           <TouchableOpacity 
             style={[styles.toggleBtn, userProfile.aiMode === 'Aggressive' && styles.toggleActive]}
             onPress={() => setUserProfile({ aiMode: 'Aggressive' })}
           >
              <Text style={[styles.toggleText, userProfile.aiMode === 'Aggressive' && styles.toggleTextActive]}>AGGRESSIVE</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.toggleBtn, userProfile.aiMode === 'Calm' && styles.toggleActive]}
             onPress={() => setUserProfile({ aiMode: 'Calm' })}
           >
              <Text style={[styles.toggleText, userProfile.aiMode === 'Calm' && styles.toggleTextActive]}>CALM</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* GOALS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PRIMARY OBJECTIVES</Text>
        {userProfile.goals.map((g, index) => (
           <View key={index} style={styles.listItem}>
               <Text style={styles.listText}>{g}</Text>
               <TouchableOpacity onPress={() => removeGoal(index)}>
                  <Trash2 color={COLORS.error} size={18} />
               </TouchableOpacity>
           </View>
        ))}
        <View style={styles.addInputRow}>
           <TextInput
              style={styles.addInput}
              placeholder="Add new objective..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={newGoal}
              onChangeText={setNewGoal}
              onSubmitEditing={handleAddGoal}
           />
           <TouchableOpacity style={styles.addBtn} onPress={handleAddGoal}>
              <Plus color={COLORS.primary} size={20} />
           </TouchableOpacity>
        </View>
      </View>

      {/* CUSTOM HABITS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CORE CONSTANTS (DAILY)</Text>
        {customHabits.map((h, index) => (
           <View key={index} style={styles.listItem}>
               <Activity color={COLORS.primaryFixed} size={14} style={{marginRight: 8}}/>
               <Text style={styles.listText}>{h}</Text>
               <TouchableOpacity onPress={() => removeCustomHabit(index)}>
                  <Trash2 color={COLORS.error} size={18} />
               </TouchableOpacity>
           </View>
        ))}
        {customHabits.length === 0 && (
           <Text style={styles.emptyText}>No core habits defined. AI will only focus on objectives.</Text>
        )}
        <View style={styles.addInputRow}>
           <TextInput
              style={styles.addInput}
              placeholder="E.g. Drink 1 Gallon of Water"
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={newHabit}
              onChangeText={setNewHabit}
              onSubmitEditing={handleAddHabit}
           />
           <TouchableOpacity style={styles.addBtn} onPress={handleAddHabit}>
              <Plus color={COLORS.primary} size={20} />
           </TouchableOpacity>
        </View>
      </View>

      {/* STATISTICS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Trophy color={COLORS.primaryFixed} size={28} style={{ marginBottom: SIZES.sm }} />
          <Text style={styles.statValue}>{xpTotal}</Text>
          <Text style={styles.statLabel}>LIFETIME XP</Text>
        </View>
        <View style={styles.statBox}>
          <Activity color={COLORS.primaryFixed} size={28} style={{ marginBottom: SIZES.sm }} />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
        <View style={styles.statBox}>
          <ShieldAlert color={COLORS.primaryFixed} size={28} style={{ marginBottom: SIZES.sm }} />
          <Text style={styles.statValue}>{restTokens}</Text>
          <Text style={styles.statLabel}>REST TOKENS</Text>
        </View>
      </View>

      <Text style={[styles.emptyText, {textAlign: 'center', marginBottom: SIZES.xl}]}>
         {7 - perfectDaysCount} perfect days until next Rest Token.
      </Text>

      {/* OPERATIONAL HISTORY LIST */}
      <TouchableOpacity style={styles.historyHeader} onPress={toggleHistory} activeOpacity={0.8}>
         <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <History color={COLORS.onSurfaceVariant} size={20} style={{marginRight: 8}}/>
            <Text style={styles.sectionHeader}>OPERATIONAL HISTORY</Text>
         </View>
         <Text style={{color: COLORS.primaryFixed, fontFamily: TYPOGRAPHY.label}}>{completedMissions.length} COMPLETED</Text>
      </TouchableOpacity>

      {historyExpanded && (
         <View style={styles.historyList}>
            {completedMissions.length === 0 ? (
               <Text style={styles.emptyText}>NO VERIFIED COMBAT LOGS FOUND.</Text>
            ) : (
               completedMissions.map(m => (
                  <View key={m.id} style={styles.historyItem}>
                     <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                        <Check color={COLORS.success} size={16} style={{marginRight: 8}} />
                        <Text style={styles.historyTitle}>{m.title}</Text>
                     </View>
                     <Text style={styles.historyDate}>DAY {m.dayAssigned}</Text>
                  </View>
               )).reverse()
            )}
         </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: SIZES.lg, paddingTop: 60, paddingBottom: 100, alignItems: 'center' },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 0,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.md, borderWidth: 2, borderColor: COLORS.primaryFixed,
  },
  avatarInitial: { fontFamily: TYPOGRAPHY.display, fontSize: 40, color: COLORS.primaryFixed },
  
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.xl },
  name: { fontFamily: TYPOGRAPHY.display, fontSize: 32, color: COLORS.onSurface },
  nameInput: {
    fontFamily: TYPOGRAPHY.display, fontSize: 32, color: COLORS.onSurface,
    borderBottomWidth: 1, borderBottomColor: COLORS.primaryFixed, minWidth: 150, textAlign: 'center'
  },
  
  section: { width: '100%', marginBottom: SIZES.xl },
  sectionHeader: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm, letterSpacing: 2, marginBottom: SIZES.sm },

  listItem: {
     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
     padding: SIZES.md, backgroundColor: COLORS.surfaceContainerLowest,
     borderLeftWidth: 2, borderLeftColor: COLORS.primaryFixed,
     marginBottom: SIZES.sm
  },
  listText: { fontFamily: TYPOGRAPHY.body, color: COLORS.onSurface, flex: 1 },
  
  addInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.xs },
  addInput: {
     flex: 1, backgroundColor: COLORS.surfaceContainerLow, padding: SIZES.md,
     fontFamily: TYPOGRAPHY.body, color: COLORS.onSurface,
  },
  addBtn: {
     backgroundColor: COLORS.primaryFixed, padding: SIZES.md,
     justifyContent: 'center', alignItems: 'center'
  },

  emptyText: { fontFamily: TYPOGRAPHY.body, color: COLORS.onSurfaceVariant, fontSize: SIZES.sm, fontStyle: 'italic', marginVertical: SIZES.sm },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: SIZES.md },
  statBox: {
    backgroundColor: COLORS.surfaceContainerLowest, padding: SIZES.md,
    alignItems: 'center', width: '31%', borderWidth: 1, borderColor: COLORS.surfaceContainerHighest,
  },
  statValue: { fontFamily: TYPOGRAPHY.display, fontSize: 24, color: COLORS.onSurface, marginBottom: 4 },
  statLabel: { fontFamily: TYPOGRAPHY.label, fontSize: 10, color: COLORS.onSurfaceVariant, letterSpacing: 1 },

  toggleRow: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.xs },
  toggleBtn: { flex: 1, padding: SIZES.md, backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 1, borderColor: COLORS.surfaceContainerHigh, alignItems: 'center' },
  toggleActive: { backgroundColor: COLORS.primaryFixed, borderColor: COLORS.primaryFixed },
  toggleText: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant },
  toggleTextActive: { color: COLORS.primary },

  historyHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceContainerHigh },
  historyList: { width: '100%', marginTop: SIZES.md },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.md, backgroundColor: COLORS.surfaceContainerLowest, marginBottom: 2 },
  historyTitle: { fontFamily: TYPOGRAPHY.bodyMedium, color: COLORS.onSurfaceVariant, flex: 1 },
  historyDate: { fontFamily: TYPOGRAPHY.label, color: COLORS.onSurfaceVariant, fontSize: 10 },
});
