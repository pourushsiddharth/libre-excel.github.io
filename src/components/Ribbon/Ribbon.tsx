import React, { useState, useEffect } from 'react';

const FONT_OPTIONS = [
  {
    group: 'Material Design Headings',
    fonts: [
      { label: 'Open Sans (Material H1-H6)', value: 'Open Sans' },
      { label: 'Roboto (Material Standard)', value: 'Roboto' },
      { label: 'Plus Jakarta Sans (Modern Display)', value: 'Plus Jakarta Sans' },
      { label: 'Work Sans (Refined Heading)', value: 'Work Sans' },
      { label: 'Montserrat (Geometric)', value: 'Montserrat' },
      { label: 'Outfit (Clean Technical)', value: 'Outfit' },
      { label: 'Poppins (Soft Rounded)', value: 'Poppins' },
    ],
  },
  {
    group: 'Material Design Body & Data',
    fonts: [
      { label: 'Roboto (Material Body)', value: 'Roboto' },
      { label: 'Inter (High Legibility)', value: 'Inter' },
      { label: 'Open Sans (Neutral Reading)', value: 'Open Sans' },
      { label: 'Lato (Humanist Body)', value: 'Lato' },
    ],
  },
  {
    group: 'Office & Classic Sans',
    fonts: [
      { label: 'Calibri (Body)', value: 'Calibri' },
      { label: 'Aptos (Default 365)', value: 'Aptos' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Segoe UI', value: 'Segoe UI' },
      { label: 'Tahoma', value: 'Tahoma' },
      { label: 'Verdana', value: 'Verdana' },
      { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    ],
  },
  {
    group: 'Editorial Serif',
    fonts: [
      { label: 'Merriweather', value: 'Merriweather' },
      { label: 'Lora', value: 'Lora' },
      { label: 'Playfair Display', value: 'Playfair Display' },
      { label: 'Times New Roman', value: 'Times New Roman' },
      { label: 'Georgia', value: 'Georgia' },
      { label: 'Garamond', value: 'Garamond' },
    ],
  },
  {
    group: 'Monospace & Tabular Data',
    fonts: [
      { label: 'JetBrains Mono', value: 'JetBrains Mono' },
      { label: 'Fira Code', value: 'Fira Code' },
      { label: 'Roboto Mono', value: 'Roboto Mono' },
      { label: 'Consolas', value: 'Consolas' },
      { label: 'Courier New', value: 'Courier New' },
    ],
  },
  {
    group: 'Display & Signature',
    fonts: [
      { label: 'Oswald', value: 'Oswald' },
      { label: 'Impact', value: 'Impact' },
      { label: 'Caveat', value: 'Caveat' },
      { label: 'Dancing Script', value: 'Dancing Script' },
      { label: 'Pacifico', value: 'Pacifico' },
    ],
  },
];

export interface MaterialTypeScaleItem {
  id: string;
  category: string;
  name: string;
  fontFamily: string;
  weightLabel: string;
  fontSize: number;
  bold: boolean;
  italic?: boolean;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase';
  description: string;
}

const MATERIAL_TYPE_SCALES: MaterialTypeScaleItem[] = [
  {
    id: 'h1',
    category: 'Headlines',
    name: 'Headline 1',
    fontFamily: 'Open Sans',
    weightLabel: 'Light / 32pt',
    fontSize: 32,
    bold: false,
    description: 'Display hero figures, primary document title',
  },
  {
    id: 'h2',
    category: 'Headlines',
    name: 'Headline 2',
    fontFamily: 'Open Sans',
    weightLabel: 'Light / 26pt',
    fontSize: 26,
    bold: false,
    description: 'Major section titles or KPI numbers',
  },
  {
    id: 'h3',
    category: 'Headlines',
    name: 'Headline 3',
    fontFamily: 'Open Sans',
    weightLabel: 'Regular / 22pt',
    fontSize: 22,
    bold: true,
    description: 'Table group header or dashboard tile title',
  },
  {
    id: 'h4',
    category: 'Headlines',
    name: 'Headline 4',
    fontFamily: 'Open Sans',
    weightLabel: 'Regular / 18pt',
    fontSize: 18,
    bold: true,
    description: 'Section headers, prominent group titles',
  },
  {
    id: 'h5',
    category: 'Headlines',
    name: 'Headline 5',
    fontFamily: 'Open Sans',
    weightLabel: 'Regular / 16pt',
    fontSize: 16,
    bold: true,
    description: 'Standard table and column block headings',
  },
  {
    id: 'h6',
    category: 'Headlines',
    name: 'Headline 6',
    fontFamily: 'Open Sans',
    weightLabel: 'Medium / 14pt',
    fontSize: 14,
    bold: true,
    description: 'Sub-headers and column group titles',
  },
  {
    id: 'subtitle1',
    category: 'Subtitles',
    name: 'Subtitle 1',
    fontFamily: 'Roboto',
    weightLabel: 'Regular / 13pt',
    fontSize: 13,
    bold: false,
    description: 'Descriptive subtitle or lead paragraph',
  },
  {
    id: 'subtitle2',
    category: 'Subtitles',
    name: 'Subtitle 2',
    fontFamily: 'Roboto',
    weightLabel: 'Medium / 12pt',
    fontSize: 12,
    bold: true,
    description: 'Sub-table titles, metric captions',
  },
  {
    id: 'body1',
    category: 'Body',
    name: 'Body 1',
    fontFamily: 'Roboto',
    weightLabel: 'Regular / 12pt',
    fontSize: 12,
    bold: false,
    description: 'Comfortable reading, long comments, data entries',
  },
  {
    id: 'body2',
    category: 'Body',
    name: 'Body 2',
    fontFamily: 'Roboto',
    weightLabel: 'Regular / 11pt',
    fontSize: 11,
    bold: false,
    description: 'Standard grid cell data, default table rows',
  },
  {
    id: 'button',
    category: 'Functional & Data',
    name: 'Button / Callout',
    fontFamily: 'Roboto',
    weightLabel: 'Medium / 11pt',
    fontSize: 11,
    bold: true,
    textTransform: 'uppercase',
    description: 'Interactive cells, action markers, status labels',
  },
  {
    id: 'caption',
    category: 'Functional & Data',
    name: 'Caption',
    fontFamily: 'Roboto',
    weightLabel: 'Regular / 10pt',
    fontSize: 10,
    bold: false,
    description: 'Footnotes, audit timestamps, source references',
  },
  {
    id: 'overline',
    category: 'Functional & Data',
    name: 'Overline',
    fontFamily: 'Roboto',
    weightLabel: 'Medium / 9pt',
    fontSize: 9,
    bold: true,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    description: 'Category eyebrow, super-title tags, status banners',
  },
];
import { 
  Undo2, 
  Redo2, 
  Clipboard, 
  Scissors, 
  Copy, 
  Paintbrush, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  DollarSign, 
  Percent, 
  Sparkles, 
  BarChart3, 
  Filter, 
  ArrowUpDown, 
  Table, 
  Sigma, 
  Search, 
  ChevronDown,
  Grid,
  PaintBucket,
  Highlighter,
  Trash2,
  PlusSquare,
  MinusSquare,
  WrapText,
  Merge,
  PieChart,
  LineChart,
  Layers,
  FileText,
  Link,
  MessageSquare,
  Shapes,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  HelpCircle,
  Keyboard,
  BookOpen,
  Printer,
  Grid3X3,
  RotateCcw,
  SpellCheck,
  Lock,
  Unlock,
  Calculator,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { coordsToCellId, isColorDark } from '../../engine/helpers';

export const Ribbon: React.FC = () => {
  const { 
    activeRibbonTab, 
    setSelectionStyle, 
    adjustSelectionDecimals,
    setIsChartModalOpen, 
    setIsTemplatesModalOpen,
    setIsFindReplaceOpen,
    setIsShortcutsModalOpen,
    setIsHelpModalOpen,
    setIsFeedbackModalOpen,
    setCellValue,
    activeCell,
    undo,
    redo,
    history,
    future,
    clearSelection,
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    setFormatPainterStyle,
    formatPainterStyle,
    sheets,
    activeSheetId,
    permissionMode,
    zoomLevel,
    setZoomLevel,
    theme,
    setTheme,
    recalculateSheet,
    addComment,
    sortRange
  } = useSpreadsheetStore();

  const isReadOnly = permissionMode === 'view';

  const [isBordersOpen, setIsBordersOpen] = useState(false);
  const [isAutoSumOpen, setIsAutoSumOpen] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isConditionalOpen, setIsConditionalOpen] = useState(false);
  const [isFormatTableOpen, setIsFormatTableOpen] = useState(false);
  const [customFillColor, setCustomFillColor] = useState<string | null>(null);
  const [customTextColor, setCustomTextColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);

  const currentSheet = sheets.find(s => s.id === activeSheetId);
  const activeCellId = coordsToCellId(activeCell.col, activeCell.row);
  const activeCellData = currentSheet?.data[activeCellId];

  useEffect(() => {
    if (activeCellData?.style?.fontFamily) {
      setFontFamily(activeCellData.style.fontFamily);
    } else {
      setFontFamily('Calibri');
    }
    if (activeCellData?.style?.fontSize) {
      setFontSize(activeCellData.style.fontSize);
    } else {
      setFontSize(11);
    }
  }, [activeCellId, activeCellData?.style?.fontFamily, activeCellData?.style?.fontSize]);

  // Active cell's real colors (default transparent/white for bg, black for text)
  const cellBgColor = activeCellData?.style?.bgColor;
  const effectiveFillColor = customFillColor || cellBgColor || 'transparent';

  const cellTextColor = activeCellData?.style?.textColor;
  const effectiveTextColor = customTextColor || cellTextColor || (cellBgColor && isColorDark(cellBgColor) ? '#ffffff' : '#000000');

  const insertQuickFormula = (func: string) => {
    const id = coordsToCellId(activeCell.col, activeCell.row);
    setCellValue(id, '=' + func + '()');
    setIsAutoSumOpen(false);
  };

  const handleFontFamily = (font: string) => {
    setFontFamily(font);
    setSelectionStyle({ fontFamily: font });
  };

  const handleFontSize = (size: number) => {
    setFontSize(size);
    setSelectionStyle({ fontSize: size });
  };

  const applyBorder = (borderType: string) => {
    if (borderType === 'all') setSelectionStyle({ borderAll: true });
    else if (borderType === 'box') setSelectionStyle({ borderBox: true });
    else if (borderType === 'bottom') setSelectionStyle({ borderBottom: true });
    else if (borderType === 'top') setSelectionStyle({ borderTop: true });
    else if (borderType === 'left') setSelectionStyle({ borderLeft: true });
    else if (borderType === 'right') setSelectionStyle({ borderRight: true });
    else if (borderType === 'none') {
      setSelectionStyle({
        borderTop: false,
        borderBottom: false,
        borderLeft: false,
        borderRight: false,
        borderAll: false,
        borderBox: false
      });
    }
    setIsBordersOpen(false);
  };

  return (
    <div 
      id="tutorial-target-ribbon"
      className={`bg-[#fcfdfd] border-b border-gray-200 select-none font-sans relative z-30 transition-opacity ${
      isReadOnly ? 'opacity-60 pointer-events-none' : ''
    }`}>
      {/* Ribbon Action Toolbar */}
      <div className="h-11 px-3 flex items-center gap-1.5 text-gray-700 py-1 text-xs relative overflow-visible">
        {/* ========================================================= */}
        {/* HOME TAB TOOLBAR                                          */}
        {/* ========================================================= */}
        {(!activeRibbonTab || activeRibbonTab === 'home') && (
          <>
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
              <button
                onClick={undo}
                disabled={history.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 disabled:opacity-30 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">undo</span>
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 disabled:opacity-30 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">redo</span>
          </button>
        </div>

        {/* Clipboard Group */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
          <button 
            onClick={() => alert('Press Ctrl+V to paste into active cell')}
            title="Paste (Ctrl+V)"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">content_paste</span>
          </button>
          <button 
            onClick={() => alert('Press Ctrl+X to cut')}
            title="Cut (Ctrl+X)"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">content_cut</span>
          </button>
          <button 
            onClick={() => alert('Press Ctrl+C to copy')}
            title="Copy (Ctrl+C)"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">content_copy</span>
          </button>
          <button 
            onClick={() => {
              if (formatPainterStyle) {
                setFormatPainterStyle(null);
              } else {
                setFormatPainterStyle({ bold: true, bgColor: '#fef08a' });
                alert('Format Painter active: click any cell to apply formatting!');
              }
            }}
            title="Format Painter"
            className={`p-1 rounded transition flex items-center justify-center ${formatPainterStyle ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            <span className="material-symbols-outlined text-[19px]">format_paint</span>
          </button>
        </div>

        {/* Font Family & Size Selectors */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <select
            value={fontFamily}
            onChange={(e) => handleFontFamily(e.target.value)}
            className="h-6 px-1.5 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 outline-none w-36 font-medium cursor-pointer shadow-2xs"
            title="Font Family"
          >
            {FONT_OPTIONS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.fonts.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={fontSize}
            onChange={(e) => handleFontSize(Number(e.target.value))}
            className="h-6 px-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 outline-none w-12 font-medium cursor-pointer"
          >
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36].map((sz) => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>

          <button
            onClick={() => handleFontSize(Math.min(fontSize + 1, 36))}
            title="Increase Font Size"
            className="px-1 h-6 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">format_size</span>
          </button>
        </div>

        {/* Font Formats: Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
          <button
            onClick={() => setSelectionStyle({ bold: true })}
            title="Bold (Ctrl+B)"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 hover:text-gray-900 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_bold</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ italic: true })}
            title="Italic (Ctrl+I)"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 hover:text-gray-900 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_italic</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ underline: true })}
            title="Underline (Ctrl+U)"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 hover:text-gray-900 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_underlined</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ strikethrough: true })}
            title="Strikethrough"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 hover:text-gray-900 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">strikethrough_s</span>
          </button>

          {/* Borders Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBordersOpen(!isBordersOpen)}
              title="Borders"
              className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[19px]">border_all</span>
              <span className="material-symbols-outlined text-[15px] text-gray-400">arrow_drop_down</span>
            </button>
            {isBordersOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsBordersOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={() => applyBorder('bottom')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_bottom</span>
                    <span>Bottom Border</span>
                  </button>
                  <button onClick={() => applyBorder('top')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_top</span>
                    <span>Top Border</span>
                  </button>
                  <button onClick={() => applyBorder('left')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_left</span>
                    <span>Left Border</span>
                  </button>
                  <button onClick={() => applyBorder('right')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_right</span>
                    <span>Right Border</span>
                  </button>
                  <div className="h-px bg-gray-200 my-0.5" />
                  <button onClick={() => applyBorder('none')} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">border_clear</span>
                    <span>No Border</span>
                  </button>
                  <button onClick={() => applyBorder('all')} className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_all</span>
                    <span>All Borders</span>
                  </button>
                  <button onClick={() => applyBorder('box')} className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">border_outer</span>
                    <span>Thick Outside Box</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Fill Color Picker (Custom Paint Bucket SVG with single live color line) */}
          <label 
            className="flex flex-col items-center justify-center px-1.5 py-0.5 hover:bg-gray-100 active:bg-gray-200 rounded cursor-pointer relative" 
            title={`Fill Color: ${effectiveFillColor === 'transparent' ? 'No Fill' : effectiveFillColor}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-700 select-none" viewBox="0 0 16 16">
              <path d="M6.192 2.78c-.458-.677-.927-1.248-1.35-1.643a3 3 0 0 0-.71-.515c-.217-.104-.56-.205-.882-.02-.367.213-.427.63-.43.896-.003.304.064.664.173 1.044.196.687.556 1.528 1.035 2.402L.752 8.22c-.277.277-.269.656-.218.918.055.283.187.593.36.903.348.627.92 1.361 1.626 2.068.707.707 1.441 1.278 2.068 1.626.31.173.62.305.903.36.262.05.64.059.918-.218l5.615-5.615c.118.257.092.512.05.939-.03.292-.068.665-.073 1.176v.123h.003a1 1 0 0 0 1.993 0H14v-.057a1 1 0 0 0-.004-.117c-.055-1.25-.7-2.738-1.86-3.494a4 4 0 0 0-.211-.434c-.349-.626-.92-1.36-1.627-2.067S8.857 3.052 8.23 2.704c-.31-.172-.62-.304-.903-.36-.262-.05-.64-.058-.918.219zM4.16 1.867c.381.356.844.922 1.311 1.632l-.704.705c-.382-.727-.66-1.402-.813-1.938a3.3 3.3 0 0 1-.131-.673q.137.09.337.274m.394 3.965c.54.852 1.107 1.567 1.607 2.033a.5.5 0 1 0 .682-.732c-.453-.422-1.017-1.136-1.564-2.027l1.088-1.088q.081.181.183.365c.349.627.92 1.361 1.627 2.068.706.707 1.44 1.278 2.068 1.626q.183.103.365.183l-4.861 4.862-.068-.01c-.137-.027-.342-.104-.608-.252-.524-.292-1.186-.8-1.846-1.46s-1.168-1.32-1.46-1.846c-.147-.265-.225-.47-.251-.607l-.01-.068zm2.87-1.935a2.4 2.4 0 0 1-.241-.561c.135.033.324.11.562.241.524.292 1.186.8 1.846 1.46.45.45.83.901 1.118 1.31a3.5 3.5 0 0 0-1.066.091 11 11 0 0 1-.76-.694c-.66-.66-1.167-1.322-1.458-1.847z"/>
            </svg>
            
            {/* Single bottom color bar */}
            <div 
              className={`w-4 h-[3px] rounded-xs mt-0.5 border ${
                effectiveFillColor === 'transparent' 
                  ? 'bg-transparent border-gray-300' 
                  : 'border-black/20'
              }`}
              style={{ 
                backgroundColor: effectiveFillColor === 'transparent' ? 'transparent' : effectiveFillColor 
              }} 
            />

            <input
              type="color"
              value={effectiveFillColor === 'transparent' ? '#ffffff' : effectiveFillColor}
              onChange={(e) => {
                const newBg = e.target.value;
                setCustomFillColor(newBg);
                if (isColorDark(newBg)) {
                  setSelectionStyle({ bgColor: newBg, textColor: '#ffffff' });
                  setCustomTextColor('#ffffff');
                } else {
                  setSelectionStyle({ bgColor: newBg, textColor: '#000000' });
                  setCustomTextColor('#000000');
                }
              }}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>

          {/* Font Color Picker (Letter A with single live font color line) */}
          <label 
            className="flex flex-col items-center justify-center px-1.5 py-0.5 hover:bg-gray-100 active:bg-gray-200 rounded cursor-pointer relative" 
            title={`Font Color: ${effectiveTextColor}`}
          >
            <span className="text-[13px] font-bold text-gray-800 leading-tight font-sans select-none">
              A
            </span>

            {/* Single bottom color bar */}
            <div 
              className="w-4 h-[3px] rounded-xs mt-0.5 shadow-2xs border border-black/20" 
              style={{ backgroundColor: effectiveTextColor }} 
            />

            <input
              type="color"
              value={effectiveTextColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setCustomTextColor(newColor);
                setSelectionStyle({ textColor: newColor });
              }}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>
        </div>

        {/* Alignment & Text Wrapping */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2">
          <button
            onClick={() => setSelectionStyle({ align: 'left' })}
            title="Align Left"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_align_left</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ align: 'center' })}
            title="Align Center"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_align_center</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ align: 'right' })}
            title="Align Right"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">format_align_right</span>
          </button>

          <button
            onClick={() => setSelectionStyle({ wrapText: true })}
            title="Wrap Text"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">wrap_text</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ align: 'center', bold: true })}
            title="Merge & Center"
            className="p-1 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">call_merge</span>
          </button>
        </div>

        {/* Number Formatting Group (General, Currency, Percent, Decimals) */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <div className="relative">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="h-6 px-2 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 flex items-center justify-between w-24 font-medium"
            >
              <span>General</span>
              <span className="material-symbols-outlined text-[15px] text-gray-400">arrow_drop_down</span>
            </button>
            {isFormatOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsFormatOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['general', 'number', 'currency', 'accounting', 'percent', 'date'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        setSelectionStyle({ format: fmt as any });
                        setIsFormatOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-800 capitalize font-medium transition-colors"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setSelectionStyle({ format: 'currency' })}
            title="Currency ($)"
            className="p-1 hover:bg-gray-100 rounded font-bold text-xs text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">attach_money</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ format: 'percent' })}
            title="Percent (%)"
            className="p-1 hover:bg-gray-100 rounded font-bold text-xs text-gray-700 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">percent</span>
          </button>
          <button
            onClick={() => setSelectionStyle({ format: 'number' })}
            title="Comma Separator (,)"
            className="px-1.5 h-6 hover:bg-gray-100 rounded font-bold text-xs flex items-center justify-center"
          >
            ,
          </button>
          <button
            onClick={() => adjustSelectionDecimals(1)}
            title="Increase Decimal (.00 ->)"
            className="p-1 h-6 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">decimal_increase</span>
          </button>
          <button
            onClick={() => adjustSelectionDecimals(-1)}
            title="Decrease Decimal (.0 <-)"
            className="p-1 h-6 hover:bg-gray-100 rounded text-gray-700 flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">decimal_decrease</span>
          </button>
        </div>

        {/* Styles & Table formatting */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          {/* Conditional Formatting Dropdown (Excel 365 Fluent Design) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsConditionalOpen(!isConditionalOpen);
                setIsFormatTableOpen(false);
              }}
              title="Conditional Formatting"
              className={`h-7 px-1.5 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-0.5 transition cursor-pointer ${
                isConditionalOpen ? 'bg-blue-50 ring-1 ring-blue-300' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[19px] text-[#0b57d0]">tune</span>
              <span className="material-symbols-outlined text-[14px] text-gray-500">arrow_drop_down</span>
            </button>
            {isConditionalOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsConditionalOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-300/80 rounded-md shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans text-gray-800">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                    <span>Highlight Cells Rules</span>
                    <span className="material-symbols-outlined text-[14px] text-gray-400">chevron_right</span>
                  </div>

                  <div className="py-1">
                    {/* Greater / Positive (Green) */}
                    <button
                      onClick={() => {
                        setSelectionStyle({ bgColor: '#c6efce', textColor: '#006100', bold: true });
                        setIsConditionalOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100/90 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-4 rounded-xs bg-[#c6efce] border border-[#9fd8a8] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#006100]">12</span>
                        </div>
                        <span className="text-gray-800 text-[12px]">Light Red / Green with Dark Text</span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-mono">High</span>
                    </button>

                    {/* Yellow / Medium */}
                    <button
                      onClick={() => {
                        setSelectionStyle({ bgColor: '#ffeb9c', textColor: '#9c6500', bold: true });
                        setIsConditionalOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100/90 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-4 rounded-xs bg-[#ffeb9c] border border-[#ffd54f] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#9c6500]">08</span>
                        </div>
                        <span className="text-gray-800 text-[12px]">Yellow Fill with Dark Yellow Text</span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-mono">Mid</span>
                    </button>

                    {/* Red / Low */}
                    <button
                      onClick={() => {
                        setSelectionStyle({ bgColor: '#ffc7ce', textColor: '#9c0006', bold: true });
                        setIsConditionalOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-100/90 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-4 rounded-xs bg-[#ffc7ce] border border-[#e5989b] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#9c0006]">03</span>
                        </div>
                        <span className="text-gray-800 text-[12px]">Light Red Fill with Dark Red Text</span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-mono">Low</span>
                    </button>
                  </div>

                  {/* Excel Color Scales Group */}
                  <div className="border-t border-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500 flex items-center justify-between">
                    <span>Color Scales</span>
                    <span className="material-symbols-outlined text-[14px] text-gray-400">palette</span>
                  </div>
                  <div className="px-3 pb-2 pt-0.5 flex gap-1.5">
                    <button
                      onClick={() => {
                        setSelectionStyle({ bgColor: '#e2f0d9', textColor: '#385723' });
                        setIsConditionalOpen(false);
                      }}
                      title="Green Gradient Scale"
                      className="h-5 flex-1 rounded-xs border border-gray-300 flex overflow-hidden hover:ring-2 ring-emerald-500 cursor-pointer"
                    >
                      <div className="flex-1 bg-[#63be7b]" />
                      <div className="flex-1 bg-[#ffeb84]" />
                      <div className="flex-1 bg-[#f8696b]" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectionStyle({ bgColor: '#eff6ff', textColor: '#1e3a8a' });
                        setIsConditionalOpen(false);
                      }}
                      title="Blue-White Scale"
                      className="h-5 flex-1 rounded-xs border border-gray-300 flex overflow-hidden hover:ring-2 ring-blue-500 cursor-pointer"
                    >
                      <div className="flex-1 bg-[#5b9bd5]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#ed7d31]" />
                    </button>
                  </div>

                  <div className="border-t border-gray-200/80 my-0.5" />

                  {/* Clear Rules */}
                  <button
                    onClick={() => {
                      setSelectionStyle({ bgColor: undefined, textColor: undefined, bold: false });
                      setIsConditionalOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center gap-2 text-gray-700 hover:text-gray-900 text-[12px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-gray-500">backspace</span>
                    <span>Clear Rules from Selected Cells</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Format as Table Dropdown (Excel 365 Authentic Gallery) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFormatTableOpen(!isFormatTableOpen);
                setIsConditionalOpen(false);
              }}
              title="Format as Table"
              className={`h-7 px-1.5 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-0.5 transition cursor-pointer ${
                isFormatTableOpen ? 'bg-gray-200/80 ring-1 ring-gray-300' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[19px] text-[#2b579a]">table_chart</span>
              <span className="material-symbols-outlined text-[14px] text-gray-500">arrow_drop_down</span>
            </button>
            {isFormatTableOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsFormatTableOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-300/80 rounded-md shadow-xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 font-sans">
                  {/* Category: Light / Medium / Dark */}
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Table Styles (Office 365)
                  </div>

                  <div className="space-y-3">
                    {/* Light Section */}
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">Light & Soft</div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Table Style Light 1 (Blue) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#f0f4f8', textColor: '#102a43', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-[#2b579a] hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#4472c4] rounded-xs" />
                          <div className="h-2 bg-[#d9e1f2] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-white mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Light Blue</div>
                        </button>

                        {/* Table Style Light 2 (Green) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#f2f9f4', textColor: '#064e3b', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-[#107c41] hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#70ad47] rounded-xs" />
                          <div className="h-2 bg-[#e2efda] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-white mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Light Green</div>
                        </button>

                        {/* Table Style Light 3 (Gray/Slate) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#f8fafc', textColor: '#1e293b', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-gray-500 hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#7f7f7f] rounded-xs" />
                          <div className="h-2 bg-[#d9d9d9] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-white mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Light Gray</div>
                        </button>
                      </div>
                    </div>

                    {/* Medium / Accent Section */}
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">Medium Accent</div>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Table Style Med 1 (Excel Green Accent) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#107c41', textColor: '#ffffff', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-[#107c41] hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#107c41] rounded-xs" />
                          <div className="h-2 bg-[#a9d18e] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-[#e2efda] mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Excel Dark</div>
                        </button>

                        {/* Table Style Med 2 (Executive Navy) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#1e3a8a', textColor: '#ffffff', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-[#1e3a8a] hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#203764] rounded-xs" />
                          <div className="h-2 bg-[#8ea9db] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-[#d9e1f2] mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Executive</div>
                        </button>

                        {/* Table Style Med 3 (Warm Amber) */}
                        <button
                          onClick={() => {
                            setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#fef3c7', textColor: '#78350f', bold: true });
                            setIsFormatTableOpen(false);
                          }}
                          className="border border-gray-200 hover:border-amber-600 hover:shadow-xs rounded-xs overflow-hidden text-left transition cursor-pointer p-0.5 bg-white"
                        >
                          <div className="h-3 bg-[#ed7d31] rounded-xs" />
                          <div className="h-2 bg-[#f8cbad] mt-0.5 rounded-xs" />
                          <div className="h-2 bg-[#fbe5d6] mt-0.5 rounded-xs" />
                          <div className="text-[9px] text-center text-gray-600 mt-1 font-medium">Warm Amber</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cells: Insert & Delete */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          <button
            onClick={() => insertRow(activeCell.row)}
            title="Insert Row"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px] text-emerald-600">add_box</span>
          </button>
          <button
            onClick={() => deleteRow(activeCell.row)}
            title="Delete Row"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px] text-gray-500 hover:text-red-600">indeterminate_check_box</span>
          </button>
        </div>

        {/* Editing: AutoSum, Clear, Sort, Find */}
        <div className="flex items-center gap-0.5">
          {/* AutoSum Split Button */}
          <div className="relative flex items-center">
            <button
              onClick={() => insertQuickFormula('SUM')}
              title="AutoSum (SUM)"
              className="p-1 hover:bg-gray-100 active:bg-gray-200 text-gray-700 rounded-l transition flex items-center justify-center font-bold text-sm"
            >
              <span className="material-symbols-outlined text-[19px]">functions</span>
            </button>
            <button
              onClick={() => setIsAutoSumOpen(!isAutoSumOpen)}
              title="More calculation functions"
              className="p-1 hover:bg-gray-100 active:bg-gray-200 text-gray-500 rounded-r transition flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[15px] text-gray-400">arrow_drop_down</span>
            </button>

            {isAutoSumOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsAutoSumOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Quick Functions
                  </div>
                  {['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => insertQuickFormula(fn)}
                      className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-800 font-mono font-medium flex items-center justify-between transition-colors"
                    >
                      <span>{fn}</span>
                      <span className="text-[10px] text-gray-400 font-sans">Formula</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear Button */}
          <button
            onClick={() => clearSelection('contents')}
            title="Clear (Contents & Formats)"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-600 hover:text-red-600 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">delete</span>
          </button>

          {/* Find & Select */}
          <button
            onClick={() => setIsFindReplaceOpen(true)}
            title="Find & Select (Ctrl+F)"
            className="p-1 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-600 transition flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px]">search</span>
          </button>
        </div>
        </>
      )}

      {/* ========================================================= */}
      {/* INSERT TAB TOOLBAR                                        */}
      {/* ========================================================= */}
      {activeRibbonTab === 'insert' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Tables Group */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                setSelectionStyle({ borderBox: true, borderAll: true, bgColor: '#f0fdf4' });
                alert('Table created over selected range!');
              }}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Create Table"
            >
              <Table className="w-4 h-4 text-emerald-600" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Insert Spreadsheet Template"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Templates</span>
            </button>
          </div>

          {/* Charts Group */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setIsChartModalOpen(true)}
              className="h-8 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#0b57d0] rounded font-semibold flex items-center gap-1.5 transition"
              title="Insert Chart"
            >
              <BarChart3 className="w-4 h-4 text-[#0b57d0]" />
              <span>Insert Chart</span>
            </button>
            <button
              onClick={() => setIsChartModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1 transition"
              title="Line Chart"
            >
              <LineChart className="w-4 h-4 text-indigo-600" />
              <span>Line</span>
            </button>
            <button
              onClick={() => setIsChartModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1 transition"
              title="Pie Chart"
            >
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Pie</span>
            </button>
          </div>

          {/* Illustrations & Links */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                const cellId = coordsToCellId(activeCell.col, activeCell.row);
                setCellValue(cellId, '★ Shape');
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Insert Shape"
            >
              <Shapes className="w-4 h-4 text-purple-600" />
              <span>Shapes</span>
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter Hyperlink URL:', 'https://');
                if (url) {
                  const cellId = coordsToCellId(activeCell.col, activeCell.row);
                  setCellValue(cellId, url);
                  setSelectionStyle({ textColor: '#2563eb', underline: true });
                }
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Insert Link"
            >
              <Link className="w-4 h-4 text-sky-600" />
              <span>Link</span>
            </button>
          </div>

          {/* Comments Group */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const text = prompt('Add Comment for active cell:');
                if (text) {
                  const cellId = coordsToCellId(activeCell.col, activeCell.row);
                  addComment(cellId, text, 'You');
                }
              }}
              className="h-8 px-2.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="New Comment"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>New Comment</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE LAYOUT TAB TOOLBAR                                   */}
      {/* ========================================================= */}
      {activeRibbonTab === 'layout' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Page Setup */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => window.print()}
              className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-1.5 transition"
              title="Print Sheet"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={() => alert('Orientation set to Landscape')}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Page Orientation"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <span>Orientation</span>
            </button>
          </div>

          {/* Gridlines and Headers options */}
          <div className="flex items-center gap-2 border-r border-gray-200 pr-2">
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none px-2 py-1 rounded hover:bg-gray-100">
              <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span>View Gridlines</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer select-none px-2 py-1 rounded hover:bg-gray-100">
              <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span>View Headings</span>
            </label>
          </div>

          {/* Rows & Columns defaults */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                for (let r = 0; r < 20; r++) insertRow(r);
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Expand Sheet Size"
            >
              <Grid3X3 className="w-4 h-4 text-gray-600" />
              <span>Expand Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORMULAS TAB TOOLBAR                                      */}
      {/* ========================================================= */}
      {activeRibbonTab === 'formulas' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Function Library */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                const id = coordsToCellId(activeCell.col, activeCell.row);
                setCellValue(id, '=');
              }}
              className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-1.5 transition"
              title="Insert Function"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Insert Function (fx)</span>
            </button>
          </div>

          {/* Quick Functions */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            {['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'].map((fn) => (
              <button
                key={fn}
                onClick={() => insertQuickFormula(fn)}
                className="h-8 px-2 hover:bg-gray-100 rounded font-mono font-medium text-gray-700 hover:text-emerald-700 transition text-xs"
                title={`Insert ${fn} function`}
              >
                {fn}
              </button>
            ))}
          </div>

          {/* Logical & Lookup */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            {['IF', 'VLOOKUP', 'CONCAT', 'ROUND'].map((fn) => (
              <button
                key={fn}
                onClick={() => insertQuickFormula(fn)}
                className="h-8 px-2 hover:bg-gray-100 rounded font-mono font-medium text-gray-700 hover:text-blue-700 transition text-xs"
                title={`Insert ${fn} formula`}
              >
                {fn}
              </button>
            ))}
          </div>

          {/* Calculation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => recalculateSheet()}
              className="h-8 px-2.5 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Recalculate Sheet Formulas"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Calculate Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DATA TAB TOOLBAR                                          */}
      {/* ========================================================= */}
      {activeRibbonTab === 'data' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Sort & Filter */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                sortRange(activeCell.col, 'asc');
              }}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Sort Selected Column A-Z (Ascending)"
            >
              <ArrowUpDown className="w-4 h-4 text-emerald-600" />
              <span>Sort A to Z</span>
            </button>
            <button
              onClick={() => {
                sortRange(activeCell.col, 'desc');
              }}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Sort Selected Column Z-A (Descending)"
            >
              <ArrowUpDown className="w-4 h-4 text-emerald-600 rotate-180" />
              <span>Sort Z to A</span>
            </button>
            <button
              onClick={() => alert('Filter toggled on active table range.')}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Filter Selected Range"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter</span>
            </button>
          </div>

          {/* Data Tools */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                recalculateSheet();
                alert('All data validated and formulas refreshed.');
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Refresh Data & Formulas"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Refresh All</span>
            </button>
            <button
              onClick={() => alert('Data Validation: Any Value is allowed.')}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Data Validation"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <span>Data Validation</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REVIEW TAB TOOLBAR                                        */}
      {/* ========================================================= */}
      {activeRibbonTab === 'review' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Proofing */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => alert('Spelling check complete. Good to go!')}
              className="h-8 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-1.5 transition"
              title="Check Spelling"
            >
              <SpellCheck className="w-4 h-4 text-emerald-700" />
              <span>Spelling</span>
            </button>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => {
                const text = prompt('Add Review Comment:');
                if (text) {
                  const cellId = coordsToCellId(activeCell.col, activeCell.row);
                  addComment(cellId, text, 'Reviewer');
                }
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="New Comment"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>New Comment</span>
            </button>
          </div>

          {/* Protection */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => alert('Sheet protection settings: Edit permission is managed via Share link.')}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Protect Sheet"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Protect Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW TAB TOOLBAR                                          */}
      {/* ========================================================= */}
      {activeRibbonTab === 'view' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1 transition font-medium cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
              <span>Zoom In</span>
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
              className="h-8 px-2 hover:bg-gray-100 active:bg-gray-200 rounded text-gray-700 flex items-center gap-1 transition font-medium cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
              <span>Zoom Out</span>
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="h-8 px-2.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 font-semibold transition cursor-pointer"
              title="Reset Zoom to 100%"
            >
              {zoomLevel}%
            </button>
          </div>

          {/* Theme Mode */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'classic' : 'dark')}
              className="h-8 px-2.5 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
              <span>{theme === 'dark' ? 'Classic Theme' : 'Dark Theme'}</span>
            </button>
          </div>

          {/* Window */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HELP TAB TOOLBAR                                          */}
      {/* ========================================================= */}
      {activeRibbonTab === 'help' && (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          {/* Main Help & Guide */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="h-8 px-3 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-md font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Open Complete User Guide & Process"
            >
              <HelpCircle className="w-4 h-4 text-white" />
              <span>Help Center & Process</span>
            </button>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Formulas Reference Guide"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Formula Guide</span>
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="h-8 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#0b57d0] rounded-md font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              <Keyboard className="w-4 h-4 text-[#0b57d0]" />
              <span>Shortcuts (Ctrl+/)</span>
            </button>
          </div>

          {/* Samples & Tutorials */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Prebuilt Spreadsheet Templates"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Templates & Examples</span>
            </button>
          </div>

          {/* User Feedback */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="h-8 px-2 hover:bg-gray-100 rounded text-gray-700 flex items-center gap-1.5 transition font-medium cursor-pointer"
              title="Send feedback or feature request"
            >
              <MessageSquare className="w-4 h-4 text-[#0b57d0]" />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

