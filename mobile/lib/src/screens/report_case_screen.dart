import 'dart:io';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';

class ReportCaseScreen extends StatefulWidget {
  const ReportCaseScreen({Key? key}) : super(key: key);

  @override
  State<ReportCaseScreen> createState() => _ReportCaseScreenState();
}

class _ReportCaseScreenState extends State<ReportCaseScreen> {
  final PageController _pageController = PageController();
  final ImagePicker _picker = ImagePicker();

  int _activeStep = 0;
  final int _totalSteps = 5;

  // Case Type Selection
  String _regType = 'Person'; // 'Person', 'Vehicle', 'Special'

  // Image/File States
  List<File> _personImages = [];
  List<File> _vehicleImages = [];
  List<File> _specialImages = [];
  File? _ownershipDoc;
  File? _doctorReport;
  File? _criminalRecord;

  // Step 1: Basic Person / Special Case Form Fields
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _middleNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  String? _selectedGender;
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  // Step 1: Vehicle Form Fields
  final TextEditingController _brandController = TextEditingController();
  final TextEditingController _modelController = TextEditingController();
  final TextEditingController _submodelController = TextEditingController();
  final TextEditingController _colorController = TextEditingController();
  String? _selectedPlateType;
  String? _selectedRegion;
  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _plateNumberController = TextEditingController();

  // Step 1: Special Case Specific
  String? _selectedSpecialCategory; // 'Mentally Ill', 'Criminal', 'Other'

  // Step 2: Last Seen Fields
  final TextEditingController _locationController = TextEditingController();
  DateTime? _lastSeenDate;
  TimeOfDay? _lastSeenTime;
  double? _latitude;
  double? _longitude;
  bool _isLocating = false;

  // Step 3: Contact Info Fields
  final TextEditingController _telegramController = TextEditingController();
  final TextEditingController _additionalContactController = TextEditingController();

  // Submission State
  bool _isSubmitting = false;
  bool _confirmAccuracy = false;

  @override
  void dispose() {
    _pageController.dispose();
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _descriptionController.dispose();
    _brandController.dispose();
    _modelController.dispose();
    _submodelController.dispose();
    _colorController.dispose();
    _codeController.dispose();
    _plateNumberController.dispose();
    _locationController.dispose();
    _telegramController.dispose();
    _additionalContactController.dispose();
    super.dispose();
  }

  // Pick multiple images for case profiles
  Future<void> _pickCaseImages(ImageSource source) async {
    try {
      final List<XFile> photos = await _picker.pickMultiImage(imageQuality: 80);
      if (photos.isNotEmpty) {
        setState(() {
          if (_regType == 'Person') {
            _personImages.addAll(photos.map((p) => File(p.path)));
          } else if (_regType == 'Vehicle') {
            _vehicleImages.addAll(photos.map((p) => File(p.path)));
          } else {
            _specialImages.addAll(photos.map((p) => File(p.path)));
          }
        });
      }
    } catch (e) {
      // Fallback single pick in case pickMultiImage is unsupported or errors
      try {
        final XFile? photo = await _picker.pickImage(source: source, imageQuality: 80);
        if (photo != null) {
          setState(() {
            if (_regType == 'Person') {
              _personImages.add(File(photo.path));
            } else if (_regType == 'Vehicle') {
              _vehicleImages.add(File(photo.path));
            } else {
              _specialImages.add(File(photo.path));
            }
          });
        }
      } catch (_) {
        _showSnackBar(context, 'Error picking photos: $e', Colors.red);
      }
    }
  }

  // Pick Document files (ownership doc, doctor report, arrest warrant)
  Future<void> _pickDocument(String docType) async {
    try {
      final XFile? file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (file != null) {
        setState(() {
          if (docType == 'ownership') {
            _ownershipDoc = File(file.path);
          } else if (docType == 'doctor') {
            _doctorReport = File(file.path);
          } else if (docType == 'criminal') {
            _criminalRecord = File(file.path);
          }
        });
      }
    } catch (e) {
      _showSnackBar(context, 'Error selecting document: $e', Colors.red);
    }
  }

