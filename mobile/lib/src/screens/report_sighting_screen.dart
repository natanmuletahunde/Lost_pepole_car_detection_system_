import 'dart:io';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';

class ReportSightingScreen extends StatefulWidget {
  final ApiService apiService;
  final String caseId;
  final String type; // 'person' or 'vehicle'
  final String name; // person full name or vehicle plate number
  final String? plateNumber;

  const ReportSightingScreen({
    Key? key,
    required this.apiService,
    required this.caseId,
    required this.type,
    required this.name,
    this.plateNumber,
  }) : super(key: key);

  @override
  State<ReportSightingScreen> createState() => _ReportSightingScreenState();
}

class _ReportSightingScreenState extends State<ReportSightingScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  File? _selectedImage;
  bool _isSubmitting = false;
  bool _isLocating = false;
  double? _latitude;
  double? _longitude;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  // Theme getters to dynamically support light and dark modes
  bool get isDarkMode => Theme.of(context).brightness == Brightness.dark;
  Color get themePrimary => Theme.of(context).colorScheme.primary;
  Color get themePrimaryLight => isDarkMode 
      ? const Color(0xFF4D79FF) 
      : Theme.of(context).colorScheme.primary.withOpacity(0.8);
  Color get themeBg => Theme.of(context).scaffoldBackgroundColor;
  Color get themeCardBg => Theme.of(context).cardTheme.color ?? (isDarkMode ? const Color(0xFF1E293B) : Colors.white);
  Color get themeSecondary => Theme.of(context).colorScheme.secondary;
  Color get themeTextColor => Theme.of(context).colorScheme.onSurface;
  Color get themeTextMuted => Theme.of(context).colorScheme.onSurfaceVariant;
  Color get themeDividerColor => Theme.of(context).dividerColor;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );
    _fadeController.forward();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _locationController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  String _getPromptText() {
    if (widget.type == 'person') {
      return '📍 ${tr('sighting.prompt_person').replaceAll('{name}', widget.name)}';
    } else {
      final vehicleName = widget.plateNumber ?? widget.name;
      return '🚗 ${tr('sighting.prompt_vehicle').replaceAll('{name}', vehicleName)}';
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    showModalBottomSheet(
      context: context,
      backgroundColor: themeCardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: themeTextMuted.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                tr('sighting.photo'),
                style: TextStyle(
                  color: themeTextColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: themePrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.camera_alt, color: themePrimary),
                ),
                title: Text(
                  tr('sighting.take_photo'),
                  style: TextStyle(color: themeTextColor),
                ),
                onTap: () async {
                  Navigator.pop(ctx);
                  final photo = await picker.pickImage(
                    source: ImageSource.camera,
                    imageQuality: 80,
                  );
                  if (photo != null) {
                    setState(() => _selectedImage = File(photo.path));
                  }
                },
              ),
              const SizedBox(height: 8),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: themePrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.photo_library, color: themePrimary),
                ),
                title: Text(
                  tr('sighting.from_gallery'),
                  style: TextStyle(color: themeTextColor),
                ),
                onTap: () async {
                  Navigator.pop(ctx);
                  final photo = await picker.pickImage(
                    source: ImageSource.gallery,
                    imageQuality: 80,
                  );
                  if (photo != null) {
                    setState(() => _selectedImage = File(photo.path));
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _fetchGPS() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.always ||
          permission == LocationPermission.whileInUse) {
        final position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        setState(() {
          _latitude = position.latitude;
          _longitude = position.longitude;
          _isLocating = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'GPS: ${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}',
              ),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          );
        }
      } else {
        setState(() => _isLocating = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(tr('sighting.gps_denied')),
              backgroundColor: Colors.orange,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _isLocating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('GPS Error: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      builder: (ctx, child) => Theme(
        data: ThemeData(
          brightness: isDarkMode ? Brightness.dark : Brightness.light,
          colorScheme: isDarkMode 
              ? ColorScheme.dark(primary: themePrimary, surface: themeCardBg)
              : ColorScheme.light(primary: themePrimary, surface: themeCardBg),
        ),
        child: child!,
      ),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  Future<void> _pickTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (ctx, child) => Theme(
        data: ThemeData(
          brightness: isDarkMode ? Brightness.dark : Brightness.light,
          colorScheme: isDarkMode 
              ? ColorScheme.dark(primary: themePrimary, surface: themeCardBg)
              : ColorScheme.light(primary: themePrimary, surface: themeCardBg),
        ),
        child: child!,
      ),
    );
    if (time != null) setState(() => _selectedTime = time);
  }

  Future<void> _submitSighting() async {
    // Validate
    if (_locationController.text.trim().isEmpty) {
      _showError(tr('sighting.location_required'));
      return;
    }
    if (_latitude == null || _longitude == null) {
      _showError(tr('sighting.gps_required'));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      // Build description
      final subjectInfo = widget.type == 'person'
          ? 'Person: ${widget.name}'
          : 'Vehicle plate: ${widget.plateNumber ?? widget.name}';
      final baseDesc = _descriptionController.text.trim().isNotEmpty
          ? _descriptionController.text.trim()
          : 'No additional details provided';

      String dateTimeStr = '';
      if (_selectedDate != null) {
        dateTimeStr = '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
        if (_selectedTime != null) {
          dateTimeStr += ' ${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';
        }
      }

      final description =
          '$subjectInfo. $baseDesc.${dateTimeStr.isNotEmpty ? ' Seen: $dateTimeStr' : ''}';

      final success = await widget.apiService.reportSighting(
        caseId: widget.caseId,
        type: widget.type,
        latitude: _latitude!,
        longitude: _longitude!,
        lastSeenLocation: _locationController.text.trim(),
        description: description.length > 1000
            ? description.substring(0, 1000)
            : description,
        localImagePath: _selectedImage?.path,
      );

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(tr('sighting.success')),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          );
          Navigator.pop(context, true);
        } else {
          _showError(tr('sighting.failed'));
        }
      }
    } catch (e) {
      if (mounted) {
        _showError('${tr('sighting.failed')}: $e');
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: themeBg,
      appBar: AppBar(
        backgroundColor: themeBg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: themeTextColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          tr('sighting.title'),
          style: TextStyle(
            color: themeTextColor,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Prompt Banner ──
              _buildPromptBanner(),
              const SizedBox(height: 24),

              // ── Main Form Card ──
              _buildFormCard(),
              const SizedBox(height: 24),

              // ── Submit Button ──
              _buildSubmitButton(),
              const SizedBox(height: 16),

              // ── Confidentiality Notice ──
              _buildConfidentialityNotice(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPromptBanner() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [themePrimary, themePrimaryLight],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: themePrimary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  widget.type == 'person' ? Icons.person_search : Icons.directions_car,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.type == 'person'
                      ? tr('sighting.type_person')
                      : tr('sighting.type_vehicle'),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _getPromptText(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: themeCardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: themeDividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left accent bar + title
          Row(
            children: [
              Container(
                width: 4,
                height: 24,
                decoration: BoxDecoration(
                  color: themePrimary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                tr('sighting.form_title'),
                style: TextStyle(
                  color: themeTextColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Subject (read-only) ──
          _buildLabel(
            widget.type == 'person'
                ? tr('sighting.person_name')
                : tr('sighting.plate_number'),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: themeBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: themePrimary.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(
                  widget.type == 'person' ? Icons.person : Icons.directions_car,
                  color: themeSecondary,
                  size: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                     widget.type == 'person'
                        ? widget.name
                        : (widget.plateNumber ?? widget.name),
                    style: TextStyle(
                      color: themeTextColor,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // ── Description ──
          _buildLabel(tr('sighting.description')),
          const SizedBox(height: 8),
          TextField(
            controller: _descriptionController,
            maxLines: 3,
            style: TextStyle(color: themeTextColor, fontSize: 14),
            decoration: _inputDecoration(
              tr('sighting.description_hint'),
              Icons.edit_note,
            ),
          ),
          const SizedBox(height: 20),

          // ── Location ──
          _buildLabel(tr('sighting.location')),
          const SizedBox(height: 8),
          TextField(
            controller: _locationController,
            style: TextStyle(color: themeTextColor, fontSize: 14),
            decoration: _inputDecoration(
              tr('sighting.location_hint'),
              Icons.location_on_outlined,
            ),
          ),
          const SizedBox(height: 12),

          // ── GPS Button ──
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _isLocating ? null : _fetchGPS,
              icon: _isLocating
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: themeSecondary,
                      ),
                    )
                  : const Icon(Icons.gps_fixed, size: 18),
              label: Text(
                _latitude != null
                    ? '${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}'
                    : tr('sighting.pin_gps'),
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: themeSecondary,
                side: BorderSide(color: themePrimary.withOpacity(0.4)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // ── Date & Time ──
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel(tr('sighting.date')),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 14),
                        decoration: BoxDecoration(
                          color: themeBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: themeDividerColor),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.calendar_today,
                                color: themeSecondary, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _selectedDate != null
                                    ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                                    : tr('sighting.select_date'),
                                style: TextStyle(
                                  color: _selectedDate != null
                                      ? themeTextColor
                                      : themeTextMuted,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel(tr('sighting.time')),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickTime,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 14),
                        decoration: BoxDecoration(
                          color: themeBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: themeDividerColor),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.access_time,
                                color: themeSecondary, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _selectedTime != null
                                    ? _selectedTime!.format(context)
                                    : tr('sighting.select_time'),
                                style: TextStyle(
                                  color: _selectedTime != null
                                      ? themeTextColor
                                      : themeTextMuted,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── Photo Upload ──
          _buildLabel(tr('sighting.photo')),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              width: double.infinity,
              height: _selectedImage != null ? 200 : 100,
              decoration: BoxDecoration(
                color: themeBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _selectedImage != null
                      ? themePrimary.withOpacity(0.5)
                      : themeDividerColor,
                  width: _selectedImage != null ? 2 : 1,
                ),
              ),
              child: _selectedImage != null
                  ? Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(
                            _selectedImage!,
                            width: double.infinity,
                            height: 200,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: GestureDetector(
                            onTap: () =>
                                setState(() => _selectedImage = null),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close,
                                  color: Colors.white, size: 16),
                            ),
                          ),
                        ),
                      ],
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.cloud_upload_outlined,
                            color: themeTextMuted.withOpacity(0.5), size: 32),
                        const SizedBox(height: 8),
                        Text(
                          tr('sighting.upload_hint'),
                          style: TextStyle(
                            color: themeTextMuted.withOpacity(0.7),
                            fontSize: 12,
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

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitSighting,
        style: ElevatedButton.styleFrom(
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 8,
          shadowColor: themePrimary.withOpacity(0.4),
        ),
        child: Ink(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [themePrimary, themePrimaryLight],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            alignment: Alignment.center,
            child: _isSubmitting
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.send_rounded,
                          color: Colors.white, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        tr('sighting.submit'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildConfidentialityNotice() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.info_outline, color: themeTextMuted.withOpacity(0.5), size: 14),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            tr('sighting.confidential'),
            style: TextStyle(
              color: themeTextMuted.withOpacity(0.6),
              fontSize: 11,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        color: themeTextColor,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: themeTextMuted.withOpacity(0.5), fontSize: 13),
      prefixIcon: Icon(icon, color: themeSecondary, size: 18),
      filled: true,
      fillColor: themeBg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: themeDividerColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: themeDividerColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: themePrimary, width: 1.5),
      ),
    );
  }
}
