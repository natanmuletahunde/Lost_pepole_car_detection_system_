import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminFeedbackPage extends StatefulWidget {
  final ApiService apiService;
  const AdminFeedbackPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminFeedbackPage> createState() => _AdminFeedbackPageState();
}

class _AdminFeedbackPageState extends State<AdminFeedbackPage> {
  List<Map<String, dynamic>> _feedbacks = [];
  bool _isLoading = true;
  int _currentPage = 1;
  int _totalFeedback = 0;
  int _totalPages = 1;
  double _avgRating = 0;
  String _ratingFilter = '';
  String _typeFilter = '';

  @override
  void initState() {
    super.initState();
    _loadFeedback();
  }

  Future<void> _loadFeedback() async {
    setState(() => _isLoading = true);
    final data = await widget.apiService.fetchAllFeedback(
      page: _currentPage,
      limit: 20,
      rating: _ratingFilter.isEmpty ? null : int.tryParse(_ratingFilter),
      type: _typeFilter.isEmpty ? null : _typeFilter,
    );
    print('Feedback page received data: $data');
    if (mounted) {
      setState(() {
        _feedbacks = data['feedback'] ?? [];
        _avgRating = data['avgRating'] ?? 0;
        _totalFeedback = data['pagination']?['total'] ?? 0;
        _totalPages = data['pagination']?['pages'] ?? 1;
        _isLoading = false;
      });
      print('Feedback loaded: ${_feedbacks.length}, Total: $_totalFeedback, Pages: $_totalPages, Avg Rating: $_avgRating');
    }
  }

