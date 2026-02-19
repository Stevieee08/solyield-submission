import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function Header({ title, showBack = false, onBack }: any) {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.card, paddingTop: Platform.OS === 'android' ? 30 : 0 }}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      
      <View style={[styles.container, { borderBottomColor: colors.border }]}>
        
        {/* LEFT SIDE */}
        <View style={styles.leftRow}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
              <Text style={[styles.pageTitle, { color: colors.text }]}>{title}</Text>
            </TouchableOpacity>
          ) : (
            // Just the Name (No Image)
            <Text style={[styles.name, { color: colors.text }]}>Hi, Arjun</Text>
          )}
        </View>

        {/* RIGHT SIDE: Theme Toggle */}
        <TouchableOpacity onPress={toggleTheme} style={[styles.toggleBtn, { backgroundColor: colors.tint }]}>
          <Ionicons 
              name={theme === 'dark' ? "sunny" : "moon"} 
              size={20} 
              color={theme === 'dark' ? "#FBBF24" : colors.primary} 
          />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12, // Reduced height
    paddingHorizontal: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', // Pushes items to corners
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: 'bold' }, // Larger, bolder text
  pageTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  toggleBtn: { padding: 8, borderRadius: 20 },
});