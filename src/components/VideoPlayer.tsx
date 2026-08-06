import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Share2, AlertTriangle, Radio, Activity, Settings, 
  ChevronLeft, ChevronRight, Tv, ShieldCheck, Bookmark, PictureInPicture,
  Film, Send, Clock, Calendar, Star
} from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface VideoPlayerProps {
  channel: Channel;
  language: Language;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare: () => void;
  onOpenReport: () => void;
  likesCount: number;
  onLikeChannel: () => void;
  activeQuality: string;
  setActiveQuality: (q: string) => void;
  currentUser?: any;
  onOpenPremium?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  language,
  onNextChannel,
  onPrevChannel,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onOpenReport,
  likesCount,
  onLikeChannel,
  activeQuality,
  setActiveQuality,
  currentUser,
  onOpenPremium,
}) => {
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [playerServer, setPlayerServer] = useState<'hls' | 'fallback' | 'iframe'>('hls');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showServerMenu, setShowServerMenu] = useState<boolean>(false);
  const [pingMs, setPingMs] = useState<number>(24);
  const [liveViewers, setLiveViewers] = useState<number>(channel.viewers);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Fluctuating viewers & latency ping simulator
  useEffect(() => {
    setLiveViewers(channel.viewers);
    setPlayerServer('hls');
    setCurrentTime(0);
    setDuration(0);
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 11) - 5;
        return Math.max(100, prev + delta);
      });
      setPingMs(Math.floor(Math.random() * 12) + 20);
    }, 4000);
    return () => clearInterval(interval);
  }, [channel]);

  const getEmbedSourceUrl = (): string => {
    return channel.iframeUrl || channel.streamUrl || '';
  };

  // Handle stream loading (HLS or Native MP4 fallback)
  useEffect(() => {
    if (channel.isPremium && !currentUser?.isVip) {
      setIsPlaying(false);
      return;
    }

    if (playerServer === 'iframe') return;

    const video = videoRef.current;
    if (!video) return;

    setStreamError(false);
    setUsingFallback(playerServer === 'fallback');

    // Destroy previous HLS instance if active
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamToPlay = playerServer === 'fallback' 
      ? (channel.fallbackStreamUrl || channel.streamUrl)
      : channel.streamUrl;

    if (Hls.isSupported() && streamToPlay.endsWith('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(streamToPlay);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal error, switching to fallback video source:', data);
          setUsingFallback(true);
          setPlayerServer('fallback');
          if (channel.fallbackStreamUrl) {
            video.src = channel.fallbackStreamUrl;
            video.play().catch(() => {});
          } else if (channel.iframeUrl) {
            setPlayerServer('iframe');
          } else {
            setStreamError(true);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && streamToPlay.endsWith('.m3u8')) {
      // Native Safari HLS
      video.src = streamToPlay;
      video.play().catch(() => {});
    } else {
      // Fallback HTML5 video
      const targetSrc = channel.fallbackStreamUrl || streamToPlay;
      video.src = targetSrc;
      video.play().catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, channel.streamUrl, channel.fallbackStreamUrl, playerServer]);

  // Sync play state
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Sync volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      videoRef.current.requestPictureInPicture().catch(() => {});
    }
  };

  // Format seconds to H:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  return (
    <div className={`w-full transition-all duration-300 relative ${isTheater ? 'max-w-none px-0' : 'max-w-7xl mx-auto px-4'}`}>
      
      {/* 🔮 PREMIUM AMBIENT GLOW BACKDROP (Only when not in theater mode) */}
      {!isTheater && (
        <div className="absolute -inset-4 bg-gradient-to-tr from-rose-600/10 via-slate-900/0 to-amber-500/10 rounded-3xl blur-[60px] opacity-80 pointer-events-none z-0" />
      )}

      {/* Main Container */}
      <div className="bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* Main Stream Player Box */}
        <div 
          ref={containerRef}
          className={`relative bg-black group overflow-hidden ${
            isTheater ? 'h-[75vh]' : 'aspect-video max-h-[640px]'
          } flex items-center justify-center`}
        >
          {/* HTML5 Video Element or Web Embed Iframe */}
          {(channel.isPremium && !currentUser?.isVip) ? (
            /* 👑 BEAUTIFUL PREMIUM LOCK OVERLAY */
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center border border-amber-400 shadow-2xl animate-bounce shadow-amber-950">
                <span className="text-4xl">👑</span>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                  {language === 'en' ? 'VIP Premium Content' : 'د VIP ګډون ځانګړې برخه'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'This channel or movie is exclusive to VIP members. Please purchase a VIP subscription to unlock unlimited access.'
                    : 'دا تلویزون یا فلم یوازې د VIP غړو لپاره ځانګړی شوی دی. مهرباني وکړئ د ټول کانتنټ خلاصولو لپاره VIP غړیتوب ترلاسه کړئ.'}
                </p>
              </div>
              <button
                onClick={onOpenPremium}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-950 hover:scale-105 active:scale-95 transition"
              >
                {language === 'en' ? 'Get VIP Subscription Now' : '👑 اوس د VIP غړیتوب ترلاسه کړئ'}
              </button>
            </div>
          ) : (playerServer === 'iframe' || channel.iframeUrl) ? (
            <iframe
              src={getEmbedSourceUrl()}
              title={channel.name}
              className="w-full h-full border-0 min-h-[300px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              autoPlay
              loop
              poster={channel.bannerImg || channel.logo}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
              }}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration);
              }}
            />
          )}

          {/* 🍿 CENTERED GLOWING GLASS PLAY/PAUSE OVERLAY (Only for native video streams) */}
          {playerServer !== 'iframe' && !channel.iframeUrl && !(channel.isPremium && !currentUser?.isVip) && (
            <div 
              onClick={togglePlay}
              className={`absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-300 cursor-pointer ${
                isPlaying ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto' : 'opacity-100'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-rose-500/40 hover:bg-rose-950/40">
                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 drop-shadow-md" />
                ) : (
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 fill-amber-400 ml-1.5 drop-shadow-md animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Top Overlay Banner (Differentiates Live TV from Movies) */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2">
              {(channel.isMovie || channel.category === 'movies') ? (
                /* Movie Player Badge - NO Live Red Dot */
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="bg-slate-950/90 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>🎬 پښتو فلم</span>
                  </span>
                  {channel.imdbRating && (
                    <span className="bg-slate-950/90 text-amber-400 font-bold text-xs px-2.5 py-2 rounded-xl border border-amber-500/30 backdrop-blur-md flex items-center gap-1 shadow-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>IMDb {channel.imdbRating}</span>
                    </span>
                  )}
                </div>
              ) : (
                /* Live TV Channel Badge - Includes Live Red Dot */
                <span className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-rose-500/30 backdrop-blur-md flex items-center gap-2.5 shadow-lg pointer-events-auto text-xs font-bold text-rose-400" title="ژوندی خپراوی">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span>ژوندی خپراوی (LIVE)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Latency badge */}
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-slate-950/90 text-emerald-400 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{pingMs} ms</span>
              </span>

              {/* HD Quality indicator */}
              <span className="bg-slate-950/90 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-500/20 backdrop-blur-md shadow-lg">
                {channel.quality || '1080p HD'}
              </span>
            </div>
          </div>

          {/* Player Surfing Channel Arrows (On Hover) */}
          <button
            onClick={onPrevChannel}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 ltr:right-auto ltr:left-4"
            title={t.quickSurfing}
          >
            <ChevronRight className="w-7 h-7 ltr:rotate-180" />
          </button>

          <button
            onClick={onNextChannel}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110 ltr:left-auto ltr:right-4"
            title={t.quickSurfing}
          >
            <ChevronLeft className="w-7 h-7 ltr:rotate-180" />
          </button>

          {/* Video Stream Error or Loading Banner */}
          {streamError && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center text-white">
              <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold mb-2">د سټریم یا فلم خپرولو غږ بند دی</h3>
              <p className="text-slate-400 text-xs max-w-md mb-6 leading-relaxed">
                کېدای شي د دې فلم یا تلویزیوني سټریم لینک بند شوی وي او یا په بهرني سرور کې تخنیکي ستونزه وي. که ستونزه حل نشي، شکایت ثبت کړئ ترڅو اډمین یې لینک نوی کړي.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-900/30"
                >
                  بیا تازه کول (Reload)
                </button>
                <button 
                  onClick={onOpenReport}
                  className="px-5 py-2.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 border border-slate-700 transition"
                >
                  {t.reportIssue}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Custom Video Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 flex flex-col gap-3.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
            
            {/* 🎞️ SEEKBAR PROGRESS BAR (Only for direct HTML5 Video/Stream) */}
            {(playerServer !== 'iframe' && !channel.iframeUrl) ? (
              duration > 0 ? (
                <div className="flex items-center gap-3 w-full bg-slate-950/90 px-4 py-2.5 rounded-xl border border-slate-800/60 backdrop-blur-md shadow-inner" dir="ltr">
                  <span className="text-xs font-mono font-bold text-slate-300 select-none min-w-[45px] text-center">
                    {formatTime(currentTime)}
                  </span>
                  
                  {/* Styled Seek Range */}
                  <div className="relative flex-grow group/seek flex items-center h-5">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 focus:outline-none transition-all duration-200"
                    />
                    {/* Glowing highlight indicator */}
                    <div 
                      className="absolute left-0 top-[9px] h-1.5 bg-gradient-to-r from-rose-600 to-rose-400 rounded-full pointer-events-none"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-400 select-none min-w-[45px] text-center">
                    {formatTime(duration)}
                  </span>
                </div>
              ) : (
                /* Beautiful pulse signal indicator for live streams with no duration */
                <div className="flex items-center justify-between w-full bg-rose-950/20 border border-rose-500/20 px-4 py-2 rounded-xl backdrop-blur-md mb-1 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span>📡 په مستقیم او تیز رفتار سرور کې د تلویزیون ژوندۍ ننداره روانه ده</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    {t.liveIndicator || 'High Speed Connection'}
                  </span>
                </div>
              )
            ) : null}

            {/* Controls Bar Row */}
            <div className="flex items-center justify-between text-white">
              
              {/* Left Play/Pause & Volume */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white flex items-center justify-center transition-all duration-200 shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5.5 h-5.5 text-white" /> : <Play className="w-5.5 h-5.5 ml-0.5 text-white fill-white" />}
                </button>

                {/* Refined Mute & Expanding Volume Slider */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800/80 backdrop-blur-md group/vol transition-all duration-300">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-300 hover:text-white transition"
                    title="Volume"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-slate-100" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-20 md:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all duration-300 overflow-hidden"
                  />
                </div>

                <div className="hidden md:flex items-center gap-2.5 bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50" />
                  <span>{channel.name}</span>
                  <span className="text-slate-400 font-mono">#{channel.number}</span>
                </div>
              </div>

              {/* Right Controls: Quality, PiP, Theater, Fullscreen */}
              <div className="flex items-center gap-2">

                {/* Quality Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 transition"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>{activeQuality}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 w-28 z-50 ltr:left-auto ltr:right-0">
                      {['Auto', '1080p HD', '720p HD', '480p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setActiveQuality(q);
                            setShowQualityMenu(false);
                          }}
                          className={`w-full text-right ltr:text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition ${
                            activeQuality === q ? 'text-amber-400 font-extrabold bg-amber-500/10' : 'text-slate-300'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture in Picture */}
                <button
                  onClick={togglePiP}
                  className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-800 transition"
                  title="Picture in Picture"
                >
                  <PictureInPicture className="w-4.5 h-4.5" />
                </button>

                {/* Theater Mode Toggle */}
                <button
                  onClick={() => setIsTheater(!isTheater)}
                  className={`p-2.5 rounded-xl border transition hidden md:block ${
                    isTheater 
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-transparent hover:border-slate-800'
                  }`}
                  title="Theater Mode"
                >
                  <Tv className="w-4.5 h-4.5" />
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-800 transition"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-4.5 h-4.5" /> : <Maximize className="w-4.5 h-4.5" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Channel Info & Interactive Bar Below Player */}
        <div className="p-5 sm:p-6 bg-slate-900/65 border-t border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Channel Info Left */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700/80 shadow-lg bg-slate-850"
              />
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-extrabold text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                {channel.number}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'dr' && channel.nameDr ? channel.nameDr : language === 'en' && channel.nameEn ? channel.nameEn : channel.name}
                </h2>
                <span className="bg-rose-500/10 text-rose-400 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  {channel.location}
                </span>

                {(channel.isMovie || channel.category === 'movies') && (
                  <>
                    <span className="bg-amber-500/10 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-1 shadow-sm">
                      <Film className="w-3 h-3 text-amber-400" />
                      <span>پښتو ژباړل شوی فلم</span>
                    </span>
                    {channel.imdbRating && (
                      <span className="bg-amber-500/10 text-amber-400 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-amber-500/20 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>IMDb {channel.imdbRating}</span>
                      </span>
                    )}
                    {channel.genre && (
                      <span className="bg-purple-500/10 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-purple-500/20 shadow-sm">
                        {channel.genre}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap font-medium">
                {channel.isMovie || channel.category === 'movies' ? (
                  <>
                    {channel.duration && (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{channel.duration}</span>
                      </span>
                    )}
                    {channel.releaseYear && (
                      <span className="flex items-center gap-1 text-slate-200">
                        <Calendar className="w-4 h-4 text-rose-400" />
                        <span>{channel.releaseYear}</span>
                      </span>
                    )}
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{channel.language}</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 font-medium">{channel.language}</span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="text-slate-200">{channel.description}</span>
              </div>
            </div>
          </div>

          {/* Interactive Buttons Right */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            
            {(channel.telegramUrl || channel.streamUrl.includes('t.me/')) && (
              <a
                href={channel.telegramUrl || channel.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all duration-200 shadow-lg shadow-sky-900/30 hover:scale-105 shrink-0"
                title="د ټیلیګرام کانال خلاص کړئ"
              >
                <Send className="w-4 h-4" />
                <span>ټیلیګرام کې لیدل</span>
              </a>
            )}

            {/* Favorite / Save Bookmark Button */}
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-md shadow-amber-950/20'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={isFavorite ? "خوندي شوی (Saved)" : "خوندي کول (Save)"}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'خوندي شوی' : 'خوندي کول'}</span>
            </button>

            {/* Share */}
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 transition"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{t.shareChannel}</span>
            </button>

            {/* Report Issue */}
            <button
              onClick={onOpenReport}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition"
              title={t.reportIssue}
            >
              <AlertTriangle className="w-4.5 h-4.5" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
