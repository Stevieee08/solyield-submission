import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Calendar from 'expo-calendar';

import { schedule } from '../../constants/schedule';
import { sites } from '../../constants/sites';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';

export default function AgendaScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { colors, theme } = useTheme();

  // Combine schedule and site data
  const data = schedule.map(visit => {
    const site = sites.find(s => s.id === visit.siteId);
    return { ...visit, siteName: site ? site.name : "Unknown Site" };
  });

  // Syncs to Calendar AND opens the native app
  const addToCalendar = async (visit: any) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Calendar permissions are required.');
        return;
      }

      let calendarId;
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const primaryCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
        if (!primaryCalendar) {
          Alert.alert('Error', 'No calendar found on this device.');
          return;
        }
        calendarId = primaryCalendar.id;
      }

      const startDate = visit.date ? new Date(visit.date) : new Date(); 
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); 

      await Calendar.createEventAsync(calendarId, {
        title: `Site Visit: ${visit.siteName}`,
        startDate: startDate,
        endDate: endDate,
        notes: `Task: ${visit.title}\nAssigned via Field App`,
        timeZone: 'Asia/Kolkata', 
      });

      Alert.alert('✅ Added to Calendar', 'Event synced successfully!', [
        { text: 'Stay Here', style: 'cancel' },
        { 
          text: 'Open Google Calendar', 
          onPress: () => {
             // Open the specific calendar event time natively
             if (Platform.OS === 'ios') {
                 Linking.openURL('calshow:' + (startDate.getTime() / 1000));
             } else if (Platform.OS === 'android') {
                 Linking.openURL('content://com.android.calendar/time/' + startDate.getTime());
             }
          }
        }
      ]);

    } catch (error) {
      console.error('Calendar Error: ', error);
      Alert.alert('Error', 'Could not sync the event to your calendar.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/visit/${item.id}`)}>
      <LinearGradient 
        colors={[colors.cardGradientStart, colors.cardGradientEnd]} 
        style={[styles.card, { borderColor: colors.border }]}
      >
        {/* Date & Time Row */}
        <View style={styles.cardHeader}>
            <View style={styles.dateRow}>
                <Ionicons name="calendar" size={16} color={colors.primary} style={{marginRight: 6}} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                    {format(new Date(item.date), 'EEE, dd MMM yyyy')}
                </Text>
            </View>
            <View style={[styles.timeBadge, { backgroundColor: colors.tint }]}>
                <Text style={[styles.timeText, { color: colors.primary }]}>{item.time}</Text>
            </View>
        </View>
        
        {/* Main Content */}
        <View style={styles.cardBody}>
            <Text style={[styles.siteName, { color: colors.text }]}>{item.siteName}</Text>
            <View style={styles.taskRow}>
                <Ionicons name="briefcase-outline" size={14} color={colors.subText} style={{marginRight: 6}} />
                <Text style={[styles.visitTitle, { color: colors.subText }]}>{item.title}</Text>
            </View>
        </View>

        {/* Action Row */}
        <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
            {/* Calendar Button */}
            <TouchableOpacity onPress={() => addToCalendar(item)} style={styles.calendarBtn}>
                <Ionicons name="add-circle-outline" size={18} color={colors.subText} style={{marginRight:4}} />
                <Text style={[styles.actionText, { color: colors.subText }]}>Calendar</Text>
            </TouchableOpacity>

            <View style={[styles.detailsBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.detailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
            </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Visits</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>You have {data.length} tasks scheduled</Text>
        
        <FlatList 
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={colors.primary}/>}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flex: 1 },
  sectionTitle: { fontFamily: 'Jakarta-Bold', fontSize: 28, marginBottom: 4 },
  subtitle: { fontFamily: 'Jakarta-Regular', fontSize: 15, marginBottom: 24 },
  
  card: {
    borderRadius: 24, marginBottom: 16, borderWidth: 1, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Jakarta-SemiBold', fontSize: 14 },
  timeBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  timeText: { fontFamily: 'Jakarta-Bold', fontSize: 12 },
  
  cardBody: { marginBottom: 20 },
  siteName: { fontFamily: 'Jakarta-Bold', fontSize: 20, marginBottom: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  visitTitle: { fontFamily: 'Jakarta-Regular', fontSize: 14 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  actionText: { fontFamily: 'Jakarta-SemiBold', fontSize: 14 },
  
  detailsBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  detailsText: { fontFamily: 'Jakarta-Bold', fontSize: 13, color: 'white', marginRight: 4 }
});