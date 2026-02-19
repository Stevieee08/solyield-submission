import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface Visit {
  id: string;
  siteName: string;
  date: string;
  status: 'pending' | 'completed' | 'in-progress';
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

interface VisitCardProps {
  visit: Visit;
}

export default function VisitCard({ visit }: VisitCardProps) {
  const router = useRouter();

  const getStatusColor = () => {
    switch (visit.status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (visit.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/visit/${visit.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.siteName}>{visit.siteName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.date}>{visit.date}</Text>
        {visit.isCheckedIn && (
          <Text style={styles.checkInStatus}>Checked In</Text>
        )}
      </View>

      {visit.checkInTime && (
        <Text style={styles.timeInfo}>
          Check-in: {new Date(visit.checkInTime).toLocaleTimeString()}
        </Text>
      )}
      
      {visit.checkOutTime && (
        <Text style={styles.timeInfo}>
          Check-out: {new Date(visit.checkOutTime).toLocaleTimeString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  checkInStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  timeInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
