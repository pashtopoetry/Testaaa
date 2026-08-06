import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { Channel, Language, ViewerComment } from '../types';
import { initialComments } from '../data/channels';
import { translations } from '../data/translations';

interface LiveChatProps {
  channel: Channel;
  language: Language;
}

export const LiveChat: React.FC<LiveChatProps> = ({ channel, language }) => {
  const t = translations[language];
  const [comments, setComments] = useState<ViewerComment[]>(initialComments);
  const [newText, setNewText] = useState('');
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newComment: ViewerComment = {
      id: 'c_' + Date.now(),
      channelId: channel.id,
      userName: userName.trim() || (language === 'dr' ? 'بیننده عزیز' : language === 'en' ? 'Viewer' : 'ګران لیدونکی'),
      location: userLocation.trim() || 'کابل، افغانستان',
      text: newText.trim(),
      timestamp: 'همدا اوس',
      likes: 1,
    };

    setComments([newComment, ...comments]);
    setNewText('');
  };

  const handleLikeComment = (id: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col h-[480px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">{t.liveComments}</h3>
            <p className="text-[11px] text-slate-400">د لیدونکو مستقیم او ژوندۍ نظریات</p>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          {comments.length} څرګندونې
        </span>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 no-scrollbar">
        {comments.map((comment) => (
          <div 
            key={comment.id}
            className="p-3 rounded-xl bg-slate-800/60 border border-slate-750/80 hover:border-slate-700 transition space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {comment.userName.charAt(0)}
                </div>
                <span className="font-bold text-xs text-slate-200">{comment.userName}</span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  {comment.location}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{comment.text}</p>

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{comment.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handlePostComment} className="mt-3 pt-3 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-rose-500"
          />
          <input
            type="text"
            placeholder={t.locationPlaceholder}
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.commentPlaceholder}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 bg-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!newText.trim()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.sendComment}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
