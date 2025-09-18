import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import '../models/issue.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.1.8:4000'; // Your backend URL
  static final Logger _logger = Logger();
  
  // Headers
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Authentication endpoints
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data;
        }
      }
      return null;
    } catch (e) {
      _logger.e('Login error: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> register({
    required String fullName,
    required String email,
    required String password,
    String? mobile,
    String language = 'English',
    int usertypeId = 4,
    String? department,
    String? mandalArea,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: _headers,
        body: jsonEncode({
          'fullName': fullName,
          'email': email,
          'password': password,
          'mobile': mobile,
          'language': language,
          'usertype_id': usertypeId,
          'department': department,
          'mandal_area': mandalArea,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data;
        }
      }
      return null;
    } catch (e) {
      _logger.e('Register error: $e');
      return null;
    }
  }

  // Issue endpoints
  static Future<List<Issue>> getIssues() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/reports'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true && responseData['reports'] != null) {
          final List<dynamic> data = responseData['reports'];
          return data.map((json) => Issue.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      _logger.e('Get issues error: $e');
      return [];
    }
  }

  static Future<List<Issue>> getMyReports(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/reports/user/$userId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true && responseData['reports'] != null) {
          final List<dynamic> data = responseData['reports'];
          return data.map((json) => Issue.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      _logger.e('Get my reports error: $e');
      return [];
    }
  }

  static Future<Issue?> submitIssue({
    required String title,
    required String description,
    required String category,
    required String department,
    String? reporterEmail,
    String? reporterUserId,
    String? locationText,
    double? latitude,
    double? longitude,
    List<String>? photos,
    String? voiceNoteUrl,
    String priority = 'medium',
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/reports'),
        headers: _headers,
        body: jsonEncode({
          'title': title,
          'description': description,
          'category': category,
          'department': department,
          'reporter_email': reporterEmail,
          'reporter_user_id': reporterUserId,
          'location_text': locationText,
          'latitude': latitude,
          'longitude': longitude,
          'photos': photos?.map((url) => {'url': url, 'caption': ''}).toList() ?? [],
          'voice_note_url': voiceNoteUrl,
          'priority': priority,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true) {
          // Convert the response to Issue format
          return Issue.fromJson({
            'id': responseData['reportId'],
            'title': responseData['title'],
            'description': description,
            'category': category,
            'location': locationText ?? 'Location not specified',
            'status': 'submitted',
            'priority': priority,
            'dateReported': DateTime.now().toIso8601String().split('T')[0],
            'assignedDept': department,
            'reporter': reporterEmail ?? 'Unknown',
          });
        }
      }
      return null;
    } catch (e) {
      _logger.e('Submit issue error: $e');
      return null;
    }
  }

  static Future<bool> upvoteIssue(String issueId, String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/issues/$issueId/upvote'),
        headers: _headers,
        body: jsonEncode({
          'userId': userId,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      _logger.e('Upvote issue error: $e');
      return false;
    }
  }

  static Future<List<Issue>> getNearbyIssues(double latitude, double longitude, double radiusKm) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/reports/nearby?lat=$latitude&lng=$longitude&radius=$radiusKm'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        if (responseData['success'] == true && responseData['reports'] != null) {
          final List<dynamic> data = responseData['reports'];
          return data.map((json) => Issue.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      _logger.e('Get nearby issues error: $e');
      return [];
    }
  }

  // File upload
  static Future<String?> uploadImage(String imagePath) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/reports/upload-photos'),
      );

      request.files.add(await http.MultipartFile.fromPath('photos', imagePath));

      final response = await request.send();

      if (response.statusCode == 200) {
        final responseBody = await response.stream.bytesToString();
        final data = jsonDecode(responseBody);
        if (data['success'] == true && data['photos'] != null && data['photos'].isNotEmpty) {
          return data['photos'][0]['url'];
        }
      }
      return null;
    } catch (e) {
      _logger.e('Upload image error: $e');
      return null;
    }
  }
}

