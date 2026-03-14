import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import ViewShot from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { schedule } from '../../constants/schedule';
import { sites } from '../../constants/sites';
import { chartData } from '../../constants/chart_data';
import { performanceData } from '../../constants/performance_data';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';

const screenWidth = Dimensions.get('window').width;
const chartContainerWidth = screenWidth - 64; 

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const processChartData = (textColor: string) => {
  if (!chartData || !Array.isArray(chartData)) return [];
  const flatData: any[] = [];
  chartData.forEach(month => {
    if (month.days) {
        month.days.forEach(day => {
            const date = new Date(day.date);
            const dayLabel = `${date.getUTCDate()} ${date.toLocaleString('default', { month: 'short', timeZone: 'UTC' })}`;
            flatData.push({
                value: day.energyGeneratedkWh,
                label: dayLabel,
                frontColor: '#2563EB',
                gradientColor: '#60A5FA',
                topLabelComponent: () => (
                    <Text style={{fontSize: 10, color: textColor, marginBottom: 4, fontWeight: 'bold'}}>
                        {day.energyGeneratedkWh}
                    </Text>
                )
            });
        });
    }
  });
  return flatData;
};

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, theme } = useTheme(); 
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  
  // Chart Refs for Screenshotting
  const barChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);
  
  const technician = { id: "tech_01", name: "Arjun" };
  const visit = schedule.find(v => v.id === id);
  const site = sites.find(s => s.id === visit?.siteId);

  if (!visit || !site) return <View style={[styles.center, {backgroundColor: colors.background}]}><Text style={{color: colors.text}}>Visit Not Found</Text></View>;

  const barData = processChartData(colors.text);
  const perfData = performanceData as any;
  const zeroEnergyVal = perfData?.['zeroEnergy Days'] || perfData?.zeroEnergyDays || 0;
  
  const pieData = [
    { value: perfData?.overPerformingDays || 0, color: '#4ADE80', text: String(perfData?.overPerformingDays || 0), label: 'Over Performing' },
    { value: perfData?.normalDays || 0, color: '#60A5FA', text: String(perfData?.normalDays || 0), label: 'Normal' },
    { value: perfData?.underPerformingDays || 0, color: '#FBBF24', text: String(perfData?.underPerformingDays || 0), label: 'Under Performing' },
    { value: zeroEnergyVal, color: '#F87171', text: String(zeroEnergyVal), label: 'Zero Energy' },
    { value: perfData?.daysNoData || 0, color: '#9CA3AF', text: String(perfData?.daysNoData || 0), label: 'No Data' },
  ].filter(item => item.value > 0);

  const handleCheckIn = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return setLoading(false);
    
    try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const distance = getDistanceFromLatLonInMeters(location.coords.latitude, location.coords.longitude, site.location.lat, site.location.lng);
        const ALLOWED_RADIUS = 500; 
        if (distance <= ALLOWED_RADIUS) {
            setCheckedIn(true);
            Alert.alert("✅ Verified", "You are at the site.");
        } else {
            Alert.alert("❌ Too Far", `You are ${Math.round(distance)}m away. You must be within 500m to check in.`);
        }
    } finally {
        setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
        // 1. Capture the charts as base64 images directly from the screen!
        const barBase64 = await barChartRef.current?.capture();
        const pieBase64 = await pieChartRef.current?.capture();

        // 2. Format them for HTML image tags
        const barChartImg = barBase64 ? `data:image/jpeg;base64,${barBase64}` : '';
        const pieChartImg = pieBase64 ? `data:image/jpeg;base64,${pieBase64}` : '';

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111827; background-color: white; }
              .header { text-align: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
              .title { color: #1E3A8A; margin: 0; font-size: 28px; }
              .subtitle { color: #6B7280; font-size: 14px; margin-top: 5px; }
              .section { margin-bottom: 40px; }
              .section h2 { border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; color: #374151; font-size: 20px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .card { background: #F9FAFB; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; }
              .card strong { color: #374151; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
              .card span { font-size: 16px; color: #111827; }
              .chart-container { width: 100%; margin: 20px auto; text-align: center; }
              .chart-container img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #E5E7EB; padding: 10px; }
              .badge-success { color: #047857; background: #D1FAE5; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
              .badge-error { color: #B91C1C; background: #FEE2E2; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Inspection & Performance Report</h1>
              <p class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <div class="section">
              <h2>1. Personnel & Site Details</h2>
              <div class="grid">
                <div class="card"><strong>Technician Name</strong><span>${technician.name}</span></div>
                <div class="card"><strong>Technician ID</strong><span>${technician.id}</span></div>
                <div class="card"><strong>Site Name</strong><span>${site.name}</span></div>
                <div class="card"><strong>Site Capacity</strong><span>${site.capacity}</span></div>
                <div class="card"><strong>Assigned Task</strong><span>${visit.title}</span></div>
                <div class="card"><strong>Geographic Coordinates</strong><span>Lat: ${site.location.lat}, Lng: ${site.location.lng}</span></div>
                <div class="card" style="grid-column: span 2;">
                    <strong>Geofence Verification Status</strong>
                    <span class="${checkedIn ? 'badge-success' : 'badge-error'}">
                        ${checkedIn ? '✅ Verified On-Site via GPS' : '❌ Not Verified (Check-in Required)'}
                    </span>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>2. Daily Generation Data (kWh)</h2>
              <div class="chart-container">
                <img src="${barChartImg}" alt="Daily Generation Bar Chart" />
              </div>
            </div>

            <div class="section">
              <h2>3. Performance Breakdown (Days)</h2>
              <div class="chart-container">
                <img src="${pieChartImg}" alt="Performance Pie Chart" style="max-width: 400px;" />
              </div>
              <div class="grid" style="margin-top: 20px;">
                 <div class="card"><strong>Over Performing</strong><span>${perfData?.overPerformingDays || 0}</span></div>
                 <div class="card"><strong>Normal</strong><span>${perfData?.normalDays || 0}</span></div>
                 <div class="card"><strong>Under Performing</strong><span>${perfData?.underPerformingDays || 0}</span></div>
                 <div class="card"><strong>Zero Energy</strong><span>${zeroEnergyVal}</span></div>
                 <div class="card"><strong>No Data</strong><span>${perfData?.daysNoData || 0}</span></div>
              </div>
            </div>
          </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);

    } catch (error) {
        Alert.alert("Error", "Could not generate PDF");
        console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Visit Details" showBack onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
            <Text style={{color: 'white', fontSize: 22, fontWeight: 'bold'}}>{site.name}</Text>
            <Text style={{color: 'rgba(255,255,255,0.8)', marginTop: 4}}>{site.capacity} • {visit.title}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: theme === 'dark' ? '#000' : '#ccc' }]}>
            <View style={styles.cardRow}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Technician Status</Text>
                {checkedIn && <Ionicons name="checkmark-circle" size={24} color={colors.success} />}
            </View>
            {checkedIn ? (
                <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Text style={{color: colors.success, fontWeight: 'bold'}}>✅ Verified On-Site</Text>
                </View>
            ) : (
                <TouchableOpacity onPress={handleCheckIn} disabled={loading} style={[styles.button, { backgroundColor: colors.primary }]}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>📍 I'm Here (Check In)</Text>}
                </TouchableOpacity>
            )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, overflow: 'hidden' }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Generation (kWh)</Text>
            <View style={{ marginTop: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
                  {/* WRAP THE BARCHART */}
                  <ViewShot ref={barChartRef} options={{ format: 'jpg', quality: 0.8, result: 'base64' }}>
                    <BarChart
                        data={barData} barWidth={32} spacing={24} roundedTop hideRules xAxisThickness={1} xAxisColor={colors.subText}
                        yAxisThickness={0} yAxisTextStyle={{color: colors.subText}} noOfSections={4} maxValue={60} height={200}
                        width={chartContainerWidth} xAxisLabelTextStyle={{color: colors.subText, fontSize: 11}}
                    />
                  </ViewShot>
                </ScrollView>
            </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Performance Breakdown (Days)</Text>
            <View style={{alignItems: 'center', marginVertical: 10}}>
                {/* WRAP THE PIECHART */}
                <ViewShot ref={pieChartRef} options={{ format: 'jpg', quality: 0.8, result: 'base64' }}>
                  <PieChart data={pieData} radius={100} showText textSize={14} fontWeight="bold" strokeWidth={2} strokeColor={colors.card} />
                </ViewShot>
                <View style={styles.legendContainer}>
                    {pieData.map((p, i) => (
                        <View key={i} style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: p.color }]} />
                            <Text style={{color: colors.subText, fontSize: 12}}>{p.label}: </Text>
                            <Text style={{color: colors.text, fontWeight: 'bold', fontSize: 12}}>{p.text}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>

        <TouchableOpacity onPress={() => router.push(`/form/${id}`)} style={[styles.button, { backgroundColor: colors.warning }]}>
            <Ionicons name="clipboard" size={20} color="white" style={{marginRight: 8}} />
            <Text style={styles.btnText}>Start Maintenance Checklist</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={generatePDF} style={[styles.button, { backgroundColor: colors.text, marginTop: 16, marginBottom: 40 }]}>
            <Text style={[styles.btnText, { color: colors.background }]}>Generate PDF Report</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16, shadowOffset:{width:0, height:2}, shadowOpacity:0.1, elevation:2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  badge: { padding: 12, borderRadius: 8, alignItems: 'center' },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  legendContainer: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginRight: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
});