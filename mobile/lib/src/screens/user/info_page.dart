import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class UserInfoPage extends StatelessWidget {
  final ApiService apiService;
  const UserInfoPage({Key? key, required this.apiService}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Info & User Guide')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Text(
            'About Flega Search',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0034D1)),
          ),
          const SizedBox(height: 8),
          const Text(
            'Flega AI Search is a state-of-the-art missing persons and lost vehicles registry powered by automated CCTV face-matching ML scanners and GPS smart boundaries pairing belts.',
            style: TextStyle(fontSize: 14, height: 1.4),
          ),
          const Divider(height: 30),
          const Text(
            'How It Works',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 12),
          _buildStepCard('1', 'Register Case Record', 'Upload missing family profile photos or target vehicle license plate details.'),
          _buildStepCard('2', 'AI Active Cameras Match', 'Our neural scanning networks continuously audit public area feeds looking for matches.'),
          _buildStepCard('3', 'Receive Push Alarms', 'Get real-time notification alerts with exact coordinates markers and accuracy matching metrics.'),
        ],
      ),
    );
  }

  Widget _buildStepCard(String stepNum, String title, String body) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: const Color(0xFF0034D1),
              foregroundColor: Colors.white,
              radius: 14,
              child: Text(stepNum),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text(body, style: const TextStyle(fontSize: 13, color: Colors.black87)),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
