import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../models/case_model.dart';
import '../services/api_service.dart';
import 'report_case_screen.dart';
import 'report_sighting_screen.dart';
import 'user/notifications_page.dart';
import 'admin/admin_console.dart';
import 'admin/inbox_page.dart';
import 'admin/doc_validation_page.dart';
import 'admin/accounts_page.dart';
import 'admin/activities_page.dart';
import 'admin/feedback_page.dart';
import 'admin/finance_page.dart';
import 'admin/notification_page.dart';
import 'admin/registered_data_page.dart';
import 'admin/settings_page.dart';

class HomeScreen extends StatefulWidget {
  final ApiService apiService;
  const HomeScreen({Key? key, required this.apiService}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final ApiService _apiService;
  
  List<MissingPerson> _persons = [];
  List<MissingVehicle> _vehicles = [];
  bool _isLoading = true;

  // Real-time metrics
  int _totalReports = 0;
  int _resolvedCases = 0;
  int _activeUsers = 0;
  int _activeDevices = 0;
  bool _isLoadingStats = true;

  // Admin-specific metrics
  int _missingPersonCount = 0;
  int _missingVehicleCount = 0;
  int _activeCases = 0;
  int _resolutionRate = 0;
  Map<String, dynamic> _adminStats = {};
  bool _isLoadingAdminStats = true;

  // Tab state: 'persons' or 'vehicles'
  String _activeTab = 'persons';

  int _unreadNotificationCount = 0;

  @override
  void initState() {
    super.initState();
    _apiService = widget.apiService;
    _loadData();
    _loadStats();
    _loadUnreadNotificationsCount();
    if (_isAdmin) {
      _loadAdminStats();
    }
  }

  Future<void> _loadUnreadNotificationsCount() async {
    try {
      final list = await _apiService.fetchUserNotifications();
      final unread = list.where((n) => n['isRead'] == false || n['isRead'] == 0 || n['isRead'] == 'false').length;
      if (mounted) {
        setState(() {
          _unreadNotificationCount = unread;
        });
      }
    } catch (_) {}
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final personsList = await _apiService.fetchMissingPersons();
      final vehiclesList = await _apiService.fetchMissingVehicles();
      setState(() {
        _persons = personsList;
        _vehicles = vehiclesList;
        _missingPersonCount = personsList.length;
        _missingVehicleCount = vehiclesList.length;
        _activeCases = personsList.where((p) => p.status.toLowerCase() == 'active').length +
                          vehiclesList.where((v) => v.status.toLowerCase() == 'active').length;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load active directory listings.')),
        );
      }
    }
  }

