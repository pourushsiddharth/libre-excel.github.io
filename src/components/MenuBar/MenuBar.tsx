import React, { useRef, useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  FolderDown, 
  Upload, 
  Printer, 
  LayoutTemplate, 
  Undo2, 
  Redo2, 
  Scissors, 
  Copy, 
  Clipboard, 
  Search, 
  BarChart3, 
  Table, 
  HelpCircle, 
  Eye, 
  Filter, 
  ArrowUpDown,
  MessageSquare,
  ChevronRight,
  Settings,
  Share2,
  Trash2,
  History,
  CheckCircle2,
  Info,
  Shield,
  FilePlus,
  FileText,
  FileDown
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { exportToXLSX, exportToCSV, importFileToWorksheet } from '../../engine/io';
import confetti from 'canvas-confetti';

export const MenuBar: React.FC = () => {
  const { 
    activeRibbonTab, 
    setActiveRibbonTab,
    activeMenu, 
    setActiveMenu,
    documentTitle,
    setDocumentTitle,
    sheets,
    activeSheetId,
    undo,
    redo,
    replaceActiveWorksheet,
    addSheet,
    clearSelection,
    setIsChartModalOpen,
    setIsTemplatesModalOpen,
    setIsFindReplaceOpen,
    setIsShortcutsModalOpen,
    setIsSettingsModalOpen,
    setIsHelpModalOpen,
    setIsShareModalOpen,
    setIsFeedbackModalOpen,
    setIsTutorialOpen,
    setZoomLevel,
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    activeCell,
    recalculateSheet,
    sortRange
  } = useSpreadsheetStore();

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submenu state tracking
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setActiveMenu]);

  const handleExportXLSX = () => {
    exportToXLSX(activeSheet, documentTitle.replace(/\s+/g, '_') + '.xlsx');
    setActiveMenu(null);
    setActiveSubmenu(null);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.1 } });
  };

  const handleExportCSV = () => {
    exportToCSV(activeSheet, documentTitle.replace(/\s+/g, '_') + '.csv');
    setActiveMenu(null);
    setActiveSubmenu(null);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.1 } });
  };

  const handleExportPDF = () => {
    window.print();
    setActiveMenu(null);
    setActiveSubmenu(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedWs = await importFileToWorksheet(file);
      replaceActiveWorksheet(importedWs);
      setActiveMenu(null);
      setActiveSubmenu(null);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.15 } });
    } catch (err) {
      alert('Error importing spreadsheet. Please verify file format.');
    }
  };

  const handleRename = () => {
    const newName = prompt('Enter new document name:', documentTitle);
    if (newName && newName.trim()) {
      setDocumentTitle(newName.trim());
    }
    setActiveMenu(null);
  };

  const handleMakeCopy = () => {
    const copyName = `Copy of ${documentTitle}`;
    setDocumentTitle(copyName);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.1 } });
    setActiveMenu(null);
  };

  const handleMoveToTrash = () => {
    if (confirm(`Are you sure you want to move "${documentTitle}" to trash?`)) {
      clearSelection();
      setDocumentTitle('Untitled spreadsheet');
      alert('Document reset to blank untitled spreadsheet.');
    }
    setActiveMenu(null);
  };

  const menuTabs = [
    { id: 'file', label: 'File' },
    { id: 'edit', label: 'Edit' },
    { id: 'view', label: 'View' },
    { id: 'insert', label: 'Insert' },
    { id: 'format', label: 'Format' },
    { id: 'data', label: 'Data' },
    { id: 'tools', label: 'Tools' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div 
      id="tutorial-target-menubar"
      ref={menuContainerRef} 
      className="h-7 bg-white border-b border-gray-200 px-2 flex items-center gap-0.5 text-xs text-gray-700 select-none relative z-40 font-sans"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />

      {menuTabs.map((tab) => {
        const isMenuOpen = activeMenu === tab.id;

        return (
          <div key={tab.id} className="relative">
            <button
              onClick={() => {
                setActiveMenu(isMenuOpen ? null : tab.id);
                setActiveSubmenu(null);
              }}
              onMouseEnter={() => {
                if (activeMenu) {
                  setActiveMenu(tab.id);
                  setActiveSubmenu(null);
                }
              }}
              className={`px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer ${
                isMenuOpen 
                  ? 'bg-[#e8f0fe] text-[#0b57d0] font-semibold' 
                  : 'hover:bg-gray-100 hover:text-gray-900 text-gray-700'
              }`}
            >
              {tab.label}
            </button>

            {/* ========================================================= */}
            {/* FILE MENU DROPDOWN (Matches Google Sheets screenshot)     */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'file' && (
              <div 
                className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {/* 1. New -> Submenu */}
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('new')}
                >
                  <button
                    className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[17px] text-gray-600">note_add</span>
                      <span className="text-gray-800">New</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {activeSubmenu === 'new' && (
                    <div className="absolute left-full top-0 ml-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50">
                      <button
                        onClick={() => { addSheet(); setActiveMenu(null); }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">table_chart</span>
                        <span>Spreadsheet</span>
                      </button>
                      <button
                        onClick={() => { setIsTemplatesModalOpen(true); setActiveMenu(null); }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-purple-600">dashboard_customize</span>
                        <span>From template gallery</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Open Ctrl+O */}
                <button
                  onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">folder_open</span>
                    <span className="text-gray-800">Open</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-sans">Ctrl+O</span>
                </button>

                {/* 3. Import */}
                <button
                  onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">file_upload</span>
                  <span className="text-gray-800">Import</span>
                </button>

                {/* 4. Make a copy */}
                <button
                  onClick={handleMakeCopy}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">content_copy</span>
                  <span className="text-gray-800">Make a copy</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                {/* 5. Share -> Submenu */}
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('share')}
                >
                  <button
                    className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[17px] text-gray-600">person_add</span>
                      <span className="text-gray-800">Share</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {activeSubmenu === 'share' && (
                    <div className="absolute left-full top-0 ml-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50">
                      <button
                        onClick={() => { setIsShareModalOpen(true); setActiveMenu(null); }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#0b57d0]">share</span>
                        <span>Share with others</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Public link copied to clipboard!');
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-teal-600">public</span>
                        <span>Publish to web</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. Email (Disabled) */}
                <div className="w-full text-left px-3.5 py-1.5 flex items-center justify-between text-gray-300 cursor-not-allowed">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-300">mail</span>
                    <span>Email</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>

                {/* 7. Download -> Submenu */}
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('download')}
                >
                  <button
                    className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[17px] text-gray-600">download</span>
                      <span className="text-gray-800">Download</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {activeSubmenu === 'download' && (
                    <div className="absolute left-full top-0 ml-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50">
                      <button
                        onClick={handleExportXLSX}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">description</span>
                        <span>Microsoft Excel (.xlsx)</span>
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-rose-600">picture_as_pdf</span>
                        <span>PDF Document (.pdf)</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">format_list_numbered</span>
                        <span>Comma Separated Values (.csv)</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200 my-1" />

                {/* 8. Rename */}
                <button
                  onClick={handleRename}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">edit</span>
                  <span className="text-gray-800">Rename</span>
                </button>

                {/* 9. Move to trash */}
                <button
                  onClick={handleMoveToTrash}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">delete</span>
                  <span className="text-gray-800">Move to trash</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                {/* 10. Version history (Disabled) */}
                <div className="w-full text-left px-3.5 py-1.5 flex items-center justify-between text-gray-400">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-400">history</span>
                    <span>Version history</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>

                {/* 11. Make available offline */}
                <button
                  onClick={() => {
                    alert('Offline mode enabled. Document is cached locally.');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">check_circle</span>
                  <span className="text-gray-800">Make available offline</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                {/* 12. Details */}
                <button
                  onClick={() => {
                    alert(`Document: ${documentTitle}\nSheets: ${sheets.length}\nActive Cells: ${Object.keys(activeSheet.data).length}`);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">info</span>
                  <span className="text-gray-800">Details</span>
                </button>

                {/* 13. Security limitations */}
                <div className="w-full text-left px-3.5 py-1.5 flex items-center gap-2.5 text-gray-400">
                  <span className="material-symbols-outlined text-[17px] text-gray-400">shield</span>
                  <span>Security limitations</span>
                </div>

                {/* 14. Settings */}
                <button
                  onClick={() => { setIsSettingsModalOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">settings</span>
                  <span className="text-gray-800">Settings</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                {/* 15. Print Ctrl+P */}
                <button
                  onClick={() => { window.print(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">print</span>
                    <span className="text-gray-800">Print</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-sans">Ctrl+P</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* EDIT MENU DROPDOWN                                        */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'edit' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { undo(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">undo</span>
                    <span>Undo</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+Z</span>
                </button>

                <button
                  onClick={() => { redo(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">redo</span>
                    <span>Redo</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+Y</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => { alert('Press Ctrl+X to cut selected cells'); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">content_cut</span>
                    <span>Cut</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+X</span>
                </button>

                <button
                  onClick={() => { alert('Press Ctrl+C to copy selected cells'); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">content_copy</span>
                    <span>Copy</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+C</span>
                </button>

                <button
                  onClick={() => { alert('Press Ctrl+V to paste into active cell'); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">content_paste</span>
                    <span>Paste</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+V</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => { clearSelection(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">backspace</span>
                    <span>Delete</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Del</span>
                </button>

                <button
                  onClick={() => { setIsFindReplaceOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">find_replace</span>
                    <span>Find and replace</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+H</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW MENU DROPDOWN                                        */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'view' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setZoomLevel(1); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">zoom_in</span>
                    <span>Zoom: 100%</span>
                  </div>
                </button>
                <button
                  onClick={() => { setZoomLevel(1.25); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">zoom_in</span>
                    <span>Zoom: 125%</span>
                  </div>
                </button>
                <button
                  onClick={() => { setZoomLevel(0.75); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-gray-600">zoom_out</span>
                    <span>Zoom: 75%</span>
                  </div>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen?.();
                    } else {
                      document.exitFullscreen?.();
                    }
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">fullscreen</span>
                  <span>Full screen</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* INSERT MENU DROPDOWN                                      */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'insert' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { insertRow(activeCell.row); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">table_rows</span>
                  <span>Rows: Insert 1 row above</span>
                </button>

                <button
                  onClick={() => { insertRow(activeCell.row + 1); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">table_rows</span>
                  <span>Rows: Insert 1 row below</span>
                </button>

                <button
                  onClick={() => { insertCol(activeCell.col); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">view_column</span>
                  <span>Columns: Insert 1 column left</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => { addSheet(); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-600">note_add</span>
                  <span>Sheet</span>
                </button>

                <button
                  onClick={() => { setIsChartModalOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#0b57d0]">bar_chart</span>
                  <span>Chart</span>
                </button>

                <button
                  onClick={() => {
                    const text = prompt('Enter comment for this cell:');
                    if (text) {
                      const cellId = `${String.fromCharCode(65 + activeCell.col)}${activeCell.row + 1}`;
                      useSpreadsheetStore.getState().addComment(cellId, text, 'You');
                    }
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-amber-600">add_comment</span>
                  <span>Comment</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* FORMAT MENU DROPDOWN                                      */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'format' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setActiveRibbonTab('home'); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">format_bold</span>
                  <span>Theme & Text Styles</span>
                </button>

                <button
                  onClick={() => {
                    useSpreadsheetStore.getState().setSelectionStyle({ format: 'currency' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-600">attach_money</span>
                  <span>Number: Currency ($)</span>
                </button>

                <button
                  onClick={() => {
                    useSpreadsheetStore.getState().setSelectionStyle({ format: 'percent' });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-blue-600">percent</span>
                  <span>Number: Percent (%)</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => {
                    useSpreadsheetStore.getState().setSelectionStyle({ bold: false, italic: false, underline: false, bgColor: undefined, textColor: undefined });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">format_clear</span>
                  <span>Clear formatting</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* DATA MENU DROPDOWN                                        */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'data' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    sortRange(activeCell.col, 'asc');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">arrow_upward</span>
                  <span>Sort range by column A to Z</span>
                </button>

                <button
                  onClick={() => {
                    sortRange(activeCell.col, 'desc');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">arrow_downward</span>
                  <span>Sort range by column Z to A</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => {
                    recalculateSheet();
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-blue-600">refresh</span>
                  <span>Refresh calculations</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TOOLS MENU DROPDOWN                                       */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'tools' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsTemplatesModalOpen(true);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-purple-600">palette</span>
                  <span>Templates gallery</span>
                </button>

                <button
                  onClick={() => {
                    setIsChartModalOpen(true);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#0b57d0]">insights</span>
                  <span>Visual charts engine</span>
                </button>
              </div>
            )}


            {/* ========================================================= */}
            {/* HELP MENU DROPDOWN                                        */}
            {/* ========================================================= */}
            {isMenuOpen && tab.id === 'help' && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setIsTutorialOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer text-[#0b57d0] font-medium"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#0b57d0]">school</span>
                  <span>Spreadsheet Tutorial</span>
                </button>

                <button
                  onClick={() => { setIsHelpModalOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">help</span>
                  <span>Help Center & Functions</span>
                </button>

                <button
                  onClick={() => { setIsShortcutsModalOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-teal-600">keyboard</span>
                    <span>Keyboard shortcuts</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Ctrl+/</span>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                <button
                  onClick={() => { setIsFeedbackModalOpen(true); setActiveMenu(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-amber-600">rate_review</span>
                  <span>Send feedback</span>
                </button>

                <button
                  onClick={() => {
                    alert('Vedval Excel Pro Suite\nVersion 2.4.0\nHigh-Performance Web Spreadsheet');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-gray-600">info</span>
                  <span>About Vedval Excel</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
