import React, { useState } from 'react';
import { X, PlusCircle, Link, Tv } from 'lucide-react';
import { Channel, Category, Language } from '../types';
import { translations } from '../data/translations';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (channel: Channel) => void;
  language: Language;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onAddStream,
  language,
}) => {
  const t = translations[language];

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('movies');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    const trimmedUrl = url.trim();
    const isTelegram = trimmedUrl.includes('t.me/');
    const isMovie = category === 'movies' || isTelegram;

    const newChannel: Channel = {
      id: 'custom_' + Date.now(),
      number: 99,
      name: title.trim(),
      logo: isMovie 
        ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=300&q=80',
      category: category,
      province: 'kabul',
      location: isTelegram ? 'تلګرام ویډیو / فلم' : 'zamatv.site - دودیز',
      quality: '1080p HD',
      isLive: !isMovie,
      isMovie: isMovie,
      viewers: 120,
      likes: 85,
      description: isMovie ? 'د تلګرام څخه زیات شوی پښتو فلم' : 'د zamatv.site لپاره اضافه شوی مستقیم سټریم لینک',
      streamUrl: trimmedUrl,
      telegramUrl: isTelegram ? trimmedUrl : undefined,
      language: 'پښتو (Pashto)',
      epg: []
    };

    onAddStream(newChannel);
    setUrl('');
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">{t.customStream}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">{t.customStreamDesc}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t.channelTitle}</label>
            <input
              type="text"
              required
              placeholder="مثال: د سلطان جګړه پښتو فلم..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ویش/کټګوري</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="movies">🎬 پښتو ژباړل شوي فلمونه (Movies)</option>
              <option value="news">📰 خبرونه او سیاست (News)</option>
              <option value="entertainment">🎭 تفریحي او خپرونې (Entertainment)</option>
              <option value="sports">🏏 سپورټ او لوبې (Sports)</option>
              <option value="cultural">🕌 کلتوري او اسلامي (Cultural)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">{t.streamUrl} / تلګرام ویډیو لینک</label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 ltr:right-auto ltr:left-3" />
              <input
                type="url"
                required
                placeholder="https://t.me/PashtoMovies/101 یا MP4/m3u8"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3.5 ltr:pr-3.5 ltr:pl-9 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              تاسې کولای شئ مستقیم د تلګرام لینک (t.me/channel/id) یا ویډیو سټریم اچولی شئ.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
            >
              لغوه کول
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
            >
              <Tv className="w-4 h-4" />
              <span>{t.playCustom}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
