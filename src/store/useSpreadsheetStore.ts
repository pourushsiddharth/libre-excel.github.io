import { create } from 'zustand';
import { Worksheet, SheetData, CellCoords, SelectionRange, CellStyle, ThemeMode, ChartConfig, CellComment } from '../types/spreadsheet';
import { coordsToCellId, parseRange, cellIdToCoords, colIndexToLetter, verifyShareSignature } from '../engine/helpers';
import { evaluateFormula } from '../engine/parser';
import { TEMPLATES } from '../engine/templates';

interface HistorySnapshot {
  worksheet: Worksheet;
}

interface SpreadsheetState {
  // Document meta
  docId: string;
  setDocId: (docId: string) => void;
  documentTitle: string;
  theme: ThemeMode;
  permissionMode: 'edit' | 'view';
  isLockedView: boolean;
  setPermissionMode: (mode: 'edit' | 'view') => void;
  setTheme: (theme: ThemeMode) => void;
  setDocumentTitle: (title: string) => void;

  // Worksheets
  sheets: Worksheet[];
  activeSheetId: string;
  setActiveSheetId: (id: string) => void;
  addSheet: (name?: string) => void;
  renameSheet: (id: string, newName: string) => void;
  deleteSheet: (id: string) => void;
  setSheetTabColor: (id: string, color: string) => void;
  loadTemplate: (templateKey: string) => void;
  replaceActiveWorksheet: (ws: Worksheet) => void;

  // Active cell & selection
  activeCell: CellCoords;
  selection: SelectionRange;
  isSelecting: boolean;
  setActiveCell: (coords: CellCoords) => void;
  setSelection: (selection: SelectionRange) => void;
  setIsSelecting: (selecting: boolean) => void;
  selectAll: () => void;
  selectRow: (row: number) => void;
  selectColumn: (col: number) => void;

  // Col / Row sizing
  setColWidth: (col: number, width: number) => void;
  setRowHeight: (row: number, height: number) => void;
  insertRow: (targetRow: number) => void;
  deleteRow: (targetRow: number) => void;
  insertCol: (targetCol: number) => void;
  deleteCol: (targetCol: number) => void;

  // Cell editing & calculation
  setCellValue: (cellId: string, raw: string, skipSnapshot?: boolean) => void;
  batchSetCells: (updates: { [cellId: string]: { raw: string; style?: any } }) => void;
  setSelectionStyle: (style: Partial<CellStyle>) => void;
  adjustSelectionDecimals: (delta: number) => void;
  recalculateSheet: (sheetId?: string) => void;
  clearSelection: (mode?: 'all' | 'contents' | 'formats') => void;
  sortRange: (col: number, direction: 'asc' | 'desc') => void;

  // Comments
  addComment: (cellId: string, text: string, author?: string) => void;
  deleteComment: (cellId: string) => void;

  // Format Painter
  formatPainterStyle: CellStyle | null;
  setFormatPainterStyle: (style: CellStyle | null) => void;

  // Clipboard & undo/redo
  clipboardCell: { raw: string; style?: CellStyle } | null;
  setClipboardCell: (data: { raw: string; style?: CellStyle } | null) => void;
  history: HistorySnapshot[];
  future: HistorySnapshot[];
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;

