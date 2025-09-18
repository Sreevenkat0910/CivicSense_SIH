import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: string;
  type: 'update' | 'alert' | 'info' | 'resolved';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  issueId?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'resolved': return 'check-circle';
      case 'alert': return 'warning';
      case 'update': return 'schedule';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'resolved': return '#10b981';
      case 'alert': return '#ef4444';
      case 'update': return '#3b82f6';
      case 'info': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getNotificationBackground = (type: Notification['type'], read: boolean) => {
    const opacity = read ? 0.6 : 1;
    switch (type) {
      case 'resolved': return `rgba(16, 185, 129, 0.1)`;
      case 'alert': return `rgba(239, 68, 68, 0.1)`;
      case 'update': return `rgba(59, 130, 246, 0.1)`;
      case 'info': return `rgba(107, 114, 128, 0.1)`;
      default: return `rgba(107, 114, 128, 0.1)`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = ({ item: notification }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: getNotificationBackground(notification.type, notification.read),
          opacity: notification.read ? 0.6 : 1,
        }
      ]}
      onPress={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationIcon}>
          <MaterialIcons 
            name={getNotificationIcon(notification.type)} 
            size={20} 
            color={getNotificationColor(notification.type)} 
          />
        </View>
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              notification.read && styles.notificationTitleRead
            ]}>
              {notification.title}
            </Text>
            {!notification.read && (
              <View style={styles.unreadDot} />
            )}
          </View>
          <Text style={[
            styles.notificationMessage,
            notification.read && styles.notificationMessageRead
          ]}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="info" size={48} color="#9ca3af" style={styles.emptyIcon} />
      <Text style={styles.emptyText}>No notifications yet</Text>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                </View>
              )}
            </View>
            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.markAllButton}
                  onPress={onMarkAllAsRead}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <View style={styles.content}>
            {notifications.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  markAllText: {
    fontSize: 12,
    color: '#3b82f6',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 8,
  },
  notificationItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  notificationContent: {
    flexDirection: 'row',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  notificationTitleRead: {
    color: '#6b7280',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  notificationMessageRead: {
    color: '#9ca3af',
  },
  notificationTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
