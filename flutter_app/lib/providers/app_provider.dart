import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/channel.dart';
import '../models/user.dart';
import '../data/channels_data.dart';

class AppProvider with ChangeNotifier {
  List<Channel> _channels = List.from(initialAfghanChannels);
  Channel? _selectedChannel;
  ChannelCategory _selectedCategory = ChannelCategory.all;
  Province _selectedProvince = Province.all;
  String _searchQuery = '';
  List<String> _favorites = [];
  AppUser? _currentUser;
  String _language = 'ps'; // 'ps' | 'dr' | 'en'
  bool _isDarkMode = true;
  bool _isPlaying = false;
  bool _showFavoritesOnly = false;

  AppProvider() {
    _selectedChannel = _channels.isNotEmpty ? _channels.first : null;
    _loadState();
  }

  // Getters
  List<Channel> get channels => _channels;
  Channel? get selectedChannel => _selectedChannel;
  ChannelCategory get selectedCategory => _selectedCategory;
  Province get selectedProvince => _selectedProvince;
  String get searchQuery => _searchQuery;
  List<String> get favorites => _favorites;
  AppUser? get currentUser => _currentUser;
  String get language => _language;
  bool get isDarkMode => _isDarkMode;
  bool get isPlaying => _isPlaying;
  bool get showFavoritesOnly => _showFavoritesOnly;

  List<Channel> get filteredChannels {
    return _channels.where((c) {
      if (_showFavoritesOnly && !_favorites.contains(c.id)) {
        return false;
      }
      if (_selectedCategory != ChannelCategory.all) {
        if (_selectedCategory == ChannelCategory.radio && !c.isRadio) {
          return false;
        }
        if (_selectedCategory == ChannelCategory.movies && !c.isMovie) {
          return false;
        }
        if (_selectedCategory != ChannelCategory.radio &&
            _selectedCategory != ChannelCategory.movies &&
            c.category != _selectedCategory) {
          return false;
        }
      }
      if (_selectedProvince != Province.all && c.province != _selectedProvince) {
        return false;
      }
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchName = c.name.toLowerCase().contains(q) ||
            (c.nameEn?.toLowerCase().contains(q) ?? false) ||
            (c.nameDr?.toLowerCase().contains(q) ?? false);
        final matchDesc = c.description.toLowerCase().contains(q);
        final matchLocation = c.location.toLowerCase().contains(q);
        if (!matchName && !matchDesc && !matchLocation) return false;
      }
      return true;
    }).toList();
  }

  // Setters & Methods
  void selectChannel(Channel channel) {
    _selectedChannel = channel;
    _isPlaying = true;
    notifyListeners();
  }

  void togglePlayPause() {
    _isPlaying = !_isPlaying;
    notifyListeners();
  }

  void setIsPlaying(bool playing) {
    _isPlaying = playing;
    notifyListeners();
  }

  void selectCategory(ChannelCategory category) {
    _selectedCategory = category;
    _showFavoritesOnly = false;
    notifyListeners();
  }

  void selectProvince(Province province) {
    _selectedProvince = province;
    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void toggleShowFavoritesOnly() {
    _showFavoritesOnly = !_showFavoritesOnly;
    notifyListeners();
  }

  void toggleFavorite(String channelId) {
    if (_favorites.contains(channelId)) {
      _favorites.remove(channelId);
    } else {
      _favorites.add(channelId);
    }
    _saveFavorites();
    notifyListeners();
  }

  bool isFavorite(String channelId) => _favorites.contains(channelId);

  void setLanguage(String lang) {
    _language = lang;
    _savePreferences();
    notifyListeners();
  }

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _savePreferences();
    notifyListeners();
  }

  void addCustomStream(Channel newChannel) {
    _channels.insert(0, newChannel);
    _selectedChannel = newChannel;
    _isPlaying = true;
    notifyListeners();
  }

  void loginDemoUser(String email, String name) {
    _currentUser = AppUser(
      id: 'demo_${DateTime.now().millisecondsSinceEpoch}',
      name: name.isNotEmpty ? name : 'مېلمه',
      email: email,
      isVip: false,
      isVIP: false,
    );
    notifyListeners();
  }

  void requestVipUpgrade(String planName) {
    if (_currentUser == null) {
      _currentUser = AppUser(
        id: 'usr_${DateTime.now().millisecondsSinceEpoch}',
        name: 'افغان کاروونکی',
        email: 'user@zamatv.af',
        isVip: false,
        hasPendingVip: true,
      );
    } else {
      _currentUser = AppUser(
        id: _currentUser!.id,
        name: _currentUser!.name,
        email: _currentUser!.email,
        phone: _currentUser!.phone,
        isVip: _currentUser!.isVip,
        isVIP: _currentUser!.isVIP,
        vipPlanName: planName,
        hasPendingVip: true,
      );
    }
    notifyListeners();
  }

  void approveVipForUser() {
    if (_currentUser != null) {
      final now = DateTime.now();
      final exp = now.add(const Duration(days: 30));
      _currentUser = AppUser(
        id: _currentUser!.id,
        name: _currentUser!.name,
        email: _currentUser!.email,
        phone: _currentUser!.phone,
        isVip: true,
        isVIP: true,
        vipPlanName: '30 Days 4K VIP',
        vipStartedAt: now.toIso8601String(),
        vipExpiresAt: exp.toIso8601String(),
        hasPendingVip: false,
      );
      notifyListeners();
    }
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _favorites = prefs.getStringList('zama_favorites') ?? [];
      _language = prefs.getString('zama_language') ?? 'ps';
      _isDarkMode = prefs.getBool('zama_dark_mode') ?? true;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _saveFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('zama_favorites', _favorites);
    } catch (_) {}
  }

  Future<void> _savePreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('zama_language', _language);
      await prefs.setBool('zama_dark_mode', _isDarkMode);
    } catch (_) {}
  }
}