  // Visuals, Modals & Shell
  activeRibbonTab: string;
  setActiveRibbonTab: (tab: string) => void;
  activeMenu: string | null;
  setActiveMenu: (m: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isFindReplaceOpen: boolean;
  setIsFindReplaceOpen: (open: boolean) => void;

  charts: ChartConfig[];
  addChart: (chart: ChartConfig) => void;
  removeChart: (id: string) => void;
  isChartModalOpen: boolean;
  setIsChartModalOpen: (open: boolean) => void;
  isTemplatesModalOpen: boolean;
  setIsTemplatesModalOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
}

const initialSheet: Worksheet = {
  id: 'sheet_default',
  name: 'Sheet1',
  rowCount: 100,
  colCount: 26,
  colWidths: { 0: 160, 1: 100, 2: 110, 3: 120 },
  rowHeights: { 0: 36, 1: 26, 3: 30 },
  data: {
    'A1': { raw: 'Vedval Excel', value: 'Vedval Excel', style: { bold: true, fontSize: 16, textColor: '#0b57d0', fontFamily: 'Calibri' } },
    'A2': { raw: 'World-Class Spreadsheet Architecture', value: 'World-Class Spreadsheet Architecture', style: { italic: true, textColor: '#4b5563', fontFamily: 'Calibri' } },
    'A4': { raw: 'Product Name', value: 'Product Name', style: { bold: true, bgColor: '#f1f5f9', align: 'left' } },
    'B4': { raw: 'Quantity', value: 'Quantity', style: { bold: true, bgColor: '#f1f5f9', align: 'right' } },
    'C4': { raw: 'Unit Price', value: 'Unit Price', style: { bold: true, bgColor: '#f1f5f9', align: 'right' } },
    'D4': { raw: 'Total Revenue', value: 'Total Revenue', style: { bold: true, bgColor: '#f1f5f9', align: 'right' } },
    'A5': { raw: 'MacBook Pro M3 Max', value: 'MacBook Pro M3 Max', comment: { author: 'Admin', text: 'Top seller this quarter', timestamp: '10:30 AM' } },
    'B5': { raw: '12', value: 12, style: { align: 'right' } },
    'C5': { raw: '2499', value: 2499, style: { format: 'currency', align: 'right' } },
    'D5': { raw: '=B5*C5', value: 29988, style: { format: 'currency', align: 'right', bold: true } },
    'A6': { raw: 'Dell UltraSharp 4K Monitor', value: 'Dell UltraSharp 4K Monitor' },
    'B6': { raw: '24', value: 24, style: { align: 'right' } },
    'C6': { raw: '599', value: 599, style: { format: 'currency', align: 'right' } },
    'D6': { raw: '=B6*C6', value: 14376, style: { format: 'currency', align: 'right', bold: true } },
    'A7': { raw: 'Logitech MX Master 3S', value: 'Logitech MX Master 3S' },
    'B7': { raw: '45', value: 45, style: { align: 'right' } },
    'C7': { raw: '99', value: 99, style: { format: 'currency', align: 'right' } },
    'D7': { raw: '=B7*C7', value: 4455, style: { format: 'currency', align: 'right', bold: true } },
    'A8': { raw: 'Quarterly Summary', value: 'Quarterly Summary', style: { bold: true, bgColor: '#e8f0fe', textColor: '#0b57d0' } },
    'B8': { raw: '=SUM(B5:B7)', value: 81, style: { bold: true, align: 'right', bgColor: '#e8f0fe' } },
    'C8': { raw: '', value: '', style: { bgColor: '#e8f0fe' } },
    'D8': { raw: '=SUM(D5:D7)', value: 48819, style: { bold: true, format: 'currency', align: 'right', bgColor: '#e8f0fe', textColor: '#0b57d0' } }
  }
};

const getInitialStateFromUrl = () => {
  let docId = 'doc_workbook_1';
  let initialTitle = 'Untitled spreadsheet';
  let initialSheets = [initialSheet];
  let initialActiveSheetId = initialSheet.id;
  let initialActiveCell = { col: 0, row: 3 };
  let initialPermissionMode: 'edit' | 'view' = 'edit';
  let isLockedView = false;

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    const urlDoc = params.get('doc');
    const urlToken = params.get('token');

    if (urlDoc) {
      docId = urlDoc;
      const saved = localStorage.getItem('libre_doc_' + urlDoc);
      let isLocalOwner = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.documentTitle && parsed.documentTitle !== 'Book') {
            initialTitle = parsed.documentTitle;
          }
          if (parsed.sheets && parsed.sheets.length > 0) {
            initialSheets = parsed.sheets;
            initialActiveSheetId = parsed.activeSheetId || parsed.sheets[0].id;
          }
          // The creator who created this doc in their browser has ownership record
          if (parsed.ownerId && parsed.ownerId === localStorage.getItem('libre_owner_token')) {
            isLocalOwner = true;
          }
        } catch (e) {
          console.error('Error loading document from storage:', e);
        }
      }

      // Check cryptographic tokens
      const isViewToken = urlToken ? verifyShareSignature(urlDoc, 'view', urlToken) : false;
      const hasValidEditToken = urlToken ? verifyShareSignature(urlDoc, 'edit', urlToken) : false;
      const previouslyLocked = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('libre_locked_doc_' + urlDoc) === 'view';

      // 1. Explicit view mode OR a View-signed token is present
      if (urlMode === 'view' || isViewToken) {
        initialPermissionMode = 'view';
        isLockedView = true;
        sessionStorage.setItem('libre_locked_doc_' + urlDoc, 'view');

        // If someone tampered with the URL by replacing 'mode=view' with 'mode=edit' while keeping the view token:
        if (urlMode === 'edit') {
          console.warn('Unauthorized attempt to elevate to edit mode with view token. Reverting to view-only.');
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.set('mode', 'view');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      } else if (urlMode === 'edit') {
        // Attempting edit mode: requires a valid edit signature if URL token was supplied,
        // or if document was previously locked to view in this session, or if user is an external visitor
        if (!hasValidEditToken && (urlToken || previouslyLocked || !isLocalOwner)) {
          console.warn('Unauthorized attempt to elevate to edit mode without valid edit token. Reverting to view-only.');
          initialPermissionMode = 'view';
          isLockedView = true;
          sessionStorage.setItem('libre_locked_doc_' + urlDoc, 'view');
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.set('mode', 'view');
          cleanUrl.searchParams.delete('token');
          window.history.replaceState({}, '', cleanUrl.toString());
        } else {
          initialPermissionMode = 'edit';
          isLockedView = false;
        }
      } else if (previouslyLocked && !hasValidEditToken) {
        // Previously locked in this browser tab and no valid edit token provided
        initialPermissionMode = 'view';
        isLockedView = true;
      }
    } else {
      const savedDocId = localStorage.getItem('libre_current_doc_id');
      if (savedDocId) {
        docId = savedDocId;
        const saved = localStorage.getItem('libre_doc_' + savedDocId);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.documentTitle && parsed.documentTitle !== 'Book') {
              initialTitle = parsed.documentTitle;
            }
            if (parsed.sheets && parsed.sheets.length > 0) {
              // Strip legacy borderTop/borderBottom from sample rows if present
              parsed.sheets.forEach((ws: any) => {
                if (ws?.data) {
                  ['A4', 'B4', 'C4', 'D4', 'A8', 'B8', 'C8', 'D8'].forEach(k => {
                    if (ws.data[k]?.style) {
                      delete ws.data[k].style.borderBottom;
                      delete ws.data[k].style.borderTop;
                      delete ws.data[k].style.borderLeft;
                      delete ws.data[k].style.borderRight;
                      delete ws.data[k].style.borderAll;
                      delete ws.data[k].style.borderBox;
                    }
                  });
                }
              });
              initialSheets = parsed.sheets;
              initialActiveSheetId = parsed.activeSheetId || parsed.sheets[0].id;
            }
          } catch (e) {
            console.error('Error loading default doc from storage:', e);
          }
        }
      } else {
        docId = 'doc_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('libre_current_doc_id', docId);
      }
      initialPermissionMode = 'edit';
      isLockedView = false;
    }

    const urlSheet = params.get('sheet');
    if (urlSheet) {
      const foundSheet = initialSheets.find(
        (s) => s.name.toLowerCase() === urlSheet.toLowerCase() || s.id === urlSheet
      );
      if (foundSheet) {
        initialActiveSheetId = foundSheet.id;
      }
    }

    const urlCell = params.get('cell');
    if (urlCell) {
      const coords = cellIdToCoords(urlCell.toUpperCase());
      if (coords) {
        initialActiveCell = coords;
      }
    }
  }

  return { docId, initialTitle, initialSheets, initialActiveSheetId, initialActiveCell, initialPermissionMode, isLockedView };
};

