import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminActivitiesPage extends StatefulWidget {
  final ApiService apiService;
  const AdminActivitiesPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminActivitiesPage> createState() => _AdminActivitiesPageState();
}

class _AdminActivitiesPageState extends State<AdminActivitiesPage> {
  // Activities are derived from live sightings (from inbox) as the backend
  // doesn't have a standalone activity log endpoint. We fetch sightings as proxy.
  List<Map<String, dynamic>> _activities = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities() async {
    setState(() => _isLoading = true);
    // Fetch admin notifications as an activity proxy (real events from the system)
    final notifData = await widget.apiService.fetchNotifications();
    if (mounted) {
      setState(() {
        _activities = notifData;
        _isLoading = false;
      });
    }
  }

  Color _typeColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'success': return Colors.green;
      case 'warning': return Colors.orange;
      case 'info':    return Colors.blue;
      case 'alert':   return Colors.red;
      case 'feedback': return Colors.purple;
      case 'register': return Colors.teal;
      case 'payment': return Colors.green;
      default:        return Colors.grey;
    }
  }

  IconData _typeIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'success':  return Icons.check_circle_outline;
      case 'warning':  return Icons.warning_amber_rounded;
      case 'info':     return Icons.info_outline;
      case 'alert':    return Icons.notifications_active_outlined;
      case 'feedback': return Icons.feedback_outlined;
      case 'payment':  return Icons.payment;
      case 'register': return Icons.app_registration;
      default:         return Icons.history_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = isDark ? const Color(0xFF1C0F0F) : Colors.white;
    final Color bgColor = isDark ? const Color(0xFF0F0A0A) : const Color(0xFFFDF2F2);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('System Activity Log', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadActivities),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _adminAccent))
          : _activities.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.timeline_rounded, size: 64, color: _adminAccent.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      const Text('No system activity recorded yet.', style: TextStyle(color: Colors.grey, fontSize: 15)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: _adminAccent,
                  onRefresh: _loadActivities,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: _activities.length,
                    itemBuilder: (context, index) {
                      final item = _activities[index];
                      final title   = item['title']?.toString() ?? 'System Event';
                      final message = item['message']?.toString() ?? item['description']?.toString() ?? '';
                      final type    = item['type']?.toString() ?? 'info';
                      final date    = item['createdAt']?.toString();
                      final color   = _typeColor(type);
                      final icon    = _typeIcon(type);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: color.withOpacity(0.15)),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          leading: Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
                            child: Icon(icon, color: color, size: 20),
                          ),
                          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (message.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(message, style: const TextStyle(fontSize: 12, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                              ],
                              const SizedBox(height: 6),
                              Row(children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                  child: Text(type.toUpperCase(), style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                                if (date != null) ...[
                                  const SizedBox(width: 8),
                                  const Icon(Icons.access_time, size: 11, color: Colors.grey),
                                  const SizedBox(width: 3),
                                  Text(
                                    DateFormat('MMM d, h:mm a').format(DateTime.parse(date).toLocal()),
                                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                                  ),
                                ],
                              ]),
                            ],
                          ),
                          isThreeLine: true,
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
