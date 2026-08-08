import { createContext } from 'react';

export type Language = 'ps' | 'dr' | 'en'; // Pashto (پښتو), Dari (دري), English

export type Theme = 'dark' | 'light';

export const ThemeContext = createContext<{ theme: Theme; isLight: boolean }>({ theme: 'dark', isLight: false });

export const getThemeClasses = (theme: Theme) => {
  const isLight = theme === 'light';
  return {
    isLight,
    appBg: isLight ? 'bg-white text-slate-900' : 'bg-slate-950 text-slate-100',
    headerBg: isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' : 'bg-slate-900/95 border-slate-800 text-white shadow-xl',
    cardBg: isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm hover:shadow-md' : 'bg-slate-900/90 border-slate-800 text-white',
    inputBg: isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500' : 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400',
    modalBg: isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white',
    textMain: isLight ? 'text-slate-900' : 'text-white',
    textMuted: isLight ? 'text-slate-600' : 'text-slate-400',
    border: isLight ? 'border-slate-200' : 'border-slate-800',
    panelBg: isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800',
  };
};

export type Category = 
  | 'all' 
  | 'news' 
  | 'entertainment' 
  | 'movies'
  | 'sports' 
  | 'cultural' 
  | 'regional' 
  | 'radio';

export type Province = 
  | 'all' 
  | 'kabul' 
  | 'kandahar' 
  | 'herat' 
  | 'balkh' 
  | 'nangarhar' 
  | 'paktia' 
  | 'helmand';

export interface EPGItem {
  id: string;
  title: string;
  titleDr?: string;
  titleEn?: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  host?: string;
  description?: string;
  isLive?: boolean;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  nameDr?: string;
  nameEn?: string;
  logo: string;
  category: Category;
  province: Province;
  location: string;
  quality: '4K' | '1080p HD' | '720p HD' | 'SD';
  isLive: boolean;
  viewers: number;
  likes: number;
  description: string;
  streamUrl: string;       // Primary m3u8 or video source
  fallbackStreamUrl?: string; // Fallback video stream
  iframeUrl?: string;       // Embed player fallback if m3u8 is unavailable
  epg: EPGItem[];
  frequency?: string;      // Satellite / terrestrial frequency
  language: string;        // Primary broadcast language
  isRadio?: boolean;
  isMovie?: boolean;
  duration?: string;
  releaseYear?: string;
  imdbRating?: string;
  genre?: string;
  director?: string;
  bannerImg?: string;
  isPremium?: boolean;
}

export interface NewsItem {
  id: string;
  titlePs: string;
  titleDr: string;
  titleEn: string;
  time: string;
  category: string;
  source: string;
  isUrgent?: boolean;
}

export interface ViewerComment {
  id: string;
  channelId: string;
  userName: string;
  userAvatar?: string;
  location: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface StreamReport {
  channelId: string;
  channelName: string;
  issueType: 'buffering' | 'no_audio' | 'broken_link' | 'wrong_epg' | 'other';
  note: string;
  timestamp: string;
}