const _initState = getInitialStateFromUrl();

export const useSpreadsheetStore = create<SpreadsheetState>((set, get) => ({
  docId: _initState.docId,
  setDocId: (docId) => set({ docId }),
  documentTitle: _initState.initialTitle,
  theme: 'classic',
  permissionMode: _initState.initialPermissionMode,
  isLockedView: _initState.isLockedView,
  setPermissionMode: (mode) => {
    const { isLockedView } = get();
    // If user arrived with a View-only link, strictly disallow switching to edit mode
    if (isLockedView && mode === 'edit') {
      alert('Access Denied: You have View-only access to this document and cannot switch to Edit mode.');
      return;
    }
    set({ permissionMode: mode });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      window.history.replaceState({}, '', url.toString());
    }
  },
  setTheme: (theme) => set({ theme }),
  setDocumentTitle: (title) => {
    set({ documentTitle: title });
    const { docId, sheets, activeSheetId } = get();
    if (typeof window !== 'undefined') {
      const ownerId = localStorage.getItem('libre_owner_token') || 'owner_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('libre_owner_token', ownerId);
      localStorage.setItem('libre_doc_' + docId, JSON.stringify({ documentTitle: title, sheets, activeSheetId, ownerId }));
    }
  },

  sheets: _initState.initialSheets,
  activeSheetId: _initState.initialActiveSheetId,
  setActiveSheetId: (id) => set({ activeSheetId: id }),

  activeCell: _initState.initialActiveCell,
  selection: { start: _initState.initialActiveCell, end: _initState.initialActiveCell },
  isSelecting: false,
  setActiveCell: (coords) => set({ activeCell: coords }),
  setSelection: (selection) => set({ selection }),
  setIsSelecting: (isSelecting) => set({ isSelecting }),

  selectAll: () => {
    const { sheets, activeSheetId } = get();
    const ws = sheets.find(s => s.id === activeSheetId) || sheets[0];
    set({
      selection: {
        start: { col: 0, row: 0 },
        end: { col: ws.colCount - 1, row: ws.rowCount - 1 }
      }
    });
  },

  selectRow: (row: number) => {
    const { sheets, activeSheetId } = get();
    const ws = sheets.find(s => s.id === activeSheetId) || sheets[0];
    set({
      activeCell: { col: 0, row },
      selection: {
        start: { col: 0, row },
        end: { col: ws.colCount - 1, row }
      }
    });
  },

  selectColumn: (col: number) => {
    const { sheets, activeSheetId } = get();
    const ws = sheets.find(s => s.id === activeSheetId) || sheets[0];
    set({
      activeCell: { col, row: 0 },
      selection: {
        start: { col, row: 0 },
        end: { col, row: ws.rowCount - 1 }
      }
    });
  },

  setColWidth: (col: number, width: number) => {
    const { sheets, activeSheetId } = get();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        return {
          ...s,
          colWidths: {
            ...(s.colWidths || {}),
            [col]: Math.max(40, width)
          }
        };
      })
    });
  },

  setRowHeight: (row: number, height: number) => {
    const { sheets, activeSheetId } = get();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        return {
          ...s,
          rowHeights: {
            ...(s.rowHeights || {}),
            [row]: Math.max(20, height)
          }
        };
      })
    });
  },

  insertRow: (targetRow: number) => {
    const { sheets, activeSheetId, saveSnapshot } = get();
    saveSnapshot();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const newData: SheetData = {};
        for (const [key, cell] of Object.entries(s.data)) {
          const coords = cellIdToCoords(key);
          if (!coords) continue;
          if (coords.row >= targetRow) {
            newData[coordsToCellId(coords.col, coords.row + 1)] = cell;
          } else {
            newData[key] = cell;
          }
        }
        return { ...s, data: newData, rowCount: s.rowCount + 1 };
      })
    });
  },

  deleteRow: (targetRow: number) => {
    const { sheets, activeSheetId, saveSnapshot } = get();
    saveSnapshot();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const newData: SheetData = {};
        for (const [key, cell] of Object.entries(s.data)) {
          const coords = cellIdToCoords(key);
          if (!coords) continue;
          if (coords.row === targetRow) continue;
          if (coords.row > targetRow) {
            newData[coordsToCellId(coords.col, coords.row - 1)] = cell;
          } else {
            newData[key] = cell;
          }
        }
        return { ...s, data: newData, rowCount: Math.max(20, s.rowCount - 1) };
      })
    });
  },

  insertCol: (targetCol: number) => {
    const { sheets, activeSheetId, saveSnapshot } = get();
    saveSnapshot();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const newData: SheetData = {};
        for (const [key, cell] of Object.entries(s.data)) {
          const coords = cellIdToCoords(key);
          if (!coords) continue;
          if (coords.col >= targetCol) {
            newData[coordsToCellId(coords.col + 1, coords.row)] = cell;
          } else {
            newData[key] = cell;
          }
        }
        return { ...s, data: newData, colCount: s.colCount + 1 };
      })
    });
  },

  deleteCol: (targetCol: number) => {
    const { sheets, activeSheetId, saveSnapshot } = get();
    saveSnapshot();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const newData: SheetData = {};
        for (const [key, cell] of Object.entries(s.data)) {
          const coords = cellIdToCoords(key);
          if (!coords) continue;
          if (coords.col === targetCol) continue;
          if (coords.col > targetCol) {
            newData[coordsToCellId(coords.col - 1, coords.row)] = cell;
          } else {
            newData[key] = cell;
          }
        }
        return { ...s, data: newData, colCount: Math.max(10, s.colCount - 1) };
      })
    });
  },

  addComment: (cellId: string, text: string, author = 'User') => {
    const { sheets, activeSheetId, saveSnapshot } = get();
    saveSnapshot();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const cell = s.data[cellId] || { raw: '', value: '' };
        return {
          ...s,
          data: {
            ...s.data,
            [cellId]: {
              ...cell,
              comment: {
                author,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            }
          }
        };
      })
    });
  },

  deleteComment: (cellId: string) => {
    const { sheets, activeSheetId } = get();
    set({
      sheets: sheets.map(s => {
        if (s.id !== activeSheetId) return s;
        const cell = s.data[cellId];
        if (!cell) return s;
        const updated = { ...cell };
        delete updated.comment;
        return {
          ...s,
          data: {
            ...s.data,
            [cellId]: updated
          }
        };
      })
    });
  },

  formatPainterStyle: null,
  setFormatPainterStyle: (style) => set({ formatPainterStyle: style }),

  clipboardCell: null,
  setClipboardCell: (data) => set({ clipboardCell: data }),

  activeRibbonTab: 'home',
  setActiveRibbonTab: (tab) => set({ activeRibbonTab: tab }),
  activeMenu: null,
  setActiveMenu: (activeMenu) => set({ activeMenu }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  isShareModalOpen: false,
  setIsShareModalOpen: (isShareModalOpen) => set({ isShareModalOpen }),
  isFindReplaceOpen: false,
  setIsFindReplaceOpen: (isFindReplaceOpen) => set({ isFindReplaceOpen }),

  charts: [
    {
      id: 'chart_sample',
      title: 'Quarterly Sales by Product',
      type: 'bar',
      range: 'A5:D7',
      labelColumn: 'A',
      dataColumn: 'D'
    }
  ],
  addChart: (chart) => set((s) => ({ charts: [...s.charts, chart] })),
  removeChart: (id) => set((s) => ({ charts: s.charts.filter((c) => c.id !== id) })),
  isChartModalOpen: false,
  setIsChartModalOpen: (open) => set({ isChartModalOpen: open }),
  isTemplatesModalOpen: false,
  setIsTemplatesModalOpen: (open) => set({ isTemplatesModalOpen: open }),
  isShortcutsModalOpen: false,
  setIsShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  isHelpModalOpen: false,
  setIsHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
  isFeedbackModalOpen: false,
  setIsFeedbackModalOpen: (open) => set({ isFeedbackModalOpen: open }),
  isTutorialOpen: false,
  setIsTutorialOpen: (open) => set({ isTutorialOpen: open }),
  zoomLevel: 100,
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(50, Math.min(200, zoom)) }),

  history: [],
  future: [],

  saveSnapshot: () => {
    const { sheets, activeSheetId } = get();
    const currentSheet = sheets.find((s) => s.id === activeSheetId);
    if (!currentSheet) return;
    set((state) => ({
      history: [...state.history.slice(-30), { worksheet: JSON.parse(JSON.stringify(currentSheet)) }],
      future: []
    }));
  },

  undo: () => {
    const { history, sheets, activeSheetId } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const currentSheet = sheets.find((s) => s.id === activeSheetId);
    if (!currentSheet) return;

    set((state) => ({
      history: state.history.slice(0, -1),
      future: [{ worksheet: JSON.parse(JSON.stringify(currentSheet)) }, ...state.future],
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? previous.worksheet : s))
    }));
  },

  redo: () => {
    const { future, sheets, activeSheetId } = get();
    if (future.length === 0) return;
    const next = future[0];
    const currentSheet = sheets.find((s) => s.id === activeSheetId);
    if (!currentSheet) return;

    set((state) => ({
      future: state.future.slice(1),
      history: [...state.history, { worksheet: JSON.parse(JSON.stringify(currentSheet)) }],
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? next.worksheet : s))
    }));
  },

  addSheet: (name) => {
    const { sheets } = get();
    const newIdx = sheets.length + 1;
    const newSheet: Worksheet = {
      id: 'sheet_' + Date.now(),
      name: name || ('Sheet' + newIdx),
      rowCount: 100,
      colCount: 26,
      data: {}
    };
    set((state) => ({
      sheets: [...state.sheets, newSheet],
      activeSheetId: newSheet.id
    }));
  },

  renameSheet: (id, newName) => {
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === id ? { ...s, name: newName } : s))
    }));
  },

  deleteSheet: (id) => {
    const { sheets } = get();
    if (sheets.length <= 1) return;
    const remaining = sheets.filter((s) => s.id !== id);
    set({
      sheets: remaining,
      activeSheetId: remaining[0].id
    });
  },

  setSheetTabColor: (id, color) => {
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === id ? { ...s, tabColor: color } : s))
    }));
  },

  loadTemplate: (templateKey) => {
    const t = TEMPLATES[templateKey];
    if (!t) return;
    get().saveSnapshot();
    const newSheet: Worksheet = {
      ...JSON.parse(JSON.stringify(t.worksheet)),
      id: 'sheet_' + Date.now()
    };
    set((state) => ({
      sheets: [...state.sheets, newSheet],
      activeSheetId: newSheet.id,
      isTemplatesModalOpen: false
    }));
  },

  replaceActiveWorksheet: (ws) => {
    get().saveSnapshot();
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === state.activeSheetId ? ws : s))
    }));
  },

  setCellValue: (cellId, raw, skipSnapshot = false) => {
    const { sheets, activeSheetId, permissionMode } = get();
    if (permissionMode === 'view') return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    if (!skipSnapshot) {
      get().saveSnapshot();
    }

    const currentCell = sheet.data[cellId] || { raw: '', value: '' };
    const updatedData: SheetData = {
      ...sheet.data,
      [cellId]: {
        ...currentCell,
        raw,
        value: raw.startsWith('=') ? raw : isNaN(Number(raw)) || raw.trim() === '' ? raw : Number(raw)
      }
    };

    // Recalculate formulas in sheet
    for (const key in updatedData) {
      const c = updatedData[key];
      if (c && c.raw && c.raw.startsWith('=')) {
        c.value = evaluateFormula(c.raw, updatedData);
      }
    }

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  batchSetCells: (updates) => {
    const { sheets, activeSheetId, permissionMode } = get();
    if (permissionMode === 'view' || Object.keys(updates).length === 0) return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    get().saveSnapshot();

    const updatedData: SheetData = { ...sheet.data };
    for (const [cellId, update] of Object.entries(updates)) {
      const currentCell = updatedData[cellId] || { raw: '', value: '' };
      const raw = update.raw;
      const newStyle = update.style ? { ...(currentCell.style || {}), ...update.style } : currentCell.style;
      updatedData[cellId] = {
        ...currentCell,
        raw,
        value: raw.startsWith('=') ? raw : isNaN(Number(raw)) || raw.trim() === '' ? raw : Number(raw),
        style: newStyle
      };
    }

    // Recalculate formulas in sheet
    for (const key in updatedData) {
      const c = updatedData[key];
      if (c && c.raw && c.raw.startsWith('=')) {
        c.value = evaluateFormula(c.raw, updatedData);
      }
    }

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  sortRange: (col, direction) => {
    const { sheets, activeSheetId, selection, permissionMode } = get();
    if (permissionMode === 'view') return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    get().saveSnapshot();

    const minRow = Math.min(selection.start.row, selection.end.row);
    const maxRow = Math.max(selection.start.row, selection.end.row);
    const minCol = Math.min(selection.start.col, selection.end.col);
    const maxCol = Math.max(selection.start.col, selection.end.col);

    // Collect rows within selection
    const rows: { rowIndex: number; sortVal: any; cells: { [c: number]: any } }[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const cellRow: { [c: number]: any } = {};
      for (let c = minCol; c <= maxCol; c++) {
        const id = coordsToCellId(c, r);
        cellRow[c] = sheet.data[id];
      }
      const sortCellId = coordsToCellId(col, r);
      const sortVal = sheet.data[sortCellId]?.value ?? '';
      rows.push({ rowIndex: r, sortVal, cells: cellRow });
    }

    // Sort rows based on sortVal
    rows.sort((a, b) => {
      const valA = a.sortVal;
      const valB = b.sortVal;
      const numA = Number(valA);
      const numB = Number(valB);

      let comparison = 0;
      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        comparison = numA - numB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    const updatedData = { ...sheet.data };
    rows.forEach((rowObj, idx) => {
      const targetR = minRow + idx;
      for (let c = minCol; c <= maxCol; c++) {
        const targetId = coordsToCellId(c, targetR);
        if (rowObj.cells[c]) {
          updatedData[targetId] = rowObj.cells[c];
        } else {
          delete updatedData[targetId];
        }
      }
    });

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  setSelectionStyle: (stylePatch) => {
    const { sheets, activeSheetId, selection, permissionMode } = get();
    if (permissionMode === 'view') return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    get().saveSnapshot();

    const updatedData: SheetData = { ...sheet.data };
    const minRow = Math.min(selection.start.row, selection.end.row);
    const maxRow = Math.max(selection.start.row, selection.end.row);
    const minCol = Math.min(selection.start.col, selection.end.col);
    const maxCol = Math.max(selection.start.col, selection.end.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const id = coordsToCellId(c, r);
        const cell = updatedData[id] || { raw: '', value: '' };
        updatedData[id] = {
          ...cell,
          style: {
            ...cell.style,
            ...stylePatch
          }
        };
      }
    }

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  adjustSelectionDecimals: (delta) => {
    const { sheets, activeSheetId, selection, permissionMode } = get();
    if (permissionMode === 'view') return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    get().saveSnapshot();

    const updatedData: SheetData = { ...sheet.data };
    const minRow = Math.min(selection.start.row, selection.end.row);
    const maxRow = Math.max(selection.start.row, selection.end.row);
    const minCol = Math.min(selection.start.col, selection.end.col);
    const maxCol = Math.max(selection.start.col, selection.end.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const id = coordsToCellId(c, r);
        const cell = updatedData[id] || { raw: '', value: '' };
        const currentDecimals = typeof cell.style?.decimals === 'number' ? cell.style.decimals : 0;
        const newDecimals = Math.max(0, Math.min(10, currentDecimals + delta));
        
        updatedData[id] = {
          ...cell,
          style: {
            ...cell.style,
            decimals: newDecimals
          }
        };
      }
    }

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  clearSelection: (mode = 'all') => {
    const { sheets, activeSheetId, selection, permissionMode } = get();
    if (permissionMode === 'view') return;
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    get().saveSnapshot();
    const updatedData: SheetData = { ...sheet.data };
    const minRow = Math.min(selection.start.row, selection.end.row);
    const maxRow = Math.max(selection.start.row, selection.end.row);
    const minCol = Math.min(selection.start.col, selection.end.col);
    const maxCol = Math.max(selection.start.col, selection.end.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const id = coordsToCellId(c, r);
        const cell = updatedData[id];
        if (!cell) continue;

        if (mode === 'all') {
          delete updatedData[id];
        } else if (mode === 'contents') {
          updatedData[id] = { ...cell, raw: '', value: '' };
        } else if (mode === 'formats') {
          updatedData[id] = { ...cell, style: undefined };
        }
      }
    }

    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === activeSheetId ? { ...s, data: updatedData } : s))
    }));
  },

  recalculateSheet: (sheetId) => {
    const targetId = sheetId || get().activeSheetId;
    set((state) => {
      return {
        sheets: state.sheets.map((s) => {
          if (s.id !== targetId) return s;
          const updatedData = { ...s.data };
          for (const key in updatedData) {
            const cell = updatedData[key];
            if (cell && cell.raw && cell.raw.startsWith('=')) {
              cell.value = evaluateFormula(cell.raw, updatedData);
            }
          }
          return { ...s, data: updatedData };
        })
      };
    });
  }
}));
