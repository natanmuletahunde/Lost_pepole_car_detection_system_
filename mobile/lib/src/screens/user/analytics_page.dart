import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class UserAnalyticsPage extends StatelessWidget {
  final ApiService apiService;
  const UserAnalyticsPage({Key? key, required this.apiService}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search & CCTV Analytics')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Card(
            color: Color(0xFF0034D1),
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.query_stats, size: 36, color: Colors.white),
                  SizedBox(height: 10),
                  Text('Active Detection Systems online', style: TextStyle(color: Colors.white70)),
                  Text('98.8% Accuracy', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('System Sighting Statistics', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 16),
                  _buildStatRow('Total Active Cases', '84 cases'),
                  _buildStatRow('Successful CCTV matches', '1,492 matches'),
                  _buildStatRow('Smart geofences monitored', '412 belts'),
                  _buildStatRow('Admin approval rate', '100% verified'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black87)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0034D1))),
        ],
      ),
    );
  }
}
