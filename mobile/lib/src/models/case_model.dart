class MissingPerson {
  final String id;
  final String firstName;
  final String lastName;
  final int age;
  final String gender;
  final String location;
  final List<String> images;
  final String status;

  MissingPerson({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.age,
    required this.gender,
    required this.location,
    required this.images,
    required this.status,
  });

  factory MissingPerson.fromJson(Map<String, dynamic> json) {
    return MissingPerson(
      id: json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      age: json['age'] is int ? json['age'] : int.tryParse(json['age']?.toString() ?? '0') ?? 0,
      gender: json['gender'] ?? '',
      location: json['location'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'active',
    );
  }

  String get fullName => '$firstName $lastName';
}

class MissingVehicle {
  final String id;
  final String plateNumber;
  final String model;
  final String color;
  final String location;
  final List<String> images;
  final String status;

  MissingVehicle({
    required this.id,
    required this.plateNumber,
    required this.model,
    required this.color,
    required this.location,
    required this.images,
    required this.status,
  });

  factory MissingVehicle.fromJson(Map<String, dynamic> json) {
    return MissingVehicle(
      id: json['_id'] ?? '',
      plateNumber: json['plateNumber'] ?? '',
      model: json['model'] ?? '',
      color: json['color'] ?? '',
      location: json['location'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      status: json['status'] ?? 'active',
    );
  }
}
