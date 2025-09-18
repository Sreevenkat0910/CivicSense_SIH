import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadPhotos, submitReport, PhotoObject } from '../utils/api';

interface IssueReportScreenProps {
  onSubmit: (issue: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const categories = [
  'Road & Traffic',
  'Water & Sanitation',
  'Electricity',
  'Waste Management',
  'Public Safety',
  'Parks & Recreation',
  'Building & Construction',
  'Other'
];

interface IssueReportScreenProps {
  onSubmit?: (issue: any) => void;
}

export const IssueReportScreen: React.FC<IssueReportScreenProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    photos: [] as PhotoObject[],
    voiceNote: null as string | null,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoObject | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Animation values
  const headerTranslateY = useSharedValue(-50);
  const headerOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const photoScale = useSharedValue(1);

  React.useEffect(() => {
    // Entrance animations
    headerTranslateY.value = withTiming(0, { duration: 600 });
    headerOpacity.value = withTiming(1, { duration: 600 });
    
    formTranslateY.value = withTiming(0, { duration: 600, delay: 200 });
    formOpacity.value = withTiming(1, { duration: 600, delay: 200 });
  }, []);


  const handlePhotoUpload = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const photoObject = {
          url: asset.uri,
          caption: '',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        };
        
        setPreviewPhoto(photoObject);
        setShowPhotoPreview(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Photo library permission is required to select photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        selectionLimit: 3 - formData.photos.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photoObjects = result.assets.map(asset => ({
          url: asset.uri,
          caption: '',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        }));
        
        setPreviewPhoto(photoObjects[0]);
        setShowPhotoPreview(true);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const confirmPhoto = () => {
    if (previewPhoto) {
      const newPhotos = [...formData.photos, previewPhoto].slice(0, 3);
      setFormData(prev => ({ ...prev, photos: newPhotos }));
      
      // Photo added animation
      photoScale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }
    setShowPhotoPreview(false);
    setPreviewPhoto(null);
  };

  const discardPhoto = () => {
    setShowPhotoPreview(false);
    setPreviewPhoto(null);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setFormData(prev => ({ ...prev, voiceNote: 'voice-recording.mp3' }));
      }, 3000);
    }
  };

  const getCurrentLocation = () => {
    // Simulate getting current location
    setFormData(prev => ({
      ...prev,
      location: 'Current Location: Connaught Place, New Delhi'
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryModal(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    const issue = {
      ...formData,
      id: Date.now().toString(),
      status: 'submitted',
      timestamp: new Date().toISOString(),
      priority: 'medium',
      upvotes: 0,
      reporterEmail: currentUser?.email || 'unknown@example.com',
      userId: currentUser?.id || 'unknown',
    };
    
    // Call onSubmit if provided, otherwise show success message
    if (onSubmit) {
      onSubmit(issue);
    } else {
      // Simulate API call
      console.log('Submitting issue:', issue);
      Alert.alert('Success', 'Issue reported successfully! Our team will review it soon.');
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      photos: [],
      voiceNote: null,
    });
  };

  const selectedCategory = categories.find(cat => cat === formData.category);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const photoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior="padding"
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
              <Text style={styles.title}>Report an Issue</Text>
              <Text style={styles.subtitle}>Help improve your community by reporting civic issues</Text>
            </Animated.View>

            {/* Form */}
            <Animated.View style={[styles.form, formAnimatedStyle]}>
              {/* Issue Title */}
              <AnimatedInputField
                label="Issue Title *"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
                icon="title"
                delay={0}
              />

              {/* Category */}
              <AnimatedCategorySelector
                label="Category *"
                selectedCategory={selectedCategory}
                onPress={() => setShowCategoryModal(true)}
                delay={100}
              />

              {/* Description */}
              <AnimatedTextArea
                label="Detailed Description *"
                placeholder="Provide detailed information about the issue"
                value={formData.description}
                onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                delay={200}
              />

              {/* Location */}
              <AnimatedLocationField
                label="Location"
                placeholder="Enter address or landmark"
                value={formData.location}
                onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
                onLocationPress={getCurrentLocation}
                delay={300}
              />

              {/* Photo Upload */}
              <AnimatedPhotoSection
                photos={formData.photos}
                onAddPhoto={handlePhotoUpload}
                onRemovePhoto={removePhoto}
                delay={400}
                animatedStyle={photoAnimatedStyle}
              />

              {/* Voice Note */}
              <AnimatedVoiceSection
                isRecording={isRecording}
                voiceNote={formData.voiceNote}
                onRecord={handleVoiceRecord}
                onRemove={() => setFormData(prev => ({ ...prev, voiceNote: null }))}
                delay={500}
              />

              {/* Submit Button */}
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!formData.title || !formData.description || !formData.category) && styles.submitButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={!formData.title || !formData.description || !formData.category}
                >
                  <LinearGradient
                    colors={formData.title && formData.description && formData.category ? ['#3b82f6', '#1d4ed8'] : ['#9ca3af', '#6b7280']}
                    style={styles.submitButtonGradient}
                  >
                    <MaterialIcons name="cloud-upload" size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <AnimatedCategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategory={formData.category}
        onSelect={handleCategorySelect}
      />

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        visible={showPhotoPreview}
        photo={previewPhoto}
        onConfirm={confirmPhoto}
        onDiscard={discardPhoto}
      />
    </LinearGradient>
  );
};

