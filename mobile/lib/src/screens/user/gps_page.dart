import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../services/api_service.dart';
import 'register_belt_page.dart';

class UserGpsPage extends StatefulWidget {
  final ApiService apiService;
  const UserGpsPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<UserGpsPage> createState() => _UserGpsPageState();
}

class _UserGpsPageState extends State<UserGpsPage> {
  List<Map<String, dynamic>> _devices = [];
  bool _isLoading = false;
  MapController? _mapController;
  final List<Marker> _markers = [];

  @override
  void initState() {
    super.initState();
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    setState(() => _isLoading = true);
    final list = await widget.apiService.fetchGpsDevices();
    setState(() {
      _devices = list;
      _isLoading = false;
      _updateMarkers();
    });
  }

  void _updateMarkers() {
    _markers.clear();
    for (final dev in _devices) {
      final loc = dev['lastLocation'];
      if (loc != null && loc['lat'] != null && loc['lng'] != null) {
        final lat = double.tryParse(loc['lat'].toString()) ?? 0.0;
        final lng = double.tryParse(loc['lng'].toString()) ?? 0.0;
        _markers.add(
          Marker(
            point: LatLng(lat, lng),
            width: 40,
            height: 40,
            child: Icon(
              Icons.location_on,
              color: Colors.red,
              size: 40,
            ),
          ),
        );
      }
    }
  }

  void _focusDevice(Map<String, dynamic> dev) {
    final loc = dev['lastLocation'];
    if (loc != null && loc['lat'] != null && loc['lng'] != null && _mapController != null) {
      final lat = double.tryParse(loc['lat'].toString()) ?? 0.0;
      final lng = double.tryParse(loc['lng'].toString()) ?? 0.0;
      _mapController!.move(LatLng(lat, lng), 15.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(tr('smart_belt.title') ?? 'GPS Smart Belt'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDevices,
          )
        ],
      ),
      body: _isLoading && _devices.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDevices,
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  // Bounds Alert / Safe Zone Banner
                  Card(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.route,
                            size: 36,
                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            tr('smart_belt.boundary_alert') ?? 'Geofence Boundaries',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Theme.of(context).colorScheme.onPrimaryContainer,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Get instant alerts if kids/elderly step outside designated coordinates.',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onPrimaryContainer.withOpacity(0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Flutter Map Live Tracking View
                  Container(
                    height: 250,
                    decoration: BoxDecoration(
                      border: Border.all(color: Theme.of(context).dividerColor),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCenter: const LatLng(9.03, 38.74), // Addis Ababa
                          initialZoom: 11.0,
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.example.lost_person_detection_app',
                          ),
                          MarkerLayer(
                            markers: _markers,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Device List Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Your Connected Devices ()',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Register'),
                        onPressed: () async {
                          final success = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => RegisterBeltPage(apiService: widget.apiService),
                            ),
                          );
                          if (success == true) {
                            _loadDevices();
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  if (_devices.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          children: [
                            Icon(Icons.watch, size: 48, color: Theme.of(context).disabledColor),
                            const SizedBox(height: 12),
                            const Text(
                              'No registered devices found.',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Register a Smart Belt to track locations in real-time.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _devices.length,
                      itemBuilder: (context, index) {
                        final dev = _devices[index];
                        final loc = dev['lastLocation'] ?? {};
                        final battery = dev['battery'] ?? 100;
                        final status = dev['status'] ?? 'active';

                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          elevation: 1,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: Theme.of(context).dividerColor.withOpacity(0.5),
                            ),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                              child: Icon(
                                Icons.watch,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            title: Text(
                              dev['name'] ?? 'Smart Belt',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: status == 'active' ? Colors.green : Colors.red,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      status.toString().toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: status == 'active' ? Colors.green : Colors.red,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Icon(
                                      Icons.battery_std,
                                      size: 14,
                                      color: battery < 20 ? Colors.red : Colors.grey,
                                    ),
                                    Text(
                                      '%',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: battery < 20 ? Colors.red : Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Loc: ',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                            isThreeLine: true,
                            trailing: const Icon(Icons.gps_fixed),
                            onTap: () => _focusDevice(dev),
                          ),
                        );
                      },
                    ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }
}
