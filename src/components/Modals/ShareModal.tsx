import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Globe, 
  Link2
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { coordsToCellId, getDocumentCapabilities } from '../../engine/helpers';
import confetti from 'canvas-confetti';

export const ShareModal: React.FC = () => {
  const { 
    isShareModalOpen, 
    setIsShareModalOpen, 
    documentTitle,
    docId,
    sheets,
    activeSheetId,
    activeCell
  } = useSpreadsheetStore();

  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<'edit' | 'view'>('view');
  const [emailInput, setEmailInput] = useState('');
  const [linkToCell, setLinkToCell] = useState(true);

  // Active sheet & cell info
  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];
  const sheetName = activeSheet ? activeSheet.name : 'Sheet1';
  const cellId = coordsToCellId(activeCell.col, activeCell.row);

  // Sync state to storage
  useEffect(() => {
    if (isShareModalOpen && typeof window !== 'undefined') {
      const { editSecret, viewSecret } = getDocumentCapabilities(docId);
      const ownerId = localStorage.getItem('libre_owner_token') || 'owner_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('libre_owner_token', ownerId);
      localStorage.setItem(
        'libre_doc_' + docId,
        JSON.stringify({ documentTitle, sheets, activeSheetId, ownerId, editSecret, viewSecret })
      );
    }
  }, [isShareModalOpen, docId, documentTitle, sheets, activeSheetId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isShareModalOpen) {
        setIsShareModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShareModalOpen, setIsShareModalOpen]);

  if (!isShareModalOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const searchParams = new URLSearchParams();
  searchParams.set('doc', docId);
  searchParams.set('sheet', sheetName);
  if (linkToCell) {
    searchParams.set('cell', cellId);
  }
  searchParams.set('mode', permission);
  const { editSecret, viewSecret } = getDocumentCapabilities(docId);
  const token = permission === 'edit' ? editSecret : viewSecret;
  searchParams.set('token', token);

  const exactSheetUrl = `${origin}${pathname}?${searchParams.toString()}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(exactSheetUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = exactSheetUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 }
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      prompt('Copy shareable link:', exactSheetUrl);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
      onClick={() => setIsShareModalOpen(false)}
    >
      <div 
        className="bg-white rounded-[24px] shadow-[0_12px_40px_-4px_rgba(0,0,0,0.16)] w-full max-w-[500px] overflow-hidden border border-slate-200/80 text-slate-800 animate-in zoom-in-95 duration-150 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Google Drive/Docs Clean Title */}
        <div className="flex items-center justify-between px-7 pt-6 pb-2">
          <h2 className="text-[20px] font-normal text-slate-900 tracking-tight leading-snug">
            Share "{documentTitle || 'Untitled spreadsheet'}"
          </h2>
          <button 
            onClick={() => setIsShareModalOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-3 space-y-5">
          {/* People & Groups input - Google Outlined Textfield */}
          <div>
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Add people, groups, or emails"
              className="w-full px-4 py-3 bg-white border border-slate-300 hover:border-slate-500 focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] rounded-xl text-sm text-slate-800 placeholder:text-slate-500 outline-none transition"
            />
          </div>

          {/* People with access list */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              People with access
            </h4>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {/* Google Avatar circle in blue */}
                <div className="w-9 h-9 rounded-full bg-[#0b57d0] text-white font-medium text-xs flex items-center justify-center shadow-2xs tracking-wide">
                  You
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 leading-tight">You</div>
                  <div className="text-xs text-slate-500">owner@vexcel.local</div>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-normal">Owner</span>
            </div>
          </div>

          {/* General access section */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              General access
            </h4>
            <div className="flex items-start justify-between py-1 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 leading-tight">
                    Anyone with the link
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Anyone on the internet with this link can {permission === 'edit' ? 'edit' : 'view'}
                  </div>
                </div>
              </div>

              {/* Minimal Google Select Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={permission}
                  onChange={(e) => {
                    const val = e.target.value as 'edit' | 'view';
                    setPermission(val);
                  }}
                  className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 outline-none cursor-pointer transition focus:border-[#0b57d0]"
                >
                  <option value="view">Viewer</option>
                  <option value="edit">Editor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Sheet & Cell option */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">Target:</span>
              <span className="font-semibold text-slate-800">{sheetName}</span>
              {linkToCell && <span className="text-[#0b57d0] font-semibold">• cell {cellId}</span>}
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900 transition">
              <input
                type="checkbox"
                checked={linkToCell}
                onChange={(e) => setLinkToCell(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer"
              />
              <span>Focus cell {cellId}</span>
            </label>
          </div>
        </div>

        {/* Footer: Google Material Pill Buttons */}
        <div className="flex items-center justify-between px-7 py-4.5 bg-slate-50/70 border-t border-slate-100">
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition cursor-pointer active:scale-95 ${
              copied
                ? 'border-blue-300 bg-blue-50 text-[#0b57d0]'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-[#0b57d0] hover:text-[#0842a0]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#0b57d0]" />
                <span className="font-semibold">Link copied</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-[#0b57d0]" />
                <span className="font-semibold">Copy link</span>
              </>
            )}
          </button>

          {/* Google Blue Done Button */}
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="px-6 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