  // Fetch current GPS location coordinates using Geolocator
  Future<void> _fetchGPSCoordinates() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        setState(() {
          _latitude = position.latitude;
          _longitude = position.longitude;
          _isLocating = false;
        });
        _showSnackBar(
          context,
          'tr("report_case.gps_coordinates")'.contains('gps')
              ? 'GPS Coordinates pinned: ${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}'
              : tr('report_case.gps_coordinates') + ': ${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}',
          Colors.green,
        );
      } else {
        setState(() => _isLocating = false);
        _showSnackBar(context, 'GPS Permission denied by user.', Colors.orange);
      }
    } catch (e) {
      setState(() => _isLocating = false);
      _showSnackBar(context, 'Error accessing location services: $e', Colors.red);
    }
  }

  // Helper alert bar
  void _showSnackBar(BuildContext ctx, String message, Color color) {
    ScaffoldMessenger.of(ctx).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(12),
      ),
    );
  }

  // Handle Wizard flow step validations
  bool _validateActiveStep() {
    if (_activeStep == 0) {
      return true; // Selection step is always valid
    }

    if (_activeStep == 1) {
      if (_regType == 'Person') {
        if (_firstNameController.text.trim().isEmpty ||
            _lastNameController.text.trim().isEmpty ||
            _ageController.text.trim().isEmpty ||
            _selectedGender == null) {
          _showSnackBar(context, tr('report_case.required_fields_msg'), Colors.red);
          return false;
        }
        if (_personImages.length < 2) {
          _showSnackBar(context, tr('report_case.upload_min_photos'), Colors.red);
          return false;
        }
        return true;
      } else if (_regType == 'Vehicle') {
        if (_brandController.text.trim().isEmpty ||
            _modelController.text.trim().isEmpty ||
            _colorController.text.trim().isEmpty ||
            _selectedPlateType == null ||
            _selectedRegion == null ||
            _codeController.text.trim().isEmpty ||
            _plateNumberController.text.trim().isEmpty) {
          _showSnackBar(context, tr('report_case.required_fields_msg'), Colors.red);
          return false;
        }
        return true;
      } else if (_regType == 'Special') {
        if (_firstNameController.text.trim().isEmpty ||
            _lastNameController.text.trim().isEmpty ||
            _ageController.text.trim().isEmpty ||
            _selectedGender == null ||
            _selectedSpecialCategory == null) {
          _showSnackBar(context, tr('report_case.required_fields_msg'), Colors.red);
          return false;
        }
        if (_selectedSpecialCategory == 'Mentally Ill' && _doctorReport == null) {
          _showSnackBar(context, tr('report_case.doctor_report_req'), Colors.red);
          return false;
        }
        if (_selectedSpecialCategory == 'Criminal' && _criminalRecord == null) {
          _showSnackBar(context, tr('report_case.criminal_record_req'), Colors.red);
          return false;
        }
        if (_specialImages.isEmpty) {
          _showSnackBar(context, 'Please upload at least 1 recent photo of the special case.', Colors.red);
          return false;
        }
        return true;
      }
    }

    if (_activeStep == 2) {
      if (_locationController.text.trim().isEmpty) {
        _showSnackBar(context, tr('report_case.location_required'), Colors.red);
        return false;
      }
      if (_lastSeenDate == null) {
        _showSnackBar(context, tr('report_case.date_required'), Colors.red);
        return false;
      }
      return true;
    }

    if (_activeStep == 3) {
      return true; // Contact details are optional
    }

    return true;
  }

  // Wizard Step Navigation
  void _nextStep() {
    if (_validateActiveStep()) {
      if (_activeStep < _totalSteps - 1) {
        setState(() {
          _activeStep++;
        });
        _pageController.animateToPage(
          _activeStep,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeInOut,
        );
      }
    }
  }

  void _previousStep() {
    if (_activeStep > 0) {
      setState(() {
        _activeStep--;
      });
      _pageController.animateToPage(
        _activeStep,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  // Complete submission
  void _submitForm() {
    if (!_confirmAccuracy) {
      _showSnackBar(context, 'Please confirm the accuracy of all submitted details.', Colors.orange);
      return;
    }

    setState(() => _isSubmitting = true);

    // Mock API Sighting Schedulers
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isSubmitting = false);
        _showSnackBar(context, 'Case registered successfully in the system!', Colors.green);
        Navigator.pop(context, true);
      }
    });
  }

  // Reset form inputs
  void _resetForm() {
    setState(() {
      _activeStep = 0;
      _personImages.clear();
      _vehicleImages.clear();
      _specialImages.clear();
      _ownershipDoc = null;
      _doctorReport = null;
      _criminalRecord = null;
      _firstNameController.clear();
      _middleNameController.clear();
      _lastNameController.clear();
      _ageController.clear();
      _selectedGender = null;
      _heightController.clear();
      _weightController.clear();
      _descriptionController.clear();
      _brandController.clear();
      _modelController.clear();
      _submodelController.clear();
      _colorController.clear();
      _selectedPlateType = null;
      _selectedRegion = null;
      _codeController.clear();
      _plateNumberController.clear();
      _selectedSpecialCategory = null;
      _locationController.clear();
      _lastSeenDate = null;
      _lastSeenTime = null;
      _latitude = null;
      _longitude = null;
      _telegramController.clear();
      _additionalContactController.clear();
      _confirmAccuracy = false;
    });
    _pageController.jumpToPage(0);
    _showSnackBar(context, tr('report_case.reset_form') + ' completed.', Colors.blue);
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF0034D1);
    final accentBgColor = const Color(0xFFF4F7FF);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          tr('report_case.title'),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
        ),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _resetForm,
            tooltip: tr('report_case.reset_form'),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Premium Customized Stepper Progress Header
            _buildStepperHeader(primaryColor),

            const Divider(height: 1),

            // 2. Main Page Content Wizard Form
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStepSelectType(primaryColor, accentBgColor),
                  _buildStepDetails(primaryColor, accentBgColor),
                  _buildStepLastSeen(primaryColor, accentBgColor),
                  _buildStepContactInfo(primaryColor, accentBgColor),
                  _buildStepReview(primaryColor, accentBgColor),
                ],
              ),
            ),

            const Divider(height: 1),

            // 3. Navigation Controls Bar
            _buildNavigationControls(primaryColor),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // WIDGET BUILDERS
  // ==========================================

  Widget _buildStepperHeader(Color primaryColor) {
    final stepIcons = [
      Icons.info_outline,
      Icons.assignment_ind_outlined,
      Icons.map_outlined,
      Icons.contact_mail_outlined,
      Icons.check_circle_outline,
    ];

    final stepLabels = [
      tr('report_case.step_basic'),
      tr('report_case.step_details'),
      tr('report_case.step_seen'),
      tr('report_case.step_contact'),
      tr('report_case.step_review'),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      color: Colors.white,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_totalSteps, (index) {
              final isCompleted = index < _activeStep;
              final isActive = index == _activeStep;
              return GestureDetector(
                onTap: () {
                  if (index <= _activeStep) {
                    setState(() => _activeStep = index);
                    _pageController.jumpToPage(index);
                  }
                },
                child: Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: isActive ? 42 : 36,
                      height: isActive ? 42 : 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive
                            ? primaryColor
                            : isCompleted
                                ? Colors.green
                                : Colors.grey[200],
                        border: isActive
                            ? Border.all(color: primaryColor.withOpacity(0.2), width: 4)
                            : null,
                      ),
                      child: Icon(
                        isCompleted ? Icons.check : stepIcons[index],
                        color: isCompleted || isActive ? Colors.white : Colors.grey[600],
                        size: isActive ? 20 : 18,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      stepLabels[index],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isActive || isCompleted ? FontWeight.bold : FontWeight.normal,
                        color: isActive
                            ? primaryColor
                            : isCompleted
                                ? Colors.green
                                : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (_activeStep + 1) / _totalSteps,
                backgroundColor: Colors.grey[100],
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                minHeight: 4,
              ),
            ),
          )
        ],
      ),
    );
  }

  // Step 0: Select case registration type
  Widget _buildStepSelectType(Color primaryColor, Color accentBgColor) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 10),
          Text(
            tr('report_case.select_type'),
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 22, letterSpacing: -0.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Text(
            tr('report_case.report_person_desc').contains('Report')
                ? 'Select the case registry division you want to file and track.'
                : tr('report_case.report_person_desc'),
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 30),

          // Cards
          _buildSelectionCard(
            type: 'Person',
            icon: Icons.person_add_alt_1_rounded,
            title: tr('report_case.person'),
            desc: tr('report_case.report_person_desc'),
            points: ['Personal description data', 'Multiple pictures validation', 'Real-time AI matching'],
            primaryColor: primaryColor,
          ),
          const SizedBox(height: 16),
          _buildSelectionCard(
            type: 'Vehicle',
            icon: Icons.directions_car_filled_rounded,
            title: tr('report_case.vehicle'),
            desc: tr('report_case.report_vehicle_desc'),
            points: ['Ethiopian license plate mapping', 'Ownership verification docs', 'CCTV OCR plate scanner integration'],
            primaryColor: primaryColor,
          ),
          const SizedBox(height: 16),
          _buildSelectionCard(
            type: 'Special',
            icon: Icons.warning_amber_rounded,
            title: tr('report_case.special_case'),
            desc: tr('report_case.report_special_desc'),
            points: ['Mentally ill / criminal cases', 'Official doctor/court authorization docs', 'Emergency high-priority dispatch'],
            primaryColor: primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionCard({
    required String type,
    required IconData icon,
    required String title,
    required String desc,
    required List<String> points,
    required Color primaryColor,
  }) {
    final isSelected = _regType == type;
    return GestureDetector(
      onTap: () {
        setState(() {
          _regType = type;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0F4FF) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? primaryColor : Colors.grey[200]!,
            width: isSelected ? 2.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isSelected ? 0.05 : 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? primaryColor : Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : primaryColor,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isSelected ? primaryColor : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    desc,
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                  const SizedBox(height: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: points
                        .map((p) => Padding(
                              padding: const EdgeInsets.only(bottom: 3.0),
                              child: Row(
                                children: [
                                  Icon(Icons.check_circle_outline_rounded, color: isSelected ? primaryColor : Colors.grey[400], size: 12),
                                  const SizedBox(width: 6),
                                  Text(p, style: TextStyle(color: Colors.grey[700], fontSize: 10)),
                                ],
                              ),
                            ))
                        .toList(),
                  )
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: primaryColor, size: 22)
          ],
        ),
      ),
    );
  }

  // Step 1: Details form inputs based on Case Type
  Widget _buildStepDetails(Color primaryColor, Color accentBgColor) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.description_outlined, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              Text(
                'Case Details: $_regType',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Complete all detailed physical descriptions and submit documents.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 20),

          // Dynamic Forms
          if (_regType == 'Person') _buildPersonForm(primaryColor, accentBgColor),
          if (_regType == 'Vehicle') _buildVehicleForm(primaryColor, accentBgColor),
          if (_regType == 'Special') _buildSpecialForm(primaryColor, accentBgColor),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String labelText, IconData icon) {
    return InputDecoration(
      labelText: labelText,
      prefixIcon: Icon(icon, color: const Color(0xFF0034D1)),
      filled: true,
      fillColor: Colors.grey[50],
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey[200]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF0034D1), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
    );
  }

  Widget _buildPersonForm(Color primaryColor, Color accentBgColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _firstNameController,
          decoration: _inputDecoration(tr('report_case.first_name'), Icons.person_outline),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _middleNameController,
          decoration: _inputDecoration(tr('report_case.middle_name'), Icons.person_outline),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _lastNameController,
          decoration: _inputDecoration(tr('report_case.last_name'), Icons.person_outline),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _ageController,
                decoration: _inputDecoration(tr('report_case.age'), Icons.cake_outlined),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selectedGender,
                decoration: _inputDecoration(tr('report_case.gender'), Icons.wc_outlined),
                items: ['Male', 'Female', 'Other']
                    .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedGender = val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _heightController,
                decoration: _inputDecoration(tr('report_case.height'), Icons.height_outlined),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextFormField(
                controller: _weightController,
                decoration: _inputDecoration(tr('report_case.weight'), Icons.monitor_weight_outlined),
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _descriptionController,
          decoration: _inputDecoration(tr('report_case.description'), Icons.edit_note_outlined).copyWith(
            hintText: tr('report_case.description_placeholder'),
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        _buildImagePickerBox('Person Profile Photos * (Upload 2+ pictures)', _personImages, primaryColor),
      ],
    );
  }

  Widget _buildVehicleForm(Color primaryColor, Color accentBgColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _brandController,
          decoration: _inputDecoration(tr('report_case.brand'), Icons.branding_watermark_outlined),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _modelController,
          decoration: _inputDecoration(tr('report_case.model'), Icons.model_training_outlined),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _submodelController,
          decoration: _inputDecoration(tr('report_case.submodel'), Icons.subdirectory_arrow_right_outlined),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _colorController,
          decoration: _inputDecoration(tr('report_case.color'), Icons.palette_outlined),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedPlateType,
          decoration: _inputDecoration(tr('report_case.plate_type'), Icons.credit_card_outlined),
          items: ['Private', 'Commercial', 'Government', 'NGO', 'Diplomatic']
              .map((t) => DropdownMenuItem(value: t, child: Text(t)))
              .toList(),
          onChanged: (val) => setState(() => _selectedPlateType = val),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedRegion,
          decoration: _inputDecoration(tr('report_case.region'), Icons.public_outlined),
          items: ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'Somali', 'Afar', 'Benishangul-Gumuz', 'SNNPR', 'Gambela', 'Harari', 'Dire Dawa', 'Sidama', 'South West', 'Federal/Police']
              .map((r) => DropdownMenuItem(value: r, child: Text(r)))
              .toList(),
          onChanged: (val) => setState(() => _selectedRegion = val),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              flex: 2,
              child: TextFormField(
                controller: _codeController,
                decoration: _inputDecoration(tr('report_case.code'), Icons.pin_outlined),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 3,
              child: TextFormField(
                controller: _plateNumberController,
                decoration: _inputDecoration(tr('report_case.plate_number'), Icons.pin_outlined),
                keyboardType: TextInputType.text,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _descriptionController,
          decoration: _inputDecoration(tr('report_case.description'), Icons.edit_note_outlined).copyWith(
            hintText: 'Additional details (scratches, stickers, dents, damages, customized rims, etc.)',
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        _buildDocumentPickerBox('Proof of Ownership (Optional docs/card picture)', _ownershipDoc, 'ownership', primaryColor),
        const SizedBox(height: 24),
        _buildImagePickerBox('Vehicle Exterior Images', _vehicleImages, primaryColor),
      ],
    );
  }

  Widget _buildSpecialForm(Color primaryColor, Color accentBgColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _firstNameController,
          decoration: _inputDecoration(tr('report_case.first_name'), Icons.person_outline),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _lastNameController,
          decoration: _inputDecoration(tr('report_case.last_name'), Icons.person_outline),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _ageController,
                decoration: _inputDecoration(tr('report_case.age'), Icons.cake_outlined),
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: _selectedGender,
                decoration: _inputDecoration(tr('report_case.gender'), Icons.wc_outlined),
                items: ['Male', 'Female', 'Other']
                    .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedGender = val),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedSpecialCategory,
          decoration: _inputDecoration(tr('report_case.special_category'), Icons.category_outlined),
          items: ['Mentally Ill', 'Criminal', 'Other']
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (val) => setState(() => _selectedSpecialCategory = val),
        ),
        const SizedBox(height: 16),
        if (_selectedSpecialCategory == 'Mentally Ill') ...[
          _buildDocumentPickerBox('Doctor Hospital Medical Report *', _doctorReport, 'doctor', primaryColor),
          const SizedBox(height: 16),
        ],
        if (_selectedSpecialCategory == 'Criminal') ...[
          _buildDocumentPickerBox('Official Arrest Warrant / Police Report *', _criminalRecord, 'criminal', primaryColor),
          const SizedBox(height: 16),
        ],
        TextFormField(
          controller: _descriptionController,
          decoration: _inputDecoration(tr('report_case.description'), Icons.edit_note_outlined).copyWith(
            hintText: tr('report_case.description_placeholder'),
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        _buildImagePickerBox('Recent Sighting Photograph *', _specialImages, primaryColor),
      ],
    );
  }

  Widget _buildImagePickerBox(String title, List<File> imageList, Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 10),
        if (imageList.isNotEmpty)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: imageList.length + 1,
            itemBuilder: (context, index) {
              if (index == imageList.length) {
                return _buildPickerAddButton(primaryColor);
              }
              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(
                      imageList[index],
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    ),
                  ),
                  Positioned(
                    right: 4,
                    top: 4,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          imageList.removeAt(index);
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.red,
                        ),
                        child: const Icon(Icons.close, color: Colors.white, size: 12),
                      ),
                    ),
                  )
                ],
              );
            },
          )
        else
          GestureDetector(
            onTap: () => _pickCaseImages(ImageSource.gallery),
            child: Container(
              height: 120,
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!, width: 2),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_photo_alternate_outlined, size: 38, color: primaryColor),
                  const SizedBox(height: 8),
                  Text('Upload Pictures from Gallery', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                ],
              ),
            ),
          )
      ],
    );
  }

  Widget _buildPickerAddButton(Color primaryColor) {
    return GestureDetector(
      onTap: () => _pickCaseImages(ImageSource.gallery),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!, width: 2),
        ),
        child: Center(
          child: Icon(Icons.add_a_photo_outlined, color: primaryColor, size: 24),
        ),
      ),
    );
  }

  Widget _buildDocumentPickerBox(String label, File? documentFile, String docType, Color primaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 10),
        if (documentFile != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green[700]),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    documentFile.path.split('/').last,
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green[900], fontSize: 13),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () {
                    setState(() {
                      if (docType == 'ownership') {
                        _ownershipDoc = null;
                      } else if (docType == 'doctor') {
                        _doctorReport = null;
                      } else {
                        _criminalRecord = null;
                      }
                    });
                  },
                )
              ],
            ),
          )
        else
          OutlinedButton.icon(
            icon: const Icon(Icons.upload_file_outlined),
            label: const Text('Browse Device Document File (PDF / JPG)'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _pickDocument(docType),
          ),
      ],
    );
  }

  // Step 2: Last Seen mapping details
  Widget _buildStepLastSeen(Color primaryColor, Color accentBgColor) {
    final isGpsPinned = _latitude != null && _longitude != null;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_outlined, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Last Seen Information',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'High spatial accuracy speeds up CCTV searching and AI correlation analysis.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 25),

          TextFormField(
            controller: _locationController,
            decoration: _inputDecoration(tr('report_case.last_location') + ' *', Icons.place_outlined).copyWith(
              hintText: 'e.g. Bole Medhanialem, Addis Ababa',
            ),
          ),
          const SizedBox(height: 20),

          // Date picker field
          GestureDetector(
            onTap: () async {
              final DateTime? date = await showDatePicker(
                context: context,
                initialDate: DateTime.now(),
                firstDate: DateTime(2020),
                lastDate: DateTime.now(),
              );
              if (date != null) {
                setState(() => _lastSeenDate = date);
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.calendar_month_outlined, color: primaryColor),
                  const SizedBox(width: 12),
                  Text(
                    _lastSeenDate == null
                        ? 'Select Approximate Sighting Date *'
                        : DateFormat('yyyy-MM-dd').format(_lastSeenDate!),
                    style: TextStyle(
                      color: _lastSeenDate == null ? Colors.grey[600] : Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Time picker field
          GestureDetector(
            onTap: () async {
              final TimeOfDay? time = await showTimePicker(
                context: context,
                initialTime: TimeOfDay.now(),
              );
              if (time != null) {
                setState(() => _lastSeenTime = time);
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.access_time_outlined, color: primaryColor),
                  const SizedBox(width: 12),
                  Text(
                    _lastSeenTime == null
                        ? 'Select Approximate Sighting Time (Optional)'
                        : _lastSeenTime!.format(context),
                    style: TextStyle(
                      color: _lastSeenTime == null ? Colors.grey[600] : Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 25),

          // GPS Coordinates Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isGpsPinned ? Colors.green[50] : accentBgColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isGpsPinned ? Colors.green[200]! : primaryColor.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Icon(
                      isGpsPinned ? Icons.gps_fixed_rounded : Icons.gps_not_fixed_rounded,
                      color: isGpsPinned ? Colors.green[700] : primaryColor,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      isGpsPinned ? 'GPS Pinned Successfully' : 'Map Sighting GPS coordinates',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isGpsPinned ? Colors.green[800] : primaryColor,
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Fetching real-time GPS coordinates directly embeds spatial tracking vectors into our smart alerting servers.',
                  style: TextStyle(color: isGpsPinned ? Colors.green[900] : Colors.grey[700], fontSize: 11),
                ),
                if (isGpsPinned) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Coordinates: ${_latitude!.toStringAsFixed(6)}, ${_longitude!.toStringAsFixed(6)}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
                const SizedBox(height: 16),
                _isLocating
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton.icon(
                        icon: const Icon(Icons.my_location),
                        label: Text(isGpsPinned ? 'Re-fetch Current Coordinates' : 'Fetch GPS Coordinates Now'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isGpsPinned ? Colors.green[700] : primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _fetchGPSCoordinates,
                      ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // Step 3: Contact Info fields
  Widget _buildStepContactInfo(Color primaryColor, Color accentBgColor) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.contact_phone_outlined, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Contact Information',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Verify coordinates of contact channels so sightings can reach you safely.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 25),

          TextFormField(
            controller: _telegramController,
            decoration: _inputDecoration(tr('report_case.telegram_username') + ' (Optional)', Icons.telegram_outlined).copyWith(
              hintText: 'e.g. username (without @ symbol)',
            ),
          ),
          const SizedBox(height: 16),

          TextFormField(
            controller: _additionalContactController,
            decoration: _inputDecoration('Additional Contact Details (Optional)', Icons.contact_mail_outlined).copyWith(
              hintText: 'Alternative phone numbers, email handles, or special dispatch requests...',
            ),
            maxLines: 4,
          ),
          const SizedBox(height: 25),

          // Security Trust Alert Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.shield_outlined, color: primaryColor, size: 22),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Secure Communications Enforced',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Your identity coordinates are encrypted. Verified dispatch operators will communicate through SSL secured channels.',
                        style: TextStyle(color: Colors.grey[600], fontSize: 11),
                      ),
                    ],
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  // Step 4: Final Review & Submit page
  Widget _buildStepReview(Color primaryColor, Color accentBgColor) {
    final imagesCount = _regType == 'Person'
        ? _personImages.length
        : _regType == 'Vehicle'
            ? _vehicleImages.length
            : _specialImages.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.fact_check_outlined, color: primaryColor, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Review Sighting Registry',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Confirm everything matches details perfectly before dispatching.',
            style: TextStyle(color: Colors.grey[600], fontSize: 13),
          ),
          const SizedBox(height: 20),

          // Sighting Summary Card
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey[200]!),
            ),
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Registry Type:',
                        style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _regType.toUpperCase(),
                          style: TextStyle(color: primaryColor, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      )
                    ],
                  ),
                  const Divider(height: 24),

                  // Dynamic summary blocks
                  if (_regType == 'Person' || _regType == 'Special') ...[
                    _buildSummaryRow(
                      'Target Name:',
                      '${_firstNameController.text.trim()} ${_middleNameController.text.trim()} ${_lastNameController.text.trim()}',
                    ),
                    _buildSummaryRow('Age / Gender:', '${_ageController.text.trim()} yrs • ${_selectedGender ?? "Unknown"}'),
                    if (_regType == 'Person') ...[
                      _buildSummaryRow('Height / Weight:', '${_heightController.text.trim()} cm • ${_weightController.text.trim()} kg'),
                    ],
                    if (_regType == 'Special') ...[
                      _buildSummaryRow('Special Category:', _selectedSpecialCategory ?? 'Unknown'),
                    ],
                  ] else ...[
                    _buildSummaryRow('Vehicle Brand / Model:', '${_brandController.text.trim()} • ${_modelController.text.trim()}'),
                    _buildSummaryRow('Color / Submodel:', '${_colorController.text.trim()} • ${_submodelController.text.trim()}'),
                    _buildSummaryRow(
                      'License Plate Information:',
                      '${_selectedRegion ?? "Unknown"} (Code ${_codeController.text.trim()}) - ${_plateNumberController.text.trim()}',
                    ),
                  ],

                  _buildSummaryRow('Sighting Location:', _locationController.text.trim()),
                  _buildSummaryRow(
                    'Approx Date & Time:',
                    '${_lastSeenDate != null ? DateFormat('yyyy-MM-dd').format(_lastSeenDate!) : ""} • ${_lastSeenTime?.format(context) ?? ""}',
                  ),

                  if (_telegramController.text.isNotEmpty)
                    _buildSummaryRow('Telegram Channel:', '@' + _telegramController.text.trim()),

                  _buildSummaryRow('Photos Attached:', '$imagesCount images loaded'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Accuracy check
          CheckboxListTile(
            value: _confirmAccuracy,
            title: const Text(
              'I confirm that all physical details, documentation logs, and location coordinates are correct to the best of my knowledge.',
              style: TextStyle(fontSize: 12),
            ),
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: primaryColor,
            contentPadding: EdgeInsets.zero,
            onChanged: (val) => setState(() => _confirmAccuracy = val ?? false),
          ),
          const SizedBox(height: 25),

          // Action dispatch
          _isSubmitting
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                  ),
                  onPressed: _submitForm,
                  child: const Text(
                    'DISPATCH CASE REPORT NOW',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 11)),
          const SizedBox(height: 2),
          Text(
            value.isEmpty ? 'Not Provided' : value,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationControls(Color primaryColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous step button
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              side: BorderSide(color: Colors.grey[300]!),
            ),
            onPressed: _activeStep == 0 ? null : _previousStep,
            child: Row(
              children: [
                const Icon(Icons.chevron_left, size: 18, color: Colors.black54),
                const SizedBox(width: 4),
                Text(
                  tr('report_case.prev_step'),
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87),
                ),
              ],
            ),
          ),

          // Next step button
          if (_activeStep < _totalSteps - 1)
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _nextStep,
              child: Row(
                children: [
                  Text(
                    tr('report_case.continue_to'),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.chevron_right, size: 18),
                ],
              ),
            )
          else
            const SizedBox.shrink(),
        ],
      ),
    );
  }
}
