import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Command, 
  Sliders, 
  Sun, 
  Moon, 
  Sparkles, 
  Globe, 
  Check, 
  FileSpreadsheet,
  Layers,
  Palette
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Formatting' | 'Editing & Clipboard' | 'Selection' | 'Formulas & View';
}

const SHORTCUTS_DATA: ShortcutItem[] = [
  // Editing & Clipboard
  { keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'Y'], description: 'Redo last action', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'C'], description: 'Copy selected cell content and formatting', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'X'], description: 'Cut selected cell content', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'V'], description: 'Paste copied content & styles', category: 'Editing & Clipboard' },
  { keys: ['Delete'], description: 'Clear cell contents', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'F'], description: 'Open Find & Replace dialog', category: 'Editing & Clipboard' },

  // Formatting
  { keys: ['Ctrl', 'B'], description: 'Toggle Bold text', category: 'Formatting' },
  { keys: ['Ctrl', 'I'], description: 'Toggle Italic text', category: 'Formatting' },
  { keys: ['Ctrl', 'U'], description: 'Toggle Underline text', category: 'Formatting' },

  // Navigation
  { keys: ['Arrow Keys'], description: 'Navigate active cell Up, Down, Left, or Right', category: 'Navigation' },
  { keys: ['Enter'], description: 'Confirm edit and move down one cell', category: 'Navigation' },
  { keys: ['Tab'], description: 'Confirm edit and move right one cell', category: 'Navigation' },
  { keys: ['Escape'], description: 'Cancel current cell editing', category: 'Navigation' },
  { keys: ['Ctrl', 'Home'], description: 'Jump to cell A1', category: 'Navigation' },
  { keys: ['Alt', 'Q'], description: 'Search menus and tools', category: 'Navigation' },

  // Selection
  { keys: ['Ctrl', 'A'], description: 'Select all cells in the sheet', category: 'Selection' },
  { keys: ['Shift', 'Space'], description: 'Select entire row', category: 'Selection' },
  { keys: ['Ctrl', 'Space'], description: 'Select entire column', category: 'Selection' },
  { keys: ['Shift', 'Arrows'], description: 'Extend cell selection range', category: 'Selection' },

  // Formulas & View
  { keys: ['='], description: 'Start writing a formula in active cell', category: 'Formulas & View' },
  { keys: ['Ctrl', '/'], description: 'Open Keyboard Shortcuts', category: 'Formulas & View' },
];

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen,
    theme,
    setTheme
  } = useSpreadsheetStore();

  const [activeTab, setActiveTab] = useState<'shortcuts' | 'preferences'>('shortcuts');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsModalOpen, setIsSettingsModalOpen]);

  if (!isSettingsModalOpen) return null;

  const categories = ['All', 'Navigation', 'Formatting', 'Editing & Clipboard', 'Selection', 'Formulas & View'];

  const filteredShortcuts = SHORTCUTS_DATA.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.keys.some((k) => k.toLowerCase().includes(filterQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150 font-sans"
      onClick={() => setIsSettingsModalOpen(false)}
    >
      <div 
        className="bg-white rounded-[24px] shadow-[0_12px_40px_-4px_rgba(0,0,0,0.16)] w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200/90 text-slate-800 animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Google Workspace Style */}
        <div className="flex items-center justify-between px-7 pt-6 pb-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">tune</span>
            </div>
            <div>
              <h2 className="text-[18px] font-normal text-slate-900 tracking-tight leading-snug">
                Settings & Shortcuts
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Keyboard shortcuts and workspace preferences
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsModalOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-7 pt-2 flex items-center gap-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer select-none ${
              activeTab === 'shortcuts'
                ? 'border-[#0b57d0] text-[#0b57d0]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">keyboard</span>
            <span>Keyboard shortcuts</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer select-none ${
              activeTab === 'preferences'
                ? 'border-[#0b57d0] text-[#0b57d0]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">palette</span>
            <span>Theme & Display</span>
          </button>
        </div>

        {/* TAB 1: KEYBOARD SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search & Category Filter Pills */}
            <div className="px-7 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search shortcuts..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] rounded-full outline-none transition"
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer whitespace-nowrap select-none ${
                      selectedCategory === cat
                        ? 'bg-[#c2e7ff] text-[#001d35] font-semibold'
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortcuts Grid List */}
            <div className="flex-1 overflow-y-auto px-7 py-4 divide-y divide-slate-100 bg-slate-50/40 custom-scrollbar">
              {filteredShortcuts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2.5">
                  {filteredShortcuts.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-[#0b57d0] hover:shadow-2xs transition-colors"
                    >
                      <div className="flex-1 pr-3 min-w-0">
                        <span className="text-[12px] text-slate-800 font-medium block truncate">
                          {item.description}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 block">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-0.5 text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md tracking-wider shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No shortcuts found matching "{filterQuery}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PREFERENCES & THEME */}
        {activeTab === 'preferences' && (
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5 custom-scrollbar">
            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Workspace Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setTheme('classic')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    theme === 'classic' 
                      ? 'border-[#0b57d0] bg-blue-50/40 ring-1 ring-[#0b57d0]' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-2xs">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Light Mode</div>
                    <div className="text-[11px] text-slate-500">Google Sheets Clean Blue</div>
                  </div>
                </div>

                <div 
                  onClick={() => setTheme('dark')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                    theme === 'dark' 
                      ? 'border-[#0b57d0] bg-blue-50/40 ring-1 ring-[#0b57d0]' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-2xs">
                    <Moon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Dark Mode</div>
                    <div className="text-[11px] text-slate-500">High contrast dark canvas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Preferences */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="block text-xs font-medium text-slate-700">
                Display Options
              </label>
              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition">
                <div>
                  <div className="font-medium text-slate-800">Show cell gridlines</div>
                  <div className="text-[11px] text-slate-400">Display subtle grey grid borders across rows and columns</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer" />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition">
                <div>
                  <div className="font-medium text-slate-800">Formula bar helper tooltips</div>
                  <div className="text-[11px] text-slate-400">Show formula syntax and autocomplete hints while typing</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer" />
              </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Command className="w-3.5 h-3.5 text-slate-400" />
            <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-[10px] text-slate-700">Ctrl + /</kbd> anytime</span>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-6 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold text-xs tracking-wide shadow-xs transition active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
