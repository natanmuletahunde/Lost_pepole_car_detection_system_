import 'package:dio/dio.dart';
import '../models/case_model.dart';

class ApiService {
  // Points to the local development server (10.197.142.126) for physical device testing.
  // Make sure your phone is connected to the same Wi-Fi network.
  static const String baseUrl = 'http://10.197.142.126:5000/api/v1';

  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  String? _jwtToken;
  String? _userRole; // 'user' or 'admin'
  String? _userEmail;

  String? get userRole => _userRole;
  String? get userEmail => _userEmail;

  /// User Authentication Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'loginValue': email,
        'password': password,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        _jwtToken = data['token'] ?? '';
        _userRole = data['user']['role'] ?? 'user';
        _userEmail = data['user']['email'] ?? '';

        // Inject authorization header for all subsequent requests
        _dio.options.headers['Authorization'] = 'Bearer $_jwtToken';
        
        return {
          'success': true,
          'role': _userRole,
          'email': _userEmail,
        };
      }
      return {'success': false, 'message': 'Invalid login credentials'};
    } catch (e) {
      print('Login error: $e');
      return {'success': false, 'message': 'Network error'};
    }
  }

  /// User Registration Signup
  Future<bool> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    String? telegramUsername,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'password': password,
        'confirmPassword': password,
        if (telegramUsername != null && telegramUsername.isNotEmpty)
          'telegramUsername': telegramUsername,
      });
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Signup error: $e');
      return false;
    }
  }

  /// Fetch active missing persons
  Future<List<MissingPerson>> fetchMissingPersons() async {
    try {
      final response = await _dio.get('/missing-persons');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return data.map((json) => MissingPerson.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching missing persons: $e');
      rethrow;
    }
  }

  /// Fetch active missing vehicles
  Future<List<MissingVehicle>> fetchMissingVehicles() async {
    try {
      final response = await _dio.get('/missing-vehicles');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return data.map((json) => MissingVehicle.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching missing vehicles: $e');
      rethrow;
    }
  }

  /// Submit a sighting report
  Future<bool> reportSighting({
    required String caseId,
    required String type,
    required double latitude,
    required double longitude,
    required String lastSeenLocation,
    required String description,
    String? localImagePath,
  }) async {
    try {
      final Map<String, dynamic> formDataMap = {
        'caseId': caseId,
        'type': type,
        'location': lastSeenLocation,
        'description': description,
        'latitude': latitude.toString(),
        'longitude': longitude.toString(),
      };

      if (localImagePath != null && localImagePath.isNotEmpty) {
        formDataMap['image'] = await MultipartFile.fromFile(
          localImagePath,
          filename: 'sighting_${DateTime.now().millisecondsSinceEpoch}.jpg',
        );
      }

      final formData = FormData.fromMap(formDataMap);
      final response = await _dio.post('/sightings', data: formData);
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error submitting sighting report: $e');
      return false;
    }
  }

  /// Fetch system alert notifications (e.g., AI Sighting Matches)
  Future<List<Map<String, dynamic>>> fetchNotifications() async {
    try {
      final response = await _dio.get('/notifications');
      if (response.statusCode == 200) {
        final List data = response.data['data'] ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching notifications: $e');
      return [];
    }
  }

  /// Fetch logged in user's reported missing persons
  Future<List<MissingPerson>> fetchMyMissingPersons() async {
    try {
      final response = await _dio.get('/missing-persons/my-reports');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return data.map((json) => MissingPerson.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching my missing persons: $e');
      return [];
    }
  }

  /// Fetch logged in user's reported missing vehicles
  Future<List<MissingVehicle>> fetchMyMissingVehicles() async {
    try {
      final response = await _dio.get('/missing-vehicles/my-reports');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return data.map((json) => MissingVehicle.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching my missing vehicles: $e');
      return [];
    }
  }

  /// Fetch all sightings registered by or for this user
  Future<List<Map<String, dynamic>>> fetchMySightings() async {
    try {
      final response = await _dio.get('/sightings/my-sightings');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching my sightings: $e');
      return [];
    }
  }

  /// Resolve a missing person report
  Future<bool> resolveMissingPerson(String id) async {
    try {
      final response = await _dio.patch('/missing-persons/$id/resolve');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error resolving missing person: $e');
      return false;
    }
  }

  /// Resolve a missing vehicle report
  Future<bool> resolveMissingVehicle(String id) async {
    try {
      final response = await _dio.patch('/missing-vehicles/$id/resolve');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error resolving missing vehicle: $e');
      return false;
    }
  }

  /// Fetch all user-specific notifications
  Future<List<Map<String, dynamic>>> fetchUserNotifications() async {
    try {
      final response = await _dio.get('/notifications/my-notifications');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching user notifications: $e');
      return [];
    }
  }

  /// Mark a notification as read
  Future<bool> markNotificationAsRead(String id) async {
    try {
      final response = await _dio.patch('/notifications/$id/read');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error marking notification as read: $e');
      return false;
    }
  }

  /// Delete a single notification
  Future<bool> deleteNotification(String id) async {
    try {
      final response = await _dio.delete('/notifications/$id');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error deleting notification: $e');
      return false;
    }
  }

  /// Clear all notifications
  Future<bool> clearAllNotifications() async {
    try {
      final response = await _dio.delete('/notifications');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error clearing all notifications: $e');
      return false;
    }
  }

  /// Submit a platform feedback form
  Future<bool> submitFeedback(String subject, String content) async {
    try {
      final response = await _dio.post('/feedback', data: {
        'subject': subject,
        'content': content,
      });
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error submitting feedback: $e');
      return false;
    }
  }

  /// ADMIN: Approve user submitted sighting alert
  Future<bool> approveSighting(String sightingId) async {
    try {
      final response = await _dio.put('/admin/sightings/$sightingId/approve');
      return response.statusCode == 200;
    } catch (e) {
      print('Error approving sighting: $e');
      return false;
    }
  }

  /// ADMIN: Verify doctor reports or legal uploads
  Future<bool> validateDocument(String reportId, String decision) async {
    try {
      final response = await _dio.put('/admin/document-validation/$reportId', data: {
        'status': decision, // 'Approved' or 'Rejected'
      });
      return response.statusCode == 200;
    } catch (e) {
      print('Error validating document: $e');
      return false;
    }
  }

  /// Fetch Public System Statistics (reports, resolved cases, active users, devices)
  Future<Map<String, dynamic>> fetchPublicStats() async {
    try {
      final response = await _dio.get('/public/stats');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data']['stats']);
      }
      return {};
    } catch (e) {
      print('Error fetching public stats: $e');
      return {};
    }
  }

  // --- GPS Tracking Methods (connecting to the port 3001 mock server) ---
  static const String gpsBaseUrl = 'http://10.197.142.126:3001';

  Future<List<Map<String, dynamic>>> fetchGpsDevices() async {
    try {
      final response = await _dio.get('$gpsBaseUrl/gpsDevices');
      if (response.statusCode == 200) {
        final List data = response.data as List? ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching GPS devices: $e');
      return [];
    }
  }

  Future<bool> registerGpsDevice(Map<String, dynamic> deviceData) async {
    try {
      final response = await _dio.post(
        '$gpsBaseUrl/gpsDevices',
        data: deviceData,
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Error registering GPS device: $e');
      return false;
    }
  }

  // ─── ADMIN API METHODS ────────────────────────────────────────────────────

  /// ADMIN: Fetch dashboard stats (total users, cases, resolved, revenue)
  Future<Map<String, dynamic>> fetchAdminDashboardStats() async {
    try {
      final response = await _dio.get('/admin/dashboard');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data'] ?? {});
      }
      return {};
    } catch (e) {
      print('Error fetching admin dashboard stats: $e');
      return {};
    }
  }

  /// ADMIN: Fetch all users
  Future<Map<String, dynamic>> fetchAllUsers({String? role, String? search, int? page, int? limit}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (role != null && role.isNotEmpty) queryParams['role'] = role;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;
      final response = await _dio.get('/admin/users', queryParameters: queryParams);
      print('Fetch users response: ${response.data}');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'] ?? {};
        print('Fetch users data: $data');
        return Map<String, dynamic>.from(data);
      }
      return {'users': [], 'pagination': {'total': 0, 'pages': 1}};
    } catch (e) {
      print('Error fetching all users: $e');
      return {'users': [], 'pagination': {'total': 0, 'pages': 1}};
    }
  }

  /// ADMIN: Update user (role, isActive, etc.)
  Future<bool> adminUpdateUser(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.patch('/admin/users/$id', data: data);
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error updating user: $e');
      return false;
    }
  }

  /// ADMIN: Delete a user account
  Future<bool> adminDeleteUser(String id) async {
    try {
      final response = await _dio.delete('/admin/users/$id');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error deleting user: $e');
      return false;
    }
  }

  /// ADMIN: Fetch all cases (persons + vehicles)
  Future<List<Map<String, dynamic>>> fetchAllAdminCases() async {
    try {
      final response = await _dio.get('/admin/cases');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching admin cases: $e');
      return [];
    }
  }

  /// ADMIN: Update case status
  Future<bool> adminUpdateCaseStatus(String id, String status) async {
    try {
      final response = await _dio.patch('/admin/cases/$id/status', data: {'status': status});
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error updating case status: $e');
      return false;
    }
  }

  /// ADMIN: Delete a case record
  Future<bool> adminDeleteCase(String type, String id) async {
    try {
      final response = await _dio.delete('/admin/cases/$type/$id');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error deleting case: $e');
      return false;
    }
  }

  /// ADMIN: Fetch finance/revenue stats
  Future<Map<String, dynamic>> fetchFinanceStats() async {
    try {
      final response = await _dio.get('/admin/finance');
      if (response.statusCode == 200 && response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data'] ?? {});
      }
      return {};
    } catch (e) {
      print('Error fetching finance stats: $e');
      return {};
    }
  }

  /// ADMIN: Fetch all user feedback submissions
  Future<Map<String, dynamic>> fetchAllFeedback({int? page, int? limit, int? rating, String? type}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;
      if (rating != null) queryParams['rating'] = rating;
      if (type != null && type.isNotEmpty) queryParams['type'] = type;
      final response = await _dio.get('/admin/feedback', queryParameters: queryParams);
      print('Fetch feedback response: ${response.data}');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'] ?? {};
        print('Fetch feedback data: $data');
        return Map<String, dynamic>.from(data);
      }
      return {'feedback': [], 'avgRating': 0, 'pagination': {'total': 0, 'pages': 1}};
    } catch (e) {
      print('Error fetching feedback: $e');
      return {'feedback': [], 'avgRating': 0, 'pagination': {'total': 0, 'pages': 1}};
    }
  }

  /// ADMIN: Respond to a feedback item
  Future<bool> respondToFeedback(String id, String reply) async {
    try {
      final response = await _dio.patch('/admin/feedback/$id/respond', data: {'reply': reply});
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error responding to feedback: $e');
      return false;
    }
  }

  /// ADMIN: Send a bulk push notification to all users
  Future<bool> sendBulkNotification(String title, String message, {String type = 'info'}) async {
    try {
      final response = await _dio.post('/admin/notifications/bulk', data: {
        'title': title,
        'message': message,
        'type': type,
      });
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error sending bulk notification: $e');
      return false;
    }
  }

  /// ADMIN: Reject a sighting report
  Future<bool> rejectSighting(String sightingId, {String? reason}) async {
    try {
      final response = await _dio.patch('/admin/sightings/$sightingId/reject',
          data: reason != null ? {'reason': reason} : null);
      return response.statusCode == 200;
    } catch (e) {
      print('Error rejecting sighting: $e');
      return false;
    }
  }

  /// ADMIN: Get pending vehicle document validations
  Future<List<Map<String, dynamic>>> fetchPendingVehicleValidations() async {
    try {
      final response = await _dio.get('/admin/vehicles/pending-validation');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final List data = response.data['data'] as List? ?? [];
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error fetching pending validations: $e');
      return [];
    }
  }

  /// ADMIN: Verify a vehicle document
  Future<bool> adminVerifyVehicleDocument(String id, String decision) async {
    try {
      final response = await _dio.patch('/admin/vehicles/$id/verify', data: {'status': decision});
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      print('Error verifying vehicle document: $e');
      return false;
    }
  }

  /// Sign out utility
  void logout() {
    _jwtToken = null;
    _userRole = null;
    _userEmail = null;
    _dio.options.headers.remove('Authorization');
  }
}
