import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Undo2, 
  Redo2, 
  BarChart3, 
  FolderDown, 
  LayoutTemplate, 
  Palette,
  Check
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { exportToXLSX, exportToCSV, importFileToWorksheet } from '../../engine/io';
import confetti from 'canvas-confetti';

export const Header: React.FC = () => {
  const { 
    documentTitle, 
    setDocumentTitle, 
    undo, 
    redo, 
    history, 
    future,
    sheets,
    activeSheetId,
    theme,
    setTheme,
    setIsChartModalOpen,
    setIsTemplatesModalOpen,
    replaceActiveWorksheet
  } = useSpreadsheetStore();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

  const handleExportXLSX = () => {
    exportToXLSX(activeSheet, documentTitle.replace(/\s+/g, '_') + '.xlsx');
    setIsExportMenuOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.1 } });
  };

  const handleExportCSV = () => {
    exportToCSV(activeSheet, documentTitle.replace(/\s+/g, '_') + '.csv');
    setIsExportMenuOpen(false);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.1 } });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedWs = await importFileToWorksheet(file);
      replaceActiveWorksheet(importedWs);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.15 } });
    } catch (err) {
      alert('Error importing spreadsheet. Please verify file format.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-xs select-none relative z-30">
      <div className="flex items-center gap-3">
        {/* Brand Logo & Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b57d0] to-[#1a73e8] flex items-center justify-center text-white shadow-md shadow-blue-500/20 transform hover:scale-105 transition duration-200">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#0b57d0] to-[#1a73e8] bg-clip-text text-transparent">
                VExcel
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-[#0b57d0] border border-blue-200">
                VEDVAL EXCEL
              </span>
            </div>
            <input 
              type="text" 
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="text-xs text-gray-500 hover:text-gray-900 focus:text-gray-900 border border-transparent hover:border-gray-300 focus:border-[#0b57d0] rounded px-1.5 py-0.5 outline-none font-medium transition duration-150 w-64 truncate"
              placeholder="Untitled spreadsheet"
            />
          </div>
        </div>

        {/* Undo / Redo buttons */}
        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
        <div className="flex items-center gap-1 hidden sm:flex">
          <button 
            onClick={undo}
            disabled={history.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action CTA & Quick Features */}
      <div className="flex items-center gap-2">
        {/* Templates Button */}
        <button
          onClick={() => setIsTemplatesModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-xs hover:border-gray-300 transition"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
          <span>Templates</span>
        </button>

        {/* Charts Button */}
        <button
          onClick={() => setIsChartModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-xs hover:border-gray-300 transition"
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          <span>Visuals</span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />

        {/* Import file */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx, .xls, .csv" 
          className="hidden" 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Excel or CSV file"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
        >
          <Upload className="w-3.5 h-3.5 text-gray-600" />
          <span className="hidden md:inline">Import</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0b57d0] hover:bg-[#0842a0] rounded-lg shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleExportXLSX}
                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2.5 transition"
              >
                <FolderDown className="w-4 h-4 text-[#0b57d0]" />
                <div>
                  <div className="font-semibold">Microsoft Excel (.xlsx)</div>
                  <div className="text-[10px] text-gray-400">Open format compatible</div>
                </div>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold">Comma-Separated (.csv)</div>
                  <div className="text-[10px] text-gray-400">Universal plain data</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            title="Switch Workspace Theme"
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
          >
            <Palette className="w-4 h-4 text-gray-600" />
          </button>
          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
              {(['classic', 'dark', 'glass', 'emerald'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTheme(t); setIsThemeMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs capitalize text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>{t}</span>
                  {theme === t && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
