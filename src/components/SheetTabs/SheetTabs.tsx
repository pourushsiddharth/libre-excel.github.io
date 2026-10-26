import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Minus, 
  Maximize2,
  Grid,
  FileText
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { coordsToCellId } from '../../engine/helpers';

export const SheetTabs: React.FC = () => {
  const {
    sheets,
    activeSheetId,
    setActiveSheetId,
    addSheet,
    renameSheet,
    deleteSheet,
    selection,
    zoomLevel,
    setZoomLevel,
    permissionMode
  } = useSpreadsheetStore();

  const isReadOnly = permissionMode === 'view';

  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isSheetListOpen, setIsSheetListOpen] = useState(false);

  const currentSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

  // Calculate live statistics for status bar (Sum, Average, Count, Min, Max)
  const minRow = Math.min(selection.start.row, selection.end.row);
  const maxRow = Math.max(selection.start.row, selection.end.row);
  const minCol = Math.min(selection.start.col, selection.end.col);
  const maxCol = Math.max(selection.start.col, selection.end.col);

  let numSum = 0;
  let numCount = 0;
  let totalCells = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      totalCells++;
      const id = coordsToCellId(c, r);
      const val = currentSheet.data[id]?.value;
      if (val !== undefined && val !== null && val !== '') {
        const n = Number(val);
        if (!isNaN(n)) {
          numSum += n;
          numCount++;
          if (n < minVal) minVal = n;
          if (n > maxVal) maxVal = n;
        }
      }
    }
  }

  const numAverage = numCount > 0 ? (numSum / numCount).toFixed(2) : '0';

  const handleStartRename = (id: string, currentName: string) => {
    setEditingSheetId(id);
    setTempName(currentName);
  };

  const handleFinishRename = (id: string) => {
    if (tempName.trim()) {
      renameSheet(id, tempName.trim());
    }
    setEditingSheetId(null);
  };

  const currentSheetIndex = sheets.findIndex(s => s.id === activeSheetId);
  const goToPrevSheet = () => {
    if (currentSheetIndex > 0) setActiveSheetId(sheets[currentSheetIndex - 1].id);
  };
  const goToNextSheet = () => {
    if (currentSheetIndex < sheets.length - 1) setActiveSheetId(sheets[currentSheetIndex + 1].id);
  };

  return (
    <div 
      id="tutorial-target-sheettabs"
      className="h-7 bg-[#f3f4f6] border-t border-gray-300 flex items-center justify-between px-2 text-xs select-none relative z-20 font-sans"
    >
      {/* Sheets Navigation Cluster */}
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {/* Navigation arrows & All sheets list button */}
        <button
          onClick={goToPrevSheet}
          disabled={currentSheetIndex <= 0}
          title="Previous sheet"
          className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-700 transition flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[17px]">chevron_left</span>
        </button>
        <button
          onClick={goToNextSheet}
          disabled={currentSheetIndex >= sheets.length - 1}
          title="Next sheet"
          className="p-1 hover:bg-gray-200 disabled:opacity-30 rounded text-gray-700 transition flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[17px]">chevron_right</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSheetListOpen(!isSheetListOpen)}
            title="All sheets"
            className="p-1 hover:bg-gray-200 rounded text-gray-700 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[17px]">menu</span>
          </button>
          {isSheetListOpen && (
            <div className="absolute left-0 bottom-8 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Worksheets</div>
              {sheets.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setActiveSheetId(s.id); setIsSheetListOpen(false); }}
                  className={`px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                    s.id === activeSheetId ? 'font-bold text-[#0b57d0] bg-blue-50/70' : 'text-gray-700'
                  }`}
                >
                  <span>{s.name}</span>
                  {s.id === activeSheetId && <span className="material-symbols-outlined text-[15px] text-[#0b57d0]">check</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Sheet Plus Button */}
        {!isReadOnly && (
          <button
            onClick={() => addSheet()}
            title="Add sheet (+)"
            className="p-1 hover:bg-gray-200 rounded text-gray-700 transition mr-1.5 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-gray-700 hover:text-[#0b57d0]">add</span>
          </button>
        )}

        {/* Sheet Tabs List */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xl no-scrollbar">
          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            return (
              <div
                key={sheet.id}
                onClick={() => setActiveSheetId(sheet.id)}
                onDoubleClick={() => {
                  if (isReadOnly) return;
                  setEditingSheetId(sheet.id);
                  setTempName(sheet.name);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1 border-r border-gray-300 cursor-pointer font-medium transition text-xs relative ${
                  isActive 
                    ? 'bg-white text-[#0b57d0] border-b-2 border-b-[#0b57d0] font-semibold shadow-xs' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
                style={sheet.tabColor ? { borderBottom: `3px solid ${sheet.tabColor}` } : {}}
              >
                {editingSheetId === sheet.id ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleFinishRename(sheet.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(sheet.id)}
                    autoFocus
                    className="w-20 px-1 py-0.2 font-semibold bg-white border border-[#0b57d0] rounded outline-none text-xs"
                  />
                ) : (
                  <span>{sheet.name}</span>
                )}

                {sheets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSheet(sheet.id);
                    }}
                    title="Delete Sheet"
                    className="p-0.5 hover:bg-gray-300 rounded text-gray-400 hover:text-red-600 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Section: Aggregated Stats & Zoom Controls */}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        {/* Dynamic Status Bar Metrics */}
        {totalCells > 1 && (
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-gray-600 border-r border-gray-300 pr-3 font-sans">
            {numCount > 0 && (
              <>
                <span>Average: <strong className="text-gray-900 font-mono">{(numSum / numCount).toFixed(2)}</strong></span>
                <span>Count: <strong className="text-gray-900 font-mono">{totalCells}</strong></span>
                <span>Numerical Count: <strong className="text-gray-900 font-mono">{numCount}</strong></span>
                <span>Min: <strong className="text-gray-900 font-mono">{minVal}</strong></span>
                <span>Max: <strong className="text-gray-900 font-mono">{maxVal}</strong></span>
                <span>Sum: <strong className="text-gray-900 font-mono">{numSum.toLocaleString()}</strong></span>
              </>
            )}
            {numCount === 0 && (
              <span>Count: <strong className="text-gray-900 font-mono">{totalCells}</strong></span>
            )}
          </div>
        )}

        {/* View Layout Controls */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 hidden sm:flex">
          <button title="Normal Grid View" className="p-1 hover:bg-gray-200 rounded text-gray-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px] text-[#0b57d0]">grid_on</span>
          </button>
          <button title="Page Break Preview" className="p-1 hover:bg-gray-200 rounded text-gray-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">description</span>
          </button>
        </div>

        {/* Interactive Zoom Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(zoomLevel - 10)}
            title="Zoom Out"
            className="p-0.5 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[15px]">remove</span>
          </button>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#0b57d0]"
          />
          <button
            onClick={() => setZoomLevel(zoomLevel + 10)}
            title="Zoom In"
            className="p-0.5 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
          </button>
          <span 
            onClick={() => setZoomLevel(100)}
            className="w-9 text-right font-mono font-medium text-[10px] text-gray-700 cursor-pointer hover:text-[#0b57d0]"
            title="Click to reset zoom to 100%"
          >
            {zoomLevel}%
          </span>
        </div>

        {/* Netlify Deployment Badge */}
        <div className="border-l border-gray-300 pl-2.5 flex items-center">
          <a 
            href="https://www.netlify.com" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Deploys by Netlify"
            className="opacity-75 hover:opacity-100 transition-opacity flex items-center shrink-0"
          >
            <img 
              src="https://www.netlify.com/assets/badges/netlify-badge-color-bg.svg" 
              alt="Deploys by Netlify" 
              className="h-4 w-auto block"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

