import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, MapPin, Radio, Tv, Film, Send } from 'lucide-react';
import { Category, Channel, Language, Province } from '../types';
import { ChannelCard } from './ChannelCard';
import { translations } from '../data/translations';

interface ChannelGridProps {
  channels: Channel[];
  activeChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  language: Language;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  selectedProvince: Province;
  setSelectedProvince: (prov: Province) => void;
  favorites: string[];
  onToggleFavorite: (channelId: string, e: React.MouseEvent) => void;
  viewMode: 'grid' | 'list' | 'compact';
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
}

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  language,
  selectedCategory,
  setSelectedCategory,
  selectedProvince,
  setSelectedProvince,
  favorites,
  onToggleFavorite,
  viewMode,
  setViewMode,
  showFavoritesOnly,
  setShowFavoritesOnly,
}) => {
  const t = translations[language];

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'movies', label: t.catMovies, icon: '🎬' },
    { id: 'news', label: t.catNews, icon: '📰' },
    { id: 'entertainment', label: t.catEntertainment, icon: '🎭' },
    { id: 'sports', label: t.catSports, icon: '🏏' },
    { id: 'cultural', label: t.catCultural, icon: '🕌' },
    { id: 'regional', label: t.catRegional, icon: '🏞️' },
    { id: 'radio', label: t.catRadio, icon: '📻' },
  ];

  const provinces: { id: Province; label: string }[] = [
    { id: 'all', label: t.allProvinces },
    { id: 'kabul', label: t.kabul },
    { id: 'kandahar', label: t.kandahar },
    { id: 'herat', label: t.herat },
    { id: 'balkh', label: t.balkh },
    { id: 'nangarhar', label: t.nangarhar },
  ];

  return (
    <div className="space-y-4">
      
      {/* Category Pills & Filters Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-md">
        
        {/* Category Scrollable Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const isMovies = cat.id === 'movies';
            const isSelected = selectedCategory === cat.id && !showFavoritesOnly;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (showFavoritesOnly) setShowFavoritesOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? isMovies
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/40'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-500 text-white shadow-md'
                    : isMovies
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters & View Mode Selector */}
        <div className="flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 border-slate-800 pt-2.5 md:pt-0">
          
          {/* Province Dropdown */}
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value as Province)}
              className="bg-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none pr-7 ltr:pr-3 ltr:pl-7"
            >
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-rose-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ltr:left-auto ltr:right-2.5" />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title={t.gridMode}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title={t.listMode}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>


      {/* Grid or List Display */}
      {channels.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
          <p className="font-bold text-base text-slate-200 mb-1">{t.noChannelsFound}</p>
          <p className="text-xs text-slate-400 mb-4">لطفاً فلټرونه پاک کړئ یا بل نوم ولټوئ.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedProvince('all');
              setShowFavoritesOnly(false);
            }}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition"
          >
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4' 
            : 'space-y-2'
        }>
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              language={language}
              isActive={activeChannel.id === channel.id}
              onSelect={() => onSelectChannel(channel)}
              isFavorite={favorites.includes(channel.id)}
              onToggleFavorite={(e) => onToggleFavorite(channel.id, e)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

    </div>
  );
};
