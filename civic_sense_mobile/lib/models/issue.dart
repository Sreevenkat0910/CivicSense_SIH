import 'package:flutter/material.dart';

class Issue {
  final String id;
  final String reportId;
  final String title;
  final String description;
  final String category;
  final String priority;
  final IssueStatus status;
  final String location;
  final double latitude;
  final double longitude;
  final List<String> images;
  final String reporterName;
  final String reporterEmail;
  final String reporterMobile;
  final String department;
  final String mandalArea;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? assignedTo;
  final String? resolutionNotes;

  Issue({
    required this.id,
    required this.reportId,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    required this.location,
    required this.latitude,
    required this.longitude,
    required this.images,
    required this.reporterName,
    required this.reporterEmail,
    required this.reporterMobile,
    required this.department,
    required this.mandalArea,
    required this.createdAt,
    required this.updatedAt,
    this.assignedTo,
    this.resolutionNotes,
  });

  factory Issue.fromJson(Map<String, dynamic> json) {
    return Issue(
      id: json['id'] ?? '',
      reportId: json['report_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      priority: json['priority'] ?? 'medium',
      status: IssueStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => IssueStatus.pending,
      ),
      location: json['location'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      images: List<String>.from(json['images'] ?? []),
      reporterName: json['reporter_name'] ?? '',
      reporterEmail: json['reporter_email'] ?? '',
      reporterMobile: json['reporter_mobile'] ?? '',
      department: json['department'] ?? '',
      mandalArea: json['mandal_area'] ?? '',
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
      assignedTo: json['assigned_to'],
      resolutionNotes: json['resolution_notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'report_id': reportId,
      'title': title,
      'description': description,
      'category': category,
      'priority': priority,
      'status': status.name,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'images': images,
      'reporter_name': reporterName,
      'reporter_email': reporterEmail,
      'reporter_mobile': reporterMobile,
      'department': department,
      'mandal_area': mandalArea,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'assigned_to': assignedTo,
      'resolution_notes': resolutionNotes,
    };
  }
}

enum IssueStatus {
  pending,
  inProgress,
  completed,
}

extension IssueStatusExtension on IssueStatus {
  String get displayName {
    switch (this) {
      case IssueStatus.pending:
        return 'Pending';
      case IssueStatus.inProgress:
        return 'In Progress';
      case IssueStatus.completed:
        return 'Completed';
    }
  }

  Color get color {
    switch (this) {
      case IssueStatus.pending:
        return const Color(0xFFEF4444); // Red
      case IssueStatus.inProgress:
        return const Color(0xFFF97316); // Orange
      case IssueStatus.completed:
        return const Color(0xFF22C55E); // Green
    }
  }
}

class IssueCategory {
  static const List<String> categories = [
    'Infrastructure',
    'Water',
    'Roads',
    'Sanitation',
    'Traffic',
    'Parks',
    'Health',
    'Education',
    'Other',
  ];

  static const Map<String, IconData> categoryIcons = {
    'Infrastructure': Icons.build,
    'Water': Icons.water_drop,
    'Roads': Icons.terrain,
    'Sanitation': Icons.cleaning_services,
    'Traffic': Icons.traffic,
    'Parks': Icons.park,
    'Health': Icons.local_hospital,
    'Education': Icons.school,
    'Other': Icons.more_horiz,
  };
}

class User {
  final String id;
  final String email;
  final String name;
  final String? profileImageUrl;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    this.profileImageUrl,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      profileImageUrl: json['profileImageUrl'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'profileImageUrl': profileImageUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
