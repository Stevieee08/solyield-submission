import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formSchema } from '../../constants/form_schema';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Hook

export default function DynamicFormScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme(); // Get Current Theme Colors
  const [formData, setFormData] = useState<Record<string, any>>({});

  // --- 1. HANDLE TEXT/CHOICE INPUT ---
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // --- 2. HANDLE IMAGE UPLOAD (Multi-Select) ---
  const handleImagePick = async (fieldId: string, type: 'Capture' | 'Upload') => {
    // Check Permissions
    if (type === 'Capture') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Permission Denied", "Camera access needed.");
    } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert("Permission Denied", "Gallery access needed.");
    }

    let result;
    if (type === 'Capture') {
        result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });
    } else {
        result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, 
            quality: 0.5,
        });
    }

    if (!result.canceled) {
        const currentImages = formData[fieldId] || [];
        const newImages = result.assets.map(asset => asset.uri);
        handleInputChange(fieldId, [...currentImages, ...newImages]);
    }
  };

  const removeImage = (fieldId: string, uriToRemove: string) => {
    const currentImages = formData[fieldId] || [];
    const updatedImages = currentImages.filter((uri: string) => uri !== uriToRemove);
    handleInputChange(fieldId, updatedImages);
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = () => {
    Alert.alert("Success", "Maintenance Data Saved Locally", [
        { text: "OK", onPress: () => router.back() }
    ]);
  };

  // --- 4. RENDERERS ---
  const renderField = (field: any) => {
    const val = formData[field.id];

    // TEXT & NUMBER
    if (field.type === 'text' || field.type === 'number') {
        return (
            <TextInput
                style={[styles.input, { 
                    backgroundColor: colors.background, 
                    borderColor: colors.border, 
                    color: colors.text 
                }]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.subText}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                value={val}
                onChangeText={(text) => handleInputChange(field.id, text)}
            />
        );
    }

    // SELECT & RADIO
    if (field.type === 'select' || field.type === 'radio') {
        return (
            <View style={styles.optionContainer}>
                {field.options?.map((option: string) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => handleInputChange(field.id, option)}
                        style={[
                            styles.optionPill, 
                            { borderColor: colors.border, backgroundColor: colors.background },
                            val === option && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                    >
                        <Text style={[
                            styles.optionText, 
                            { color: colors.subText },
                            val === option && { color: 'white', fontWeight: 'bold' }
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    // CHECKBOX
    if (field.type === 'checkbox') {
        const currentSelected = val || [];
        return (
            <View style={styles.optionContainer}>
                {field.options?.map((option: string) => {
                    const isSelected = currentSelected.includes(option);
                    return (
                        <TouchableOpacity
                            key={option}
                            onPress={() => {
                                const newSelection = isSelected 
                                    ? currentSelected.filter((i: string) => i !== option)
                                    : [...currentSelected, option];
                                handleInputChange(field.id, newSelection);
                            }}
                            style={[
                                styles.checkboxRow, 
                                { borderColor: colors.border, backgroundColor: colors.background },
                                isSelected && { backgroundColor: colors.tint, borderColor: colors.primary }
                            ]}
                        >
                            <Ionicons 
                                name={isSelected ? "checkbox" : "square-outline"} 
                                size={20} 
                                color={isSelected ? colors.primary : colors.subText} 
                            />
                            <Text style={[
                                styles.checkboxText, 
                                { color: colors.text },
                                isSelected && { color: colors.primary, fontWeight: 'bold' }
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    // MULTI-FILE UPLOAD
    if (field.type === 'file') {
        const isCapture = field.uploadType === 'Capture';
        const images = val || [];
        
        return (
            <View>
                <TouchableOpacity 
                    style={[styles.fileUploadBox, { borderColor: colors.border, backgroundColor: colors.background }]}
                    onPress={() => handleImagePick(field.id, field.uploadType)}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.tint }]}>
                        <Ionicons 
                            name={isCapture ? "camera" : "images"} 
                            size={24} 
                            color={colors.primary} 
                        />
                    </View>
                    <View style={{marginLeft: 12}}>
                        <Text style={{color: colors.text, fontWeight: '600', fontSize: 15}}>
                            {isCapture ? "Add Photo (Camera)" : "Add Photos (Gallery)"}
                        </Text>
                        <Text style={{color: colors.subText, fontSize: 12, marginTop: 2}}>
                            {images.length} files selected
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Thumbnails */}
                {images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
                        {images.map((uri: string, index: number) => (
                            <View key={index} style={styles.thumbnailWrapper}>
                                <Image source={{ uri }} style={[styles.thumbnail, { borderColor: colors.border }]} />
                                <TouchableOpacity 
                                    style={[styles.removeIcon, { backgroundColor: colors.card }]} 
                                    onPress={() => removeImage(field.id, uri)}
                                >
                                    <Ionicons name="close-circle" size={24} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* THEMED HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Maintenance Form</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {formSchema.sections.map((section) => (
            <View key={section.id} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
                </View>
                
                {section.fields.map((field) => (
                    <View key={field.id} style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {field.label} {field.required && <Text style={{color: colors.error}}>*</Text>}
                        </Text>
                        {renderField(field)}
                    </View>
                ))}
            </View>
        ))}

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.success }]} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, 
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  sectionCard: {
    borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  sectionHeader: { borderBottomWidth: 1, paddingBottom: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  
  fieldContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16 },
  
  optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionPill: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 24, borderWidth: 1 },
  optionText: { fontSize: 14, fontWeight: '500' },
  
  checkboxRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, 
    borderWidth: 1, borderRadius: 8, marginBottom: 8, width: '48%'
  },
  checkboxText: { marginLeft: 8, fontSize: 13 },
  
  fileUploadBox: {
    padding: 16, borderWidth: 1, borderRadius: 12, 
    flexDirection: 'row', alignItems: 'center',
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  
  thumbnailContainer: { marginTop: 12, flexDirection: 'row' },
  thumbnailWrapper: { marginRight: 12, position: 'relative' },
  thumbnail: { width: 80, height: 80, borderRadius: 8, borderWidth: 1 },
  removeIcon: { position: 'absolute', top: -8, right: -8, borderRadius: 12 },

  submitButton: { 
    padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 30,
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});