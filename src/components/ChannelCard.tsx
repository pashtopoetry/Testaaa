import React from 'react';
import { Play, Bookmark, Radio, MapPin, Film } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface ChannelCardProps {
  channel: Channel;
  language: Language;
  isActive: boolean;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list' | 'compact';
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  language,
  isActive,
  onSelect,
  isFavorite,
  onToggleFavorite,
  viewMode = 'grid',
}) => {
  const t = translations[language];

  const channelName = language === 'dr' && channel.nameDr 
    ? channel.nameDr 
    : language === 'en' && channel.nameEn 
    ? channel.nameEn 
    : channel.name;

  if (viewMode === 'list') {
    return (
      <div 
        onClick={onSelect}
        className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
          isActive 
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/20' 
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm ${isActive ? 'text-rose-400' : 'text-slate-100 group-hover:text-rose-300'}`}>
                {channelName}
              </h3>
              {channel.isLive && (
                <span className="relative flex h-2 w-2" title="ژوندی">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{channel.location}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono text-[11px]">{channel.quality}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            title={isFavorite ? "خوندي شوی (Saved)" : "خوندي کول (Save)"}
            className={`p-2 rounded-xl border transition ${
              isFavorite 
                ? 'text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-sm' 
                : 'text-slate-400 bg-slate-800/80 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
            isActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-rose-600 group-hover:text-white'
          }`}>
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col ${
        isActive 
          ? 'bg-slate-900 border-rose-500 shadow-xl shadow-rose-950/40 ring-2 ring-rose-500/30' 
          : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1 hover:shadow-xl'
      }`}
    >
      {/* Thumbnail Banner & Play Overlay */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img 
          src={channel.bannerImg || channel.logo} 
          alt={channel.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-end z-10">
          <div className="flex items-center gap-2">
            {/* Single live dot badge without heavy text */}
            {channel.isLive && (
              <span className="bg-slate-950/80 p-1.5 rounded-full border border-rose-500/40 backdrop-blur-md flex items-center justify-center shadow-md" title="ژوندی">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              </span>
            )}

            {/* Save / Favorite Bookmark Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(e);
              }}
              title={isFavorite ? "خوندي شوی (Saved)" : "خوندي کول (Save)"}
              className={`p-1.5 rounded-full backdrop-blur-md transition border ${
                isFavorite 
                  ? 'bg-amber-500/30 text-amber-400 border-amber-500/50 shadow-md' 
                  : 'bg-slate-950/70 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Channel Logo floating over thumbnail */}
        <div className="absolute bottom-2.5 right-2.5 ltr:right-auto ltr:left-2.5 flex items-center gap-2">
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-10 h-10 rounded-xl object-cover border-2 border-slate-800 shadow-md bg-slate-900"
          />
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 ml-1 fill-current" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className={`font-bold text-sm line-clamp-1 ${isActive ? 'text-rose-400' : 'text-slate-100 group-hover:text-rose-300'}`}>
              <bdi dir="auto">{channelName}</bdi>
            </h3>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <bdi dir="auto">{channel.location}</bdi>
          </p>
        </div>

        {/* Card Footer Clean Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-sans gap-1">
          <span className="text-slate-400 text-[11px] truncate">
            <bdi dir="auto">
              {channel.category === 'movies' || channel.isMovie 
                ? '🎬 پښتو فلم' 
                : channel.language === 'Pashto / Dari' || channel.language === 'Pashto/Dari'
                ? 'پښتو / دري'
                : channel.language}
            </bdi>
          </span>

          <span className="bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px] border border-slate-700 shrink-0 font-mono">
            {channel.quality}
          </span>
        </div>
      </div>
    </div>
  );
};
