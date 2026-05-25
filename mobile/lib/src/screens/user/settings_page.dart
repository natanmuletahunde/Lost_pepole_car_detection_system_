import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../providers/theme_provider.dart';
import '../admin/admin_console.dart';
import '../auth/login_screen.dart';
import 'feedback_page.dart';
import 'subscribe_page.dart';
import 'reported_cases_page.dart';
import 'analytics_page.dart';
import 'info_page.dart';

class UserSettingsPage extends StatefulWidget {
  final ApiService apiService;
  const UserSettingsPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<UserSettingsPage> createState() => _UserSettingsPageState();
}

class _UserSettingsPageState extends State<UserSettingsPage> {
  @override
  Widget build(BuildContext context) {
    final isAdmin = widget.apiService.userRole == 'admin' || widget.apiService.userEmail == 'admin@flega.com';
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 360;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text(tr('settings.title'), style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFF0034D1),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 12 : 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            const Text(
              'Settings',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Manage your preferences and account',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 20),

            // User profile card
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark 
                    ? [const Color(0xFF1E293B), const Color(0xFF334155)]
                    : [const Color(0xFF0034D1), const Color(0xFF228BE6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(isSmallScreen ? 12 : 16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.person,
                      size: isSmallScreen ? 24 : 28,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.apiService.userEmail ?? 'User Account',
                          style: TextStyle(
                            fontSize: isSmallScreen ? 14 : 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Role: ${widget.apiService.userRole ?? 'User Tier'}',
                          style: TextStyle(
                            fontSize: isSmallScreen ? 12 : 13,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Theme toggle
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
                        decoration: BoxDecoration(
                          color: (themeProvider.isDarkMode ? Colors.amber : Colors.blue).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
                          size: isSmallScreen ? 20 : 24,
                          color: themeProvider.isDarkMode ? Colors.amber : Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dark Mode',
                            style: TextStyle(
                              fontSize: isSmallScreen ? 14 : 15,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          Text(
                            themeProvider.isDarkMode ? 'Dark Theme Enabled' : 'Light Theme Enabled',
                            style: TextStyle(
                              fontSize: isSmallScreen ? 11 : 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: themeProvider.isDarkMode,
                    onChanged: (bool value) {
                      themeProvider.toggleTheme(value);
                    },
                    activeColor: const Color(0xFF228BE6),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Language section
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
                        decoration: BoxDecoration(
                          color: Colors.purple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.language,
                          size: isSmallScreen ? 20 : 24,
                          color: Colors.purple,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Language',
                        style: TextStyle(
                          fontSize: isSmallScreen ? 14 : 15,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildLanguageOption('English', 'en', isDark, isSmallScreen),
                  _buildLanguageOption('አማርኛ (Amharic)', 'am', isDark, isSmallScreen),
                  _buildLanguageOption('Afaan Oromoo (Oromo)', 'om', isDark, isSmallScreen),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quick actions section
            Text(
              'Quick Actions',
              style: TextStyle(
                fontSize: isSmallScreen ? 14 : 15,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            
            _buildQuickAction(
              icon: Icons.star,
              iconColor: Colors.amber,
              title: tr('settings.subscribe'),
              subtitle: 'Upgrade to Premium Chapa Tier',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UserSubscribePage(apiService: widget.apiService)),
                );
              },
              isDark: isDark,
              isSmallScreen: isSmallScreen,
            ),
            const SizedBox(height: 12),
            
            _buildQuickAction(
              icon: Icons.feedback_outlined,
              iconColor: Colors.teal,
              title: 'Submit Suggestions',
              subtitle: 'Tell us how to improve Flega Search',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UserFeedbackPage(apiService: widget.apiService)),
                );
              },
              isDark: isDark,
              isSmallScreen: isSmallScreen,
            ),
            const SizedBox(height: 12),
            
            _buildQuickAction(
              icon: Icons.history,
              iconColor: Colors.indigo,
              title: 'Reported Cases History',
              subtitle: 'Audit cases reported by your account',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UserReportedCasesPage(apiService: widget.apiService)),
                );
              },
              isDark: isDark,
              isSmallScreen: isSmallScreen,
            ),
            const SizedBox(height: 12),
            
            _buildQuickAction(
              icon: Icons.analytics_outlined,
              iconColor: Colors.purple,
              title: 'Search Analytics',
              subtitle: 'View system detection charts',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UserAnalyticsPage(apiService: widget.apiService)),
                );
              },
              isDark: isDark,
              isSmallScreen: isSmallScreen,
            ),
            const SizedBox(height: 12),
            
            _buildQuickAction(
              icon: Icons.info_outline,
              iconColor: Colors.blueGrey,
              title: 'Info & Guide',
              subtitle: 'How Flega AI Search works',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => UserInfoPage(apiService: widget.apiService)),
                );
              },
              isDark: isDark,
              isSmallScreen: isSmallScreen,
            ),

            // Admin console
            if (isAdmin) ...[
              const SizedBox(height: 20),
              Container(
                padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
                decoration: BoxDecoration(
                  color: isDark ? Colors.red.withOpacity(0.2) : Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Colors.red.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.admin_panel_settings,
                        size: isSmallScreen ? 20 : 24,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr('settings.switch_admin'),
                            style: TextStyle(
                              fontSize: isSmallScreen ? 14 : 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.red,
                            ),
                          ),
                          Text(
                            'Open Sighting approvals and Document valid queues',
                            style: TextStyle(
                              fontSize: isSmallScreen ? 11 : 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.arrow_forward_ios, size: 16, color: Colors.red),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Logout button
            SizedBox(
              width: double.infinity,
              height: isSmallScreen ? 52 : 56,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.logout, size: 20),
                label: const Text('Logout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () {
                  widget.apiService.logout();
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String title, String code, bool isDark, bool isSmallScreen) {
    final isSelected = context.locale.languageCode == code;
    return GestureDetector(
      onTap: () {
        context.setLocale(Locale(code));
        setState(() {});
      },
      child: Container(
        margin: EdgeInsets.only(bottom: isSmallScreen ? 8 : 12),
        padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 12 : 16, vertical: isSmallScreen ? 10 : 12),
        decoration: BoxDecoration(
          color: isSelected 
              ? (isDark ? const Color(0xFF228BE6).withOpacity(0.2) : const Color(0xFF228BE6).withOpacity(0.1))
              : (isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA)),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF228BE6) : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: isSmallScreen ? 13 : 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, size: isSmallScreen ? 18 : 20, color: const Color(0xFF228BE6)),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required bool isDark,
    required bool isSmallScreen,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(isSmallScreen ? 14 : 16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: isSmallScreen ? 20 : 24,
                color: iconColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: isSmallScreen ? 14 : 15,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: isSmallScreen ? 11 : 12,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
