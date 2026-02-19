import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { sites } from '../../constants/sites';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { colors, theme, fontFamily } = useTheme();
  const [selectedSite, setSelectedSite] = useState<any>(null);

  const handleNavigate = () => {
    if(!selectedSite) return;
    const { lat, lng } = selectedSite.location;
    const label = selectedSite.name;
    
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header title="Map Navigation" />
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          userInterfaceStyle={theme}
          initialRegion={{
            latitude: 20.5937, longitude: 78.9629,
            latitudeDelta: 15, longitudeDelta: 15,
          }}
          onPress={() => setSelectedSite(null)} // Deselect when clicking map
        >
          {sites.map((site) => (
              <Marker
                  key={site.id}
                  coordinate={{ latitude: site.location.lat, longitude: site.location.lng }}
                  onPress={() => setSelectedSite(site)}
                  pinColor={selectedSite?.id === site.id ? colors.primary : 'red'}
              />
          ))}
        </MapView>

        {/* FLOATING ACTION CARD (VISIBLE NAVIGATION) */}
        {selectedSite ? (
           <View style={[styles.bottomCard, { backgroundColor: colors.card }]}>
              <View>
                  <Text style={[styles.siteTitle, { color: colors.text, fontFamily }]}>{selectedSite.name}</Text>
                  <Text style={[styles.siteSub, { color: colors.subText, fontFamily }]}>{selectedSite.capacity}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={handleNavigate}
              >
                  <Ionicons name="navigate" size={20} color="white" style={{marginRight: 6}} />
                  <Text style={[styles.navText, { fontFamily }]}>GO</Text>
              </TouchableOpacity>
           </View>
        ) : (
           // Default Info when nothing selected
           <View style={[styles.infoPill, { backgroundColor: colors.card }]}>
              <Text style={{color: colors.text, fontFamily, fontSize: 12}}>Tap a pin to navigate</Text>
           </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1, overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  map: { width: '100%', height: '100%' },
  
  // Floating Bottom Card
  bottomCard: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    width: width - 40, padding: 16, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.2, elevation: 6
  },
  siteTitle: { fontSize: 16, fontWeight: 'bold' },
  siteSub: { fontSize: 12, marginTop: 2 },
  
  navButton: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center'
  },
  navText: { color: 'white', fontWeight: 'bold' },

  infoPill: {
    position: 'absolute', top: 20, alignSelf: 'center',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.1, elevation: 3
  }
});