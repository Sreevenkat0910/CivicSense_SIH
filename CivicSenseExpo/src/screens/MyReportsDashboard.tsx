import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

type FilterType = 'all' | 'submitted' | 'in-progress' | 'resolved' | 'closed';
type SortType = 'newest' | 'oldest' | 'priority' | 'status';

export const MyReportsDashboard: React.FC<MyReportsDashboardProps> = ({ 
  reports, 
  onViewDetails 
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort reports
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        const statusOrder = { 'submitted': 1, 'in-progress': 2, 'resolved': 3, 'closed': 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      default:
        return 0;
    }
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

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

  const renderReportItem = ({ item: report }: { item: Report }) => (
    <View style={[styles.reportCard, { borderLeftColor: getPriorityColor(report.priority) }]}>
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
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{getStatusProgress(report.status)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: getProgressColor(report.status),
                width: `${getStatusProgress(report.status)}%`
              }
            ]} 
          />
        </View>
      </View>

      {/* Description */}
      <Text style={styles.reportDescription} numberOfLines={2}>
        {report.description}
      </Text>

      {/* Official Response */}
      {report.officialResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Official Response:</Text>
          <Text style={styles.responseText}>{report.officialResponse}</Text>
        </View>
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
          onPress={() => handleViewDetails(report)}
        >
          <Icon name="visibility" size={16} color="#3b82f6" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="message" size={32} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptySubtitle}>You haven't submitted any issues yet. Tap the "Report Issue" button to get started!</Text>
    </View>
  );

  const renderSummaryStats = () => {
    const submittedCount = reports.filter(r => r.status === 'submitted').length;
    const inProgressCount = reports.filter(r => r.status === 'in-progress').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;
    const totalUpvotes = reports.reduce((sum, r) => sum + r.upvotes, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{submittedCount}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#1f2937' }]}>{totalUpvotes}</Text>
            <Text style={styles.statLabel}>Total Upvotes</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.title}>My Reports</Text>
            <Text style={styles.subtitle}>Track the progress of your submitted issues</Text>
          </View>

          {/* Filter Controls */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Icon name="filter-list" size={20} color="#3b82f6" />
              <Text style={styles.filterButtonText}>Filter & Sort</Text>
            </TouchableOpacity>
          </View>

          {/* Reports List */}
          {sortedReports.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlatList
                data={sortedReports}
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

      {/* Report Details Modal */}
      {selectedReport && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedReport.title}</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalDescription}>{selectedReport.description}</Text>
                {selectedReport.officialResponse && (
                  <View style={styles.modalResponse}>
                    <Text style={styles.modalResponseTitle}>Official Response:</Text>
                    <Text style={styles.modalResponseText}>{selectedReport.officialResponse}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
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
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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
    backgroundColor: '#ffffff',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
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
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalResponse: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  modalResponseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalResponseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});