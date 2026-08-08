import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/channel.dart';
import '../providers/app_provider.dart';

class RadioPlayerWidget extends StatefulWidget {
  final Channel channel;

  const RadioPlayerWidget({super.key, required this.channel});

  @override
  State<RadioPlayerWidget> createState() => _RadioPlayerWidgetState();
}

class _RadioPlayerWidgetState extends State<RadioPlayerWidget> {
  bool _isPlaying = false;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1E1B4B),
            const Color(0xFF0F172A),
          ],
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundImage: NetworkImage(widget.channel.logo),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.amber,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'FM RADIO',
                            style: TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 9,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          widget.channel.location,
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.channel.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Animated Sound Wave Representation
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(12, (index) {
              final heights = [18.0, 32.0, 12.0, 42.0, 24.0, 36.0, 16.0, 30.0, 48.0, 20.0, 28.0, 14.0];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: 5,
                height: _isPlaying ? heights[index] : 8,
                decoration: BoxDecoration(
                  color: _isPlaying ? Colors.amber : Colors.grey.shade700,
                  borderRadius: BorderRadius.circular(4),
                ),
              );
            }),
          ),

          const SizedBox(height: 20),

          // Play/Pause Button
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _isPlaying = !_isPlaying;
              });
            },
            icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow, size: 28),
            label: Text(_isPlaying ? 'د راډیو موقت کول (Pause)' : 'د راډیو اورېدل (Play Radio)'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE11D48),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
