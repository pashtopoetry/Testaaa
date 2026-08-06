import React, { useState } from 'react';
import { Smartphone, X, Volume2, VolumeX, ChevronUp, ChevronDown, Power, Zap } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface RemoteControlProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onSelectChannelByNumber: (num: number) => void;
  language: Language;
}

export const RemoteControl: React.FC<RemoteControlProps> = ({
  isOpen,
  onClose,
  channels,
  onSelectChannelByNumber,
  language,
}) => {
  const t = translations[language];
  const [inputNum, setInputNum] = useState('');

  if (!isOpen) return null;

  const handleKeyClick = (key: string) => {
    if (inputNum.length < 2) {
      const updated = inputNum + key;
      setInputNum(updated);
      const parsed = parseInt(updated, 10);
      if (parsed > 0) {
        onSelectChannelByNumber(parsed);
      }
    }
  };

  const handleClear = () => {
    setInputNum('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Remote Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">{t.remoteControl}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Remote Digital Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center mb-5 shadow-inner">
          <p className="text-[11px] text-slate-500 font-mono uppercase mb-1">{t.channelNumber}</p>
          <div className="text-3xl font-black font-mono tracking-widest text-amber-400 min-h-[40px] flex items-center justify-center">
            {inputNum ? `# ${inputNum}` : 'CH --'}
          </div>
        </div>

        {/* Number Keypad Grid 1-9 */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyClick(num)}
              className="h-12 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 font-bold text-lg border border-slate-700 active:scale-95 transition flex items-center justify-center shadow"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs border border-slate-700 transition flex items-center justify-center"
          >
            پاکول
          </button>

          <button
            onClick={() => handleKeyClick('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 font-bold text-lg border border-slate-700 active:scale-95 transition flex items-center justify-center shadow"
          >
            0
          </button>

          <button
            onClick={onClose}
            className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-500 transition flex items-center justify-center shadow-lg"
          >
            تایید (OK)
          </button>
        </div>

        {/* Quick Channels List */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 font-semibold mb-2">مشهور شمیرې:</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {channels.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setInputNum(c.number.toString());
                  onSelectChannelByNumber(c.number);
                  onClose();
                }}
                className="text-right ltr:text-left px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-rose-400 transition truncate flex items-center justify-between"
              >
                <span className="truncate">{c.name}</span>
                <span className="font-mono font-bold text-amber-400 text-[10px]">#{c.number}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
