import 'package:flutter/material.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminNotificationPage extends StatefulWidget {
  final ApiService apiService;
  const AdminNotificationPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminNotificationPage> createState() => _AdminNotificationPageState();
}

class _AdminNotificationPageState extends State<AdminNotificationPage> {
  final TextEditingController _titleCtrl = TextEditingController();
  final TextEditingController _bodyCtrl  = TextEditingController();
  String _selectedType = 'info';
  bool _isSending = false;
  List<Map<String, dynamic>> _sentHistory = [];

  final List<Map<String, dynamic>> _typeOptions = [
    {'value': 'info',    'label': 'Info',    'icon': Icons.info_outline,           'color': Colors.blue},
    {'value': 'warning', 'label': 'Warning', 'icon': Icons.warning_amber_rounded,  'color': Colors.orange},
    {'value': 'alert',   'label': 'Alert',   'icon': Icons.notifications_active,   'color': Colors.red},
    {'value': 'success', 'label': 'Success', 'icon': Icons.check_circle_outline,   'color': Colors.green},
  ];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _bodyCtrl.dispose();
    super.dispose();
  }

  Future<void> _dispatch() async {
    if (_titleCtrl.text.trim().isEmpty || _bodyCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in both title and message fields.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _isSending = true);
    final ok = await widget.apiService.sendBulkNotification(
      _titleCtrl.text.trim(),
      _bodyCtrl.text.trim(),
      type: _selectedType,
    );
    setState(() => _isSending = false);

    if (ok) {
      setState(() {
        _sentHistory.insert(0, {
          'title': _titleCtrl.text.trim(),
          'message': _bodyCtrl.text.trim(),
          'type': _selectedType,
          'sentAt': DateTime.now().toIso8601String(),
        });
      });
      _titleCtrl.clear();
      _bodyCtrl.clear();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✓ Global notification dispatched to all users!'), backgroundColor: Colors.green),
      );
    } else {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to dispatch notification. Try again.'), backgroundColor: Colors.red),
      );
    }
  }

  Color _typeColor(String type) {
    return (_typeOptions.firstWhere((t) => t['value'] == type, orElse: () => {'color': Colors.grey})['color'] as Color);
  }

  IconData _typeIcon(String type) {
    return (_typeOptions.firstWhere((t) => t['value'] == type, orElse: () => {'icon': Icons.notifications})['icon'] as IconData);
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = isDark ? const Color(0xFF1C0F0F) : Colors.white;
    final Color bgColor = isDark ? const Color(0xFF0F0A0A) : const Color(0xFFFDF2F2);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('Dispatch Global Alert', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Composer Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _adminAccent.withOpacity(0.15)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: _adminAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.campaign_rounded, color: _adminAccent, size: 20),
                    ),
                    const SizedBox(width: 10),
                    const Text('New Broadcast Alert', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 20),

                // Alert Type Selector
                const Text('Alert Type', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.grey)),
                const SizedBox(height: 8),
                Row(
                  children: _typeOptions.map((t) {
                    final isSelected = _selectedType == t['value'];
                    final color = t['color'] as Color;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedType = t['value'] as String),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.only(right: 6),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? color.withOpacity(0.15) : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: isSelected ? color : Colors.grey.withOpacity(0.3), width: isSelected ? 1.5 : 1),
                          ),
                          child: Column(
                            children: [
                              Icon(t['icon'] as IconData, color: isSelected ? color : Colors.grey, size: 18),
                              const SizedBox(height: 4),
                              Text(t['label'] as String, style: TextStyle(color: isSelected ? color : Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                TextField(
                  controller: _titleCtrl,
                  decoration: InputDecoration(
                    labelText: 'Alert Title *',
                    hintText: 'e.g. System Maintenance Tonight',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _adminAccent)),
                    prefixIcon: const Icon(Icons.title, color: _adminAccent),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _bodyCtrl,
                  maxLines: 5,
                  decoration: InputDecoration(
                    labelText: 'Message Body *',
                    hintText: 'Write the notification message here...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _adminAccent)),
                    alignLabelWithHint: true,
                    prefixIcon: const Padding(padding: EdgeInsets.only(bottom: 60), child: Icon(Icons.message, color: _adminAccent)),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: _isSending ? null : _dispatch,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _adminAccent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    icon: _isSending
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: Colors.white),
                    label: Text(
                      _isSending ? 'Dispatching...' : 'Dispatch to All Users',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Session History
          if (_sentHistory.isNotEmpty) ...[
            const Text('Sent This Session', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            ..._sentHistory.map((item) {
              final type = item['type'] as String;
              final color = _typeColor(type);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Icon(_typeIcon(type), color: color, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text(item['message'] as String, style: const TextStyle(fontSize: 11, color: Colors.grey), maxLines: 2, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const Icon(Icons.check_circle, color: Colors.green, size: 16),
                  ],
                ),
              );
            }).toList(),
          ],

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