// Animated Input Field Component
const AnimatedInputField = ({ label, placeholder, value, onChangeText, icon, delay = 0 }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    scale.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialIcons name={icon} size={20} color="#6b7280" style={styles.inputMaterialIcons} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </Animated.View>
  );
};

// Animated Category Selector Component
const AnimatedCategorySelector = ({ label, selectedCategory, onPress, delay = 0 }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    scale.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.categorySelector} onPress={onPress}>
        <Text style={[styles.categoryText, !selectedCategory && styles.placeholderText]}>
          {selectedCategory || 'Select issue category'}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#6b7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Text Area Component
const AnimatedTextArea = ({ label, placeholder, value, onChangeText, delay = 0 }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    scale.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </Animated.View>
  );
};

// Animated Location Field Component
const AnimatedLocationField = ({ label, placeholder, value, onChangeText, onLocationPress, delay = 0 }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    scale.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, styles.locationInput]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
          <MaterialIcons name="my-location" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Animated Photo Section Component
const AnimatedPhotoSection = ({ photos, onAddPhoto, onRemovePhoto, delay = 0, animatedStyle }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
      <Text style={styles.label}>Photos (Optional)</Text>
      <View style={styles.photosContainer}>
        <Animated.View style={[styles.photosGrid, animatedStyle]}>
          {photos.map((photo: PhotoObject, index: number) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo.url }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => onRemovePhoto(index)}
              >
                <MaterialIcons name="close" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>
        {photos.length < 3 && (
          <TouchableOpacity style={styles.addPhotoButton} onPress={onAddPhoto}>
            <MaterialIcons name="camera-alt" size={24} color="#3b82f6" />
            <Text style={styles.addPhotoText}>
              Add Photos ({photos.length}/3)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Animated Voice Section Component
const AnimatedVoiceSection = ({ isRecording, voiceNote, onRecord, onRemove, delay = 0 }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Text style={styles.label}>Voice Note (Optional)</Text>
      <View style={styles.voiceContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={onRecord}
        >
          <MaterialIcons 
            name={isRecording ? "stop" : "mic"} 
            size={20} 
            color={isRecording ? "#ffffff" : "#3b82f6"} 
          />
          <Text style={[styles.voiceButtonText, isRecording && styles.voiceButtonTextRecording]}>
            {isRecording ? 'Recording... (3s)' : 'Record Voice Note'}
          </Text>
        </TouchableOpacity>
        {voiceNote && (
          <View style={styles.voiceNoteBadge}>
            <Text style={styles.voiceNoteText}>Voice note recorded</Text>
            <TouchableOpacity onPress={onRemove}>
              <MaterialIcons name="close" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Animated Category Modal Component
const AnimatedCategoryModal = ({ visible, onClose, categories, selectedCategory, onSelect }: any) => {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(300, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, overlayAnimatedStyle]}>
        <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  item === selectedCategory && styles.categoryItemSelected
                ]}
                onPress={() => onSelect(item)}
              >
                <Text style={[
                  styles.categoryItemText,
                  item === selectedCategory && styles.categoryItemTextSelected
                ]}>
                  {item}
                </Text>
                {item === selectedCategory && (
                  <MaterialIcons name="check" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Photo Preview Modal Component
const PhotoPreviewModal = ({ visible, photo, onConfirm, onDiscard }: {
  visible: boolean;
  photo: PhotoObject | null;
  onConfirm: () => void;
  onDiscard: () => void;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!photo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDiscard}
    >
      <Animated.View style={[styles.modalOverlay, modalAnimatedStyle]}>
        <Animated.View style={[styles.photoPreviewContainer, contentAnimatedStyle]}>
          <View style={styles.photoPreviewHeader}>
            <Text style={styles.photoPreviewTitle}>Preview Photo</Text>
            <TouchableOpacity onPress={onDiscard} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoPreviewContent}>
            <Image source={{ uri: photo.url }} style={styles.previewImage} />
            <Text style={styles.photoInfo}>
              {photo.fileName} • {(photo.size / 1024).toFixed(1)} KB
            </Text>
          </View>
          
          <View style={styles.photoPreviewActions}>
            <TouchableOpacity style={styles.discardButton} onPress={onDiscard}>
              <MaterialIcons name="delete" size={20} color="#ef4444" />
              <Text style={styles.discardButtonText}>Discard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <MaterialIcons name="check" size={20} color="#ffffff" />
              <Text style={styles.confirmButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  inputMaterialIcons: {
    marginRight: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 12,
  },
  locationButton: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photosContainer: {
    marginTop: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addPhotoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  voiceButtonRecording: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  voiceButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  voiceButtonTextRecording: {
    color: '#ffffff',
  },
  voiceNoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  voiceNoteText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    height: 56,
    marginTop: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  categoryItemTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  // Photo Preview Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoPreviewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  photoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  photoPreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  photoPreviewContent: {
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoInfo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  photoPreviewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  discardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  discardButtonText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});