import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../widgets/app_header.dart';
import '../widgets/category_tabs.dart';
import '../widgets/channel_card.dart';
import '../widgets/radio_player_widget.dart';
import 'player_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;
    final selectedChannel = provider.selectedChannel;
    final filteredChannels = provider.filteredChannels;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: const AppHeader(),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Active Selected Channel Player Area
            if (selectedChannel != null)
              SliverToBoxAdapter(
                child: Column(
                  children: [
                    if (selectedChannel.isRadio)
                      RadioPlayerWidget(channel: selectedChannel)
                    else
                      VideoPlayerWidget(channel: selectedChannel),
                    const Divider(height: 1),
                  ],
                ),
              ),

            // Category & Search Bar
            const SliverToBoxAdapter(
              child: CategoryTabs(),
            ),

            // Channels Section Title
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      provider.showFavoritesOnly
                          ? '❤️ خالي زما خوښ شوي (Favorites Only)'
                          : '📺 د افغان تلویزونونو لیست (${filteredChannels.length})',
                      style: TextStyle(
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    if (provider.showFavoritesOnly)
                      TextButton(
                        onPressed: () => provider.toggleShowFavoritesOnly(),
                        child: const Text('ټول ښکاره کړه', style: TextStyle(fontSize: 12)),
                      ),
                  ],
                ),
              ),
            ),

            // Channels Grid View
            if (filteredChannels.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.search_off, size: 48, color: Colors.grey),
                      const SizedBox(height: 12),
                      Text(
                        'هیڅ چینل پیدا نشو (No channels found)',
                        style: TextStyle(
                          color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 220,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 0.82,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return ChannelCard(channel: filteredChannels[index]);
                    },
                    childCount: filteredChannels.length,
                  ),
                ),
              ),

            const SliverToBoxAdapter(
              child: SizedBox(height: 30),
            ),
          ],
        ),
      ),
    );
  }
}
