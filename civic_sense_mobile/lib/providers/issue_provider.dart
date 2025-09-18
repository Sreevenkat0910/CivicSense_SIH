import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/issue.dart';

class IssueProvider extends ChangeNotifier {
  List<Issue> _issues = [];
  List<Issue> _myReports = [];
  bool _isLoading = false;
  String? _error;

  List<Issue> get issues => _issues;
  List<Issue> get myReports => _myReports;
  bool get isLoading => _isLoading;
  String? get error => _error;

  IssueProvider() {
    _loadMockData();
  }

  void _loadMockData() {
    _issues = [
      Issue(
        id: '1',
        reportId: 'CIV-2024-001',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        category: 'Roads',
        priority: 'high',
        status: IssueStatus.pending,
        location: 'Main Street, San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        images: [],
        reporterName: 'John Doe',
        reporterEmail: 'john@example.com',
        reporterMobile: '+1234567890',
        department: 'Public Works',
        mandalArea: 'Central Zone',
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        updatedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Issue(
        id: '2',
        reportId: 'CIV-2024-002',
        title: 'Broken Street Light',
        description: 'Street light not working at night',
        category: 'Infrastructure',
        priority: 'medium',
        status: IssueStatus.inProgress,
        location: 'Oak Street, San Francisco',
        latitude: 37.7849,
        longitude: -122.4094,
        images: [],
        reporterName: 'Jane Smith',
        reporterEmail: 'jane@example.com',
        reporterMobile: '+1234567891',
        department: 'Public Works',
        mandalArea: 'North Zone',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
        assignedTo: 'Maintenance Team',
      ),
      Issue(
        id: '3',
        reportId: 'CIV-2024-003',
        title: 'Water Leak in Park',
        description: 'Water fountain leaking continuously',
        category: 'Water',
        priority: 'high',
        status: IssueStatus.completed,
        location: 'Central Park, San Francisco',
        latitude: 37.7649,
        longitude: -122.4294,
        images: [],
        reporterName: 'Bob Wilson',
        reporterEmail: 'bob@example.com',
        reporterMobile: '+1234567892',
        department: 'Water Department',
        mandalArea: 'South Zone',
        createdAt: DateTime.now().subtract(const Duration(days: 10)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
        assignedTo: 'Water Maintenance Team',
        resolutionNotes: 'Leak fixed and fountain restored',
      ),
    ];

    _myReports = [
      Issue(
        id: '4',
        reportId: 'CIV-2024-004',
        title: 'My Report: Damaged Sidewalk',
        description: 'Sidewalk tiles are broken and dangerous',
        category: 'Roads',
        priority: 'medium',
        status: IssueStatus.pending,
        location: 'Pine Street, San Francisco',
        latitude: 37.7549,
        longitude: -122.4394,
        images: [],
        reporterName: 'Current User',
        reporterEmail: 'user@example.com',
        reporterMobile: '+1234567893',
        department: 'Public Works',
        mandalArea: 'East Zone',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];
  }

  Future<void> loadIssues() async {
    _setLoading(true);
    _clearError();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      notifyListeners();
    } catch (e) {
      _setError('Failed to load issues: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadMyReports() async {
    _setLoading(true);
    _clearError();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      notifyListeners();
    } catch (e) {
      _setError('Failed to load reports: ${e.toString()}');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> submitIssue({
    required String title,
    required String description,
    required String category,
    String? imagePath,
    double? latitude,
    double? longitude,
    String? address,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      final newIssue = Issue(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        reportId: 'CIV-${DateTime.now().year}-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}',
        title: title,
        description: description,
        category: category,
        priority: 'medium',
        status: IssueStatus.pending,
        location: address ?? 'Location not specified',
        latitude: latitude ?? 0.0,
        longitude: longitude ?? 0.0,
        images: imagePath != null ? [imagePath] : [],
        reporterName: 'Current User',
        reporterEmail: 'user@example.com',
        reporterMobile: '+1234567890',
        department: 'Public Works',
        mandalArea: 'Central Zone',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      _myReports.insert(0, newIssue);
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Failed to submit issue: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }


  List<Issue> getNearbyIssues(double userLatitude, double userLongitude, double radiusKm) {
    return _issues.where((issue) {
      if (issue.latitude == 0.0 || issue.longitude == 0.0) return false;
      
      final distance = _calculateDistance(
        userLatitude,
        userLongitude,
        issue.latitude,
        issue.longitude,
      );
      
      return distance <= radiusKm;
    }).toList();
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double earthRadius = 6371; // Earth's radius in kilometers
    
    final double dLat = _degreesToRadians(lat2 - lat1);
    final double dLon = _degreesToRadians(lon2 - lon1);
    
    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2);
    final double c = 2 * asin(sqrt(a));
    
    return earthRadius * c;
  }

  double _degreesToRadians(double degrees) {
    return degrees * (3.14159265359 / 180);
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}
