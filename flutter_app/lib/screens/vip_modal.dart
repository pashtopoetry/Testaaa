import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';

class VipModal extends StatefulWidget {
  const VipModal({super.key});

  @override
  State<VipModal> createState() => _VipModalState();
}

class _VipModalState extends State<VipModal> {
  final _emailController = TextEditingController();
  final _nameController = TextEditingController();
  String _selectedPlan = '1 Month VIP (300 AFN)';

  @override
  void dispose() {
    _emailController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final user = provider.currentUser;
    final isApprovedVip = user?.isApprovedVip ?? false;
    final isDark = provider.isDarkMode;

    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
        top: 20,
        left: 16,
        right: 16,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade500.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.workspace_premium, color: Colors.amber, size: 24),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isApprovedVip ? 'VIP Profile Dashboard' : 'کاروونکي پروفایل او VIP',
                          style: TextStyle(
                            color: isDark ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          'د زما ټلویزیون غړیتوب',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 16),

            if (user == null) ...[
              // Login / Sign in Form
              Text(
                'د لاګین يا نوملیکنې فورمه (Login / Sign Up)',
                style: TextStyle(
                  color: isDark ? Colors.white : Colors.black87,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _nameController,
                style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                decoration: InputDecoration(
                  labelText: 'ستاسو نوم (Name)',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _emailController,
                style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                decoration: InputDecoration(
                  labelText: 'ایمیل یا ټلیفون (Email or Phone)',
                  filled: true,
                  fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    provider.loginDemoUser(_emailController.text, _nameController.text);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE11D48),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('ورننوځئ (Login / Register)'),
                ),
              ),
            ] else ...[
              // Logged in user info
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFFE11D48),
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: TextStyle(
                              color: isDark ? Colors.white : Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            user.email,
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton(
                      onPressed: () => provider.logout(),
                      child: const Text('وتل (Logout)', style: TextStyle(fontSize: 11)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              if (isApprovedVip) ...[
                // VIP Dashboard Box
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.amber.shade900.withOpacity(0.4),
                        const Color(0xFF0F172A),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber, width: 1.5),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.workspace_premium, color: Colors.amber, size: 20),
                              SizedBox(width: 6),
                              Text(
                                'Approved VIP Membership',
                                style: TextStyle(
                                  color: Colors.amber,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.emerald.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.emerald),
                            ),
                            child: const Text(
                              '✓ فعال (Active)',
                              style: TextStyle(color: Colors.emerald, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 20, color: Colors.amber),

                      // VIP Details Grid
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailTile('د VIP پلان', user.vipPlanName ?? '1 Month VIP', isDark),
                          _buildDetailTile('پاتې شوې ورځې', '${user.remainingDays} ورځې', isDark, isHighlight: true),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailTile(
                            'د پیل نیټه',
                            user.vipStartedAt != null
                                ? DateTime.parse(user.vipStartedAt!).toString().split(' ')[0]
                                : 'امروز',
                            isDark,
                          ),
                          _buildDetailTile(
                            'د پای نیټه',
                            user.vipExpiresAt != null
                                ? DateTime.parse(user.vipExpiresAt!).toString().split(' ')[0]
                                : '—',
                            isDark,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ] else if (user.hasPendingVip) ...[
                // Pending status
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade900.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.amber),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.hourglass_top, color: Colors.amber, size: 36),
                      SizedBox(height: 8),
                      Text(
                        'ستاسو د VIP غوښتنه تر څېړنې لاندې ده',
                        style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 4),
                      Text(
                        'زموږ اډمین به ژر ستاسو لخوا لیږل شوی عکس تایید کړي.',
                        style: TextStyle(color: Colors.grey, fontSize: 11),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // Standard non-VIP status
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.grey),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'ستاسو اکونټ اوس مهال عادي (وړیا) دی. د ۴کا فلمونو لپاره VIP واخلئ.',
                          style: TextStyle(fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 16),

              // Request VIP button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    provider.requestVipUpgrade(_selectedPlan);
                  },
                  icon: const Icon(Icons.workspace_premium, color: Colors.black),
                  label: Text(
                    isApprovedVip ? 'د VIP موده غځول (Extend VIP)' : 'د VIP غړیتوب ترلاسه کول (Get VIP)',
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailTile(String label, String value, bool isDark, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade400, fontSize: 10)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            color: isHighlight ? Colors.amber : (isDark ? Colors.white : Colors.black87),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
