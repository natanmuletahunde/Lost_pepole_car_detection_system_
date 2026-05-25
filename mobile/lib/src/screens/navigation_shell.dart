import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../services/api_service.dart';

import 'home_screen.dart';
// Import newly created separate modular user pages
import 'user/sighting_map_page.dart';
import 'user/gps_page.dart';
import 'user/notifications_page.dart';
import 'user/reported_cases_page.dart';
import 'user/settings_page.dart';

class NavigationShell extends StatefulWidget {
  final ApiService apiService;
  const NavigationShell({Key? key, required this.apiService}) : super(key: key);

  @override
  State<NavigationShell> createState() => _NavigationShellState();
}

class _NavigationShellState extends State<NavigationShell> {
  int _currentIndex = 0;

  late List<Widget> _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = [
      HomeScreen(apiService: widget.apiService),
      UserSightingMapPage(apiService: widget.apiService),
      UserGpsPage(apiService: widget.apiService),
      UserReportedCasesPage(apiService: widget.apiService),
      UserSettingsPage(apiService: widget.apiService),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurfaceVariant.withOpacity(0.6),
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.dashboard),
            label: tr('dashboard.title').split(' ').first,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.map),
            label: tr('report_case.last_location').split(' ').first,
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.gps_fixed),
            label: 'GPS',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
