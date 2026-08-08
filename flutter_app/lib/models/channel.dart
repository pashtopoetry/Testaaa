import 'epg_item.dart';

enum ChannelCategory {
  all,
  news,
  entertainment,
  movies,
  sports,
  cultural,
  regional,
  radio,
}

enum Province {
  all,
  kabul,
  kandahar,
  herat,
  balkh,
  nangarhar,
  paktia,
  helmand,
}

class Channel {
  final String id;
  final int number;
  final String name;
  final String? nameDr;
  final String? nameEn;
  final String logo;
  final ChannelCategory category;
  final Province province;
  final String location;
  final String quality; // '4K' | '1080p HD' | '720p HD' | 'SD'
  final bool isLive;
  final int viewers;
  final int likes;
  final String description;
  final String streamUrl;
  final String? fallbackStreamUrl;
  final String? iframeUrl;
  final List<EPGItem> epg;
  final String? frequency;
  final String language;
  final bool isRadio;
  final bool isMovie;
  final String? duration;
  final String? releaseYear;
  final String? imdbRating;
  final String? genre;
  final String? director;
  final String? bannerImg;
  final bool isPremium;

  Channel({
    required this.id,
    required this.number,
    required this.name,
    this.nameDr,
    this.nameEn,
    required this.logo,
    required this.category,
    required this.province,
    required this.location,
    required this.quality,
    this.isLive = true,
    required this.viewers,
    required this.likes,
    required this.description,
    required this.streamUrl,
    this.fallbackStreamUrl,
    this.iframeUrl,
    this.epg = const [],
    this.frequency,
    required this.language,
    this.isRadio = false,
    this.isMovie = false,
    this.duration,
    this.releaseYear,
    this.imdbRating,
    this.genre,
    this.director,
    this.bannerImg,
    this.isPremium = false,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['id'] ?? '',
      number: json['number'] ?? 0,
      name: json['name'] ?? '',
      nameDr: json['nameDr'],
      nameEn: json['nameEn'],
      logo: json['logo'] ?? '',
      category: _categoryFromString(json['category']),
      province: _provinceFromString(json['province']),
      location: json['location'] ?? '',
      quality: json['quality'] ?? '1080p HD',
      isLive: json['isLive'] ?? true,
      viewers: json['viewers'] ?? 0,
      likes: json['likes'] ?? 0,
      description: json['description'] ?? '',
      streamUrl: json['streamUrl'] ?? '',
      fallbackStreamUrl: json['fallbackStreamUrl'],
      iframeUrl: json['iframeUrl'],
      epg: (json['epg'] as List<dynamic>?)
              ?.map((e) => EPGItem.fromJson(e))
              .toList() ??
          [],
      frequency: json['frequency'],
      language: json['language'] ?? 'Pashto',
      isRadio: json['isRadio'] ?? false,
      isMovie: json['isMovie'] ?? false,
      duration: json['duration'],
      releaseYear: json['releaseYear'],
      imdbRating: json['imdbRating'],
      genre: json['genre'],
      director: json['director'],
      bannerImg: json['bannerImg'],
      isPremium: json['isPremium'] ?? false,
    );
  }

  static ChannelCategory _categoryFromString(String? cat) {
    switch (cat?.toLowerCase()) {
      case 'news':
        return ChannelCategory.news;
      case 'entertainment':
        return ChannelCategory.entertainment;
      case 'movies':
        return ChannelCategory.movies;
      case 'sports':
        return ChannelCategory.sports;
      case 'cultural':
        return ChannelCategory.cultural;
      case 'regional':
        return ChannelCategory.regional;
      case 'radio':
        return ChannelCategory.radio;
      default:
        return ChannelCategory.all;
    }
  }

  static Province _provinceFromString(String? prov) {
    switch (prov?.toLowerCase()) {
      case 'kabul':
        return Province.kabul;
      case 'kandahar':
        return Province.kandahar;
      case 'herat':
        return Province.herat;
      case 'balkh':
        return Province.balkh;
      case 'nangarhar':
        return Province.nangarhar;
      case 'paktia':
        return Province.paktia;
      case 'helmand':
        return Province.helmand;
      default:
        return Province.all;
    }
  }
}
