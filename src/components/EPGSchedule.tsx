import React from 'react';
import { Clock, Calendar, User, Radio, PlayCircle } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface EPGScheduleProps {
  channel: Channel;
  language: Language;
}

export const EPGSchedule: React.FC<EPGScheduleProps> = ({ channel, language }) => {
  const t = translations[language];

  if (!channel.epg || channel.epg.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-slate-400 text-xs">
        د دې کانال لپاره تر اوسه دقیق EPG جدول شتون نه لري.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">{t.programGuide}</h3>
            <p className="text-[11px] text-slate-400">{channel.name} د نن ورځې مهالوېش</p>
          </div>
        </div>

        <span className="text-[11px] font-mono bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full border border-slate-700">
          ۲۴ ساعته ژوندۍ EPG
        </span>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2.5">
        {channel.epg.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all ${
              item.isLive
                ? 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`text-xs sm:text-sm font-bold ${item.isLive ? 'text-rose-400' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  {item.isLive && (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      {t.currentShow}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                )}

                {item.host && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <User className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>وياړلی کوربه: {item.host}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.startTime} - {item.endTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
