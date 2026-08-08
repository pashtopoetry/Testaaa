class EPGItem {
  final String id;
  final String title;
  final String? titleDr;
  final String? titleEn;
  final String startTime;
  final String endTime;
  final String? host;
  final String? description;
  final bool isLive;

  EPGItem({
    required this.id,
    required this.title,
    this.titleDr,
    this.titleEn,
    required this.startTime,
    required this.endTime,
    this.host,
    this.description,
    this.isLive = false,
  });

  factory EPGItem.fromJson(Map<String, dynamic> json) {
    return EPGItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      titleDr: json['titleDr'],
      titleEn: json['titleEn'],
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      host: json['host'],
      description: json['description'],
      isLive: json['isLive'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'titleDr': titleDr,
      'titleEn': titleEn,
      'startTime': startTime,
      'endTime': endTime,
      'host': host,
      'description': description,
      'isLive': isLive,
    };
  }
}
