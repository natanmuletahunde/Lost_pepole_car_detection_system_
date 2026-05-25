import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../providers/theme_provider.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent = Color(0xFFDC2626);

class AdminSettingsPage extends StatefulWidget {
  final ApiService apiService;
  const AdminSettingsPage({Key? key, required this.apiService})
      : super(key: key);

  @override
  State<AdminSettingsPage> createState() => _AdminSettingsPageState();
}

class _AdminSettingsPageState extends State<AdminSettingsPage> {
  bool _enableGeoAlerts = true;
  bool _enableEmailLogs = false;
  bool _enableAiAutoMatch = true;
  bool _enableTelegramBot = true;
  bool _maintenanceMode = false;
  bool _requireDocVerify = true;
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = isDark ? const Color(0xFF1C0F0F) : Colors.white;
    final Color bgColor =
        isDark ? const Color(0xFF0F0A0A) : const Color(0xFFFDF2F2);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text(
          'Admin Settings',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionHeader('SYSTEM PREFERENCES', cardBg),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.dark_mode_rounded,
            iconColor: Colors.indigo,
            title: 'Dark Mode',
            subtitle: 'Switch between light and dark admin interface.',
            value: isDark,
            onChanged: (val) {
              themeProvider.toggleTheme(val);
            },
          ),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.construction_rounded,
            iconColor: Colors.orange,
            title: 'Maintenance Mode',
            subtitle: 'Take the system offline for maintenance tasks.',
            value: _maintenanceMode,
            onChanged: (val) => setState(() => _maintenanceMode = val),
            dangerColor: Colors.orange,
          ),

          const SizedBox(height: 16),

          _sectionHeader('AI & DETECTION', cardBg),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.psychology_rounded,
            iconColor: Colors.blue,
            title: 'AI Auto-Matching',
            subtitle:
                'Automatically run face/plate recognition on new sightings.',
            value: _enableAiAutoMatch,
            onChanged: (val) => setState(() => _enableAiAutoMatch = val),
          ),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.location_on_rounded,
            iconColor: Colors.teal,
            title: 'Geo-Alert Fences',
            subtitle:
                'Push notifications when sightings match within coordinate geofences.',
            value: _enableGeoAlerts,
            onChanged: (val) => setState(() => _enableGeoAlerts = val),
          ),

          const SizedBox(height: 16),

          _sectionHeader('NOTIFICATIONS & LOGS', cardBg),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.email_rounded,
            iconColor: Colors.purple,
            title: 'Email Log Archiving',
            subtitle: 'Backup admin approval activity logs nightly via email.',
            value: _enableEmailLogs,
            onChanged: (val) => setState(() => _enableEmailLogs = val),
          ),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.send_rounded,
            iconColor: Colors.blue,
            title: 'Telegram Bot Alerts',
            subtitle:
                'Forward AI sighting matches to the system Telegram channel.',
            value: _enableTelegramBot,
            onChanged: (val) => setState(() => _enableTelegramBot = val),
          ),

          const SizedBox(height: 16),

          _sectionHeader('VALIDATION POLICIES', cardBg),

          _buildSwitchTile(
            cardBg: cardBg,
            icon: Icons.verified_rounded,
            iconColor: Colors.green,
            title: 'Require Document Verification',
            subtitle:
                'Mandate document upload for special cases or recovery.',
            value: _requireDocVerify,
            onChanged: (val) => setState(() => _requireDocVerify = val),
          ),

          const SizedBox(height: 24),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _isSaving
                  ? null
                  : () async {
                      setState(() => _isSaving = true);
                      await Future.delayed(
                          const Duration(milliseconds: 800));
                      setState(() => _isSaving = false);

                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Settings saved successfully.'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: _adminAccent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.save_rounded, color: Colors.white),
              label: Text(
                _isSaving ? 'Saving...' : 'Save Settings',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            ),
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _sectionHeader(String label, Color cardBg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        label,
        style: const TextStyle(
          color: _adminAccent,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 2,
        ),
      ),
    );
  }

  Widget _buildSwitchTile({
    required Color cardBg,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    Color? dangerColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: (dangerColor != null && value)
              ? dangerColor.withOpacity(0.4)
              : _adminAccent.withOpacity(0.08),
          width: (dangerColor != null && value) ? 1.5 : 1,
        ),
      ),
      child: SwitchListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        secondary: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: (value ? iconColor : Colors.grey).withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: value ? iconColor : Colors.grey, size: 20),
        ),
        title: Text(title,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: dangerColor != null && value ? dangerColor : null,
            )),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 12, height: 1.3),
        ),
        value: value,
        onChanged: onChanged,
        activeColor: dangerColor ?? _adminAccent,
      ),
    );
  }
}