import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final user = provider.currentUser;
    final isDark = provider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('د اډمین پینل (Admin Control Panel)'),
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Metrics cards
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    'ټول چینلونه',
                    '${provider.channels.length}',
                    Icons.tv,
                    Colors.blue,
                    isDark,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    'ژوندۍ خپرونې',
                    '${provider.channels.where((c) => c.isLive).length}',
                    Icons.sensors,
                    Colors.red,
                    isDark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Pending VIP Users Approval Section
            Card(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.workspace_premium, color: Colors.amber),
                        SizedBox(width: 8),
                        Text(
                          'د VIP غړیتوب لاسي تاییدول (VIP Approvals)',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    if (user != null && user.hasPendingVip) ...[
                      ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Colors.amber,
                          child: Icon(Icons.person, color: Colors.black),
                        ),
                        title: Text(user.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${user.email} • ${user.vipPlanName ?? "1 Month VIP"}'),
                        trailing: ElevatedButton(
                          onPressed: () {
                            provider.approveVipForUser();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('کاروونکی په بریالیتوب سره VIP شو!')),
                            );
                          },
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald),
                          child: const Text('تایید کړه (Approve)'),
                        ),
                      ),
                    ] else ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text(
                          'هیڅ ځنډېدلې VIP غوښتنه شتون نلري (No pending VIP requests).',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Channel Management List
            Card(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'د ټول چینلونو مدیریت (Manage Channels)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 10),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.channels.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final c = provider.channels[index];
                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundImage: NetworkImage(c.logo),
                          ),
                          title: Text(c.name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          subtitle: Text('#${c.number} • ${c.quality} • ${c.location}', style: const TextStyle(fontSize: 11)),
                          trailing: Icon(
                            c.isLive ? Icons.check_circle : Icons.error_outline,
                            color: c.isLive ? Colors.emerald : Colors.red,
                            size: 18,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 22),
              Text(
                value,
                style: TextStyle(
                  color: isDark ? Colors.white : Colors.black87,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
