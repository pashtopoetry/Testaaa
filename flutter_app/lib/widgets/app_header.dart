import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../screens/admin_screen.dart';
import '../screens/vip_modal.dart';
import 'custom_stream_modal.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  const AppHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(70);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;
    final isVip = provider.currentUser?.isApprovedVip ?? false;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade200,
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.4 : 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SafeArea(
        child: Row(
          children: [
            // Logo & Brand Name
            GestureDetector(
              onTap: () {
                provider.setSearchQuery('');
              },
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE11D48), Color(0xFFD97706)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Text(
                        'Z',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.black,
                          fontSize: 22,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Text(
                            provider.language == 'en' ? 'ZAMA TV' : 'زما ټلویزیون',
                            style: TextStyle(
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.red.shade600,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.circle, color: Colors.white, size: 6),
                                SizedBox(width: 4),
                                Text(
                                  'LIVE',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      Text(
                        provider.language == 'en'
                            ? 'Pashto & Afghan Live TV'
                            : 'د افغانستان پښتو ژوندۍ خپرونې',
                        style: TextStyle(
                          color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Actions
            Row(
              children: [
                // Custom Stream Button
                IconButton(
                  icon: const Icon(Icons.add_link, color: Color(0xFFE11D48)),
                  tooltip: 'Add Custom Stream',
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => const CustomStreamModal(),
                    );
                  },
                ),

                // Favorites Filter Toggle
                IconButton(
                  icon: Icon(
                    provider.showFavoritesOnly ? Icons.favorite : Icons.favorite_border,
                    color: provider.showFavoritesOnly ? Colors.red : (isDark ? Colors.grey.shade300 : Colors.black87),
                  ),
                  tooltip: 'Favorites Only',
                  onPressed: () {
                    provider.toggleShowFavoritesOnly();
                  },
                ),

                // Admin Screen Button
                IconButton(
                  icon: const Icon(Icons.admin_panel_settings, color: Colors.amber),
                  tooltip: 'Admin Panel',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AdminScreen()),
                    );
                  },
                ),

                // VIP / User Profile Button
                GestureDetector(
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => const VipModal(),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: isVip
                          ? LinearGradient(
                              colors: [Colors.amber.shade700, Colors.amber.shade500],
                            )
                          : null,
                      color: isVip
                          ? null
                          : (isDark ? const Color(0xFF1E293B) : Colors.grey.shade100),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isVip ? Colors.amber : (isDark ? Colors.grey.shade800 : Colors.grey.shade300),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isVip ? Icons.workspace_premium : Icons.person,
                          color: isVip ? Colors.black : (isDark ? Colors.white : Colors.black87),
                          size: 18,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isVip ? 'VIP' : 'پروفایل',
                          style: TextStyle(
                            color: isVip ? Colors.black : (isDark ? Colors.white : Colors.black87),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
