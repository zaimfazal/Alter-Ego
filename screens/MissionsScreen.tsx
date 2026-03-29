import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SIZES } from '../constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Check, Lock, Camera, RefreshCw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Calendar } from 'react-native-calendars';
import { Mission } from '../types';
import { regenerateSingleMission } from '../api/openai';

export default function MissionsScreen() {
  const { userProfile, missions, activeRestDays, updateMissionProgress, startDate, replaceMission } = useAppStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingMissionId, setLoadingMissionId] = useState<string | null>(null);

  // Calculate current day
  const now = new Date();
  const start = startDate ? new Date(startDate) : now;
  now.setHours(0,0,0,0);
  start.setHours(0,0,0,0);
  const currentDay = Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Compute marked dates for Calendar
  const markedDates: any = {};
  if (startDate) {
    for (let i = 0; i < Math.max(currentDay, 7); i++) {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const dayMissions = missions.filter(m => m.dayAssigned === i + 1);
        
        if (dayMissions.length > 0) {
           const allCompleted = dayMissions.every(m => m.completed);
           let dColor = COLORS.primaryFixed; 
           
           if (activeRestDays.includes(dateStr)) {
              dColor = '#2196F3'; // Blue for Rest Days
           } else {
              if (i + 1 < currentDay) dColor = allCompleted ? COLORS.success : COLORS.error; 
              if (i + 1 === currentDay) dColor = allCompleted ? COLORS.success : COLORS.primaryFixed;
           }
           
           markedDates[dateStr] = {
              marked: true,
              dotColor: dColor,
           };
        }
    }
  }

  // Group missions by Day Assigned
  const groupedMissions = missions.reduce((acc, mission) => {
    const day = `DAY 0${mission.dayAssigned}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(mission);
    return acc;
  }, {} as Record<string, Mission[]>);

  const sections = Object.keys(groupedMissions)
    .sort((a, b) => a.localeCompare(b))
    .map(key => ({
      title: key,
      data: groupedMissions[key],
      dayNumber: parseInt(key.replace('DAY 0', '').replace('DAY ', ''))
    }));

  const handleCaptureProofAndComplete = async (mission: Mission) => {
    if (mission.completed) return;

    if (mission.proofRequired) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('PERMISSION DENIED', 'Your Alter Ego requires camera access to verify proof of work.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const tempUri = result.assets[0].uri;
        const fileName = `proof_${mission.id}_${Date.now()}.jpg`;
        const permanentUri = (FileSystem.documentDirectory || '') + fileName;
        
        try {
           await FileSystem.copyAsync({
             from: tempUri,
             to: permanentUri
           });
           updateMissionProgress(mission.id, mission.totalSegments, permanentUri);
           triggerCompletion();
        } catch (e) {
           Alert.alert('SYSTEM ERROR', 'Failed to securely store photographic proof.');
        }
      } else {
         Alert.alert('EXCUSE REJECTED', 'You must capture proof to complete this mission.');
      }
    } else {
       updateMissionProgress(mission.id, mission.totalSegments);
       triggerCompletion();
    }
  };

  const triggerCompletion = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleReroll = async (mission: Mission) => {
    setLoadingMissionId(mission.id);
    const newMissionData = await regenerateSingleMission(userProfile, mission);
    if (newMissionData) {
       replaceMission(mission.id, { ...mission, ...newMissionData } as Mission);
    } else {
       Alert.alert("COMS ERROR", "Failed to retrieve alternative objective.");
    }
    setLoadingMissionId(null);
  };

  const renderMission = ({ item, section }: { item: Mission, section: any }) => {
    const isLocked = section.dayNumber > currentDay;
    const canReroll = !isLocked && !item.completed && !item.isCustomHabit;

    return (
      <TouchableOpacity 
        style={[
          styles.missionCard, 
          item.completed && styles.missionCardCompleted,
          isLocked && styles.missionCardLocked
        ]}
        disabled={isLocked || item.completed || loadingMissionId === item.id}
        onPress={() => handleCaptureProofAndComplete(item)}
      >
        <View style={styles.missionHeader}>
          <Text style={[styles.missionTitle, isLocked && styles.textLocked]}>
             {loadingMissionId === item.id ? "CALCULATING ALTERNATIVE..." : item.title}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             {canReroll && (
                <TouchableOpacity onPress={() => handleReroll(item)} style={{marginRight: SIZES.sm}}>
                   <RefreshCw size={16} color={COLORS.primaryFixed} />
                </TouchableOpacity>
             )}
             <Text style={[styles.xpPill, isLocked && styles.textLocked]}>{item.xpValue} XP</Text>
          </View>
        </View>
        <Text style={[styles.missionDesc, isLocked && styles.textLocked]}>
          {loadingMissionId === item.id ? "Transmitting new parameters from Central Server..." : item.description}
        </Text>
        
        <View style={styles.footerRow}>
          {isLocked ? (
            <View style={styles.statusBadge}>
              <Lock size={14} color={COLORS.onSurfaceVariant} style={{marginRight: 6}} />
              <Text style={styles.statusTextLocked}>LOCKED</Text>
            </View>
          ) : item.completed ? (
            <View style={[styles.statusBadge, {borderColor: COLORS.success, backgroundColor: '#0A2E1F'}]}>
               <Check size={14} color={COLORS.success} style={{marginRight: 6}} />
               <Text style={[styles.statusTextLocked, {color: COLORS.success}]}>VERIFIED</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, {borderColor: COLORS.primaryFixed, backgroundColor: COLORS.primaryFixedDim}]}>
               {item.proofRequired && <Camera size={14} color={COLORS.primaryFixed} style={{marginRight: 6}} />}
               <Text style={[styles.statusTextLocked, {color: COLORS.primaryFixed}]}>
                  {item.proofRequired ? "REQUIRES PROOF" : "INCOMPLETE"}
               </Text>
            </View>
          )}

          {item.completed && item.proofSubmitted && (
             <Image source={{uri: item.proofSubmitted}} style={styles.proofThumbnail} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <View style={styles.calendarContainer}>
       <Text style={styles.calendarTitle}>OPERATIONAL TIMELINE</Text>
       <Calendar
         markedDates={markedDates}
         theme={{
            calendarBackground: COLORS.surfaceContainerLowest,
            textSectionTitleColor: COLORS.onSurfaceVariant,
            dayTextColor: COLORS.onSurface,
            todayTextColor: COLORS.primaryFixed,
            monthTextColor: COLORS.primaryFixed,
            indicatorColor: COLORS.primaryFixed,
            textDayFontFamily: TYPOGRAPHY.body,
            textMonthFontFamily: TYPOGRAPHY.label,
            textDayHeaderFontFamily: TYPOGRAPHY.label,
            textMonthFontWeight: 'bold',
            arrowColor: COLORS.primaryFixed,
         }}
       />
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        ListHeaderComponent={renderListHeader}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderMission}
        renderSectionHeader={({ section: { title, dayNumber } }) => (
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>{title}</Text>
             {dayNumber === currentDay && <Text style={styles.activeTag}>TODAY</Text>}
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon count={100} origin={{ x: -10, y: 0 }} colors={[COLORS.primaryFixed, COLORS.surfaceContainerHighest, '#FFFFFF']} fallSpeed={2500} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  listContent: { padding: SIZES.lg, paddingBottom: 100 },
  
  calendarContainer: {
     backgroundColor: COLORS.surfaceContainerLowest,
     padding: SIZES.sm,
     marginBottom: SIZES.lg,
     borderWidth: 1,
     borderColor: COLORS.surfaceContainerHighest,
  },
  calendarTitle: {
     fontFamily: TYPOGRAPHY.label,
     color: COLORS.primaryFixed,
     fontSize: SIZES.xs,
     letterSpacing: 2,
     marginBottom: SIZES.md,
     marginLeft: SIZES.xs,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    paddingBottom: SIZES.xs,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 24,
    marginRight: SIZES.sm,
  },
  activeTag: {
    fontFamily: TYPOGRAPHY.label,
    backgroundColor: COLORS.primaryFixed,
    color: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    letterSpacing: 2,
  },

  missionCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHighest,
  },
  missionCardCompleted: {
    backgroundColor: COLORS.surfaceContainerHigh,
    opacity: 0.8,
  },
  missionCardLocked: {
    opacity: 0.4,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.xs,
  },
  missionTitle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.headline,
    color: COLORS.onSurface,
    fontSize: SIZES.md,
    marginRight: SIZES.md,
  },
  xpPill: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    fontSize: SIZES.xs,
    letterSpacing: 1,
  },
  missionDesc: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    fontSize: SIZES.sm,
    lineHeight: 20,
    marginBottom: SIZES.md,
  },
  textLocked: {
    color: COLORS.onSurfaceVariant,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  statusTextLocked: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    letterSpacing: 1,
  },
  proofThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  }
});
