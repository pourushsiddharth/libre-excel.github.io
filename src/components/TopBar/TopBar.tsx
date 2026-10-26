import React, { useState, useRef, useEffect } from 'react';
import { 
  Grid as AppGrid, 
  Cloud, 
  Search, 
  MessageSquare, 
  Settings, 
  Check, 
  X, 
  ChevronDown,
  History,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import confetti from 'canvas-confetti';

export const TopBar: React.FC = () => {
  const { 
    documentTitle, 
    setDocumentTitle, 
    searchQuery, 
    setSearchQuery,
    isShareModalOpen,
    setIsShareModalOpen,
    setIsChartModalOpen,
    setIsTemplatesModalOpen,
    setIsShortcutsModalOpen,
    permissionMode,
    setPermissionMode,
    isLockedView,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    setIsTutorialOpen
  } = useSpreadsheetStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isEditingMenuOpen, setIsEditingMenuOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (topBarRef.current && !topBarRef.current.contains(e.target as Node)) {
        setIsEditingMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      setDocumentTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const quickTools = [
    { label: 'Help Center & Process Guide', icon: '❓', action: () => useSpreadsheetStore.getState().setIsHelpModalOpen(true) },
    { label: 'Send Feedback & Suggestions', icon: '💬', action: () => useSpreadsheetStore.getState().setIsFeedbackModalOpen(true) },
    { label: 'Share Document & Collaborate', icon: '🔗', action: () => setIsShareModalOpen(true) },
    { label: 'Keyboard Shortcuts Cheatsheet (Ctrl+/)', icon: '⌨️', action: () => setIsShortcutsModalOpen(true) },
    { label: 'Insert Dynamic Chart', icon: '📊', action: () => setIsChartModalOpen(true) },
    { label: 'Load Budget Template', icon: '📑', action: () => setIsTemplatesModalOpen(true) },
    { label: 'AutoSum active column', icon: 'Σ', action: () => alert('Quick AutoSum triggered') },
  ].filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={topBarRef} className="h-10 bg-white border-b border-gray-200 px-3 flex items-center justify-between select-none relative z-50 text-xs text-gray-700">
      {/* Left Section: Sheets / Excel Blue Icon, Title & Cloud Save */}
      <div className="flex items-center gap-2">

        {/* Authentic Vedval Excel Document Icon (Page with folded corner and spreadsheet grid) */}
        <div 
          id="tutorial-target-logo"
          className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0"
          title="Vedval Excel Home"
        >
          <svg className="w-7 h-7 drop-shadow-xs" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sheet Page Body */}
            <path 
              d="M10 5C8.34315 5 7 6.34315 7 8V32C7 33.6569 8.34315 35 10 35H30C31.6569 35 33 33.6569 33 32V14L24 5H10Z" 
              fill="#0B57D0" 
            />
            {/* Folded Corner Ear */}
            <path 
              d="M24 5V12C24 13.1046 24.8954 14 26 14H33L24 5Z" 
              fill="#7CBBF3" 
            />
            {/* Embedded Spreadsheet Grid Card */}
            <rect x="11.5" y="16.5" width="17" height="13" rx="1.5" fill="#FFFFFF" />
            {/* Grid Table Lines */}
            {/* Horizontal dividers */}
            <line x1="11.5" y1="20.5" x2="28.5" y2="20.5" stroke="#0B57D0" strokeWidth="1.2" />
            <line x1="11.5" y1="24.5" x2="28.5" y2="24.5" stroke="#0B57D0" strokeWidth="1" strokeOpacity="0.4" />
            {/* Vertical column dividers */}
            <line x1="17" y1="16.5" x2="17" y2="29.5" stroke="#0B57D0" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="22.5" y1="16.5" x2="22.5" y2="29.5" stroke="#0B57D0" strokeWidth="1" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Document Title & Status */}
        <div id="tutorial-target-title" className="flex items-center gap-2 ml-0.5">
          {isEditingTitle && !isLockedView ? (
            <input 
              type="text" 
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="px-2 py-0.5 font-semibold text-gray-900 bg-white border-2 border-[#0b57d0] rounded-md outline-none w-56 text-[15px] shadow-sm"
            />
          ) : (
            <span 
              onClick={() => { 
                if (isLockedView) return;
                setIsEditingTitle(true); 
                setTempTitle(documentTitle); 
              }}
              className={`font-semibold text-gray-900 px-2 py-1 rounded-md truncate max-w-[260px] text-[15px] tracking-tight leading-tight ${
                isLockedView ? 'cursor-default' : 'hover:bg-slate-100 hover:ring-1 hover:ring-slate-300 cursor-pointer transition'
              }`}
              title={isLockedView ? "View-only document" : "Click to rename document"}
            >
              {documentTitle}
            </span>
          )}

          {/* Cloud Saved Icon */}
          <div className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition" title="All changes saved to cloud">
            <span className="material-symbols-outlined text-[17px] text-[#0b57d0]">cloud_done</span>
            <span className="text-[11px] text-gray-500 font-medium hidden md:inline">Saved</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Center Search Pill */}
      <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
        <div className={`flex items-center bg-[#f0f4f9] border rounded-full px-3 py-1 shadow-2xs transition ${
          isSearchFocused ? 'border-[#0b57d0] ring-2 ring-blue-100 bg-white' : 'border-transparent hover:bg-[#e9eef6]'
        }`}>
          <span className="material-symbols-outlined text-[17px] text-gray-500 mr-1.5 shrink-0">search</span>
          <input 
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search for tools, help, and more (Alt+Q)"
            className="w-full bg-transparent outline-none text-xs text-gray-800 placeholder-gray-500 font-normal"
          />
          <kbd className="hidden lg:inline text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 shrink-0 font-sans">
            Alt+Q
          </kbd>
        </div>

        {/* Quick Search Popover */}
        {isSearchFocused && searchQuery && (
          <div className="absolute left-0 right-0 top-9 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions & Features</div>
            {quickTools.length > 0 ? (
              quickTools.map((t, i) => (
                <div 
                  key={i}
                  onMouseDown={() => { t.action(); setSearchQuery(''); }}
                  className="px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer flex items-center gap-2 text-xs transition"
                >
                  <span>{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500 italic">No match for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>

      {/* Right Section: Interactive Tutorial, Feedback, Comments, Editing, Share Button */}
      <div className="flex items-center gap-1.5">
        {/* Interactive Google Style Tutorial & Walkthrough Trigger */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#0b57d0] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 rounded-full transition font-semibold cursor-pointer shadow-2xs"
          title="Open interactive spreadsheet tutorial"
        >
          <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">school</span>
          <span>Tutorial</span>
        </button>

        {/* Feedback Trigger (Quiet / Non-highlighted) */}
        <div className="relative">
          <button 
            onClick={() => setIsFeedbackModalOpen(!isFeedbackModalOpen)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition font-normal cursor-pointer"
            title="Send feedback (stored locally)"
          >
            <span className="material-symbols-outlined text-[15px] text-gray-400">rate_review</span>
            <span className="text-[11px]">Feedback</span>
          </button>

          {isFeedbackModalOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Minimal Header */}
              <div className="flex items-center justify-between pb-3.5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-[14px] tracking-tight">Send Feedback</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Help improve your spreadsheet experience</p>
                </div>
                <button 
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Feedback Content */}
              <div className="space-y-4">
                {/* Minimalist Pill Filter / Type */}
                <div className="flex flex-wrap gap-1.5">
                  {['Feature Request', 'Bug Report', 'Interface', 'Other'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                        feedbackCategory === cat
                          ? 'bg-[#0b57d0] text-white shadow-2xs font-semibold'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Subtle Rating Stars */}
                <div className="flex items-center justify-between px-1 py-0.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFeedbackRating(s)}
                        className="p-1 hover:scale-115 transition transform cursor-pointer"
                      >
                        <span 
                          className={`material-symbols-outlined text-[20px] transition-colors ${
                            s <= feedbackRating ? 'text-[#f59e0b]' : 'text-gray-200'
                          }`}
                          style={{ fontVariationSettings: s <= feedbackRating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium pr-2">
                    {feedbackRating === 5 ? 'Excellent' : feedbackRating >= 4 ? 'Good' : feedbackRating >= 3 ? 'Average' : 'Needs work'}
                  </span>
                </div>

                {/* Premium Clean Textarea */}
                <div>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us what you love or what could be improved..."
                    className="w-full text-xs p-3 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#0b57d0] rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder-gray-400 text-gray-800 leading-relaxed font-normal"
                  />
                </div>

                {/* Minimalist Actions */}
                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 font-medium transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!feedbackComment.trim()) return;
                      try {
                        const existing = JSON.parse(localStorage.getItem('vexcel_user_feedbacks') || '[]');
                        existing.push({
                          rating: feedbackRating,
                          category: feedbackCategory,
                          comment: feedbackComment.trim(),
                          date: new Date().toISOString()
                        });
                        localStorage.setItem('vexcel_user_feedbacks', JSON.stringify(existing));
                      } catch {}
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
                      setFeedbackComment('');
                      setIsFeedbackModalOpen(false);
                    }}
                    disabled={!feedbackComment.trim()}
                    className={`px-4 py-1.5 rounded-full font-medium text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      feedbackComment.trim()
                        ? 'bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-sm hover:shadow'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Submit</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => alert('Cell comments: Right-click any cell to Add Comment!')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-slate-100 rounded-md transition"
        >
          <span className="material-symbols-outlined text-[17px] text-gray-500">chat_bubble</span>
          <span>Comments</span>
        </button>

        <div className="relative">
          {isLockedView ? (
            /* Locked View-only pill badge (Google Docs / Sheets style: recipient cannot switch to edit) */
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-100/90 text-amber-900 border border-amber-300/80 rounded-md font-semibold select-none shadow-2xs"
              title="View only: You do not have permission to edit this document."
            >
              <span className="material-symbols-outlined text-[15px] text-amber-800">lock</span>
              <span>Viewing</span>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsEditingMenuOpen(!isEditingMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition font-medium cursor-pointer ${
                  permissionMode === 'view' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold' 
                    : 'text-gray-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {permissionMode === 'view' ? 'visibility' : 'edit'}
                </span>
                <span>{permissionMode === 'view' ? 'Viewing' : 'Editing'}</span>
                <span className="material-symbols-outlined text-[15px] text-gray-400">arrow_drop_down</span>
              </button>
              {isEditingMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs">
                  <div 
                    onClick={() => { setPermissionMode('edit'); setIsEditingMenuOpen(false); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                      permissionMode === 'edit' ? 'font-semibold text-[#0b57d0] bg-blue-50/70' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">edit</span>
                      <div>
                        <div className="font-semibold">Editing</div>
                        <div className="text-[10px] text-gray-500 font-normal">Make direct changes</div>
                      </div>
                    </div>
                    {permissionMode === 'edit' && <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">check</span>}
                  </div>

                  <div 
                    onClick={() => { setPermissionMode('view'); setIsEditingMenuOpen(false); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                      permissionMode === 'view' ? 'font-semibold text-amber-800 bg-amber-50/50' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-amber-700">visibility</span>
                      <div>
                        <div className="font-semibold">Viewing</div>
                        <div className="text-[10px] text-gray-500 font-normal">Read-only protection</div>
                      </div>
                    </div>
                    {permissionMode === 'view' && <span className="material-symbols-outlined text-[16px] text-amber-600">check</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Share Pill Button (Google Sheets authentic light blue pill: #c2e7ff / #001d35) */}
        <button 
          id="tutorial-target-share"
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c2e7ff] hover:bg-[#b3ddfc] active:bg-[#a5d3f9] text-[#001d35] rounded-full font-semibold shadow-2xs transition transform active:scale-95 text-xs cursor-pointer"
          title="Share document (Collaborate in real-time)"
        >
          <span className="material-symbols-outlined text-[17px] text-[#001d35]">lock</span>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
