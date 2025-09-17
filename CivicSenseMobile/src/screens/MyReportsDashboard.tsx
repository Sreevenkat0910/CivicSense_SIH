import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface Report {
  id: string;
  title: string;
  category: string;
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  officialResponse?: string;
  upvotes: number;
}

interface MyReportsDashboardProps {
  reports: Report[];
  onViewDetails: (report: Report) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const MyReportsDashboard: React.FC<MyReportsDashboardProps> = ({ 
  reports, 
  onViewDetails 
}) => {
  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 'schedule';
      case 'in-progress': return 'warning';
      case 'resolved': return 'check-circle';
      case 'closed': return 'cancel';
      default: return 'schedule';
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: Report['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusProgress = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 25;
      case 'in-progress': return 60;
      case 'resolved': return 100;
      case 'closed': return 100;
      default: return 0;
    }
  };

  const getProgressColor = (status: Report['status']) => {
    switch (status) {
      case 'resolved': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const renderReportItem = ({ item: report, index }: { item: Report; index: number }) => (
    <AnimatedReportCard
      report={report}
      index={index}
      onViewDetails={onViewDetails}
      getStatusIcon={getStatusIcon}
      getStatusColor={getStatusColor}
      getPriorityColor={getPriorityColor}
      getStatusProgress={getStatusProgress}
      getProgressColor={getProgressColor}
    />
  );

  const renderEmptyState = () => (
    <AnimatedEmptyState />
  );

  const renderSummaryStats = () => {
    const submittedCount = reports.filter(r => r.status === 'submitted').length;
    const inProgressCount = reports.filter(r => r.status === 'in-progress').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;
    const totalUpvotes = reports.reduce((sum, r) => sum + r.upvotes, 0);

    return (
      <AnimatedStatsContainer
        submittedCount={submittedCount}
        inProgressCount={inProgressCount}
        resolvedCount={resolvedCount}
        totalUpvotes={totalUpvotes}
      />
    );
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <AnimatedHeader />

          {/* Reports List */}
          {reports.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlatList
                data={reports}
                keyExtractor={(item) => item.id}
                renderItem={renderReportItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              {renderSummaryStats()}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Animated Header Component
const AnimatedHeader = () => {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 600 });
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.header, animatedStyle]}>
      <Text style={styles.title}>My Reports</Text>
      <Text style={styles.subtitle}>Track the progress of your submitted issues</Text>
    </Animated.View>
  );
};

// Animated Report Card Component
const AnimatedReportCard = ({ 
  report, 
  index, 
  onViewDetails, 
  getStatusIcon, 
  getStatusColor, 
  getPriorityColor, 
  getStatusProgress, 
  getProgressColor 
}: any) => {
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  React.useEffect(() => {
    translateX.value = withSpring(0, { 
      damping: 15, 
      stiffness: 150, 
      delay: index * 100 
    });
    opacity.value = withTiming(1, { 
      duration: 400, 
      delay: index * 100 
    });
    scale.value = withSpring(1, { 
      damping: 15, 
      stiffness: 150, 
      delay: index * 100 
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.reportCard, { borderLeftColor: getPriorityColor(report.priority) }, animatedStyle]}>
      {/* Header */}
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportCategory}>{report.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
          <Icon 
            name={getStatusIcon(report.status)} 
            size={16} 
            color={getStatusColor(report.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <AnimatedProgressBar
        progress={getStatusProgress(report.status)}
        color={getProgressColor(report.status)}
      />

      {/* Description */}
      <Text style={styles.reportDescription} numberOfLines={2}>
        {report.description}
      </Text>

      {/* Official Response */}
      {report.officialResponse && (
        <AnimatedResponseContainer response={report.officialResponse} />
      )}

      {/* Footer */}
      <View style={styles.reportFooter}>
        <View style={styles.reportMeta}>
          <Text style={styles.reportDate}>
            {new Date(report.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.reportUpvotes}>{report.upvotes} upvotes</Text>
        </View>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => onViewDetails(report)}
        >
          <Icon name="visibility" size={16} color="#3b82f6" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Animated Progress Bar Component
const AnimatedProgressBar = ({ progress, color }: { progress: number; color: string }) => {
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={styles.progressPercentage}>{progress}%</Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { backgroundColor: color },
            animatedStyle
          ]} 
        />
      </View>
    </View>
  );
};

// Animated Response Container Component
const AnimatedResponseContainer = ({ response }: { response: string }) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.responseContainer, animatedStyle]}>
      <Text style={styles.responseTitle}>Official Response:</Text>
      <Text style={styles.responseText}>{response}</Text>
    </Animated.View>
  );
};

// Animated Empty State Component
const AnimatedEmptyState = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
    rotate.value = withTiming(360, { duration: 1000, delay: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.emptyState, animatedStyle]}>
      <Animated.View style={[styles.emptyIconContainer, animatedStyle]}>
        <Icon name="message" size={32} color="#9ca3af" />
      </Animated.View>
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptySubtitle}>You haven't submitted any issues yet.</Text>
    </Animated.View>
  );
};

// Animated Stats Container Component
const AnimatedStatsContainer = ({ submittedCount, inProgressCount, resolvedCount, totalUpvotes }: any) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 600, delay: 200 });
    opacity.value = withTiming(1, { duration: 600, delay: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statsContainer, animatedStyle]}>
      <View style={styles.statsRow}>
        <AnimatedStatItem
          count={submittedCount}
          label="Submitted"
          color="#3b82f6"
          delay={0}
        />
        <AnimatedStatItem
          count={inProgressCount}
          label="In Progress"
          color="#f59e0b"
          delay={100}
        />
      </View>
      <View style={styles.statsRow}>
        <AnimatedStatItem
          count={resolvedCount}
          label="Resolved"
          color="#10b981"
          delay={200}
        />
        <AnimatedStatItem
          count={totalUpvotes}
          label="Total Upvotes"
          color="#1f2937"
          delay={300}
        />
      </View>
    </Animated.View>
  );
};

// Animated Stat Item Component
const AnimatedStatItem = ({ count, label, color, delay }: any) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const countValue = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 100, delay });
    opacity.value = withTiming(1, { duration: 400, delay });
    countValue.value = withTiming(count, { duration: 1000, delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const countAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.statGradient}
      >
        <Animated.Text style={[styles.statNumber, { color }, countAnimatedStyle]}>
          {count}
        </Animated.Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 24,
  },
  reportCategory: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 16,
  },
  responseContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 16,
    fontWeight: '500',
  },
  reportUpvotes: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
  statsContainer: {
    marginTop: 32,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
});