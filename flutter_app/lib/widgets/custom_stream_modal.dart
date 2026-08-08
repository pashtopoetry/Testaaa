import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/channel.dart';
import '../providers/app_provider.dart';

class CustomStreamModal extends StatefulWidget {
  const CustomStreamModal({super.key});

  @override
  State<CustomStreamModal> createState() => _CustomStreamModalState();
}

class _CustomStreamModalState extends State<CustomStreamModal> {
  final _nameController = TextEditingController();
  final _urlController = TextEditingController();
  final _logoController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _urlController.dispose();
    _logoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'خپله ځانګړې ژوندۍ لینک اضافه کړئ (Add Custom Stream)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _nameController,
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: 'د چینل نوم (Channel Name)',
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _urlController,
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: 'د m3u8 یا ویدیو لینک (Stream URL)',
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _logoController,
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: 'د لوګو لینک (Optional Logo URL)',
              filled: true,
              fillColor: isDark ? const Color(0xFF1E293B) : Colors.grey.shade100,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (_nameController.text.isNotEmpty && _urlController.text.isNotEmpty) {
                  final newChan = Channel(
                    id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
                    number: provider.channels.length + 1,
                    name: _nameController.text,
                    logo: _logoController.text.isNotEmpty
                        ? _logoController.text
                        : 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=300&q=80',
                    category: ChannelCategory.all,
                    province: Province.kabul,
                    location: 'Personal Custom Stream',
                    quality: '1080p HD',
                    viewers: 1,
                    likes: 1,
                    description: 'تاسو په لاسي ډول اضافه شوی ځانګړی لینک.',
                    streamUrl: _urlController.text,
                    language: 'Pashto',
                  );
                  provider.addCustomStream(newChan);
                  Navigator.pop(context);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE11D48),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('چینل اضافه کړه (Add Channel)'),
            ),
          ),
        ],
      ),
    );
  }
}
