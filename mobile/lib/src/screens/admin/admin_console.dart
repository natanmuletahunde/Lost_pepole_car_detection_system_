import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

import 'inbox_page.dart';
import 'doc_validation_page.dart';
import 'accounts_page.dart';
import 'activities_page.dart';
import 'feedback_page.dart';
import 'finance_page.dart';
import 'notification_page.dart';
import 'registered_data_page.dart';
import 'settings_page.dart';

// ─── Admin Brand Colors ───────────────────────────────────────────────────────
const Color adminPrimary   = Color(0xFF991B1B); // deep crimson
const Color adminAccent    = Color(0xFFDC2626); // vivid red
const Color adminDarkBg    = Color(0xFF0F0A0A); // near-black red-tinted
const Color adminCardDark  = Color(0xFF1C0F0F); // dark card
const Color adminCardLight = Color(0xFFFFF5F5); // light card

class AdminConsole extends StatefulWidget {
  final ApiService apiService;
  const AdminConsole({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminConsole> createState() => _AdminConsoleState();
}

class _AdminConsoleState extends State<AdminConsole> {
  Map<String, dynamic> _stats = {};
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final data = await widget.apiService.fetchAdminDashboardStats();
      if (mounted) setState(() { _stats = data; _isLoadingStats = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoadingStats = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color bgColor = isDark ? adminDarkBg : const Color(0xFFFDF2F2);
    final Color cardBg  = isDark ? adminCardDark : Colors.white;
    final Color textColor = isDark ? Colors.white : const Color(0xFF1F0A0A);
    final Color mutedColor = isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);

    return Scaffold(
      backgroundColor: bgColor,
      body: CustomScrollView(
        slivers: [
          // ── Premium Admin Header ──────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: adminPrimary,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF7F1D1D), Color(0xFFB91C1C), Color(0xFF991B1B)],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withOpacity(0.3)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.admin_panel_settings, color: Colors.white, size: 14),
                                  SizedBox(width: 4),
                                  Text('ADMIN PORTAL', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                                ],
                              ),
                            ),
                            const Spacer(),
                            IconButton(
                              icon: const Icon(Icons.refresh, color: Colors.white),
                              onPressed: _loadStats,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          tr('admin.title'),
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                        ),
                        const Text(
                          'System Control Center',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Live Stats Row ────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: _isLoadingStats
                  ? const Center(child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: CircularProgressIndicator(color: adminAccent),
                    ))
                  : Row(
                      children: [
                        _buildStatChip(icon: Icons.people, label: 'Users', value: '${_stats['totalUsers'] ?? _stats['users'] ?? '—'}', color: Colors.orange),
                        const SizedBox(width: 8),
                        _buildStatChip(icon: Icons.folder_open, label: 'Cases', value: '${_stats['totalCases'] ?? _stats['cases'] ?? '—'}', color: adminAccent),
                        const SizedBox(width: 8),
                        _buildStatChip(icon: Icons.check_circle, label: 'Resolved', value: '${_stats['resolvedCases'] ?? _stats['resolved'] ?? '—'}', color: Colors.green),
                        const SizedBox(width: 8),
                        _buildStatChip(icon: Icons.monetization_on, label: 'Revenue', value: '${_stats['revenue'] ?? '—'}', color: Colors.purple),
                      ],
                    ),
            ),
          ),

          // ── Section Label ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                'MANAGEMENT MODULES',
                style: TextStyle(color: adminAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0),
              ),
            ),
          ),

          // ── Admin Module Grid ─────────────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.05,
              ),
              delegate: SliverChildListDelegate([
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Sighting Inbox', subtitle: 'Review & approve sightings',
                  icon: Icons.inbox_rounded, gradient: const [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
                  destination: AdminInboxPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Doc Validation', subtitle: 'Verify uploaded documents',
                  icon: Icons.verified_user_rounded, gradient: const [Color(0xFF065F46), Color(0xFF10B981)],
                  destination: AdminDocValidationPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Accounts', subtitle: 'Manage users & roles',
                  icon: Icons.manage_accounts_rounded, gradient: const [Color(0xFFC2410C), Color(0xFFF97316)],
                  destination: AdminAccountsPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Activity Log', subtitle: 'System events & history',
                  icon: Icons.timeline_rounded, gradient: const [Color(0xFF6D28D9), Color(0xFF8B5CF6)],
                  destination: AdminActivitiesPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'User Feedback', subtitle: 'Read & respond to reports',
                  icon: Icons.rate_review_rounded, gradient: const [Color(0xFF0F766E), Color(0xFF14B8A6)],
                  destination: AdminFeedbackPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Finance', subtitle: 'Revenue & Chapa logs',
                  icon: Icons.account_balance_rounded, gradient: const [Color(0xFF7E22CE), Color(0xFFA855F7)],
                  destination: AdminFinancePage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Dispatch Alert', subtitle: 'Send global notifications',
                  icon: Icons.campaign_rounded, gradient: const [Color(0xFF92400E), Color(0xFFF59E0B)],
                  destination: AdminNotificationPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Directory', subtitle: 'Browse registered cases',
                  icon: Icons.storage_rounded, gradient: const [Color(0xFF1E3A5F), Color(0xFF3B82F6)],
                  destination: AdminRegisteredDataPage(apiService: widget.apiService),
                ),
                _buildModuleCard(
                  context: context, cardBg: cardBg, textColor: textColor, mutedColor: mutedColor,
                  title: 'Settings', subtitle: 'System configuration',
                  icon: Icons.settings_applications_rounded, gradient: const [Color(0xFF374151), Color(0xFF6B7280)],
                  destination: AdminSettingsPage(apiService: widget.apiService),
                ),
              ]),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }

  Widget _buildStatChip({required IconData icon, required String label, required String value, required Color color}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
            Text(label, style: TextStyle(color: color.withOpacity(0.7), fontSize: 9, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required BuildContext context,
    required Color cardBg,
    required Color textColor,
    required Color mutedColor,
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradient,
    required Widget destination,
  }) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => destination)),
      child: Container(
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.red.withOpacity(0.08)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gradient icon header
            Container(
              height: 70,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: gradient, begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
              ),
              child: Center(child: Icon(icon, color: Colors.white, size: 32)),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(color: mutedColor, fontSize: 10), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
