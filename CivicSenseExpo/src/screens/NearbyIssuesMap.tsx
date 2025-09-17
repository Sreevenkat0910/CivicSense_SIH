import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Issue {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  upvotes: number;
  timestamp: string;
  location: { x: number; y: number };
}

interface NearbyIssuesMapProps {
  issues: Issue[];
  onUpvote: (issueId: string) => void;
  onReportIssue?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const NearbyIssuesMap: React.FC<NearbyIssuesMapProps> = ({ 
  issues, 
  onUpvote, 
  onReportIssue 
}) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllIssues, setShowAllIssues] = useState(false);

  // Sort issues by priority and upvotes
  const sortedIssues = [...issues].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.upvotes - a.upvotes;
  });

  const displayedIssues = showAllIssues ? sortedIssues : sortedIssues.slice(0, 5);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleUpvote = (issueId: string) => {
    onUpvote(issueId);
    Alert.alert('Upvoted!', 'Thank you for supporting this issue.');
  };

  const handleReportIssue = () => {
    if (onReportIssue) {
      onReportIssue();
    } else {
      Alert.alert('Report Issue', 'This feature will be available soon!');
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'submitted': return 'schedule';
      case 'in-progress': return 'warning';
      case 'resolved': return 'check-circle';
      case 'closed': return 'cancel';
      default: return 'schedule';
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const renderMapMarker = (issue: Issue) => (
    <TouchableOpacity
      key={issue.id}
      style={[
        styles.marker,
        { 
          backgroundColor: getPriorityColor(issue.priority),
          left: `${issue.location.x}%`,
          top: `${issue.location.y}%`,
        }
      ]}
      onPress={() => setSelectedIssue(issue)}
    >
      <Icon name="place" size={12} color="#ffffff" />
    </TouchableOpacity>
  );

  const renderIssueItem = ({ item: issue }: { item: Issue }) => (
    <TouchableOpacity
      style={styles.issueItem}
      onPress={() => setSelectedIssue(issue)}
    >
      <View style={styles.issueItemContent}>
        <View style={styles.issueItemText}>
          <Text style={styles.issueItemTitle} numberOfLines={1}>
            {issue.title}
          </Text>
          <Text style={styles.issueItemCategory}>{issue.category}</Text>
        </View>
        <View style={styles.issueItemMeta}>
          <View style={[
            styles.priorityDot, 
            { backgroundColor: getPriorityColor(issue.priority) }
          ]} />
          <Text style={styles.upvoteCount}>{issue.upvotes}</Text>
          <Icon name="thumb-up" size={12} color="#6b7280" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Nearby Issues</Text>
            <Text style={styles.subtitle}>Tap on markers to view issue details</Text>
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {/* Simulated Map Background */}
          <View style={styles.mapBackground}>
            {/* Grid Pattern */}
            <View style={styles.gridPattern} />
            
            {/* Issue Markers */}
            {sortedIssues.map(renderMapMarker)}

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Priority</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>High</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendText}>Medium</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Low</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Selected Issue Details */}
        {selectedIssue && (
          <View style={styles.selectedIssueCard}>
            <View style={styles.selectedIssueHeader}>
              <View style={styles.selectedIssueText}>
                <Text style={styles.selectedIssueTitle}>{selectedIssue.title}</Text>
                <Text style={styles.selectedIssueCategory}>{selectedIssue.category}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedIssue(null)}
              >
                <Icon name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedIssueBadges}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(selectedIssue.status) + '20' }
              ]}>
                <Icon 
                  name={getStatusIcon(selectedIssue.status)} 
                  size={12} 
                  color={getStatusColor(selectedIssue.status)} 
                />
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor(selectedIssue.status) }
                ]}>
                  {selectedIssue.status.replace('-', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={[
                styles.priorityBadge, 
                { backgroundColor: getPriorityColor(selectedIssue.priority) }
              ]}>
                <Text style={styles.priorityText}>
                  {selectedIssue.priority.toUpperCase()} PRIORITY
                </Text>
              </View>
            </View>

            <View style={styles.selectedIssueFooter}>
              <Text style={styles.selectedIssueDate}>
                {new Date(selectedIssue.timestamp).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.upvoteButton}
                onPress={() => handleUpvote(selectedIssue.id)}
              >
                <Icon name="thumb-up" size={16} color="#3b82f6" />
                <Text style={styles.upvoteButtonText}>{selectedIssue.upvotes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Issues List */}
        <View style={styles.issuesList}>
          <View style={styles.issuesListHeader}>
            <Text style={styles.issuesListTitle}>Nearby Issues ({sortedIssues.length})</Text>
            {sortedIssues.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllIssues(!showAllIssues)}
              >
                <Text style={styles.showMoreText}>
                  {showAllIssues ? 'Show Less' : 'Show All'}
                </Text>
                <Icon 
                  name={showAllIssues ? 'expand-less' : 'expand-more'} 
                  size={16} 
                  color="#3b82f6" 
                />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={displayedIssues}
            keyExtractor={(item) => item.id}
            renderItem={renderIssueItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.issueSeparator} />}
          />
        </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  mapContainer: {
    height: 240,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#dcfce7',
    position: 'relative',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    backgroundColor: 'transparent',
    // Simple grid pattern using border
    borderWidth: 1,
    borderColor: '#6b7280',
    borderStyle: 'dashed',
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  legend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  legendItems: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
  selectedIssueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedIssueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  selectedIssueText: {
    flex: 1,
    marginRight: 12,
  },
  selectedIssueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedIssueCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    padding: 4,
  },
  selectedIssueBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
  },
  selectedIssueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedIssueDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  upvoteButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 4,
  },
  issuesList: {
    marginTop: 8,
  },
  issuesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  issuesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  showMoreText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginRight: 4,
  },
  issueItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  issueItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueItemText: {
    flex: 1,
    marginRight: 12,
  },
  issueItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  issueItemCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  issueItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upvoteCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  issueSeparator: {
    height: 8,
  },
});
