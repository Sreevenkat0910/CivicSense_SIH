import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/issue.dart';

class AuthProvider extends ChangeNotifier {
  final SharedPreferences _prefs;
  User? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._prefs) {
    _loadUserFromStorage();
  }

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void _loadUserFromStorage() {
    final userJson = _prefs.getString('user');
    if (userJson != null) {
      try {
        _user = User.fromJson(Map<String, dynamic>.from(
          Uri.splitQueryString(userJson)
        ));
        notifyListeners();
      } catch (e) {
        debugPrint('Error loading user from storage: $e');
      }
    }
  }

  Future<void> _saveUserToStorage(User user) async {
    await _prefs.setString('user', Uri(queryParameters: user.toJson()).query);
  }

  Future<void> _clearUserFromStorage() async {
    await _prefs.remove('user');
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock user data
      _user = User(
        id: '1',
        email: email,
        name: email.split('@')[0],
        createdAt: DateTime.now(),
      );

      await _saveUserToStorage(_user!);
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Login failed: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(String email, String password, String name) async {
    _setLoading(true);
    _clearError();

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock user data
      _user = User(
        id: '1',
        email: email,
        name: name,
        createdAt: DateTime.now(),
      );

      await _saveUserToStorage(_user!);
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Registration failed: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> googleSignIn() async {
    _setLoading(true);
    _clearError();

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? account = await googleSignIn.signIn();
      
      if (account != null) {
        _user = User(
          id: account.id,
          email: account.email,
          name: account.displayName ?? account.email.split('@')[0],
          profileImageUrl: account.photoUrl,
          createdAt: DateTime.now(),
        );

        await _saveUserToStorage(_user!);
        notifyListeners();
        return true;
      }
      
      return false;
    } catch (e) {
      _setError('Google sign-in failed: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();
      
      _user = null;
      await _clearUserFromStorage();
      notifyListeners();
    } catch (e) {
      debugPrint('Logout error: $e');
    } finally {
      _setLoading(false);
    }
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

