import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../services/api_service.dart';

class UserFeedbackPage extends StatefulWidget {
  final ApiService apiService;
  const UserFeedbackPage({Key? key, required this.apiService}) : super(key: key);

  @override
  State<UserFeedbackPage> createState() => _UserFeedbackPageState();
}

class _UserFeedbackPageState extends State<UserFeedbackPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  
  String _selectedType = 'general';
  int _rating = 5;
  String _priority = 'medium';
  bool _submitting = false;

  final List<FeedbackType> _feedbackTypes = [
    FeedbackType(
      value: 'general',
      label: 'General Thoughts',
      icon: Icons.message,
      color: Colors.blue,
      description: 'Share suggestions about the app',
    ),
    FeedbackType(
      value: 'bug',
      label: 'Bug Report',
      icon: Icons.bug_report,
      color: Colors.red,
      description: 'Report issues or unexpected behavior',
    ),
    FeedbackType(
      value: 'feature',
      label: 'Feature Request',
      icon: Icons.lightbulb,
      color: Colors.amber,
      description: 'Suggest new tools or additions',
    ),
    FeedbackType(
      value: 'complaint',
      label: 'Complaint',
      icon: Icons.warning,
      color: Colors.orange,
      description: 'File an official security/system complaint',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    if (_subjectController.text.trim().isEmpty || _messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in the subject and message fields')),
      );
      return;
    }

    setState(() => _submitting = true);

    final success = await widget.apiService.submitFeedback(
      _selectedType,
      '${_subjectController.text.trim()}\n\n${_messageController.text.trim()}',
    );

    if (mounted) {
      setState(() => _submitting = false);
      if (success) {
        _subjectController.clear();
        _messageController.clear();
        setState(() {
          _rating = 5;
          _selectedType = 'general';
          _priority = 'medium';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Feedback Submitted! Thank you!'),
            backgroundColor: Colors.green,
          ),
        );
        _tabController.animateTo(1);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not submit feedback at this time.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFF0034D1),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: screenWidth < 360 ? 12 : 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            const Text(
              'Feedback',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Share your thoughts and help us improve',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 20),
            _buildFormTab(theme, isDark, screenWidth),
          ],
        ),
      ),
    );
  }

  Widget _buildFormTab(ThemeData theme, bool isDark, double screenWidth) {
    final isSmallScreen = screenWidth < 360;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category selection - horizontal scrollable chips
        Text(
          'What type of feedback?',
          style: TextStyle(
            fontSize: isSmallScreen ? 14 : 15,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 50,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _feedbackTypes.length,
            itemBuilder: (context, index) {
              final type = _feedbackTypes[index];
              final isSelected = _selectedType == type.value;
              return Padding(
                padding: EdgeInsets.only(right: isSmallScreen ? 8 : 12),
                child: GestureDetector(
                  onTap: () => setState(() => _selectedType = type.value),
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: isSmallScreen ? 12 : 16,
                      vertical: isSmallScreen ? 10 : 12,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? type.color : (isDark ? const Color(0xFF1E293B) : Colors.white),
                      borderRadius: BorderRadius.circular(25),
                      border: Border.all(
                        color: isSelected ? type.color : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          type.icon,
                          size: isSmallScreen ? 16 : 18,
                          color: isSelected ? Colors.white : type.color,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          type.label,
                          style: TextStyle(
                            fontSize: isSmallScreen ? 12 : 13,
                            fontWeight: FontWeight.w600,
                            color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 20),

        // Rating section - compact
        Container(
          padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Rate your experience',
                    style: TextStyle(
                      fontSize: isSmallScreen ? 14 : 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  Text(
                    '$_rating/5',
                    style: TextStyle(
                      fontSize: isSmallScreen ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.amber,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(5, (index) {
                  return GestureDetector(
                    onTap: () => setState(() => _rating = index + 1),
                    child: Icon(
                      index < _rating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: isSmallScreen ? 32 : 40,
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Form fields in a card
        Container(
          padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Priority dropdown
              Text(
                'Priority',
                style: TextStyle(
                  fontSize: isSmallScreen ? 13 : 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 12 : 16, vertical: isSmallScreen ? 8 : 12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _priority,
                    isExpanded: true,
                    style: TextStyle(fontSize: isSmallScreen ? 13 : 14, color: isDark ? Colors.white : Colors.black87),
                    dropdownColor: isDark ? const Color(0xFF1E293B) : Colors.white,
                    items: const [
                      DropdownMenuItem(value: 'low', child: Text('Low Priority')),
                      DropdownMenuItem(value: 'medium', child: Text('Medium Priority')),
                      DropdownMenuItem(value: 'high', child: Text('High Priority')),
                      DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                    ],
                    onChanged: (value) => setState(() => _priority = value ?? 'medium'),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Subject field
              Text(
                'Subject',
                style: TextStyle(
                  fontSize: isSmallScreen ? 13 : 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _subjectController,
                style: TextStyle(fontSize: isSmallScreen ? 14 : 15, color: isDark ? Colors.white : Colors.black87),
                decoration: InputDecoration(
                  hintText: 'Brief summary',
                  hintStyle: TextStyle(fontSize: isSmallScreen ? 14 : 15, color: Colors.grey),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.all(isSmallScreen ? 14 : 16),
                ),
              ),
              const SizedBox(height: 20),

              // Message field
              Text(
                'Details',
                style: TextStyle(
                  fontSize: isSmallScreen ? 13 : 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _messageController,
                maxLines: 5,
                style: TextStyle(fontSize: isSmallScreen ? 14 : 15, color: isDark ? Colors.white : Colors.black87),
                decoration: InputDecoration(
                  hintText: 'Tell us more...',
                  hintStyle: TextStyle(fontSize: isSmallScreen ? 14 : 15, color: Colors.grey),
                  filled: true,
                  fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8F9FA),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.all(isSmallScreen ? 14 : 16),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Submit button
        SizedBox(
          width: double.infinity,
          height: isSmallScreen ? 52 : 56,
          child: ElevatedButton(
            onPressed: _submitting ? null : _submitFeedback,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF228BE6),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: _submitting
                ? const SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.send, size: 20),
                      SizedBox(width: 10),
                      Text(
                        'Submit Feedback',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildGuidelineItem(String text, bool isSmallScreen) {
    return Padding(
      padding: EdgeInsets.only(bottom: isSmallScreen ? 8 : 12),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(isSmallScreen ? 3 : 4),
            decoration: BoxDecoration(
              color: Colors.green,
              borderRadius: BorderRadius.circular(isSmallScreen ? 15 : 20),
            ),
            child: Icon(
              Icons.check,
              size: isSmallScreen ? 8 : 10,
              color: Colors.white,
            ),
          ),
          SizedBox(width: isSmallScreen ? 8 : 12),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: isSmallScreen ? 11 : 12,
                color: Colors.grey,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(ThemeData theme, bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                style: BorderStyle.solid,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.inbox,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                const Text(
                  'No Submissions Yet',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your feedback history will appear here',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FeedbackType {
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  final String description;

  FeedbackType({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
    required this.description,
  });
}
