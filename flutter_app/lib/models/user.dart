class AppUser {
  final String id;
  final String name;
  final String email;
  final String phone;
  final bool isVip;
  final bool isVIP;
  final String? vipPlanName;
  final String? vipStartedAt;
  final String? vipExpiresAt;
  final bool hasPendingVip;
  final String? createdAt;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.isVip = false,
    this.isVIP = false,
    this.vipPlanName,
    this.vipStartedAt,
    this.vipExpiresAt,
    this.hasPendingVip = false,
    this.createdAt,
  });

  bool get isApprovedVip {
    final flag = isVIP || isVip;
    if (!flag || vipExpiresAt == null) return false;
    final exp = DateTime.tryParse(vipExpiresAt!);
    if (exp == null) return false;
    return exp.isAfter(DateTime.now());
  }

  int get remainingDays {
    if (vipExpiresAt == null) return 0;
    final exp = DateTime.tryParse(vipExpiresAt!);
    if (exp == null) return 0;
    final diff = exp.difference(DateTime.now()).inDays;
    return diff > 0 ? diff : 0;
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    final vipFlag = (json['isVIP'] == true) || (json['isVip'] == true);
    return AppUser(
      id: json['id'] ?? '',
      name: json['name'] ?? 'مېلمه کاروونکی',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      isVip: vipFlag,
      isVIP: vipFlag,
      vipPlanName: json['vipPlanName'] ?? json['planTitle'] ?? json['planName'],
      vipStartedAt: json['vipStartedAt'],
      vipExpiresAt: json['vipExpiresAt'],
      hasPendingVip: json['hasPendingVip'] ?? false,
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'isVip': isVip,
      'isVIP': isVIP,
      'vipPlanName': vipPlanName,
      'vipStartedAt': vipStartedAt,
      'vipExpiresAt': vipExpiresAt,
      'hasPendingVip': hasPendingVip,
      'createdAt': createdAt,
    };
  }
}
