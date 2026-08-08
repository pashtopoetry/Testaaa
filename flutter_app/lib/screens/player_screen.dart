import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:provider/provider.dart';
import '../models/channel.dart';
import '../providers/app_provider.dart';

class VideoPlayerWidget extends StatefulWidget {
  final Channel channel;

  const VideoPlayerWidget({super.key, required this.channel});

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  VideoPlayerController? _videoPlayerController;
  ChewieController? _chewieController;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  @override
  void didUpdateWidget(covariant VideoPlayerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.channel.id != widget.channel.id) {
      _disposePlayer();
      _initializePlayer();
    }
  }

  Future<void> _initializePlayer() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    try {
      final url = widget.channel.streamUrl;
      _videoPlayerController = VideoPlayerController.networkUrl(Uri.parse(url));

      await _videoPlayerController!.initialize();

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController!,
        autoPlay: false, // Per request: video should not auto-play on initial load
        looping: true,
        isLive: widget.channel.isLive,
        aspectRatio: 16 / 9,
        allowFullScreen: true,
        allowMuting: true,
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 42),
                  const SizedBox(height: 8),
                  const Text(
                    'دا خپرونه اوس مهال شتون نلري (Stream Unavailable)',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _initializePlayer,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE11D48),
                    ),
                    child: const Text('بیا هڅه وکړئ (Retry)'),
                  ),
                ],
              ),
            ),
          );
        },
      );

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasError = true;
      });
    }
  }

  void _disposePlayer() {
    _chewieController?.dispose();
    _videoPlayerController?.dispose();
    _chewieController = null;
    _videoPlayerController = null;
  }

  @override
  void dispose() {
    _disposePlayer();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;

    return Container(
      color: Colors.black,
      child: Column(
        children: [
          // Player Container
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(
              children: [
                if (_isLoading)
                  Container(
                    color: Colors.black,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            color: const Color(0xFFE11D48),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'د ${widget.channel.name} لېږدېدل (Loading)...',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (_hasError || _chewieController == null)
                  Container(
                    color: Colors.slate.shade900,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.tv_off, color: Colors.amber, size: 48),
                          const SizedBox(height: 8),
                          Text(
                            widget.channel.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'د سپوږمۍ لینک خراب دی، بل سرور وټاکئ',
                            style: TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('بیا نښلول'),
                            onPressed: _initializePlayer,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFE11D48),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Chewie(controller: _chewieController!),
              ],
            ),
          ),

          // Channel Info & Controls below Player
          Container(
            padding: const EdgeInsets.all(12),
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundImage: NetworkImage(widget.channel.logo),
                      backgroundColor: Colors.slate.shade800,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.channel.name,
                            style: TextStyle(
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          Text(
                            '${widget.channel.location} • ${widget.channel.quality}',
                            style: TextStyle(
                              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Like button
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.thumb_up, size: 14, color: Colors.amber),
                      label: Text(
                        '${widget.channel.likes}',
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black87,
                          fontSize: 11,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: isDark ? const Color(0xFF334155) : Colors.grey.shade300,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Description
                Text(
                  widget.channel.description,
                  style: TextStyle(
                    color: isDark ? Colors.grey.shade300 : Colors.grey.shade700,
                    fontSize: 12,
                  ),
                ),

                if (widget.channel.epg.isNotEmpty) ...[
                  const Divider(height: 20),
                  const Text(
                    '📅 د خپرونو جدول (EPG)',
                    style: TextStyle(
                      color: Color(0xFFE11D48),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Column(
                    children: widget.channel.epg.map((epg) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: epg.isLive
                              ? const Color(0xFFE11D48).withOpacity(0.15)
                              : (isDark ? const Color(0xFF1E293B) : Colors.grey.shade100),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: epg.isLive
                                ? const Color(0xFFE11D48)
                                : Colors.transparent,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              epg.title,
                              style: TextStyle(
                                color: isDark ? Colors.white : Colors.black87,
                                fontSize: 12,
                                fontWeight: epg.isLive ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                            Text(
                              '${epg.startTime} - ${epg.endTime}',
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
