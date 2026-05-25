import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';
import '../../models/case_model.dart';
import 'notifications_page.dart';

class UserReportedCasesPage extends StatefulWidget {
  final ApiService apiService;
  const UserReportedCasesPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<UserReportedCasesPage> createState() => _UserReportedCasesPageState();
}

class _UserReportedCasesPageState extends State<UserReportedCasesPage> {
  List<MissingPerson> _persons = [];
  List<MissingVehicle> _vehicles = [];
  List<Map<String, dynamic>> _sightings = [];
  bool _isLoading = true;

  String _searchQuery = '';
  int _unreadNotificationCount = 0;

  // Stats
  int _totalCases = 0;
  int _activeCases = 0;
  int _resolvedCases = 0;

  @override
  void initState() {
    super.initState();
    _loadAllData();
    _loadUnreadNotificationsCount();
  }

  Future<void> _loadUnreadNotificationsCount() async {
    try {
      final list = await widget.apiService.fetchUserNotifications();
      final unread = list.where((n) => n['isRead'] == false || n['isRead'] == 0 || n['isRead'] == 'false').length;
      if (mounted) {
        setState(() {
          _unreadNotificationCount = unread;
        });
      }
    } catch (_) {}
  }

  Future<void> _loadAllData() async {
    setState(() => _isLoading = true);
    try {
      final Future<List<MissingPerson>> personsFuture = widget.apiService.fetchMyMissingPersons();
      final Future<List<MissingVehicle>> vehiclesFuture = widget.apiService.fetchMyMissingVehicles();
      final Future<List<Map<String, dynamic>>> sightingsFuture = widget.apiService.fetchMySightings();

      final results = await Future.wait([personsFuture, vehiclesFuture, sightingsFuture]);

      _persons = results[0] as List<MissingPerson>;
      _vehicles = results[1] as List<MissingVehicle>;
      _sightings = results[2] as List<Map<String, dynamic>>;

      _calculateStats();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(tr('sighting.failed'))),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _calculateStats() {
    _totalCases = _persons.length + _vehicles.length;
    
    final activePersons = _persons.where((p) => p.status.toLowerCase() == 'active').length;
    final activeVehicles = _vehicles.where((v) => v.status.toLowerCase() == 'active').length;
    _activeCases = activePersons + activeVehicles;

    _resolvedCases = _totalCases - _activeCases;
  }

  List<dynamic> _getFilteredCases() {
    final List<dynamic> allCases = [..._persons, ..._vehicles];
    if (_searchQuery.trim().isEmpty) {
      return allCases;
    }

    final query = _searchQuery.toLowerCase();
    return allCases.where((item) {
      if (item is MissingPerson) {
        return item.firstName.toLowerCase().contains(query) ||
            item.lastName.toLowerCase().contains(query) ||
            item.location.toLowerCase().contains(query) ||
            item.status.toLowerCase().contains(query);
      } else if (item is MissingVehicle) {
        return item.plateNumber.toLowerCase().contains(query) ||
            item.model.toLowerCase().contains(query) ||
            item.color.toLowerCase().contains(query) ||
            item.location.toLowerCase().contains(query) ||
            item.status.toLowerCase().contains(query);
      }
      return false;
    }).toList();
  }

  List<Map<String, dynamic>> _getMatchedSightings(dynamic caseItem) {
    if (caseItem is MissingVehicle) {
      final plate = caseItem.plateNumber.toUpperCase().replaceAll(' ', '');
      return _sightings.where((s) {
        final sType = s['type']?.toString().toLowerCase() ?? '';
        final sPlate = s['plateNumber']?.toString().toUpperCase().replaceAll(' ', '') ?? '';
        return sType == 'vehicle' && sPlate.isNotEmpty && sPlate == plate;
      }).toList();
    } else if (caseItem is MissingPerson) {
      final first = caseItem.firstName.toLowerCase();
      final last = caseItem.lastName.toLowerCase();
      return _sightings.where((s) {
        final sType = s['type']?.toString().toLowerCase() ?? '';
        final sName = s['name']?.toString().toLowerCase() ?? '';
        return sType == 'person' &&
            sName.isNotEmpty &&
            (sName.contains(first) || sName.contains(last));
      }).toList();
    }
    return [];
  }

  Future<void> _resolveCase(dynamic caseItem) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(tr('alerts.mark_resolved')),
        content: Text(tr('alerts.confirm_resolve')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(tr('report_case.prev_step')),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
            ),
            child: Text(tr('alerts.mark_resolved')),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      bool success = false;
      if (caseItem is MissingPerson) {
        success = await widget.apiService.resolveMissingPerson(caseItem.id);
      } else if (caseItem is MissingVehicle) {
        success = await widget.apiService.resolveMissingVehicle(caseItem.id);
      }

      if (success) {
        await _loadAllData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Case successfully marked as resolved!')),
          );
        }
      } else {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to resolve case. Please try again.')),
          );
        }
      }
    }
  }

  void _showCaseDetailsBottomSheet(dynamic caseItem, List<Map<String, dynamic>> caseSightings) {
    final bool isPerson = caseItem is MissingPerson;
    final String title = isPerson ? caseItem.fullName : caseItem.plateNumber;
    final String subtitle = isPerson ? 'Age: ${caseItem.age} • Gender: ${caseItem.gender}' : '${caseItem.color} ${caseItem.model}';

    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color sheetBg = Theme.of(context).scaffoldBackgroundColor;
    final Color cardBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color textColor = Theme.of(context).colorScheme.onSurface;
    final Color textMutedColor = Theme.of(context).colorScheme.onSurfaceVariant;
    final Color dividerColor = Theme.of(context).dividerColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: sheetBg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Drag Indicator
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: dividerColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              color: textColor,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            subtitle,
                            style: TextStyle(
                              color: textMutedColor,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: textMutedColor),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Divider(color: dividerColor),

              // Content List
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Cover Image
                    if (caseItem.images.isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          height: 200,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            border: Border.all(color: dividerColor),
                          ),
                          child: Image.network(
                            caseItem.images[0],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Container(
                              color: cardBg,
                              child: Icon(
                                isPerson ? Icons.person : Icons.directions_car,
                                size: 50,
                                color: textMutedColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),

                    // Case Details Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: dividerColor),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.info_outline, color: Theme.of(context).colorScheme.primary, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                tr('alerts.details').toUpperCase(),
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          _buildDetailRow(tr('alerts.reported_on'), 
                              caseItem is MissingPerson ? 'My Reported Case' : 'Vehicle Case'),
                          _buildDetailRow(tr('alerts.last_seen'), caseItem.location),
                          if (isPerson) ...[
                            _buildDetailRow(tr('alerts.age'), caseItem.age.toString()),
                            _buildDetailRow(tr('alerts.gender'), caseItem.gender),
                          ] else ...[
                            _buildDetailRow(tr('alerts.plate'), caseItem.plateNumber),
                          ],
                          _buildDetailRow('Status:', caseItem.status.toUpperCase(), 
                              textColor: caseItem.status.toLowerCase() == 'active' 
                                  ? const Color(0xFFFBBF24) 
                                  : const Color(0xFF34D399)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Sightings Logs Section
                    Row(
                      children: [
                        Icon(Icons.visibility, color: textColor, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          tr('alerts.sighting_logs'),
                          style: TextStyle(
                            color: textColor,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.4)),
                          ),
                          child: Text(
                            '${caseSightings.length}',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (caseSightings.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: cardBg.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.visibility_off, color: textMutedColor, size: 36),
                            const SizedBox(height: 8),
                            Text(
                              tr('alerts.no_sightings'),
                              style: TextStyle(color: textMutedColor, fontSize: 14),
                            ),
                          ],
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: caseSightings.length,
                        itemBuilder: (context, index) {
                          final sighting = caseSightings[index];
                          final isCCTV = sighting['cameraName'] != null;
                          final dateText = sighting['createdAt'] != null
                              ? DateTime.parse(sighting['createdAt']).toLocal().toString().substring(0, 16)
                              : 'Unknown Date';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isCCTV 
                                    ? const Color(0xFF3B82F6).withOpacity(0.3) 
                                    : dividerColor
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          isCCTV ? Icons.videocam : Icons.person_pin,
                                          color: isCCTV ? const Color(0xFF60A5FA) : const Color(0xFFFBBF24),
                                          size: 18,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          isCCTV ? 'AI CAMERA MATCH' : 'COMMUNITY REPORT',
                                          style: TextStyle(
                                            color: isCCTV ? const Color(0xFF60A5FA) : const Color(0xFFFBBF24),
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (isCCTV && sighting['confidence'] != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981).withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          '${sighting['confidence']}% Match',
                                          style: const TextStyle(
                                            color: Color(0xFF34D399),
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                _buildDetailRow('Location:', sighting['location'] ?? 'Unknown Location'),
                                _buildDetailRow('Time logged:', dateText),
                                if (sighting['description'] != null)
                                  _buildDetailRow('Notes:', sighting['description']),
                              ],
                            ),
                          );
                        },
                      ),

                    const SizedBox(height: 32),

                    // Footer Resolve Button
                    if (caseItem.status.toLowerCase() == 'active')
                      ElevatedButton.icon(
                        icon: const Icon(Icons.check_circle_outline),
                        label: Text(tr('alerts.mark_resolved')),
                        onPressed: () {
                          Navigator.pop(context);
                          _resolveCase(caseItem);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? textColor}) {
    final textMutedColor = Theme.of(context).colorScheme.onSurfaceVariant;
    final defaultTextColor = Theme.of(context).colorScheme.onSurface;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(color: textMutedColor.withOpacity(0.8), fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: textColor ?? defaultTextColor,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color darkBgColor = Theme.of(context).scaffoldBackgroundColor;
    final Color cardDarkBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color accentBlue = Theme.of(context).colorScheme.primary;
    final Color lightBlueText = isDark ? const Color(0xFF60A5FA) : Theme.of(context).colorScheme.primary;
    final Color textWhite = Theme.of(context).colorScheme.onBackground;
    final Color textMuted = Theme.of(context).colorScheme.onSurfaceVariant;

    final filteredCases = _getFilteredCases();

    return Scaffold(
      backgroundColor: darkBgColor,
      appBar: AppBar(
        title: Text(
          tr('alerts.title'),
        ),
        actions: [
          // Header Notification Bell
          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => UserNotificationsPage(apiService: widget.apiService),
                    ),
                  ).then((_) => _loadUnreadNotificationsCount());
                },
              ),
              if (_unreadNotificationCount > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEF4444),
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 14,
                      minHeight: 14,
                    ),
                    child: Text(
                      '$_unreadNotificationCount',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadAllData();
          await _loadUnreadNotificationsCount();
        },
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // 1. Metric stats header panel
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          tr('alerts.total_cases'),
                          '$_totalCases',
                          const Color(0xFF3B82F6),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricCard(
                          tr('alerts.active'),
                          '$_activeCases',
                          const Color(0xFFF59E0B),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricCard(
                          tr('alerts.resolved'),
                          '$_resolvedCases',
                          const Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // 2. Search panel
                  TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: TextStyle(color: textWhite),
                    decoration: InputDecoration(
                      hintText: tr('alerts.search_placeholder'),
                      hintStyle: TextStyle(color: textMuted),
                      prefixIcon: Icon(Icons.search, color: textMuted),
                      filled: true,
                      fillColor: cardDarkBg,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 3. Lists of combined alert cases
                  if (filteredCases.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 80),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.report_off, color: textMuted, size: 60),
                          const SizedBox(height: 16),
                          Text(
                            tr('alerts.no_cases'),
                            style: TextStyle(color: textMuted, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: filteredCases.length,
                      itemBuilder: (context, index) {
                        final caseItem = filteredCases[index];
                        final bool isPerson = caseItem is MissingPerson;
                        final List<Map<String, dynamic>> caseSightings = _getMatchedSightings(caseItem);

                        final String title = isPerson ? caseItem.fullName : caseItem.plateNumber;
                        final String category = isPerson ? tr('report_case.person') : tr('report_case.vehicle');
                        final bool isResolved = caseItem.status.toLowerCase() == 'resolved';

                        return Card(
                          color: cardDarkBg,
                          margin: const EdgeInsets.only(bottom: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          elevation: 0,
                          child: InkWell(
                            onTap: () => _showCaseDetailsBottomSheet(caseItem, caseSightings),
                            borderRadius: BorderRadius.circular(20),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Case Picture or Icon Badge
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      width: 80,
                                      height: 80,
                                      color: Colors.black12,
                                      child: caseItem.images.isNotEmpty
                                          ? Image.network(
                                              caseItem.images[0],
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) => Icon(
                                                isPerson ? Icons.person : Icons.directions_car,
                                                color: textMuted.withOpacity(0.5),
                                                size: 32,
                                              ),
                                            )
                                          : Icon(
                                              isPerson ? Icons.person : Icons.directions_car,
                                              color: textMuted.withOpacity(0.5),
                                              size: 32,
                                            ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),

                                  // Core description
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Badge row
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: accentBlue.withOpacity(0.1),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                category.toUpperCase(),
                                                style: TextStyle(
                                                  color: lightBlueText,
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: isResolved 
                                                    ? const Color(0xFF10B981).withOpacity(0.1) 
                                                    : const Color(0xFFF59E0B).withOpacity(0.1),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                isResolved 
                                                    ? tr('alerts.resolved') 
                                                    : tr('alerts.active'),
                                                style: TextStyle(
                                                  color: isResolved 
                                                      ? const Color(0xFF34D399) 
                                                      : const Color(0xFFFBBF24),
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),

                                        // Title details
                                        Text(
                                          title,
                                          style: TextStyle(
                                            color: textWhite,
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),

                                        // Last seen seen date/location details
                                        Text(
                                          'Last Seen: ${caseItem.location}',
                                          style: TextStyle(
                                            color: textMuted,
                                            fontSize: 12,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 8),

                                        // Sighting matched logs indicators
                                        Row(
                                          children: [
                                            Icon(Icons.visibility, color: lightBlueText, size: 14),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${caseSightings.length} Sightings logged',
                                              style: TextStyle(
                                                color: lightBlueText,
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Simple actions dots trigger
                                  if (!isResolved)
                                    PopupMenuButton<String>(
                                      icon: Icon(Icons.more_vert, color: textWhite),
                                      color: cardDarkBg,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      onSelected: (val) {
                                        if (val == 'resolve') {
                                          _resolveCase(caseItem);
                                        }
                                      },
                                      itemBuilder: (context) => [
                                        PopupMenuItem(
                                          value: 'resolve',
                                          child: Row(
                                            children: [
                                              const Icon(Icons.check_circle_outline, color: Color(0xFF34D399), size: 18),
                                              const SizedBox(width: 8),
                                              Text(
                                                tr('alerts.mark_resolved'),
                                                style: TextStyle(color: textWhite, fontSize: 13),
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
                        );
                      },
                    ),
                ],
              ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color accentColor) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final Color cardBg = Theme.of(context).cardTheme.color ?? (isDark ? const Color(0xFF1E293B) : Colors.white);
    final Color textColor = Theme.of(context).colorScheme.onSurface;
    final Color labelColor = Theme.of(context).colorScheme.onSurfaceVariant;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: accentColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              color: textColor,
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: labelColor,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
