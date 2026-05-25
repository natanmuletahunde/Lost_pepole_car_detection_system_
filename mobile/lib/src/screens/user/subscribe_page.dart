import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class UserSubscribePage extends StatelessWidget {
  final ApiService apiService;
  const UserSubscribePage({Key? key, required this.apiService}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final plans = [
      {'name': 'Basic Tier', 'price': 'Free', 'features': '1 Free Case Sighting submission'},
      {'name': 'Premium Tier', 'price': '360 Birr/month', 'features': 'Unlimited case sightings, real-time ML CCTV alert matcher, and 24/7 child tracker paired.'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Upgrade Subscription Plan')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: plans.length,
        itemBuilder: (context, index) {
          final plan = plans[index];
          final isPremium = plan['name'] == 'Premium Tier';
          return Card(
            color: isPremium ? Colors.amber[50] : Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(plan['name']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                      if (isPremium) const Chip(label: Text('Highly Recommended'), backgroundColor: Colors.amber),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    plan['price']!,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 28, color: Color(0xFF0034D1)),
                  ),
                  const SizedBox(height: 10),
                  Text(plan['features']!, style: const TextStyle(color: Colors.black87)),
                  const Divider(height: 30),
                  ElevatedButton(
                    onPressed: () {
                      // Trigger Chapa checkout
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Redirecting to secure Chapa payment portal...')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isPremium ? const Color(0xFF0034D1) : Colors.grey[700],
                    ),
                    child: Text(isPremium ? 'Upgrade Now' : 'Current Plan'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
