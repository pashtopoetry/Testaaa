import React from 'react';
import { Radio, Volume2, Play, Pause, Sparkles, MapPin } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface RadioPlayerProps {
  channel: Channel;
  language: Language;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  channel,
  language,
  isPlaying,
  onTogglePlay,
}) => {
  const t = translations[language];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden">
      
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Left: Station Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl bg-slate-900"
            />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
              FM
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2.5 py-0.5 rounded-md border border-amber-500/30">
                {t.activeRadio}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {channel.location}
              </span>
            </div>

            <h3 className="text-xl font-black text-white mt-1 tracking-tight">
              {channel.name}
            </h3>

            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-amber-300 font-bold">{channel.frequency}</span>
              <span>•</span>
              <span className="text-slate-400">{channel.description}</span>
            </p>
          </div>
        </div>

        {/* Center: Audio Wave Equalizer Animation */}
        <div className="flex items-center justify-center gap-1.5 h-10 px-4">
          {[40, 75, 55, 90, 30, 85, 60, 100, 45, 80, 65, 35].map((height, i) => (
            <div
              key={i}
              className={`w-1.5 bg-gradient-to-t from-amber-500 to-rose-500 rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'opacity-40'
              }`}
              style={{
                height: isPlaying ? `${height}%` : '20%',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Right: Big Play/Pause Radio Switch */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/50 transition transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>وقف کول</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>د راډیو اورېدل</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
