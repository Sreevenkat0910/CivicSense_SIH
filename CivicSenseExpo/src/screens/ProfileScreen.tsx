import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ProfileScreenProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    mobile?: string;
    language: string;
  };
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const profileOptions = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'edit',
      onPress: () => Alert.alert('Edit Profile', 'Profile editing coming soon!'),
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: 'notifications',
      onPress: () => Alert.alert('Notifications', 'Notification settings coming soon!'),
    },
    {
      id: 'language',
      title: 'Language Settings',
      icon: 'language',
      onPress: () => Alert.alert('Language', 'Language settings coming soon!'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help',
      onPress: () => Alert.alert('Help', 'Help & support coming soon!'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'info',
      onPress: () => Alert.alert('About', 'CivicSense Mobile v1.0.0'),
    },
  ];

  const renderProfileOption = (option: typeof profileOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.optionItem}
      onPress={option.onPress}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionIcon}>
          <Icon name={option.icon} size={24} color="#3b82f6" />
        </View>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Icon name="chevron-right" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color="#ffffff" />
          </View>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.mobile && (
            <Text style={styles.userMobile}>{user.mobile}</Text>
          )}
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>CivicSense Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 16,
    color: '#6b7280',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
