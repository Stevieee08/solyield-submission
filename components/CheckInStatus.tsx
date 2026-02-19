import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CheckInStatusProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isWithinRange: boolean;
}

export default function CheckInStatus({
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  isWithinRange,
}: CheckInStatusProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: isCheckedIn ? '#4CAF50' : '#FF5252' }
        ]} />
        <Text style={styles.statusText}>
          {isCheckedIn ? 'Checked In' : 'Not Checked In'}
        </Text>
      </View>

      {!isCheckedIn && isWithinRange && (
        <TouchableOpacity style={styles.checkInButton} onPress={onCheckIn}>
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
      )}

      {isCheckedIn && (
        <TouchableOpacity style={styles.checkOutButton} onPress={onCheckOut}>
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      )}

      {!isWithinRange && !isCheckedIn && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            You must be within 500m of the site to check in
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkOutButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  warningText: {
    color: '#F57C00',
    fontSize: 14,
    textAlign: 'center',
  },
});
