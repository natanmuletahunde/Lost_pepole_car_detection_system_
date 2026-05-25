import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

class AdminInboxPage extends StatefulWidget {
  final ApiService apiService;
  const AdminInboxPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminInboxPage> createState() => _AdminInboxPageState();
}

class _AdminInboxPageState extends State<AdminInboxPage> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final data = await widget.apiService.fetchUserNotifications();
      setState(() {
        _notifications = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAsRead(String id) async {
    final success = await widget.apiService.markNotificationAsRead(id);
    if (success) {
      setState(() {
        final index = _notifications.indexWhere((n) => n['_id']?.toString() == id);
        if (index != -1) {
          _notifications[index]['isRead'] = true;
        }
      });
    }
  }

  Future<void> _deleteNotification(String id) async {
    final success = await widget.apiService.deleteNotification(id);
    if (success) {
      setState(() {
        _notifications.removeWhere((n) => n['_id']?.toString() == id);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Notification removed.')),
      );
    }
  }

  Future<void> _clearAll() async {
    final success = await widget.apiService.clearAllNotifications();
    if (success) {
      setState(() {
        _notifications.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All notifications cleared.')),
      );
    }
  }

  Color _getTypeColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'success':
        return Colors.green;
      case 'warning':
        return Colors.orange;
      case 'info':
        return Colors.blue;
      case 'alert':
        return Colors.red;
      case 'feedback':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'success':
        return Icons.check_circle_outline;
      case 'warning':
        return Icons.warning_amber_rounded;
      case 'info':
        return Icons.info_outline;
      case 'alert':
        return Icons.notifications_active_outlined;
      case 'feedback':
        return Icons.feedback_outlined;
      default:
        return Icons.notifications_none;
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !(n['isRead'] == true)).length;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('admin.inbox') + (unreadCount > 0 ? ' ($unreadCount)' : '')),
        backgroundColor: Colors.blue[800],
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNotifications,
          ),
          if (_notifications.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear All'),
                    content: const Text('Are you sure you want to clear all notifications?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _clearAll();
                        },
                        child: const Text('Clear', style: TextStyle(color: Colors.red)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications found.'))
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(8.0),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      final id = item['_id']?.toString() ?? '';
                      final isRead = item['isRead'] == true;
                      final title = item['title']?.toString() ?? 'Notification';
                      final message = item['message']?.toString() ?? '';
                      final type = item['type']?.toString() ?? 'general';
                      final createdAt = item['createdAt']?.toString();
                      final color = _getTypeColor(type);

                      return Card(
                        elevation: isRead ? 1 : 3,
                        color: isRead 
                            ? (Theme.of(context).brightness == Brightness.dark ? const Color(0xFF1E293B) : Colors.white) 
                            : (Theme.of(context).brightness == Brightness.dark ? const Color(0xFF1E293B).withOpacity(0.6) : Colors.blue[50]),
                        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: isRead ? Colors.transparent : Colors.blue.withOpacity(0.4),
                            width: 1,
                          ),
                        ),
                        child: ExpansionTile(
                          leading: CircleAvatar(
                            backgroundColor: color.withOpacity(0.2),
                            child: Icon(_getTypeIcon(type), color: color, size: 20),
                          ),
                          title: Text(
                            title,
                            style: TextStyle(
                              fontWeight: isRead ? FontWeight.w500 : FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          subtitle: Text(
                            createdAt != null
                                ? DateFormat('MMM d, yyyy h:mm a').format(DateTime.parse(createdAt).toLocal())
                                : '',
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          childrenPadding: const EdgeInsets.all(16.0),
                          expandedCrossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              message,
                              style: const TextStyle(fontSize: 14, height: 1.5),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (!isRead)
                                  TextButton.icon(
                                    onPressed: () => _markAsRead(id),
                                    icon: const Icon(Icons.mark_email_read, size: 18),
                                    label: const Text('Mark Read'),
                                    style: TextButton.styleFrom(foregroundColor: Colors.green),
                                  ),
                                const SizedBox(width: 8),
                                TextButton.icon(
                                  onPressed: () => _deleteNotification(id),
                                  icon: const Icon(Icons.delete_outline, size: 18),
                                  label: const Text('Delete'),
                                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                                ),
                              ],
                            )
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
