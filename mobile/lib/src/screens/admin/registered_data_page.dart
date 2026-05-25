import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminRegisteredDataPage extends StatefulWidget {
  final ApiService apiService;
  const AdminRegisteredDataPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminRegisteredDataPage> createState() => _AdminRegisteredDataPageState();
}

class _AdminRegisteredDataPageState extends State<AdminRegisteredDataPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _cases = [];
  bool _isLoading = true;
  String _activeTab = 'all'; // all, person, vehicle

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadCases();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadCases() async {
    setState(() => _isLoading = true);
    final data = await widget.apiService.fetchAllAdminCases();
    if (mounted) setState(() { _cases = data; _isLoading = false; });
  }

  Future<void> _deleteCase(String type, String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Case', style: TextStyle(color: _adminAccent, fontWeight: FontWeight.bold)),
        content: Text('Permanently delete the record for "$name"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: _adminAccent),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      final ok = await widget.apiService.adminDeleteCase(type, id);
      if (ok) {
        _loadCases();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Case removed from directory.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _updateStatus(String id, String currentStatus) async {
    final statuses = ['active', 'resolved', 'closed'];
    final newStatus = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Update Status', style: TextStyle(color: _adminAccent, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: statuses.map((s) => RadioListTile<String>(
            title: Text(s.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            value: s,
            groupValue: currentStatus,
            activeColor: _adminAccent,
            onChanged: (v) => Navigator.pop(ctx, v),
          )).toList(),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel'))],
      ),
    );
    if (newStatus != null && newStatus != currentStatus) {
      final ok = await widget.apiService.adminUpdateCaseStatus(id, newStatus);
      if (ok) {
        _loadCases();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status updated to $newStatus'), backgroundColor: Colors.green),
        );
      }
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_activeTab == 'all') return _cases;
    return _cases.where((c) {
      final t = (c['type'] ?? c['caseType'] ?? '').toString().toLowerCase();
      return _activeTab == 'person' ? t.contains('person') : t.contains('vehicle');
    }).toList();
  }

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'resolved': return Colors.green;
      case 'active': return Colors.orange;
      case 'closed': return Colors.grey;
      default: return Colors.blue;
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
        title: const Text('Directory Cases', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadCases),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          onTap: (i) => setState(() => _activeTab = ['all', 'person', 'vehicle'][i]),
          tabs: const [
            Tab(text: 'All'),
            Tab(icon: Icon(Icons.person, size: 16), text: 'Persons'),
            Tab(icon: Icon(Icons.directions_car, size: 16), text: 'Vehicles'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _adminAccent))
          : _filtered.isEmpty
              ? Center(child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.storage_rounded, size: 60, color: _adminAccent.withOpacity(0.3)),
                    const SizedBox(height: 12),
                    const Text('No cases found.', style: TextStyle(color: Colors.grey)),
                  ],
                ))
              : RefreshIndicator(
                  color: _adminAccent,
                  onRefresh: _loadCases,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12.0),
                    itemCount: _filtered.length,
                    itemBuilder: (context, index) {
                      final item = _filtered[index];
                      final id = item['_id']?.toString() ?? '';
                      final type = (item['type'] ?? item['caseType'] ?? 'person').toString().toLowerCase();
                      final isPerson = type.contains('person');
                      final name = isPerson
                          ? (item['fullName'] ?? item['name'] ?? 'Unknown').toString()
                          : (item['plateNumber'] ?? item['vehiclePlate'] ?? item['make'] ?? 'Unknown').toString();
                      final status = (item['status'] ?? 'active').toString();
                      final location = (item['lastSeenLocation'] ?? item['lastLocation'] ?? item['location'] ?? '—').toString();
                      final date = item['createdAt']?.toString();
                      final statusColor = _statusColor(status);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _adminAccent.withOpacity(0.1)),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          leading: Container(
                            width: 44, height: 44,
                            decoration: BoxDecoration(
                              color: (isPerson ? Colors.blue : Colors.indigo).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(isPerson ? Icons.person : Icons.directions_car,
                                color: isPerson ? Colors.blue : Colors.indigo, size: 22),
                          ),
                          title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Row(children: [
                                const Icon(Icons.location_on, size: 12, color: Colors.grey),
                                const SizedBox(width: 4),
                                Expanded(child: Text(location, style: const TextStyle(fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis)),
                              ]),
                              const SizedBox(height: 4),
                              Row(children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                                  child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                                if (date != null) ...[
                                  const SizedBox(width: 8),
                                  Text(DateFormat('MMM d, yyyy').format(DateTime.parse(date).toLocal()),
                                      style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ]),
                            ],
                          ),
                          isThreeLine: true,
                          trailing: PopupMenuButton<String>(
                            icon: Icon(Icons.more_vert, color: _adminAccent.withOpacity(0.7)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            onSelected: (action) {
                              if (action == 'status') _updateStatus(id, status);
                              if (action == 'delete') _deleteCase(type, id, name);
                            },
                            itemBuilder: (_) => [
                              const PopupMenuItem(value: 'status', child: Row(children: [Icon(Icons.edit, size: 16, color: Colors.blue), SizedBox(width: 8), Text('Update Status')])),
                              const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_forever, size: 16, color: Colors.red), SizedBox(width: 8), Text('Delete', style: TextStyle(color: Colors.red))])),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
