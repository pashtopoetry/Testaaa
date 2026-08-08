import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../models/channel.dart';

class CategoryTabs extends StatelessWidget {
  const CategoryTabs({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;

    final categories = [
      {'cat': ChannelCategory.all, 'label': 'ټول (All)', 'icon': Icons.apps},
      {'cat': ChannelCategory.news, 'label': 'خبرونه (News)', 'icon': Icons.newspaper},
      {'cat': ChannelCategory.entertainment, 'label': 'تفریح (Entertainment)', 'icon': Icons.movie},
      {'cat': ChannelCategory.movies, 'label': 'فلمونه (Movies)', 'icon': Icons.local_movies},
      {'cat': ChannelCategory.sports, 'label': 'ورزش (Sports)', 'icon': Icons.sports_cricket},
      {'cat': ChannelCategory.cultural, 'label': 'کلتور (Cultural)', 'icon': Icons.museum},
      {'cat': ChannelCategory.regional, 'label': 'سیمه ایز (Regional)', 'icon': Icons.map},
      {'cat': ChannelCategory.radio, 'label': 'راډیو (Radio)', 'icon': Icons.radio},
    ];

    return Container(
      color: isDark ? const Color(0xFF0F172A) : Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 14),
              onChanged: (val) => provider.setSearchQuery(val),
              decoration: InputDecoration(
                hintText: 'د تلویزون یا راډیو چینل نوم وپلټئ (Search)...',
                hintStyle: TextStyle(color: isDark ? Colors.grey.shade500 : Colors.grey.shade600, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                filled: true,
                fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Categories Horizontal Scroll
          SizedBox(
            height: 42,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final item = categories[index];
                final cat = item['cat'] as ChannelCategory;
                final isSelected = provider.selectedCategory == cat && !provider.showFavoritesOnly;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    showCheckmark: false,
                    selected: isSelected,
                    label: Row(
                      children: [
                        Icon(
                          item['icon'] as IconData,
                          size: 16,
                          color: isSelected
                              ? Colors.white
                              : (isDark ? Colors.grey.shade300 : Colors.grey.shade700),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          item['label'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected
                                ? Colors.white
                                : (isDark ? Colors.grey.shade300 : Colors.grey.shade800),
                          ),
                        ),
                      ],
                    ),
                    selectedColor: const Color(0xFFE11D48),
                    backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                      side: BorderSide(
                        color: isSelected
                            ? const Color(0xFFE11D48)
                            : (isDark ? const Color(0xFF334155) : Colors.grey.shade300),
                      ),
                    ),
                    onSelected: (selected) {
                      provider.selectCategory(cat);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
