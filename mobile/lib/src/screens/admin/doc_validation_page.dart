import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminDocValidationPage extends StatefulWidget {
  final ApiService apiService;
  const AdminDocValidationPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminDocValidationPage> createState() => _AdminDocValidationPageState();
}

class _AdminDocValidationPageState extends State<AdminDocValidationPage> {
  List<Map<String, dynamic>> _pendingDocs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPendingDocs();
  }

  Future<void> _loadPendingDocs() async {
    setState(() => _isLoading = true);
    final data = await widget.apiService.fetchPendingVehicleValidations();
    if (mounted) setState(() { _pendingDocs = data; _isLoading = false; });
  }

  Future<void> _validate(String id, String decision, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          decision == 'Approved' ? '✓ Approve Document' : '✗ Reject Document',
          style: TextStyle(color: decision == 'Approved' ? Colors.green : _adminAccent, fontWeight: FontWeight.bold),
        ),
        content: Text('Are you sure you want to ${decision.toLowerCase()} the document for "$name"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: decision == 'Approved' ? Colors.green : _adminAccent),
            child: Text(decision, style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final ok = await widget.apiService.adminVerifyVehicleDocument(id, decision);
      if (ok) {
        setState(() => _pendingDocs.removeWhere((d) => d['_id']?.toString() == id));
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Document $decision successfully.'),
            backgroundColor: decision == 'Approved' ? Colors.green : Colors.orange,
          ),
        );
      } else {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to $decision document. Check API.'), backgroundColor: Colors.red),
        );
      }
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
        title: Text(tr('admin.doc_validation'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadPendingDocs),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _adminAccent))
          : _pendingDocs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), shape: BoxShape.circle),
                        child: const Icon(Icons.verified_rounded, size: 64, color: Colors.green),
                      ),
                      const SizedBox(height: 16),
                      const Text('All caught up!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.green)),
                      const SizedBox(height: 8),
                      const Text('No pending documents to validate.', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: _adminAccent,
                  onRefresh: _loadPendingDocs,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12.0),
                    itemCount: _pendingDocs.length,
                    itemBuilder: (context, index) {
                      final doc = _pendingDocs[index];
                      final id = doc['_id']?.toString() ?? '';
                      final plateNumber = doc['plateNumber']?.toString() ?? doc['vehiclePlate']?.toString() ?? 'Unknown Plate';
                      final make = doc['make']?.toString() ?? '';
                      final model = doc['model']?.toString() ?? '';
                      final vehicleName = [make, model].where((s) => s.isNotEmpty).join(' ');
                      final docType = doc['documentType']?.toString() ?? doc['docType']?.toString() ?? 'Vehicle Document';
                      final ownerInfo = doc['owner'] ?? doc['reportedBy'];
                      final ownerEmail = (ownerInfo is Map ? ownerInfo['email'] : ownerInfo)?.toString() ?? '—';
                      final date = doc['createdAt']?.toString();

                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.amber.withOpacity(0.3)),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 3))],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(color: Colors.amber.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                    child: const Icon(Icons.description_rounded, color: Colors.amber, size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(plateNumber, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1)),
                                        if (vehicleName.isNotEmpty)
                                          Text(vehicleName, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.amber.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                                    child: const Text('PENDING', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),

                              const Divider(height: 20),

                              // Details
                              _buildInfoRow(Icons.article_outlined, 'Document Type', docType),
                              const SizedBox(height: 6),
                              _buildInfoRow(Icons.person_outline, 'Submitted By', ownerEmail),
                              if (date != null) ...[
                                const SizedBox(height: 6),
                                _buildInfoRow(Icons.calendar_today_outlined, 'Submitted On',
                                    DateFormat('MMM d, yyyy h:mm a').format(DateTime.parse(date).toLocal())),
                              ],

                              const SizedBox(height: 16),

                              // Action Buttons
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _validate(id, 'Rejected', plateNumber),
                                      icon: const Icon(Icons.close_rounded, size: 18),
                                      label: Text(tr('admin.reject')),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: _adminAccent,
                                        side: const BorderSide(color: _adminAccent),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      onPressed: () => _validate(id, 'Approved', plateNumber),
                                      icon: const Icon(Icons.check_rounded, size: 18, color: Colors.white),
                                      label: Text(tr('admin.approve'), style: const TextStyle(color: Colors.white)),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: Colors.grey),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600)),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis)),
      ],
    );
  }
}
