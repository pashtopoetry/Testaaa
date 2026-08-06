import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  language: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  channel,
  language,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://zamatv.site/?channel=${channel.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">{t.shareChannel}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real QR Code */}
        <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-slate-800">
            <QRCodeSVG value={shareUrl} size={144} />
        </div>

        <p className="text-center text-xs font-semibold text-slate-300 mb-4">{t.scanQr}</p>

        {/* Share Link Copy */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent flex-1 text-xs text-slate-300 font-mono focus:outline-none px-2"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              copied ? 'bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.linkCopied : t.copyLink}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
