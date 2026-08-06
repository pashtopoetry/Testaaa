import React, { useState, useRef, useEffect } from 'react';
import { Tv, Radio, Search, Heart, Globe, Sliders, Smartphone, PlusCircle, AlertCircle, ShieldCheck, Film, User, Settings, Moon, Sun, ChevronDown } from 'lucide-react';
import { Category, Language, Theme } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory?: Category;
  setSelectedCategory?: (cat: Category) => void;
  onOpenRemote: () => void;
  onOpenCustomStream: () => void;
  onOpenReport: () => void;
  totalChannels: number;
  totalRadio: number;
  currentUser: any;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenRemote,
  onOpenCustomStream,
  onOpenReport,
  totalChannels,
  totalRadio,
  currentUser,
  onOpenPremium,
  onOpenSettings,
}) => {
  const t = translations[language];

  // Dropdown states for compact header widgets
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Live Badge */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                setSearchQuery('');
                if (setSelectedCategory) setSelectedCategory('all');
              }}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Zama TV Logo" 
                  className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-900"></span>
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {t.siteName}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Mobile Actions: Profile/VIP & Settings */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenPremium}
                className={`relative p-2 rounded-xl border transition flex items-center justify-center ${
                  currentUser?.isVip
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-900/40'
                    : currentUser
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title={currentUser ? currentUser.name : 'Profile / لاګین'}
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-xs font-bold">
                  {currentUser ? (
                    <span className="text-rose-400 uppercase">{currentUser.name?.[0] || 'U'}</span>
                  ) : (
                    <User className="w-4 h-4 text-slate-300" />
                  )}
                  {currentUser?.isVip && (
                    <span className="absolute -top-2 -right-2 text-xs">👑</span>
                  )}
                </div>
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
                title="تنظیمات (Settings)"
              >
                <Settings className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-lg mx-0 md:mx-4">
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ltr:right-auto ltr:left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-400 text-sm rounded-xl pr-10 pl-4 ltr:pr-4 ltr:pl-10 py-2.5 border border-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-700 px-1.5 py-0.5 rounded ltr:left-auto ltr:right-3"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Control Bar */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Pashto Dubbed Movies Shortcut Button */}
            {setSelectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory('movies');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition shadow-sm ${
                  selectedCategory === 'movies'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400 shadow-amber-900/30 ring-2 ring-amber-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title={t.catMovies}
              >
                <Film className="w-4 h-4 text-amber-400" />
                <span>🎬 {t.catMovies}</span>
              </button>
            )}

            {/* Language Selector Dropdown Spinner */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsThemeOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 transition shadow-sm"
                title="د ژبې ټاکنه (Language)"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangOpen && (
                <div className="absolute left-0 ltr:right-0 ltr:left-auto mt-2 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      setLanguage('ps');
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-right ltr:text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                      language === 'ps' ? 'bg-rose-600/20 text-rose-400 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>پښتو</span>
                    {language === 'ps' && <span className="text-rose-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('dr');
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-right ltr:text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                      language === 'dr' ? 'bg-rose-600/20 text-rose-400 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>دري</span>
                    {language === 'dr' && <span className="text-rose-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-right ltr:text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                      language === 'en' ? 'bg-rose-600/20 text-rose-400 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="text-rose-400 text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Theme Selector Dropdown Spinner (Dark / Light) */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => {
                  setIsThemeOpen(!isThemeOpen);
                  setIsLangOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 transition shadow-sm"
                title="د رنګ بڼه (Theme)"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>{theme === 'dark' ? 'تور' : 'سپین'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isThemeOpen && (
                <div className="absolute left-0 ltr:right-0 ltr:left-auto mt-2 w-36 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                  <button
                    onClick={() => {
                      setTheme('dark');
                      setIsThemeOpen(false);
                    }}
                    className={`w-full text-right ltr:text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                      theme === 'dark' ? 'bg-indigo-600/20 text-indigo-400 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2"><span>🌙</span> تور (Dark)</span>
                    {theme === 'dark' && <span className="text-indigo-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setTheme('light');
                      setIsThemeOpen(false);
                    }}
                    className={`w-full text-right ltr:text-left px-4 py-2 text-xs font-bold transition flex items-center justify-between ${
                      theme === 'light' ? 'bg-amber-500/20 text-amber-400 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2"><span>☀️</span> سپین (Light)</span>
                    {theme === 'light' && <span className="text-amber-400 text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 transition shadow-sm"
              title="تنظیمات (Settings)"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>

            {/* Profile / VIP Avatar Icon (Like a Profile Button) */}
            <button
              onClick={onOpenPremium}
              className={`relative flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition shadow-sm ${
                currentUser?.isVip
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-300 shadow-amber-900/30'
                  : currentUser
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
              title={currentUser ? `${currentUser.name} (${currentUser.isVip ? 'VIP' : 'Free'})` : 'د پروفایل/VIP لاګین'}
            >
              <div className="relative w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black shadow-inner">
                {currentUser ? (
                  <span className="text-rose-400 uppercase">{currentUser.name?.[0] || 'U'}</span>
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
                {currentUser?.isVip && (
                  <span className="absolute -top-2 -right-2 text-[10px]">👑</span>
                )}
              </div>
              <div className="text-right ltr:text-left text-[11px] font-bold leading-tight">
                <div className="truncate max-w-[80px]">
                  {currentUser ? currentUser.name : (language === 'en' ? 'Profile' : 'پروفایل')}
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {currentUser?.isVip ? 'VIP Member' : (language === 'en' ? 'Login' : 'لاګین')}
                </div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
