import React, { useState } from 'react';
import { X, Keyboard, Search, Command } from 'lucide-react';
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
  { keys: ['Ctrl', 'C'], description: 'Copy selected cell content and styling', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'X'], description: 'Cut selected cell content', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'V'], description: 'Paste copied content & formats', category: 'Editing & Clipboard' },
  { keys: ['Delete'], description: 'Clear cell contents', category: 'Editing & Clipboard' },
  { keys: ['Backspace'], description: 'Clear cell contents', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'F'], description: 'Open Find & Replace dialog', category: 'Editing & Clipboard' },
  { keys: ['Ctrl', 'H'], description: 'Open Find & Replace dialog', category: 'Editing & Clipboard' },

  // Formatting
  { keys: ['Ctrl', 'B'], description: 'Toggle Bold text', category: 'Formatting' },
  { keys: ['Ctrl', 'I'], description: 'Toggle Italic text', category: 'Formatting' },
  { keys: ['Ctrl', 'U'], description: 'Toggle Underline text', category: 'Formatting' },

  // Navigation
  { keys: ['Arrow Keys'], description: 'Move one cell Up, Down, Left, or Right', category: 'Navigation' },
  { keys: ['Enter'], description: 'Confirm edit & move down one cell', category: 'Navigation' },
  { keys: ['Tab'], description: 'Confirm edit & move right one cell', category: 'Navigation' },
  { keys: ['Escape'], description: 'Cancel current cell edit', category: 'Navigation' },
  { keys: ['Ctrl', 'Home'], description: 'Jump directly to cell A1', category: 'Navigation' },
  { keys: ['Ctrl', 'End'], description: 'Jump directly to the last active cell', category: 'Navigation' },
  { keys: ['Alt', 'Q'], description: 'Search tools, commands, and actions', category: 'Navigation' },

  // Selection
  { keys: ['Ctrl', 'A'], description: 'Select entire sheet / all cells', category: 'Selection' },
  { keys: ['Shift', 'Space'], description: 'Select entire row', category: 'Selection' },
  { keys: ['Ctrl', 'Space'], description: 'Select entire column', category: 'Selection' },
  { keys: ['Shift', 'Arrows'], description: 'Extend cell selection range', category: 'Selection' },

  // Formulas & View
  { keys: ['='], description: 'Start writing a formula in active cell', category: 'Formulas & View' },
  { keys: ['Ctrl', '/'], description: 'Open this Keyboard Shortcuts cheatsheet', category: 'Formulas & View' },
  { keys: ['?'], description: 'Open this Keyboard Shortcuts cheatsheet', category: 'Formulas & View' },
];

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen } = useSpreadsheetStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isShortcutsModalOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden text-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 border border-slate-200/60 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
              <Keyboard className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800 tracking-wide">Keyboard Shortcuts</h2>
              <p className="text-[12px] text-slate-400 font-normal tracking-wide mt-0.5">Master VExcel Pro (Vedval Excel) with standard Excel 365 hotkeys</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search shortcuts or keys..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-[#0b57d0] focus:bg-white transition"
              autoFocus
            />
          </div>

          {/* Category Badges */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto custom-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap border select-none ${
                  selectedCategory === cat
                    ? 'bg-[#0b57d0] border-[#0b57d0] text-white font-medium shadow-xs'
                    : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 divide-y divide-slate-100 bg-slate-50/40">
          {filteredShortcuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {filteredShortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 hover:border-[#0b57d0] transition-colors shadow-2xs"
                >
                  <div className="flex-1 pr-3 min-w-0">
                    <span className="text-[12px] text-slate-800 font-medium tracking-wide block truncate">{item.description}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 block">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, i) => (
                      <kbd
                        key={i}
                        className="px-2 py-1 text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md tracking-wider shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs tracking-wide">
              No shortcuts found matching "{filterQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 tracking-wide text-[11px] text-slate-500">
            <Command className="w-3.5 h-3.5 text-slate-400" />
            <span>Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-[10px] text-slate-700">Ctrl + /</kbd> or <kbd className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-[10px] text-slate-700">?</kbd> anytime</span>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-medium text-xs tracking-wide shadow-xs transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
