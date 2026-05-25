import 'package:flutter/material.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminFinancePage extends StatefulWidget {
  final ApiService apiService;
  const AdminFinancePage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminFinancePage> createState() => _AdminFinancePageState();
}

class _AdminFinancePageState extends State<AdminFinancePage> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFinance();
  }

  Future<void> _loadFinance() async {
    setState(() => _isLoading = true);
    final data = await widget.apiService.fetchFinanceStats();
    if (mounted) {
      setState(() {
        _stats = data;
        _transactions = data['transactions'] ?? data['recentTransactions'] ?? [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = isDark ? const Color(0xFF1C0F0F) : Colors.white;
    final Color bgColor = isDark ? const Color(0xFF0F0A0A) : const Color(0xFFFDF2F2);

    final totalRevenue = _stats['totalRevenue'] ?? _stats['revenue'] ?? 0;
    final monthlyRevenue = _stats['monthlyRevenue'] ?? _stats['thisMonth'] ?? 0;
    final totalTransactions = _stats['totalTransactions'] ?? _stats['count'] ?? _transactions.length;
    final pendingAmount = _stats['pendingAmount'] ?? _stats['pending'] ?? 0;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: const Text('Finance & Revenue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadFinance),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _adminAccent))
          : RefreshIndicator(
              color: _adminAccent,
              onRefresh: _loadFinance,
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  // Revenue Hero Card
                  Container(
                    padding: const EdgeInsets.all(24.0),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7F1D1D), Color(0xFFB91C1C)],
                        begin: Alignment.topLeft, end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [BoxShadow(color: _adminAccent.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(children: [
                          Icon(Icons.account_balance_wallet_rounded, color: Colors.white70, size: 20),
                          SizedBox(width: 8),
                          Text('TOTAL REVENUE', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                        ]),
                        const SizedBox(height: 12),
                        Text(
                          '$totalRevenue ETB',
                          style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            _buildRevenueChip(label: 'This Month', value: '$monthlyRevenue ETB', icon: Icons.calendar_today),
                            const SizedBox(width: 12),
                            _buildRevenueChip(label: 'Transactions', value: '$totalTransactions', icon: Icons.receipt_long),
                            const SizedBox(width: 12),
                            _buildRevenueChip(label: 'Pending', value: '$pendingAmount ETB', icon: Icons.pending),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Quick Stats Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.8,
                    children: [
                      _buildStatCard(cardBg: cardBg, label: 'Free Users', value: '${_stats['freeUsers'] ?? '—'}', icon: Icons.person_outline, color: Colors.blue),
                      _buildStatCard(cardBg: cardBg, label: 'Premium Users', value: '${_stats['premiumUsers'] ?? '—'}', icon: Icons.star, color: Colors.amber),
                      _buildStatCard(cardBg: cardBg, label: 'Success Rate', value: '${_stats['successRate'] ?? '—'}%', icon: Icons.trending_up, color: Colors.green),
                      _buildStatCard(cardBg: cardBg, label: 'Failed Tx', value: '${_stats['failedTransactions'] ?? '—'}', icon: Icons.error_outline, color: Colors.red),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Recent Transactions
                  Text('Recent Transactions (${_transactions.length})',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),

                  if (_transactions.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16)),
                      child: const Center(child: Text('No transaction records found.', style: TextStyle(color: Colors.grey))),
                    )
                  else
                    ..._transactions.map((tx) {
                      final txId = tx['transactionId']?.toString() ?? tx['_id']?.toString() ?? 'TX-???';
                      final user = tx['user'];
                      final email = (user is Map ? user['email'] : user)?.toString() ?? '—';
                      final amount = tx['amount']?.toString() ?? '0';
                      final status = tx['status']?.toString() ?? 'unknown';
                      final date = tx['createdAt']?.toString();
                      final isSuccess = status.toLowerCase() == 'success' || status.toLowerCase() == 'completed';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: cardBg,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: (isSuccess ? Colors.green : Colors.red).withOpacity(0.15)),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 2))],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: (isSuccess ? Colors.green : Colors.red).withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(isSuccess ? Icons.check : Icons.close, color: isSuccess ? Colors.green : Colors.red, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(txId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, fontFamily: 'monospace')),
                                  Text(email, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                                  if (date != null)
                                    Text(date.substring(0, 10), style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text('$amount ETB', style: TextStyle(fontWeight: FontWeight.bold, color: isSuccess ? Colors.green : Colors.red, fontSize: 14)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (isSuccess ? Colors.green : Colors.red).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(status.toUpperCase(), style: TextStyle(color: isSuccess ? Colors.green : Colors.red, fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }).toList(),

                  const SizedBox(height: 80),
                ],
              ),
            ),
    );
  }

  Widget _buildRevenueChip({required String label, required String value, required IconData icon}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [Icon(icon, size: 12, color: Colors.white70), const SizedBox(width: 4), Text(label, style: const TextStyle(color: Colors.white70, fontSize: 9))]),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({required Color cardBg, required String label, required String value, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16)),
              Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}