  Future<void> _respond(String id, String existingReply) async {
    final ctrl = TextEditingController(text: existingReply);
    final reply = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Send Admin Reply', style: TextStyle(color: _adminAccent, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: ctrl,
          maxLines: 4,
          decoration: const InputDecoration(
            hintText: 'Type your response...',
            border: OutlineInputBorder(),
            focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: _adminAccent)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            style: ElevatedButton.styleFrom(backgroundColor: _adminAccent),
            child: const Text('Send Reply', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    ctrl.dispose();
    if (reply != null && reply.isNotEmpty) {
      final ok = await widget.apiService.respondToFeedback(id, reply);
      if (ok) {
        _loadFeedback();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reply sent successfully.'), backgroundColor: Colors.green),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = isDark ? const Color(0xFF1C0F0F) : Colors.white;
    final Color bgColor = isDark ? const Color(0xFF0F0A0A) : const Color(0xFFFDF2F2);
    final Color textMuted = isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('User Feedback', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadFeedback),
        ],
      ),
      body: Column(
        children: [
          // Stats Header
          Container(
            color: _adminPrimary.withOpacity(0.05),
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$_totalFeedback Total',
                        style: TextStyle(
                          color: _adminAccent,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.star, size: 16, color: Colors.amber),
                          const SizedBox(width: 4),
                          Text(
                            'Avg Rating: ${_avgRating.toStringAsFixed(1)}',
                            style: TextStyle(color: textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Rating Filter
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _adminAccent.withOpacity(0.3)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _ratingFilter.isEmpty ? 'All' : _ratingFilter,
                      hint: Text('Rating', style: TextStyle(color: textMuted, fontSize: 12)),
                      style: TextStyle(color: textMuted, fontSize: 12),
                      items: ['All', '5', '4', '3', '2', '1'].map((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value == 'All' ? 'All Ratings' : '$value Stars'),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _ratingFilter = value == 'All' ? '' : value!;
                          _currentPage = 1;
                        });
                        _loadFeedback();
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Feedback List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: _adminAccent))
                : _feedbacks.isEmpty
                    ? Center(child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.rate_review_outlined, size: 64, color: _adminAccent.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          const Text('No feedback submissions yet.', style: TextStyle(color: Colors.grey, fontSize: 15)),
                        ],
                      ))
                    : RefreshIndicator(
                        color: _adminAccent,
                        onRefresh: _loadFeedback,
                        child: Column(
                          children: [
                            Expanded(
                              child: ListView.builder(
                                padding: const EdgeInsets.all(12),
                                itemCount: _feedbacks.length,
                                itemBuilder: (context, index) {
                                  final fb = _feedbacks[index];
                                  final id = fb['_id']?.toString() ?? '';
                                  final user = fb['user'];
                                  final userEmail = (user is Map ? user['email'] : user)?.toString() ?? 'Unknown';
                                  final userName = (user is Map ? '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim() : userEmail);
                                  final subject = fb['subject']?.toString() ?? 'No subject';
                                  final content = fb['content'] ?? fb['message'] ?? fb['body'] ?? '';
                                  final reply = fb['response']?.toString() ?? fb['adminReply']?.toString() ?? '';
                                  final hasReply = reply.isNotEmpty;
                                  final date = fb['createdAt']?.toString();
                                  final rating = fb['rating'] ?? 0;
                                  final type = fb['type']?.toString() ?? 'general';

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    decoration: BoxDecoration(
                                      color: cardBg,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: hasReply ? Colors.green.withOpacity(0.2) : _adminAccent.withOpacity(0.1)),
                                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16.0),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              CircleAvatar(
                                                radius: 20,
                                                backgroundColor: Colors.teal.withOpacity(0.15),
                                                child: Text(
                                                  userName.isNotEmpty ? userName[0].toUpperCase() : '?',
                                                  style: const TextStyle(color: Colors.teal, fontWeight: FontWeight.bold, fontSize: 18),
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.teal)),
                                                    Text(userEmail, style: TextStyle(fontSize: 11, color: textMuted)),
                                                    if (date != null)
                                                      Text(DateFormat('MMM d, yyyy h:mm a').format(DateTime.parse(date).toLocal()),
                                                          style: TextStyle(fontSize: 10, color: textMuted)),
                                                  ],
                                                ),
                                              ),
                                              Column(
                                                children: [
                                                  Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: List.generate(5, (i) => Icon(
                                                      i < rating ? Icons.star : Icons.star_border,
                                                      size: 14,
                                                      color: Colors.amber,
                                                    )),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: _adminAccent.withOpacity(0.1),
                                                      borderRadius: BorderRadius.circular(6),
                                                    ),
                                                    child: Text(type.toUpperCase(), style: TextStyle(color: _adminAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 12),
                                          Text(subject, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                          const SizedBox(height: 8),
                                          Text(content.toString(), style: const TextStyle(fontSize: 13, height: 1.5)),
                                          if (hasReply) ...[
                                            const Divider(height: 20),
                                            Container(
                                              padding: const EdgeInsets.all(12),
                                              decoration: BoxDecoration(
                                                color: Colors.green.withOpacity(0.06),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: Colors.green.withOpacity(0.2)),
                                              ),
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      const Icon(Icons.reply, size: 14, color: Colors.green),
                                                      const SizedBox(width: 6),
                                                      Text('Admin Reply', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(reply, style: const TextStyle(fontSize: 12, color: Colors.green, fontStyle: FontStyle.italic)),
                                                ],
                                              ),
                                            ),
                                          ],
                                          const SizedBox(height: 12),
                                          Align(
                                            alignment: Alignment.centerRight,
                                            child: OutlinedButton.icon(
                                              onPressed: () => _respond(id, reply),
                                              icon: const Icon(Icons.reply, size: 16),
                                              label: Text(hasReply ? 'Update Reply' : 'Reply'),
                                              style: OutlinedButton.styleFrom(
                                                foregroundColor: _adminAccent,
                                                side: const BorderSide(color: _adminAccent),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                            if (_totalPages > 1)
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: cardBg,
                                  border: Border(top: BorderSide(color: _adminAccent.withOpacity(0.1))),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Page $_currentPage of $_totalPages ($_totalFeedback total)',
                                      style: TextStyle(color: textMuted, fontSize: 12),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.chevron_left),
                                          onPressed: _currentPage > 1
                                              ? () {
                                                  setState(() => _currentPage--);
                                                  _loadFeedback();
                                                }
                                              : null,
                                        ),
                                        ...List.generate(
                                          _totalPages > 5 ? 5 : _totalPages,
                                          (index) {
                                            final pageNum = _totalPages > 5
                                                ? _currentPage <= 3
                                                    ? index + 1
                                                    : _currentPage >= _totalPages - 2
                                                        ? _totalPages - 4 + index
                                                        : _currentPage - 2 + index
                                                : index + 1;
                                            return Padding(
                                              padding: const EdgeInsets.symmetric(horizontal: 4),
                                              child: GestureDetector(
                                                onTap: () {
                                                  setState(() => _currentPage = pageNum);
                                                  _loadFeedback();
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                  decoration: BoxDecoration(
                                                    color: _currentPage == pageNum ? _adminAccent : Colors.transparent,
                                                    borderRadius: BorderRadius.circular(8),
                                                    border: Border.all(color: _adminAccent.withOpacity(0.3)),
                                                  ),
                                                  child: Text(
                                                    '$pageNum',
                                                    style: TextStyle(
                                                      color: _currentPage == pageNum ? Colors.white : textMuted,
                                                      fontWeight: _currentPage == pageNum ? FontWeight.bold : FontWeight.normal,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.chevron_right),
                                          onPressed: _currentPage < _totalPages
                                              ? () {
                                                  setState(() => _currentPage++);
                                                  _loadFeedback();
                                                }
                                              : null,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
