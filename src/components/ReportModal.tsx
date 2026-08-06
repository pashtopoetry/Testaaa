import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  language: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  channel,
  language,
}) => {
  const t = translations[language];
  const [issueType, setIssueType] = useState('buffering');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReport = {
      id: Date.now().toString(),
      channelName: channel.name,
      issueType,
      note,
      timestamp: new Date().toISOString()
    };
    
    const existingReports = JSON.parse(localStorage.getItem('zama_reports') || '[]');
    localStorage.setItem('zama_reports', JSON.stringify([newReport, ...existingReports]));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-100">{t.reportTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <p className="font-bold text-base text-emerald-400">ستاسو راپور په بریالیتوب ثبت شو!</p>
            <p className="text-xs text-slate-400">د zamatv.site تیم به ژر تر ژره سټریم ترمیم کړي.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">د کانال نوم</label>
              <input
                type="text"
                disabled
                value={channel.name}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-rose-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">د ستونزې ډول</label>
              <div className="space-y-1.5">
                {[
                  { id: 'buffering', label: t.issueBuffering },
                  { id: 'no_audio', label: t.issueNoAudio },
                  { id: 'broken_link', label: t.issueBrokenLink },
                  { id: 'wrong_epg', label: t.issueWrongEpg },
                  { id: 'other', label: t.issueOther },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="issueType"
                      value={item.id}
                      checked={issueType === item.id}
                      onChange={() => setIssueType(item.id)}
                      className="accent-rose-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t.reportNote}</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="اضافي لارښوونه که لرئ..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                {t.sendReport}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
