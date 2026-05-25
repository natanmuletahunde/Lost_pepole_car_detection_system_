import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';
import '../../models/case_model.dart';
import '../report_case_screen.dart';

class UserDashboardPage extends StatefulWidget {
  final ApiService apiService;
  const UserDashboardPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<UserDashboardPage> createState() => _UserDashboardPageState();
}

class _UserDashboardPageState extends State<UserDashboardPage> with SingleTickerProviderStateMixin {
  late TabController _innerController;
  List<MissingPerson> _persons = [];
  List<MissingVehicle> _vehicles = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _innerController = TabController(length: 2, vsync: this);
    _fetchDirectories();
  }

  Future<void> _fetchDirectories() async {
    setState(() => _isLoading = true);
    try {
      final pList = await widget.apiService.fetchMissingPersons();
      final vList = await widget.apiService.fetchMissingVehicles();
      setState(() {
        _persons = pList;
        _vehicles = vList;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        // Fallback simulation data
        _persons = [
          MissingPerson(id: '1', firstName: 'Kaleb', lastName: 'Abebe', age: 8, gender: 'Male', location: 'Bole, Addis Ababa', images: [], status: 'active'),
          MissingPerson(id: '2', firstName: 'Sara', lastName: 'Desta', age: 72, gender: 'Female', location: 'Adama, Ethiopia', images: [], status: 'active'),
        ];
        _vehicles = [
          MissingVehicle(id: '1', plateNumber: 'AA-3-A5044', model: 'Toyota Vitz', color: 'Silver', location: 'Megenagna, Addis Ababa', images: [], status: 'active'),
        ];
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _innerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/logo.png', height: 32, errorBuilder: (c, e, s) => const SizedBox.shrink()),
            const SizedBox(width: 12),
            Text(tr('dashboard.title')),
          ],
        ),
        bottom: TabBar(
          controller: _innerController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: [
            Tab(text: tr('dashboard.active_persons')),
            Tab(text: tr('dashboard.active_vehicles')),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _innerController,
              children: [
                _buildList(_persons, true),
                _buildList(_vehicles, false),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ReportCaseScreen()),
          ).then((value) => _fetchDirectories());
        },
        label: Text(tr('report_case.title')),
        icon: const Icon(Icons.add),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildList(List<dynamic> list, bool isPerson) {
    if (list.isEmpty) {
      return Center(child: Text(tr('dashboard.no_cases')));
    }
    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final item = list[index];
        final isP = item is MissingPerson;
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Theme.of(context).dividerColor.withOpacity(0.5)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      child: Icon(
                        isP ? Icons.person : Icons.directions_car,
                        size: 28,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isP ? item.fullName : item.plateNumber,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            isP ? 'Age: ${item.age} • Gender: ${item.gender}' : 'Model: ${item.model} • Color: ${item.color}',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(Icons.location_on, size: 14, color: Colors.red[400]),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  item.location,
                                  style: const TextStyle(fontSize: 12),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton.icon(
                      icon: const Icon(Icons.pin_drop, size: 16),
                      label: Text(tr('dashboard.report_button')),
                      onPressed: () {
                        // Action to submit sightings
                      },
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
