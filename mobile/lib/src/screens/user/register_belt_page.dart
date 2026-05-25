import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../services/api_service.dart';

class RegisterBeltPage extends StatefulWidget {
  final ApiService apiService;
  const RegisterBeltPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<RegisterBeltPage> createState() => _RegisterBeltPageState();
}

class _RegisterBeltPageState extends State<RegisterBeltPage> {
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _serialNumber = '';
  String _assignedTo = '';
  String _status = 'active';
  int _battery = 100;
  bool _isLoading = false;

  LatLng? _selectedLocation;
  bool _enableGeofence = false;
  double _geofenceRadius = 100;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isLoading = true);

    final deviceData = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'name': _name,
      'serialNumber': _serialNumber,
      'assignedTo': _assignedTo,
      'status': _status,
      'battery': _battery,
      'lastLocation': _selectedLocation != null
          ? {
              'lat': _selectedLocation!.latitude,
              'lng': _selectedLocation!.longitude,
              'address': 'Selected from Map',
              'location': 'Selected from Map',
              'timestamp': DateTime.now().toIso8601String(),
            }
          : null,
      'geofence': _enableGeofence && _selectedLocation != null
          ? {
              'lat': _selectedLocation!.latitude,
              'lng': _selectedLocation!.longitude,
              'radius': _geofenceRadius,
            }
          : null,
      'createdAt': DateTime.now().toIso8601String(),
    };

    final success = await widget.apiService.registerGpsDevice(deviceData);

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Belt registered successfully!')),
      );
      Navigator.pop(context, true); // return true to indicate success and refresh list
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to register belt.'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(tr('smart_belt.register_belt') ?? 'Register Belt'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Device Name *',
                      hintText: 'e.g., Belt for Patient A',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    onSaved: (val) => _name = val ?? '',
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Serial Number *',
                      hintText: 'e.g., SN-12345',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    onSaved: (val) => _serialNumber = val ?? '',
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Assigned To',
                      hintText: 'Name of the person wearing it',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onSaved: (val) => _assignedTo = val ?? '',
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _status,
                    decoration: InputDecoration(
                      labelText: 'Initial Status',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'active', child: Text('Active')),
                      DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
                      DropdownMenuItem(value: 'low_battery', child: Text('Low Battery')),
                    ],
                    onChanged: (val) => setState(() => _status = val ?? 'active'),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    initialValue: _battery.toString(),
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Initial Battery (%)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onSaved: (val) => _battery = int.tryParse(val ?? '100') ?? 100,
                  ),
                  const SizedBox(height: 24),
                  const Text('Initial Location (Optional)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade400),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: FlutterMap(
                        options: MapOptions(
                          initialCenter: const LatLng(9.03, 38.74), // Addis Ababa
                          initialZoom: 12.0,
                          onTap: (TapPosition position, LatLng location) {
                            setState(() {
                              _selectedLocation = location;
                            });
                          },
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.example.lost_person_detection_app',
                          ),
                          if (_selectedLocation != null)
                            MarkerLayer(
                              markers: [
                                Marker(
                                  point: _selectedLocation!,
                                  width: 40,
                                  height: 40,
                                  child: const Icon(
                                    Icons.location_on,
                                    color: Colors.red,
                                    size: 40,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ),
                  if (_selectedLocation != null) ...[
                    const SizedBox(height: 16),
                    CheckboxListTile(
                      title: const Text('Set Geofence around this location?'),
                      value: _enableGeofence,
                      onChanged: (val) => setState(() => _enableGeofence = val ?? false),
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
                    if (_enableGeofence)
                      TextFormField(
                        initialValue: _geofenceRadius.toString(),
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Geofence Radius (meters)',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onSaved: (val) => _geofenceRadius = double.tryParse(val ?? '100') ?? 100,
                      ),
                  ],
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.blue[800],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Register Device', style: TextStyle(fontSize: 18, color: Colors.white)),
                  ),
                ],
              ),
            ),
    );
  }
}
