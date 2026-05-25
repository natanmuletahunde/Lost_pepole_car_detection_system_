import 'package:flutter/material.dart';
import '../../services/api_service.dart';

const Color _adminPrimary = Color(0xFF991B1B);
const Color _adminAccent  = Color(0xFFDC2626);

class AdminAccountsPage extends StatefulWidget {
  final ApiService apiService;
  const AdminAccountsPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<AdminAccountsPage> createState() => _AdminAccountsPageState();
}

class _AdminAccountsPageState extends State<AdminAccountsPage> {
  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _roleFilter = '';
  String _statusFilter = '';
  int _currentPage = 1;
  int _totalUsers = 0;
  int _totalPages = 1;
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    final data = await widget.apiService.fetchAllUsers(
      role: _roleFilter.isEmpty ? null : _roleFilter,
      search: _searchQuery.isEmpty ? null : _searchQuery,
      page: _currentPage,
      limit: 20,
    );
    print('Accounts page received data: $data');
    if (mounted) {
      setState(() {
        _users = data['users'] ?? [];
        _totalUsers = data['pagination']?['total'] ?? 0;
        _totalPages = data['pagination']?['pages'] ?? 1;
        _isLoading = false;
      });
      print('Users loaded: ${_users.length}, Total: $_totalUsers, Pages: $_totalPages');
    }
  }

  String _formatLastActive(String? lastLogin) {
    if (lastLogin == null) return 'Never';
    try {
      final lastLoginDate = DateTime.parse(lastLogin);
      final now = DateTime.now();
      final diff = now.difference(lastLoginDate);
      
      if (diff.inDays == 0) return 'Today';
      if (diff.inDays == 1) return 'Yesterday';
      if (diff.inDays < 7) return '${diff.inDays} days ago';
      if (diff.inDays < 30) return '${(diff.inDays / 7).floor()} weeks ago';
      if (diff.inDays < 365) return '${(diff.inDays / 30).floor()} months ago';
      return '${(diff.inDays / 365).floor()} years ago';
    } catch (e) {
      return 'Unknown';
    }
  }

  String _formatJoinedDate(String? createdAt) {
    if (createdAt == null) return 'Unknown';
    try {
      final date = DateTime.parse(createdAt);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return 'Unknown';
    }
  }

  Future<void> _updateRole(String id, String newRole) async {
    final ok = await widget.apiService.adminUpdateUser(id, {'role': newRole});
    if (ok) {
      _loadUsers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('User role updated to $newRole'), backgroundColor: Colors.green),
        );
      }
    }
  }

  Future<void> _toggleActive(String id, bool currentlyActive) async {
    final ok = await widget.apiService.adminUpdateUser(id, {'isActive': !currentlyActive});
    if (ok) {
      _loadUsers();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(currentlyActive ? 'User deactivated' : 'User activated'),
            backgroundColor: currentlyActive ? Colors.orange : Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _deleteUser(String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete User', style: TextStyle(color: _adminAccent, fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to permanently delete "$name"?'),
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
      final ok = await widget.apiService.adminDeleteUser(id);
      if (ok) {
        _loadUsers();
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User deleted.'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _roleColor(String role) {
    switch (role.toLowerCase()) {
      case 'admin': return _adminAccent;
      case 'moderator': return Colors.orange;
      default: return Colors.blue;
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
        title: const Text('Accounts Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: _adminPrimary,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white), onPressed: _loadUsers),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter Bar
          Container(
            color: _adminPrimary.withOpacity(0.05),
            padding: const EdgeInsets.all(12.0),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Search by name or email...',
                    prefixIcon: const Icon(Icons.search, color: _adminAccent),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _adminAccent.withOpacity(0.3))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: _adminAccent)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  onSubmitted: (v) { _searchQuery = v; _loadUsers(); },
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'user', 'admin', 'moderator'].map((role) {
                      final isSelected = (role == 'All' && _roleFilter.isEmpty) || _roleFilter == role;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(role, style: TextStyle(color: isSelected ? Colors.white : _adminAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          selected: isSelected,
                          selectedColor: _adminAccent,
                          backgroundColor: _adminAccent.withOpacity(0.1),
                          side: BorderSide(color: _adminAccent.withOpacity(0.3)),
                          onSelected: (_) {
                            setState(() => _roleFilter = role == 'All' ? '' : role);
                            _loadUsers();
                          },
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Users List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: _adminAccent))
                : _users.isEmpty
                    ? Center(child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 60, color: _adminAccent.withOpacity(0.3)),
                          const SizedBox(height: 12),
                          const Text('No users found.', style: TextStyle(color: Colors.grey)),
                        ],
                      ))
                    : RefreshIndicator(
                        color: _adminAccent,
                        onRefresh: _loadUsers,
                        child: Column(
                          children: [
                            Expanded(
                              child: ListView.builder(
                                padding: const EdgeInsets.all(12.0),
                                itemCount: _users.length,
                                itemBuilder: (context, index) {
                                  final u = _users[index];
                                  final id = u['_id']?.toString() ?? '';
                                  final firstName = u['firstName']?.toString() ?? '';
                                  final lastName = u['lastName']?.toString() ?? '';
                                  final name = '$firstName $lastName'.trim();
                                  final email = u['email']?.toString() ?? '';
                                  final role = u['role']?.toString() ?? 'user';
                                  final isActive = u['isActive'] != false;
                                  final roleColor = _roleColor(role);
                                  final lastLogin = u['lastLogin']?.toString();
                                  final createdAt = u['createdAt']?.toString();
                                  final registrations = u['registrations'] ?? 0;

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 10),
                                    decoration: BoxDecoration(
                                      color: cardBg,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: _adminAccent.withOpacity(0.1)),
                                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
                                    ),
                                    child: ListTile(
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                      leading: CircleAvatar(
                                        radius: 24,
                                        backgroundColor: roleColor.withOpacity(0.15),
                                        child: Text(
                                          name.isNotEmpty ? name[0].toUpperCase() : '?',
                                          style: TextStyle(color: roleColor, fontWeight: FontWeight.bold, fontSize: 20),
                                        ),
                                      ),
                                      title: Row(
                                        children: [
                                          Expanded(child: Text(name.isNotEmpty ? name : email, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(color: roleColor.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                                            child: Text(role.toUpperCase(), style: TextStyle(color: roleColor, fontSize: 9, fontWeight: FontWeight.bold)),
                                          ),
                                        ],
                                      ),
                                      subtitle: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const SizedBox(height: 4),
                                          Text(email, style: const TextStyle(fontSize: 12)),
                                          const SizedBox(height: 4),
                                          Row(
                                            children: [
                                              Container(
                                                width: 6, height: 6,
                                                decoration: BoxDecoration(color: isActive ? Colors.green : Colors.grey, shape: BoxShape.circle),
                                              ),
                                              const SizedBox(width: 4),
                                              Text(isActive ? 'Active' : 'Inactive', style: TextStyle(color: isActive ? Colors.green : Colors.grey, fontSize: 11)),
                                              const SizedBox(width: 12),
                                              Icon(Icons.calendar_today, size: 12, color: textMuted),
                                              const SizedBox(width: 4),
                                              Text('Joined: ${_formatJoinedDate(createdAt)}', style: TextStyle(color: textMuted, fontSize: 10)),
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Row(
                                            children: [
                                              Icon(Icons.access_time, size: 12, color: textMuted),
                                              const SizedBox(width: 4),
                                              Text('Last active: ${_formatLastActive(lastLogin)}', style: TextStyle(color: textMuted, fontSize: 10)),
                                              const SizedBox(width: 12),
                                              Icon(Icons.folder_open, size: 12, color: textMuted),
                                              const SizedBox(width: 4),
                                              Text('$registrations registrations', style: TextStyle(color: textMuted, fontSize: 10)),
                                            ],
                                          ),
                                        ],
                                      ),
                                      isThreeLine: true,
                                      trailing: PopupMenuButton<String>(
                                        icon: Icon(Icons.more_vert, color: _adminAccent.withOpacity(0.7)),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        onSelected: (action) {
                                          if (action == 'toggle') _toggleActive(id, isActive);
                                          else if (action == 'delete') _deleteUser(id, name);
                                          else _updateRole(id, action);
                                        },
                                        itemBuilder: (_) => [
                                          const PopupMenuItem(value: 'user', child: Row(children: [Icon(Icons.person, size: 16), SizedBox(width: 8), Text('Set User')])),
                                          const PopupMenuItem(value: 'moderator', child: Row(children: [Icon(Icons.shield, size: 16, color: Colors.orange), SizedBox(width: 8), Text('Set Moderator')])),
                                          const PopupMenuItem(value: 'admin', child: Row(children: [Icon(Icons.admin_panel_settings, size: 16, color: _adminAccent), SizedBox(width: 8), Text('Set Admin')])),
                                          const PopupMenuDivider(),
                                          PopupMenuItem(value: 'toggle', child: Row(children: [Icon(isActive ? Icons.block : Icons.check_circle, size: 16, color: isActive ? Colors.orange : Colors.green), SizedBox(width: 8), Text(isActive ? 'Deactivate' : 'Activate')])),
                                          const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete_forever, size: 16, color: Colors.red), SizedBox(width: 8), Text('Delete', style: TextStyle(color: Colors.red))])),
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
                                      'Page $_currentPage of $_totalPages ($_totalUsers total)',
                                      style: TextStyle(color: textMuted, fontSize: 12),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.chevron_left),
                                          onPressed: _currentPage > 1
                                              ? () {
                                                  setState(() => _currentPage--);
                                                  _loadUsers();
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
                                                  _loadUsers();
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
                                                  _loadUsers();
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
