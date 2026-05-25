import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

// ─────────────────────────────────────────────────────────────────────────────
//  Type Configurations — mirrors the web typeConfig object
// ─────────────────────────────────────────────────────────────────────────────
class _NotifTypeConfig {
  final IconData icon;
  final Color accentColor;
  final Color bgColor;
  final String label;
  final String sender;

  const _NotifTypeConfig({
    required this.icon,
    required this.accentColor,
    required this.bgColor,
    required this.label,
    required this.sender,
  });
}

const _typeConfigs = <String, _NotifTypeConfig>{
  'alert': _NotifTypeConfig(
    icon: Icons.warning_amber_rounded,
    accentColor: Color(0xFFFA5252),
    bgColor: Color(0x1FFA5252),
    label: 'Alert',
    sender: 'AI Camera Detection System',
  ),
  'info': _NotifTypeConfig(
    icon: Icons.info_outline_rounded,
    accentColor: Color(0xFF228BE6),
    bgColor: Color(0x1F228BE6),
    label: 'Info',
    sender: 'System Administrator',
  ),
  'success': _NotifTypeConfig(
    icon: Icons.check_circle_outline_rounded,
    accentColor: Color(0xFF40C057),
    bgColor: Color(0x1F40C057),
    label: 'Success',
    sender: 'Verification Center',
  ),
  'warning': _NotifTypeConfig(
    icon: Icons.error_outline_rounded,
    accentColor: Color(0xFFFD7E14),
    bgColor: Color(0x1FFD7E14),
    label: 'Warning',
    sender: 'Security Desk',
  ),
  'feedback': _NotifTypeConfig(
    icon: Icons.mail_outline_rounded,
    accentColor: Color(0xFFBE4BDB),
    bgColor: Color(0x1FBE4BDB),
    label: 'Feedback',
    sender: 'Administrator Review',
  ),
  'system': _NotifTypeConfig(
    icon: Icons.settings_outlined,
    accentColor: Color(0xFF868E96),
    bgColor: Color(0x1F868E96),
    label: 'System',
    sender: 'Support Team',
  ),
  'general': _NotifTypeConfig(
    icon: Icons.notifications_outlined,
    accentColor: Color(0xFF868E96),
    bgColor: Color(0x1F868E96),
    label: 'General',
    sender: 'Support Team',
  ),
};

_NotifTypeConfig _getTypeConfig(String? type) =>
    _typeConfigs[type?.toLowerCase()] ?? _typeConfigs['general']!;

// ─────────────────────────────────────────────────────────────────────────────
//  Relative time formatter
// ─────────────────────────────────────────────────────────────────────────────
String _formatRelativeTime(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'Just now';
  try {
    final date = DateTime.parse(dateString).toLocal();
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM d').format(date);
  } catch (_) {
    return 'Just now';
  }
}

