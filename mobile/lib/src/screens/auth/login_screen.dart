import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';
import '../navigation_shell.dart';
import 'signup_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _apiService = ApiService();

  final TextEditingController _loginController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _isEmailType = true; // Toggle between Email and Phone login type

  // Simulates forgot password behavior like the website
  void _handleForgotPassword() {
    final value = _loginController.text.trim();
    if (value.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isEmailType 
                ? 'Please enter a valid email first.' 
                : 'Please enter a valid phone number first.',
          ),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Password reset instructions have been sent to your ${_isEmailType ? 'email' : 'phone'}.',
        ),
        backgroundColor: Colors.blueAccent,
      ),
    );
  }

  // Switches between Email and Phone login type
  void _handleTypeSwitch() {
    setState(() {
      _isEmailType = !_isEmailType;
      _loginController.clear();
    });
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    
    final result = await _apiService.login(
      _loginController.text.trim(),
      _passwordController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => NavigationShell(apiService: _apiService),
          ),
        );
      }
    } else {
      if (mounted) {
        // SnackBar error notification matching the red alerts on the website
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Login failed. Please try again.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    
    final Color mainBgColor = Theme.of(context).scaffoldBackgroundColor;
    final Color paperBgColor = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : const Color(0xFFDBEAFE));
    final Color primaryBlue = Theme.of(context).colorScheme.primary;
    final Color textDarkColor = Theme.of(context).colorScheme.onSurface;
    final Color textMutedColor = Theme.of(context).colorScheme.onSurfaceVariant;
    final Color inputFillColor = isDark ? Colors.black.withOpacity(0.2) : Colors.white.withOpacity(0.8);

    return Scaffold(
      backgroundColor: mainBgColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 450),
              child: Card(
                color: paperBgColor,
                elevation: 4,
                shadowColor: Colors.black.withOpacity(0.05),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(28.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Logo / Header Image
                        Center(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/logo.png',
                              height: 70,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(
                                Icons.security, 
                                size: 70, 
                                color: primaryBlue,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Title: WELCOME !!
                        Center(
                          child: Text(
                            'WELCOME !!',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 26,
                              color: textDarkColor,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),

                        // Subtitle: Login
                        Center(
                          child: Text(
                            'Login',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 18,
                              color: textDarkColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Instruction Text based on login type
                        Center(
                          child: Text(
                            _isEmailType
                                ? 'Please enter your email and password'
                                : 'Please enter your phone number and password',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: textMutedColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Login Value Input (Email / Phone)
                        TextFormField(
                          controller: _loginController,
                          keyboardType: _isEmailType 
                              ? TextInputType.emailAddress 
                              : TextInputType.phone,
                          style: TextStyle(color: textDarkColor),
                          decoration: InputDecoration(
                            labelText: _isEmailType ? 'Email' : 'Phone number',
                            hintText: _isEmailType ? 'example@email.com' : '+251 9xx xxx xxx',
                            labelStyle: TextStyle(color: textMutedColor),
                            hintStyle: TextStyle(color: textMutedColor.withOpacity(0.5)),
                            prefixIcon: Icon(
                              _isEmailType ? Icons.email_outlined : Icons.phone_outlined,
                              color: primaryBlue,
                            ),
                            filled: true,
                            fillColor: inputFillColor,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: Theme.of(context).dividerColor, width: 1),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: primaryBlue, width: 1.5),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return _isEmailType ? 'Email is required' : 'Phone number is required';
                            }
                            if (_isEmailType) {
                              final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                              if (!emailRegex.hasMatch(value.trim())) {
                                  return 'Please enter a valid email address';
                              }
                            } else {
                              if (value.trim().length < 9) {
                                return 'Please enter a valid phone number';
                              }
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Password input
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: TextStyle(color: textDarkColor),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            hintText: 'Enter your password',
                            labelStyle: TextStyle(color: textMutedColor),
                            hintStyle: TextStyle(color: textMutedColor.withOpacity(0.5)),
                            prefixIcon: Icon(
                              Icons.lock_outline,
                              color: primaryBlue,
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: textMutedColor,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            filled: true,
                            fillColor: inputFillColor,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: Theme.of(context).dividerColor, width: 1),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide(color: primaryBlue, width: 1.5),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),

                        // Submit button
                        _isLoading
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                                  child: CircularProgressIndicator(color: primaryBlue),
                                ),
                              )
                            : ElevatedButton(
                                onPressed: _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: primaryBlue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  elevation: 1,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                child: const Text(
                                  'Login',
                                  style: TextStyle(
                                    fontSize: 16, 
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                        const SizedBox(height: 16),

                        // Helper Toggles: Type Switch & Forgot Password
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            GestureDetector(
                              onTap: _handleTypeSwitch,
                              child: Text(
                                _isEmailType ? 'Use phone number' : 'Use email address',
                                style: TextStyle(
                                  color: primaryBlue,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: _handleForgotPassword,
                              child: TextStyle(
                                color: primaryBlue,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ) is TextStyle // Workaround for simple styling
                                  ? Text(
                                      'Forgot password?',
                                      style: TextStyle(
                                        color: primaryBlue,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    )
                                  : const SizedBox.shrink(),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Link to Signup
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Don't have an account? ",
                              style: TextStyle(color: textMutedColor, fontSize: 14),
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const SignupScreen(),
                                  ),
                                );
                              },
                              child: Text(
                                'Sign up',
                                style: TextStyle(
                                  color: primaryBlue,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Or Sign In Using Divider
                        Row(
                          children: [
                            Expanded(child: Divider(color: Theme.of(context).dividerColor)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: Text(
                                'or sign in using',
                                style: TextStyle(color: textMutedColor, fontSize: 12),
                              ),
                            ),
                            Expanded(child: Divider(color: Theme.of(context).dividerColor)),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Social Logins (Google & Facebook Mock Icons)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildSocialButton(
                              icon: Icons.g_mobiledata_rounded, 
                              color: Colors.redAccent,
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Google Sign-In is not configured yet.')),
                                );
                              },
                            ),
                            const SizedBox(width: 16),
                            _buildSocialButton(
                              icon: Icons.facebook, 
                              color: Colors.blueAccent,
                              onTap: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Facebook Sign-In is not configured yet.')),
                                );
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Demo Credentials Alert Container
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.black.withOpacity(0.2) : Colors.white.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.info_outline, color: textMutedColor, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Demo Credentials',
                                      style: TextStyle(
                                        color: textDarkColor, 
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Try: john@example.com / SecurePass123!',
                                      style: TextStyle(
                                        color: textMutedColor, 
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required IconData icon, 
    required Color color, 
    required VoidCallback onTap,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? Theme.of(context).scaffoldBackgroundColor : Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(icon, color: color, size: 28),
      ),
    );
  }
}
