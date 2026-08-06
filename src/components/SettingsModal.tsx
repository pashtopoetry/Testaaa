import React from 'react';
import { Settings, X, Globe, Moon, Sun, Sparkles, ShieldCheck } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../data/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  theme,
  setTheme,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {language === 'en' ? 'Settings & Preferences' : 'تنظیمات او ترتیبات'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Customize theme and language' : 'بڼه او ژبه تنظیم کړئ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Language Settings */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Language / ژبه / زبان' : 'د ژبې ټاکنه / انتخاب زبان'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setLanguage('ps')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition border ${
                  language === 'ps'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                پښتو (Pashto)
              </button>
              <button
                onClick={() => setLanguage('dr')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition border ${
                  language === 'dr'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                دري (Dari)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition border ${
                  language === 'en'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Mode (Dark / Light / Emerald / Amber) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'en' ? 'Theme Mode / رنګونه' : 'د رنګ بڼه (Dark / Light)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-rose-500 text-white ring-2 ring-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>تور رنګ (Dark Mode)</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition text-xs font-bold ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>سپین رنګ (Light Mode)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-lg shadow-rose-900/40"
          >
            {language === 'en' ? 'Done' : 'بندول / خوندي کول'}
          </button>
        </div>

      </div>
    </div>
  );
};
