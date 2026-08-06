import React, { useContext } from 'react';
import { Tv, Radio, Heart, Shield, Globe } from 'lucide-react';
import { Language, ThemeContext } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  language: Language;
  onSelectCategory: (cat: any) => void;
  totalChannels: number;
}

export const Footer: React.FC<FooterProps> = ({ language, onSelectCategory, totalChannels }) => {
  const t = translations[language];
  const { isLight } = useContext(ThemeContext);

  return (
    <footer className={`border-t transition-colors mt-12 py-10 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Tv className="w-5 h-5" />
              </div>
              <span className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.siteName}</span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
              {t.disclaimer}
            </p>
            <span className="inline-block bg-rose-500/10 text-rose-400 font-mono text-xs px-2.5 py-1 rounded-md border border-rose-500/20">
              {t.siteDomain}
            </span>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} uppercase tracking-wider mb-3`}>{t.allCategories}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory('news')} className="hover:text-rose-400 transition">
                  {t.catNews}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('entertainment')} className="hover:text-rose-400 transition">
                  {t.catEntertainment}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('sports')} className="hover:text-rose-400 transition">
                  {t.catSports}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cultural')} className="hover:text-rose-400 transition">
                  {t.catCultural}
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('radio')} className="hover:text-rose-400 transition">
                  {t.catRadio}
                </button>
              </li>
            </ul>
          </div>

          {/* Satellite Information */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">د سټلایټ فریکونسۍ (Satellite EPG)</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span>Yahsat 52.5°E</span>
                <span className="text-amber-400">12015 H 27500</span>
              </li>
              <li className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span>Eutelsat 53°E</span>
                <span className="text-amber-400">11470 V 27500</span>
              </li>
              <li className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span>Express 80°E</span>
                <span className="text-amber-400">10982 V 33000</span>
              </li>
            </ul>
          </div>

          {/* Provinces & Coverage */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">ولایتي پوښښ (Coverage)</h4>
            <div className="flex flex-wrap gap-1.5">
              {[t.kabul, t.kandahar, t.herat, t.balkh, t.nangarhar, t.paktia, t.helmand].map((prov, i) => (
                <span key={i} className="text-[11px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                  {prov}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>{t.footerRights}</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>د افغانستان مینه والو ته ډالۍ</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </div>
        </div>

      </div>
    </footer>
  );
};
