import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({Key? key}) : super(key: key);

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final ApiService _apiService = ApiService();

  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _telegramController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final success = await _apiService.signup(
      firstName: _firstNameController.text.trim(),
      lastName: _lastNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text.trim(),
      telegramUsername: _telegramController.text.trim().isNotEmpty 
          ? _telegramController.text.trim() 
          : null,
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created successfully! Please login.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context); // Go back to login screen
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration failed. Please check your credentials.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _telegramController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
                              height: 60,
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) => Icon(
                                Icons.security, 
                                size: 60, 
                                color: primaryBlue,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Title: JOIN US !!
                        Center(
                          child: Text(
                            'JOIN US !!',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 26,
                              color: textDarkColor,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),

                        // Subtitle: Sign Up
                        Center(
                          child: Text(
                            'Sign Up',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 18,
                              color: textDarkColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),

                        // Info Text
                        Center(
                          child: Text(
                            'Please fill in the details to create your account',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13,
                              color: textMutedColor,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // First Name & Last Name (Grid style side-by-side)
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _firstNameController,
                                style: TextStyle(color: textDarkColor),
                                decoration: _inputDecoration(
                                  label: 'First Name',
                                  hint: 'First name',
                                  fillColor: inputFillColor,
                                  primaryBlue: primaryBlue,
                                  textMutedColor: textMutedColor,
                                ),
                                validator: (value) => value == null || value.trim().isEmpty 
                                    ? 'Required' 
                                    : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _lastNameController,
                                style: TextStyle(color: textDarkColor),
                                decoration: _inputDecoration(
                                  label: 'Last Name',
                                  hint: 'Last name',
                                  fillColor: inputFillColor,
                                  primaryBlue: primaryBlue,
                                  textMutedColor: textMutedColor,
                                ),
                                validator: (value) => value == null || value.trim().isEmpty 
                                    ? 'Required' 
                                    : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Email Field
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: TextStyle(color: textDarkColor),
                          decoration: _inputDecoration(
                            label: 'Email',
                            hint: 'example@email.com',
                            prefixIcon: Icons.email_outlined,
                            fillColor: inputFillColor,
                            primaryBlue: primaryBlue,
                            textMutedColor: textMutedColor,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Email is required';
                            }
                            final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                            if (!emailRegex.hasMatch(value.trim())) {
                              return 'Please enter a valid email address';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Phone Field
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          style: TextStyle(color: textDarkColor),
                          decoration: _inputDecoration(
                            label: 'Phone',
                            hint: '+251 9xx xxx xxx',
                            prefixIcon: Icons.phone_outlined,
                            fillColor: inputFillColor,
                            primaryBlue: primaryBlue,
                            textMutedColor: textMutedColor,
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Phone number is required';
                            }
                            if (value.trim().length < 9) {
                              return 'Phone number must be at least 9 digits';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Telegram Username Field (Optional)
                        TextFormField(
                          controller: _telegramController,
                          style: TextStyle(color: textDarkColor),
                          decoration: _inputDecoration(
                            label: 'Telegram Username (Optional)',
                            hint: '@username',
                            prefixIcon: Icons.send_rounded,
                            fillColor: inputFillColor,
                            primaryBlue: primaryBlue,
                            textMutedColor: textMutedColor,
                            helperText: 'To receive direct alerts via Telegram',
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Password field
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: TextStyle(color: textDarkColor),
                          decoration: _inputDecoration(
                            label: 'Password',
                            hint: 'Enter your password',
                            prefixIcon: Icons.lock_outline,
                            fillColor: inputFillColor,
                            primaryBlue: primaryBlue,
                            textMutedColor: textMutedColor,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: textMutedColor,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Password is required';
                            }
                            if (value.length < 8) {
                              return 'Password must be at least 8 characters';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Confirm Password field
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: _obscureConfirmPassword,
                          style: TextStyle(color: textDarkColor),
                          decoration: _inputDecoration(
                            label: 'Confirm Password',
                            hint: 'Confirm your password',
                            prefixIcon: Icons.lock_outline,
                            fillColor: inputFillColor,
                            primaryBlue: primaryBlue,
                            textMutedColor: textMutedColor,
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: textMutedColor,
                              ),
                              onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Confirm your password';
                            }
                            if (value != _passwordController.text) {
                              return "Passwords don't match";
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 28),

                        // Submit Button
                        _isLoading
                            ? Center(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                                  child: CircularProgressIndicator(color: primaryBlue),
                                ),
                              )
                            : ElevatedButton(
                                onPressed: _handleSignup,
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
                                  'Create Account',
                                  style: TextStyle(
                                    fontSize: 16, 
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                        const SizedBox(height: 20),

                        // Link to Login
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Already have an account? ",
                              style: TextStyle(color: textMutedColor, fontSize: 14),
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Text(
                                'Login',
                                style: TextStyle(
                                  color: primaryBlue,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
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

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    IconData? prefixIcon,
    Widget? suffixIcon,
    required Color fillColor,
    required Color primaryBlue,
    required Color textMutedColor,
    String? helperText,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      helperText: helperText,
      helperMaxLines: 2,
      helperStyle: TextStyle(fontSize: 10, color: textMutedColor),
      labelStyle: TextStyle(color: textMutedColor, fontSize: 13),
      hintStyle: TextStyle(color: textMutedColor.withOpacity(0.5), fontSize: 13),
      prefixIcon: prefixIcon != null ? Icon(prefixIcon, color: primaryBlue, size: 20) : null,
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: fillColor,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
      ),
    );
  }
}