  Future<void> _loadStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final stats = await _apiService.fetchPublicStats();
      if (stats.isNotEmpty) {
        final total = stats['totalReports'] ?? 0;
        final resolved = stats['resolvedCases'] ?? 0;
        setState(() {
          _totalReports = total;
          _resolvedCases = resolved;
          _activeUsers = stats['activeUsers'] ?? 0;
          _activeDevices = stats['devicesConnected'] ?? 0;
          _resolutionRate = total > 0 ? ((resolved / total) * 100).round() : 0;
          _isLoadingStats = false;
        });
      } else {
        setState(() => _isLoadingStats = false);
      }
    } catch (e) {
      setState(() => _isLoadingStats = false);
    }
  }

  Future<void> _loadAdminStats() async {
    setState(() => _isLoadingAdminStats = true);
    try {
      final data = await _apiService.fetchAdminDashboardStats();
      if (mounted) {
        setState(() {
          _adminStats = data;
          _isLoadingAdminStats = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingAdminStats = false);
      }
    }
  }

  bool get _isAdmin => _apiService.userRole == 'admin' || _apiService.userEmail == 'admin@flega.com';

  @override
  Widget build(BuildContext context) {
    // Curated theme colors adapting to light/dark mode
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color darkBgColor = Theme.of(context).scaffoldBackgroundColor;
    final Color cardDarkBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color accentBlue = Theme.of(context).colorScheme.primary;
    final Color lightBlueText = isDark ? const Color(0xFF60A5FA) : Theme.of(context).colorScheme.primary;
    final Color textWhite = Theme.of(context).colorScheme.onBackground;
    final Color textMuted = Theme.of(context).colorScheme.onSurfaceVariant;

    return Scaffold(
      backgroundColor: darkBgColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await _loadData();
            await _loadStats();
            await _loadUnreadNotificationsCount();
          },
          child: _isAdmin 
              ? _buildAdminDashboard(isDark, cardDarkBg, accentBlue, lightBlueText, textWhite, textMuted)
              : _buildUserDashboard(isDark, cardDarkBg, accentBlue, lightBlueText, textWhite, textMuted),
        ),
      ),
    );
  }

  Widget _buildAdminDashboard(bool isDark, Color cardDarkBg, Color accentBlue, Color lightBlueText, Color textWhite, Color textMuted) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        // Admin Header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ADMIN DASHBOARD',
                      style: TextStyle(
                        color: lightBlueText,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Overview',
                      style: TextStyle(
                        color: textWhite,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: cardDarkBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                      ),
                      child: IconButton(
                        icon: Icon(Icons.settings, color: textWhite, size: 20),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => AdminConsole(apiService: _apiService)),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: cardDarkBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                      ),
                      child: IconButton(
                        icon: Icon(Icons.refresh, color: textWhite, size: 20),
                        onPressed: () {
                          _loadData();
                          _loadStats();
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Hero Banner for Admin
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF4318FF),
                    const Color(0xFF4318FF).withOpacity(0.7),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4318FF).withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'WELCOME BACK, ADMIN',
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Monitor and manage all system activities',
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Keep track of missing persons, vehicles, and user reports',
                    style: TextStyle(
                      color: textWhite.withOpacity(0.85),
                      fontSize: 12,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ),

        // Top Admin Stats - 2 columns for better mobile layout
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'KEY METRICS',
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.3,
                  children: [
                    _buildModernAdminStatCard(
                      value: _missingPersonCount.toString(),
                      label: 'Missing Persons',
                      color: const Color(0xFFFFB800),
                      icon: Icons.people,
                      darkText: false,
                    ),
                    _buildModernAdminStatCard(
                      value: _missingVehicleCount.toString(),
                      label: 'Missing Vehicles',
                      color: const Color(0xFFFFB800),
                      icon: Icons.directions_car,
                      darkText: false,
                    ),
                    _buildModernAdminStatCard(
                      value: _activeCases.toString(),
                      label: 'Active Cases',
                      color: const Color(0xFF4318FF),
                      icon: Icons.assignment,
                      darkText: false,
                    ),
                    _buildModernAdminStatCard(
                      value: '$_resolutionRate%',
                      label: 'Resolution Rate',
                      color: const Color(0xFF00D26A),
                      icon: Icons.trending_up,
                      darkText: false,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Quick Actions Grid
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'QUICK ACTIONS',
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.2,
                  children: [
                    _buildQuickActionGridCard(
                      title: 'All Cases',
                      icon: Icons.folder_open,
                      color: Colors.blue,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => AdminConsole(apiService: _apiService)),
                        );
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                    ),
                    _buildQuickActionGridCard(
                      title: 'Sightings',
                      icon: Icons.visibility,
                      color: Colors.green,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => AdminConsole(apiService: _apiService)),
                        );
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                    ),
                    _buildQuickActionGridCard(
                      title: 'Users',
                      icon: Icons.people,
                      color: Colors.purple,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => AdminConsole(apiService: _apiService)),
                        );
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                    ),
                    _buildQuickActionGridCard(
                      title: 'Analytics',
                      icon: Icons.analytics,
                      color: Colors.orange,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => AdminConsole(apiService: _apiService)),
                        );
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Recent Activity Section
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'SYSTEM STATUS',
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 12),
                _buildSystemStatusCard(
                  title: 'System Health',
                  status: 'Operational',
                  icon: Icons.check_circle,
                  color: Colors.green,
                  isDark: isDark,
                  cardDarkBg: cardDarkBg,
                  textWhite: textWhite,
                  textMuted: textMuted,
                ),
                const SizedBox(height: 12),
                _buildSystemStatusCard(
                  title: 'Database',
                  status: 'Connected',
                  icon: Icons.storage,
                  color: Colors.blue,
                  isDark: isDark,
                  cardDarkBg: cardDarkBg,
                  textWhite: textWhite,
                  textMuted: textMuted,
                ),
                const SizedBox(height: 12),
                _buildSystemStatusCard(
                  title: 'API Services',
                  status: 'Running',
                  icon: Icons.cloud,
                  color: Colors.purple,
                  isDark: isDark,
                  cardDarkBg: cardDarkBg,
                  textWhite: textWhite,
                  textMuted: textMuted,
                ),
              ],
            ),
          ),
        ),

        // Admin Stats Row
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: _isLoadingAdminStats
                ? const Center(child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: CircularProgressIndicator(color: Color(0xFF4318FF)),
                  ))
                : Row(
                    children: [
                      _buildAdminStatChip(icon: Icons.people, label: 'Users', value: '${_adminStats['totalUsers'] ?? _adminStats['users'] ?? '—'}', color: Colors.orange),
                      const SizedBox(width: 8),
                      _buildAdminStatChip(icon: Icons.folder_open, label: 'Cases', value: '${_adminStats['totalCases'] ?? _adminStats['cases'] ?? '—'}', color: const Color(0xFF4318FF)),
                      const SizedBox(width: 8),
                      _buildAdminStatChip(icon: Icons.check_circle, label: 'Resolved', value: '${_adminStats['resolvedCases'] ?? _adminStats['resolved'] ?? '—'}', color: Colors.green),
                      const SizedBox(width: 8),
                      _buildAdminStatChip(icon: Icons.monetization_on, label: 'Revenue', value: '${_adminStats['revenue'] ?? '—'}', color: Colors.purple),
                    ],
                  ),
          ),
        ),

        // Management Modules Section
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'MANAGEMENT MODULES',
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.05,
                  children: [
                    _buildAdminModuleCard(
                      title: 'Sighting Inbox',
                      subtitle: 'Review & approve sightings',
                      icon: Icons.inbox_rounded,
                      gradient: const [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminInboxPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Doc Validation',
                      subtitle: 'Verify uploaded documents',
                      icon: Icons.verified_user_rounded,
                      gradient: const [Color(0xFF065F46), Color(0xFF10B981)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminDocValidationPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Accounts',
                      subtitle: 'Manage users & roles',
                      icon: Icons.manage_accounts_rounded,
                      gradient: const [Color(0xFFC2410C), Color(0xFFF97316)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminAccountsPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Activity Log',
                      subtitle: 'System events & history',
                      icon: Icons.timeline_rounded,
                      gradient: const [Color(0xFF6D28D9), Color(0xFF8B5CF6)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminActivitiesPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'User Feedback',
                      subtitle: 'Read & respond to reports',
                      icon: Icons.rate_review_rounded,
                      gradient: const [Color(0xFF0F766E), Color(0xFF14B8A6)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminFeedbackPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Finance',
                      subtitle: 'Revenue & Chapa logs',
                      icon: Icons.account_balance_rounded,
                      gradient: const [Color(0xFF7E22CE), Color(0xFFA855F7)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminFinancePage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Dispatch Alert',
                      subtitle: 'Send global notifications',
                      icon: Icons.campaign_rounded,
                      gradient: const [Color(0xFF92400E), Color(0xFFF59E0B)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminNotificationPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Directory',
                      subtitle: 'Browse registered cases',
                      icon: Icons.storage_rounded,
                      gradient: const [Color(0xFF1E3A5F), Color(0xFF3B82F6)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminRegisteredDataPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                    _buildAdminModuleCard(
                      title: 'Settings',
                      subtitle: 'System configuration',
                      icon: Icons.settings_applications_rounded,
                      gradient: const [Color(0xFF374151), Color(0xFF6B7280)],
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => AdminSettingsPage(apiService: _apiService)));
                      },
                      isDark: isDark,
                      cardDarkBg: cardDarkBg,
                      textWhite: textWhite,
                      textMuted: textMuted,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SliverToBoxAdapter(
          child: SizedBox(height: 100),
        ),
      ],
    );
  }

  Widget _buildUserDashboard(bool isDark, Color cardDarkBg, Color accentBlue, Color lightBlueText, Color textWhite, Color textMuted) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        // 1. Dashboard Header (Like Next.js Header)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI DETECTION SYSTEM',
                      style: TextStyle(
                        color: lightBlueText,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tr('app_title').toUpperCase(),
                      style: TextStyle(
                        color: textWhite,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                
                Row(
                  children: [
                    // Premium Notification Bell
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: cardDarkBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                          ),
                          child: IconButton(
                            icon: Icon(Icons.notifications, color: textWhite, size: 20),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => UserNotificationsPage(apiService: _apiService),
                                ),
                              ).then((_) => _loadUnreadNotificationsCount());
                            },
                          ),
                        ),
                        if (_unreadNotificationCount > 0)
                          Positioned(
                            right: -2,
                            top: -2,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Color(0xFFEF4444),
                                shape: BoxShape.circle,
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 16,
                                minHeight: 16,
                              ),
                              child: Text(
                                '$_unreadNotificationCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    // Language Switcher
                    Container(
                      decoration: BoxDecoration(
                        color: cardDarkBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Theme.of(context).dividerColor, width: 1),
                      ),
                      child: PopupMenuButton<Locale>(
                        icon: Icon(Icons.language, color: textWhite, size: 20),
                        onSelected: (Locale locale) {
                          context.setLocale(locale);
                          setState(() {});
                        },
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        itemBuilder: (BuildContext context) => <PopupMenuEntry<Locale>>[
                          const PopupMenuItem<Locale>(
                            value: Locale('en'),
                            child: Text('English'),
                          ),
                          const PopupMenuItem<Locale>(
                            value: Locale('am'),
                            child: Text('አማርኛ (Amharic)'),
                          ),
                          const PopupMenuItem<Locale>(
                            value: Locale('om'),
                            child: Text('Oromoo (Oromo)'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // 2. Home Hero Welcome Banner (Visual representation of Hero)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
            child: Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    accentBlue,
                    accentBlue.withOpacity(0.6),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: accentBlue.withOpacity(0.2),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tr('home.hero_badge').toUpperCase(),
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    tr('home.hero_title'),
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tr('home.hero_subtitle'),
                    style: TextStyle(
                      color: textWhite.withOpacity(0.85),
                      fontSize: 12,
                      height: 1.4,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ReportCaseScreen()),
                      ).then((value) => _loadData());
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: textWhite,
                      foregroundColor: accentBlue,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.add, size: 18),
                    label: Text(
                      tr('home.hero_report'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // 3. Live Stats Grid (Like HomeStats.tsx on website)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tr('home.stats_title'),
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  tr('home.stats_subtitle'),
                  style: TextStyle(
                    color: textWhite,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                
                _isLoadingStats 
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24.0),
                          child: CircularProgressIndicator(color: accentBlue),
                        ),
                      )
                    : GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.4,
                        children: [
                          _buildStatCard(
                            value: _totalReports.toString(),
                            label: tr('home.stats_cases'),
                            icon: Icons.assignment_outlined,
                            color: Colors.blueAccent,
                          ),
                          _buildStatCard(
                            value: _resolvedCases.toString(),
                            label: tr('home.stats_resolved'),
                            icon: Icons.check_circle_outline,
                            color: Colors.tealAccent,
                          ),
                          _buildStatCard(
                            value: _activeUsers.toString(),
                            label: tr('home.stats_users'),
                            icon: Icons.people_outline,
                            color: Colors.indigoAccent,
                          ),
                          _buildStatCard(
                            value: _activeDevices.toString(),
                            label: tr('home.stats_devices'),
                            icon: Icons.devices_other_outlined,
                            color: Colors.cyanAccent,
                          ),
                        ],
                      ),
              ],
            ),
          ),
        ),

        // 4. Feature Showcase (Like HomeFeatures.tsx)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tr('home.features_title'),
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 16),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFeatureCard(
                        title: tr('home.features_face_title'),
                        desc: tr('home.features_face_desc'),
                        icon: Icons.psychology_outlined,
                        color: Colors.teal,
                      ),
                      const SizedBox(width: 12),
                      _buildFeatureCard(
                        title: tr('home.features_gps_title'),
                        desc: tr('home.features_gps_desc'),
                        icon: Icons.map_outlined,
                        color: Colors.orange,
                      ),
                      const SizedBox(width: 12),
                      _buildFeatureCard(
                        title: tr('home.features_telegram_title'),
                        desc: tr('home.features_telegram_desc'),
                        icon: Icons.send_rounded,
                        color: Colors.blue,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // 5. Active Listings Header & Dynamic Tabs (The Directory)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.only(left: 20.0, right: 20.0, top: 32.0, bottom: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tr('home.directory_title'),
                  style: TextStyle(
                    color: lightBlueText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  tr('home.directory_subtitle'),
                  style: TextStyle(
                    color: textWhite,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                // Custom Tabs
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: cardDarkBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: _buildTabButton(
                          label: tr('home.directory_persons'),
                          count: _persons.length,
                          isActive: _activeTab == 'persons',
                          onTap: () => setState(() => _activeTab = 'persons'),
                          accentBlue: accentBlue,
                          textWhite: textWhite,
                          textMuted: textMuted,
                        ),
                      ),
                      Expanded(
                        child: _buildTabButton(
                          label: tr('home.directory_vehicles'),
                          count: _vehicles.length,
                          isActive: _activeTab == 'vehicles',
                          onTap: () => setState(() => _activeTab = 'vehicles'),
                          accentBlue: accentBlue,
                          textWhite: textWhite,
                          textMuted: textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // 6. Tab Content (Listings)
        _isLoading
            ? SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40.0),
                    child: CircularProgressIndicator(color: accentBlue),
                  ),
                ),
              )
            : (_activeTab == 'persons' ? _buildPersonsList(cardDarkBg, accentBlue, textWhite, textMuted) : _buildVehiclesList(cardDarkBg, accentBlue, textWhite, textMuted)),
        
        // Extra spacer at bottom
        const SliverToBoxAdapter(
          child: SizedBox(height: 100),
        ),
      ],
    );
  }

  Widget _buildModernAdminStatCard({
    required String value,
    required String label,
    required Color color,
    required IconData icon,
    bool darkText = false,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color textColor = darkText
        ? (isDark ? Colors.white : Colors.black)
        : Colors.white;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                    fontSize: 28,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, color: textColor.withOpacity(0.4), size: 32),
            ],
          ),
          Text(
            label,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildAdminStatCard({
    required String value,
    required String label,
    required Color color,
    required IconData icon,
    bool darkText = false,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color textColor = darkText
        ? (isDark ? Colors.white : Colors.black)
        : Colors.white;
    final Color overlayBg = isDark
        ? Colors.white.withOpacity(0.1)
        : Colors.black.withOpacity(0.1);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w800,
                    fontSize: 24,
                  ),
                ),
                Icon(icon, color: textColor.withOpacity(0.3), size: 32),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: overlayBg,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: Center(
              child: Text(
                label,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 11,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGridCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    required bool isDark,
    required Color cardDarkBg,
    required Color textWhite,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: cardDarkBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                color: textWhite,
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemStatusCard({
    required String title,
    required String status,
    required IconData icon,
    required Color color,
    required bool isDark,
    required Color cardDarkBg,
    required Color textWhite,
    required Color textMuted,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardDarkBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: textWhite,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  status,
                  style: TextStyle(
                    color: textMuted,
                    fontSize: 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Active',
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdminStatChip({required IconData icon, required String label, required String value, required Color color}) {
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
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
            Text(label, style: TextStyle(color: color.withOpacity(0.7), fontSize: 9, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminModuleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradient,
    required VoidCallback onTap,
    required bool isDark,
    required Color cardDarkBg,
    required Color textWhite,
    required Color textMuted,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: cardDarkBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                  Text(title, style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(color: textMuted, fontSize: 10), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    required bool isDark,
    required Color cardDarkBg,
    required Color textWhite,
    required Color textMuted,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardDarkBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: textWhite,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: textMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: textMuted),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String value,
    required String label,
    required IconData icon,
    required Color color,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color textColor = Theme.of(context).colorScheme.onSurface;
    final Color labelColor = Theme.of(context).colorScheme.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.5), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  value,
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w900,
                    fontSize: 24,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
            ],
          ),
          Text(
            label,
            style: TextStyle(
              color: labelColor,
              fontWeight: FontWeight.bold,
              fontSize: 10,
              letterSpacing: 1.0,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required String title,
    required String desc,
    required IconData icon,
    required Color color,
  }) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color textColor = Theme.of(context).colorScheme.onSurface;
    final Color descColor = Theme.of(context).colorScheme.onSurfaceVariant;

    return Container(
      width: 170,
      height: 120,
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: descColor,
                  fontSize: 10,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton({
    required String label,
    required int count,
    required bool isActive,
    required VoidCallback onTap,
    required Color accentBlue,
    required Color textWhite,
    required Color textMuted,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? accentBlue : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  label,
                  style: TextStyle(
                    color: isActive ? textWhite : textMuted,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isActive ? Colors.white.withOpacity(0.2) : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    color: isActive ? textWhite : textMuted,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPersonsList(Color cardBg, Color accentBlue, Color textWhite, Color textMuted) {
    if (_persons.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Center(
            child: Text(
              tr('dashboard.no_cases'),
              style: TextStyle(color: textMuted, fontSize: 14),
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final person = _persons[index];
            final imgUrl = person.images.isNotEmpty ? person.images.first : '';
            return Container(
              margin: const EdgeInsets.only(bottom: 16.0),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Stack(
                      children: [
                        if (imgUrl.isNotEmpty)
                          Image.network(
                            imgUrl.startsWith('http') ? imgUrl : '${ApiService.baseUrl.replaceAll('/api/v1', '')}/uploads/$imgUrl',
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              height: 180,
                              color: Colors.white.withOpacity(0.02),
                              child: const Icon(Icons.person, size: 50, color: Color(0xFF94A3B8)),
                            ),
                          )
                        else
                          Container(
                            height: 180,
                            color: Colors.white.withOpacity(0.02),
                            child: const Icon(Icons.person, size: 50, color: Color(0xFF94A3B8)),
                          ),
                        
                        // Active / Resolved Badge
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: person.status.toLowerCase() == 'resolved' ? Colors.green : Colors.orange,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              person.status.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            person.fullName,
                            style: TextStyle(
                              color: textWhite,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Age: ${person.age} • Gender: ${person.gender}',
                            style: TextStyle(
                              color: textMuted,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, color: Color(0xFF60A5FA), size: 14),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  person.location,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                           ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ReportSightingScreen(
                                    apiService: _apiService,
                                    caseId: person.id,
                                    type: 'person',
                                    name: person.fullName,
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: accentBlue.withOpacity(0.1),
                              foregroundColor: const Color(0xFF60A5FA),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                                side: BorderSide(color: accentBlue.withOpacity(0.2)),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            child: Center(
                              child: Text(
                                tr('dashboard.report_button'),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
          childCount: _persons.length,
        ),
      ),
    );
  }

  Widget _buildVehiclesList(Color cardBg, Color accentBlue, Color textWhite, Color textMuted) {
    if (_vehicles.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Center(
            child: Text(
              tr('dashboard.no_cases'),
              style: TextStyle(color: textMuted, fontSize: 14),
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final vehicle = _vehicles[index];
            final imgUrl = vehicle.images.isNotEmpty ? vehicle.images.first : '';
            return Container(
              margin: const EdgeInsets.only(bottom: 16.0),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Stack(
                      children: [
                        if (imgUrl.isNotEmpty)
                          Image.network(
                            imgUrl.startsWith('http') ? imgUrl : '${ApiService.baseUrl.replaceAll('/api/v1', '')}/uploads/$imgUrl',
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              height: 180,
                              color: Colors.white.withOpacity(0.02),
                              child: const Icon(Icons.directions_car, size: 50, color: Color(0xFF94A3B8)),
                            ),
                          )
                        else
                          Container(
                            height: 180,
                            color: Colors.white.withOpacity(0.02),
                            child: const Icon(Icons.directions_car, size: 50, color: Color(0xFF94A3B8)),
                          ),
                        
                        // Active / Resolved Badge
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: vehicle.status.toLowerCase() == 'resolved' ? Colors.green : Colors.orange,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              vehicle.status.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vehicle.plateNumber,
                            style: TextStyle(
                              color: textWhite,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Model: ${vehicle.model} • Color: ${vehicle.color}',
                            style: TextStyle(
                              color: textMuted,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, color: Color(0xFF60A5FA), size: 14),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  vehicle.location,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ReportSightingScreen(
                                    apiService: _apiService,
                                    caseId: vehicle.id,
                                    type: 'vehicle',
                                    name: '${vehicle.model} (${vehicle.color})',
                                    plateNumber: vehicle.plateNumber,
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: accentBlue.withOpacity(0.1),
                              foregroundColor: const Color(0xFF60A5FA),
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                                side: BorderSide(color: accentBlue.withOpacity(0.2)),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            child: Center(
                              child: Text(
                                tr('dashboard.report_button'),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
          childCount: _vehicles.length,
        ),
      ),
    );
  }
}