String _formatFullDate(String? dateString) {
  if (dateString == null || dateString.isEmpty) return 'Unknown time';
  try {
    final date = DateTime.parse(dateString).toLocal();
    return DateFormat('EEEE, MMMM d, y • h:mm a').format(date);
  } catch (_) {
    return 'Unknown time';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Widget
// ─────────────────────────────────────────────────────────────────────────────
class UserNotificationsPage extends StatefulWidget {
  final ApiService apiService;
  const UserNotificationsPage({Key? key, required this.apiService})
      : super(key: key);

  @override
  State<UserNotificationsPage> createState() => _UserNotificationsPageState();
}

class _UserNotificationsPageState extends State<UserNotificationsPage>
    with TickerProviderStateMixin {
  List<Map<String, dynamic>> _notifs = [];
  bool _isLoading = true;
  String _activeTab = 'all';
  String _searchQuery = '';
  Map<String, dynamic>? _selectedNotif;
  bool _showReader = false;
  bool _isBulkActionLoading = false;

  late final AnimationController _readerAnimController;
  late final Animation<Offset> _readerSlideAnim;
  late final Animation<double> _readerFadeAnim;

  final TextEditingController _searchCtrl = TextEditingController();
  final ScrollController _listScrollCtrl = ScrollController();

  // Dynamic Theme Getters
  bool get isDarkMode => Theme.of(context).brightness == Brightness.dark;
  Color get themePrimary => Theme.of(context).colorScheme.primary;
  Color get themeBg => Theme.of(context).scaffoldBackgroundColor;
  Color get themeCardBg => Theme.of(context).cardTheme.color ?? (isDarkMode ? const Color(0xFF1E293B) : Colors.white);
  Color get themeTextColor => Theme.of(context).colorScheme.onSurface;
  Color get themeTextMuted => Theme.of(context).colorScheme.onSurfaceVariant;
  Color get themeDividerColor => Theme.of(context).dividerColor;
  Color get themeSecondary => Theme.of(context).colorScheme.secondary;

  @override
  void initState() {
    super.initState();
    _readerAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _readerSlideAnim = Tween<Offset>(
      begin: const Offset(0.08, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _readerAnimController,
      curve: Curves.easeOutCubic,
    ));
    _readerFadeAnim = CurvedAnimation(
      parent: _readerAnimController,
      curve: Curves.easeOut,
    );
    _loadNotifications();
  }

  @override
  void dispose() {
    _readerAnimController.dispose();
    _searchCtrl.dispose();
    _listScrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final list = await widget.apiService.fetchUserNotifications();
      if (mounted) {
        setState(() {
          _notifs = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredNotifs {
    return _notifs.where((n) {
      // Tab filter
      final type = (n['type'] ?? 'general').toString().toLowerCase();
      final isRead = n['isRead'] == true || n['isRead'] == 1;
      bool matchesTab;
      switch (_activeTab) {
        case 'unread':
          matchesTab = !isRead;
          break;
        case 'alert':
          matchesTab = type == 'alert';
          break;
        case 'system':
          matchesTab = ['system', 'general', 'info', 'warning'].contains(type);
          break;
        case 'feedback':
          matchesTab = type == 'feedback';
          break;
        default:
          matchesTab = true;
      }
      // Search filter
      if (_searchQuery.isEmpty) return matchesTab;
      final q = _searchQuery.toLowerCase();
      final title = (n['title'] ?? '').toString().toLowerCase();
      final message = (n['message'] ?? '').toString().toLowerCase();
      return matchesTab && (title.contains(q) || message.contains(q));
    }).toList();
  }

  int get _unreadCount =>
      _notifs.where((n) => n['isRead'] != true && n['isRead'] != 1).length;

  Future<void> _markAsRead(String id) async {
    final idx = _notifs.indexWhere((n) => n['_id'] == id);
    if (idx == -1) return;
    final alreadyRead =
        _notifs[idx]['isRead'] == true || _notifs[idx]['isRead'] == 1;
    if (alreadyRead) return;
    await widget.apiService.markNotificationAsRead(id);
    if (mounted) {
      setState(() {
        _notifs[idx] = Map<String, dynamic>.from(_notifs[idx])
          ..['isRead'] = true;
        if (_selectedNotif?['_id'] == id) {
          _selectedNotif = Map<String, dynamic>.from(_selectedNotif!)
            ..['isRead'] = true;
        }
      });
    }
  }

  Future<void> _deleteNotif(String id) async {
    HapticFeedback.lightImpact();
    final success = await widget.apiService.deleteNotification(id);
    if (success && mounted) {
      setState(() {
        _notifs.removeWhere((n) => n['_id'] == id);
        if (_selectedNotif?['_id'] == id) {
          _selectedNotif = null;
          _showReader = false;
        }
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(tr('notifications.deleted')),
            backgroundColor: themeSecondary,
            behavior: SnackBarBehavior.floating,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _markAllRead() async {
    setState(() => _isBulkActionLoading = true);
    final unread =
        _notifs.where((n) => n['isRead'] != true && n['isRead'] != 1).toList();
    await Future.wait(
        unread.map((n) => widget.apiService.markNotificationAsRead(n['_id'])));
    if (mounted) {
      setState(() {
        _notifs = _notifs
            .map((n) => Map<String, dynamic>.from(n)..['isRead'] = true)
            .toList();
        _isBulkActionLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('notifications.mark_all_read')),
          backgroundColor: const Color(0xFF40C057),
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  Future<void> _clearAll() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear Inbox',
            style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text(
            'Are you sure you want to permanently delete all notifications? This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFA5252),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    setState(() => _isBulkActionLoading = true);
    await widget.apiService.clearAllNotifications();
    if (mounted) {
      setState(() {
        _notifs.clear();
        _selectedNotif = null;
        _showReader = false;
        _isBulkActionLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('notifications.inbox_cleared')),
          backgroundColor: themeSecondary,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  void _openNotif(Map<String, dynamic> notif) {
    setState(() {
      _selectedNotif = notif;
      _showReader = true;
    });
    _readerAnimController.forward(from: 0.0);
    _markAsRead(notif['_id']?.toString() ?? '');
  }

  void _closeReader() {
    setState(() {
      _showReader = false;
      _selectedNotif = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: themeBg,
      appBar: _buildAppBar(context),
      body: _isLoading
          ? _buildLoadingState()
          : _showReader && _selectedNotif != null
              ? _buildReaderView(_selectedNotif!)
              : _buildInboxView(),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      elevation: 0,
      backgroundColor: themeCardBg,
      surfaceTintColor: themeCardBg,
      leading: _showReader
          ? IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded,
                  size: 20, color: themeTextColor),
              onPressed: _closeReader,
            )
          : IconButton(
              icon: Icon(Icons.arrow_back_ios_new_rounded,
                  size: 20, color: themeTextColor),
              onPressed: () => Navigator.of(context).pop(),
            ),
      title: Text(
        _showReader
            ? (_selectedNotif?['title'] ?? 'Message')
            : tr('notifications.title'),
        style: TextStyle(
          color: themeTextColor,
          fontWeight: FontWeight.w800,
          fontSize: 18,
          letterSpacing: -0.3,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      actions: _showReader
          ? [
              IconButton(
                icon:
                    const Icon(Icons.delete_outline, color: Color(0xFFFA5252)),
                tooltip: 'Delete',
                onPressed: () {
                  final id = _selectedNotif?['_id']?.toString();
                  if (id != null) _deleteNotif(id);
                },
              ),
            ]
          : [
              if (_isBulkActionLoading)
                Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: Center(
                      child: SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: themeSecondary))),
                )
              else ...[
                if (_unreadCount > 0)
                  IconButton(
                    icon: Icon(Icons.done_all_rounded,
                        color: themeSecondary),
                    tooltip: tr('notifications.mark_all_read'),
                    onPressed: _markAllRead,
                  ),
                if (_notifs.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.delete_sweep_outlined,
                        color: Color(0xFFFA5252)),
                    tooltip: tr('notifications.clear_all'),
                    onPressed: _clearAll,
                  ),
              ],
            ],
      bottom: _showReader
          ? null
          : PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(
                  height: 1, color: themeDividerColor),
            ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: themeSecondary.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: CircularProgressIndicator(
                color: themeSecondary,
                strokeWidth: 2.5,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Loading inbox...',
            style: TextStyle(
              color: themeTextMuted,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  INBOX VIEW
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildInboxView() {
    final filtered = _filteredNotifs;
    return Column(
      children: [
        _buildSearchAndActions(),
        _buildFilterTabs(),
        Expanded(
          child: RefreshIndicator(
            color: themeSecondary,
            onRefresh: _loadNotifications,
            child: filtered.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    controller: _listScrollCtrl,
                    padding: const EdgeInsets.only(bottom: 24),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) => _buildNotifCard(filtered[i]),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchAndActions() {
    return Container(
      color: themeCardBg,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: isDarkMode ? themeBg : const Color(0xFFF1F3F9),
                borderRadius: BorderRadius.circular(12),
                border: isDarkMode ? Border.all(color: themeDividerColor) : null,
              ),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => setState(() => _searchQuery = v),
                style:
                    const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                decoration: InputDecoration(
                  hintText: 'Search messages...',
                  hintStyle: TextStyle(
                      color: themeTextMuted.withOpacity(0.6), fontWeight: FontWeight.w400),
                  prefixIcon: Icon(Icons.search_rounded,
                      size: 18, color: themeTextMuted),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.close,
                              size: 16, color: themeTextMuted),
                          onPressed: () {
                            _searchCtrl.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Unread count badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: _unreadCount > 0
                  ? themeSecondary.withOpacity(0.12)
                  : (isDarkMode ? themeBg : const Color(0xFFF1F3F9)),
              borderRadius: BorderRadius.circular(10),
              border: isDarkMode ? Border.all(color: themeDividerColor) : null,
            ),
            child: Text(
              '${_filteredNotifs.length} msg${_filteredNotifs.length == 1 ? '' : 's'}',
              style: TextStyle(
                color: _unreadCount > 0
                    ? themeSecondary
                    : themeTextMuted,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    final tabs = [
      ('all', tr('notifications.all_tab')),
      ('unread', tr('notifications.unread_tab')),
      ('alert', tr('notifications.alerts_tab')),
      ('system', tr('notifications.system_tab')),
      ('feedback', tr('notifications.feedback_tab')),
    ];
    return Container(
      color: isDarkMode ? themeBg : const Color(0xFFF1F3F7),
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: tabs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (ctx, i) {
          final (key, label) = tabs[i];
          final isActive = _activeTab == key;
          return GestureDetector(
            onTap: () => setState(() => _activeTab = key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: isActive ? themeSecondary : themeCardBg,
                borderRadius: BorderRadius.circular(99),
                border: Border.all(color: isActive ? Colors.transparent : themeDividerColor),
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: themeSecondary.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        )
                      ]
                    : [],
              ),
              child: Text(
                label,
                style: TextStyle(
                  color: isActive ? Colors.white : themeTextColor.withOpacity(0.8),
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                  letterSpacing: 0.1,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotifCard(Map<String, dynamic> notif) {
    final cfg = _getTypeConfig(notif['type']?.toString());
    final id = notif['_id']?.toString() ?? '';
    final isRead = notif['isRead'] == true || notif['isRead'] == 1;
    final title = notif['title']?.toString() ?? 'Notification';
    final message = notif['message']?.toString() ?? '';
    final createdAt = notif['createdAt']?.toString();

    return Dismissible(
      key: Key(id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: const Color(0xFFFA5252),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.delete_outline, color: Colors.white, size: 24),
            SizedBox(height: 4),
            Text('Delete',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700)),
          ],
        ),
      ),
      confirmDismiss: (direction) async {
        await _deleteNotif(id);
        return false; // we handle removal ourselves
      },
      child: GestureDetector(
        onTap: () => _openNotif(notif),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: themeCardBg,
            border: Border(
              left: BorderSide(
                color: isRead ? Colors.transparent : cfg.accentColor,
                width: 4,
              ),
              bottom: BorderSide(color: themeDividerColor, width: 1),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Type icon container
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: cfg.bgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(cfg.icon, color: cfg.accentColor, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              cfg.sender,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: isRead
                                    ? themeTextMuted
                                    : cfg.accentColor,
                                letterSpacing: 0.1,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            _formatRelativeTime(createdAt),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: themeTextMuted,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              isRead ? FontWeight.w600 : FontWeight.w800,
                          color: themeTextColor,
                          letterSpacing: -0.2,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        message,
                        style: TextStyle(
                          fontSize: 12,
                          color: themeTextMuted,
                          height: 1.4,
                          fontWeight: FontWeight.w400,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (!isRead) ...[
                  const SizedBox(width: 8),
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(top: 6),
                    decoration: BoxDecoration(
                      color: themeSecondary,
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.2),
        Center(
          child: Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: themeSecondary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(Icons.inbox_outlined,
                    size: 40, color: themeSecondary),
              ),
              const SizedBox(height: 20),
              Text(
                'No messages',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: themeTextColor,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _activeTab == 'unread'
                    ? 'You have no unread messages.'
                    : 'Your inbox is empty. Check back later.',
                style: TextStyle(
                  fontSize: 13,
                  color: themeTextMuted,
                  fontWeight: FontWeight.w400,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  READER VIEW
  // ──────────────────────────────────────────────────────────────────────────
  Widget _buildReaderView(Map<String, dynamic> notif) {
    final cfg = _getTypeConfig(notif['type']?.toString());
    final title = notif['title']?.toString() ?? 'Notification';
    final message = notif['message']?.toString() ?? '';
    final createdAt = notif['createdAt']?.toString();
    final isAlert = (notif['type']?.toString().toLowerCase()) == 'alert';

    return FadeTransition(
      opacity: _readerFadeAnim,
      child: SlideTransition(
        position: _readerSlideAnim,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Type Badge ──────────────────────────────────────────────
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: cfg.bgColor,
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(cfg.icon, size: 13, color: cfg.accentColor),
                        const SizedBox(width: 5),
                        Text(
                          '${cfg.label.toUpperCase()} MESSAGE',
                          style: TextStyle(
                            color: cfg.accentColor,
                            fontWeight: FontWeight.w800,
                            fontSize: 10,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Text(
                    tr('notifications.received_via'),
                    style: TextStyle(
                      fontSize: 11,
                      color: themeTextMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // ── Subject Title ───────────────────────────────────────────
              Text(
                title,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: themeTextColor,
                  letterSpacing: -0.6,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 18),

              // ── Sender Info Block ────────────────────────────────────────
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDarkMode ? themeCardBg : const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: themeDividerColor),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: cfg.bgColor,
                      child: Text(
                        cfg.sender[0].toUpperCase(),
                        style: TextStyle(
                          color: cfg.accentColor,
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  cfg.sender,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                    color: themeTextColor,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '<surveillance-system@lost-detect.app>',
                            style: TextStyle(
                              fontSize: 11,
                              color: themeTextMuted,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text('To me',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: themeTextMuted)),
                              Text(' • ',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: themeTextMuted)),
                              Icon(Icons.calendar_today_outlined,
                                  size: 10, color: themeTextMuted),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  _formatFullDate(createdAt),
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: themeTextMuted,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              Divider(color: themeDividerColor, height: 1),
              const SizedBox(height: 22),

              // ── Message Body ────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDarkMode ? themeCardBg : const Color(0xFFF8F9FD),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: themeDividerColor),
                ),
                child: Text(
                  message,
                  style: TextStyle(
                    fontSize: 15,
                    color: themeTextColor.withOpacity(0.9),
                    height: 1.75,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // ── Contextual Shortcut for Alert type ───────────────────────
              if (isAlert) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: themeSecondary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: themeSecondary.withOpacity(0.35),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: themeSecondary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.location_on_outlined,
                            color: themeSecondary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CCTV Camera Sighting Match',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: themeTextColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Open your alert cases to inspect matching logs and location markers.',
                              style: TextStyle(
                                fontSize: 11,
                                color: themeTextMuted,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      TextButton.icon(
                        onPressed: () {
                          // Navigate back and switch to alerts tab
                          Navigator.of(context).pop();
                        },
                        icon: const Icon(Icons.chevron_right_rounded, size: 16),
                        label:
                            Text(tr('notifications.check_alerts'),
                                style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700)),
                        style: TextButton.styleFrom(
                          foregroundColor: themeSecondary,
                          backgroundColor: themeSecondary.withOpacity(0.12),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // ── Professional Signature Block ─────────────────────────────
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: themeDividerColor),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('notifications.best_regards'),
                      style: TextStyle(
                        fontSize: 13,
                        color: themeTextMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tr('notifications.surveillance_team'),
                      style: TextStyle(
                        fontSize: 14,
                        color: themeSecondary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tr('notifications.engine_desc'),
                      style: TextStyle(
                        fontSize: 11,
                        color: themeTextMuted,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // ── Reader Actions Row ───────────────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        final id = notif['_id']?.toString();
                        if (id != null) _deleteNotif(id);
                        _closeReader();
                      },
                      icon: const Icon(Icons.delete_outline, size: 16),
                      label: const Text('Delete',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFFA5252),
                        side: const BorderSide(color: Color(0xFFFA5252)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 13),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _closeReader,
                      icon: const Icon(Icons.inbox_rounded, size: 16),
                      label: Text(tr('notifications.back_inbox'),
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: themeSecondary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 13),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
