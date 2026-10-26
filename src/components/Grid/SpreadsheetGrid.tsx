import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { colIndexToLetter, coordsToCellId, cellIdToCoords, isColorDark, generateFilledCell } from '../../engine/helpers';
import { CellCoords, SelectionRange } from '../../types/spreadsheet';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  PlusSquare, 
  MinusSquare, 
  Trash2, 
  MessageSquarePlus, 
  MessageSquare,
  Check
} from 'lucide-react';

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const HEADER_COL_WIDTH = 45;

export const SpreadsheetGrid: React.FC = () => {
  const {
    sheets,
    activeSheetId,
    activeCell,
    setActiveCell,
    selection,
    setSelection,
    setCellValue,
    batchSetCells,
    selectAll,
    selectRow,
    selectColumn,
    setColWidth,
    setRowHeight,
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    clearSelection,
    setSelectionStyle,
    setClipboardCell,
    addComment,
    deleteComment,
    zoomLevel,
    theme,
    permissionMode
  } = useSpreadsheetStore();

  const isReadOnly = permissionMode === 'view';
  const currentSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isFillDragging, setIsFillDragging] = useState(false);
  const [fillEndCell, setFillEndCell] = useState<CellCoords | null>(null);
  const [resizingCol, setResizingCol] = useState<{ col: number; startX: number; startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ row: number; startY: number; startHeight: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; col: number; row: number } | null>(null);
  const [commentModal, setCommentModal] = useState<{ cellId: string; text: string } | null>(null);
  const [hoveredComment, setHoveredComment] = useState<{ x: number; y: number; cellId: string } | null>(null);

  const fillDragStateRef = useRef<{
    isDragging: boolean;
    sourceMinCol: number;
    sourceMaxCol: number;
    sourceMinRow: number;
    sourceMaxRow: number;
    currentEnd: CellCoords | null;
  }>({
    isDragging: false,
    sourceMinCol: 0,
    sourceMaxCol: 0,
    sourceMinRow: 0,
    sourceMaxRow: 0,
    currentEnd: null
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.max(currentSheet.rowCount, 60);
  const colCount = Math.max(currentSheet.colCount, 26);

  const getColWidth = (c: number) => currentSheet.colWidths?.[c] ?? DEFAULT_COL_WIDTH;
  const getRowHeight = (r: number) => currentSheet.rowHeights?.[r] ?? DEFAULT_ROW_HEIGHT;

  const startEdit = useCallback((cellId: string, initialVal?: string) => {
    if (permissionMode === 'view') return;
    setEditingCell(cellId);
    setEditInput(initialVal !== undefined ? initialVal : currentSheet.data[cellId]?.raw ?? '');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [currentSheet.data, permissionMode]);

  const commitEdit = useCallback(() => {
    if (editingCell) {
      setCellValue(editingCell, editInput);
      setEditingCell(null);
    }
  }, [editingCell, editInput, setCellValue]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleCellClick = (col: number, row: number, e: React.MouseEvent) => {
    const coords: CellCoords = { col, row };
    commitEdit();
    setContextMenu(null);
    setActiveCell(coords);
    if (e.shiftKey) {
      setSelection({
        start: selection.start,
        end: coords
      });
    } else {
      setSelection({
        start: coords,
        end: coords
      });
    }
  };

  const handleMouseDown = (col: number, row: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsMouseDown(true);
    setContextMenu(null);
    const coords: CellCoords = { col, row };
    commitEdit();
    setActiveCell(coords);
    setSelection({
      start: coords,
      end: coords
    });
  };

  const handleMouseEnter = (col: number, row: number) => {
    if (fillDragStateRef.current.isDragging) {
      fillDragStateRef.current.currentEnd = { col, row };
      setFillEndCell({ col, row });
      return;
    }
    if (isMouseDown) {
      setSelection({
        start: selection.start,
        end: { col, row }
      });
    }
  };

  const handleContextMenu = (col: number, row: number, e: React.MouseEvent) => {
    e.preventDefault();
    const coords: CellCoords = { col, row };
    setActiveCell(coords);
    setSelection({ start: coords, end: coords });
    setContextMenu({ x: e.clientX, y: e.clientY, col, row });
  };

  // Column resizing handlers
  const handleColResizeMouseDown = (col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingCol({ col, startX: e.clientX, startWidth: getColWidth(col) });
  };

  // Row resizing handlers
  const handleRowResizeMouseDown = (row: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingRow({ row, startY: e.clientY, startHeight: getRowHeight(row) });
  };

  const handleFillHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isReadOnly) return;
    commitEdit();

    const minC = Math.min(selection.start.col, selection.end.col);
    const maxC = Math.max(selection.start.col, selection.end.col);
    const minR = Math.min(selection.start.row, selection.end.row);
    const maxR = Math.max(selection.start.row, selection.end.row);

    fillDragStateRef.current = {
      isDragging: true,
      sourceMinCol: minC,
      sourceMaxCol: maxC,
      sourceMinRow: minR,
      sourceMaxRow: maxR,
      currentEnd: { col: maxC, row: maxR }
    };
    setIsFillDragging(true);
    setFillEndCell({ col: maxC, row: maxR });
  };

  const executeFill = useCallback((targetEndCol: number, targetEndRow: number) => {
    const { sourceMinCol, sourceMaxCol, sourceMinRow, sourceMaxRow } = fillDragStateRef.current;
    if (sourceMinCol === undefined) return;

    // Determine fill direction (row-wise down/up, or col-wise right/left)
    const deltaDown = targetEndRow - sourceMaxRow;
    const deltaUp = sourceMinRow - targetEndRow;
    const deltaRight = targetEndCol - sourceMaxCol;
    const deltaLeft = sourceMinCol - targetEndCol;

    const maxDelta = Math.max(deltaDown, deltaUp, deltaRight, deltaLeft);
    if (maxDelta <= 0) return; // No drag extension

    const updates: { [cellId: string]: { raw: string; style?: any } } = {};

    // 1. Dragging Down (Most common)
    if (maxDelta === deltaDown) {
      for (let c = sourceMinCol; c <= sourceMaxCol; c++) {
        // Collect source column slice
        const sourceCells: Array<{ raw: string; value: any; style?: any }> = [];
        for (let r = sourceMinRow; r <= sourceMaxRow; r++) {
          const id = coordsToCellId(c, r);
          const cell = currentSheet.data[id];
          sourceCells.push({
            raw: cell?.raw ?? '',
            value: cell?.value ?? '',
            style: cell?.style
          });
        }

        let step = 0;
        for (let r = sourceMaxRow + 1; r <= targetEndRow; r++) {
          const filled = generateFilledCell(sourceCells, step, 0, r - (sourceMinRow + (step % sourceCells.length)));
          const targetId = coordsToCellId(c, r);
          updates[targetId] = filled;
          step++;
        }
      }
      setSelection({
        start: { col: sourceMinCol, row: sourceMinRow },
        end: { col: sourceMaxCol, row: targetEndRow }
      });
    } 
    // 2. Dragging Right
    else if (maxDelta === deltaRight) {
      for (let r = sourceMinRow; r <= sourceMaxRow; r++) {
        // Collect source row slice
        const sourceCells: Array<{ raw: string; value: any; style?: any }> = [];
        for (let c = sourceMinCol; c <= sourceMaxCol; c++) {
          const id = coordsToCellId(c, r);
          const cell = currentSheet.data[id];
          sourceCells.push({
            raw: cell?.raw ?? '',
            value: cell?.value ?? '',
            style: cell?.style
          });
        }

        let step = 0;
        for (let c = sourceMaxCol + 1; c <= targetEndCol; c++) {
          const filled = generateFilledCell(sourceCells, step, c - (sourceMinCol + (step % sourceCells.length)), 0);
          const targetId = coordsToCellId(c, r);
          updates[targetId] = filled;
          step++;
        }
      }
      setSelection({
        start: { col: sourceMinCol, row: sourceMinRow },
        end: { col: targetEndCol, row: sourceMaxRow }
      });
    }
    // 3. Dragging Up
    else if (maxDelta === deltaUp) {
      for (let c = sourceMinCol; c <= sourceMaxCol; c++) {
        const sourceCells: Array<{ raw: string; value: any; style?: any }> = [];
        for (let r = sourceMinRow; r <= sourceMaxRow; r++) {
          const id = coordsToCellId(c, r);
          const cell = currentSheet.data[id];
          sourceCells.push({
            raw: cell?.raw ?? '',
            value: cell?.value ?? '',
            style: cell?.style
          });
        }

        let step = 0;
        for (let r = sourceMinRow - 1; r >= targetEndRow; r--) {
          const filled = generateFilledCell(sourceCells, step, 0, r - sourceMinRow);
          const targetId = coordsToCellId(c, r);
          updates[targetId] = filled;
          step++;
        }
      }
      setSelection({
        start: { col: sourceMinCol, row: targetEndRow },
        end: { col: sourceMaxCol, row: sourceMaxRow }
      });
    }
    // 4. Dragging Left
    else if (maxDelta === deltaLeft) {
      for (let r = sourceMinRow; r <= sourceMaxRow; r++) {
        const sourceCells: Array<{ raw: string; value: any; style?: any }> = [];
        for (let c = sourceMinCol; c <= sourceMaxCol; c++) {
          const id = coordsToCellId(c, r);
          const cell = currentSheet.data[id];
          sourceCells.push({
            raw: cell?.raw ?? '',
            value: cell?.value ?? '',
            style: cell?.style
          });
        }

        let step = 0;
        for (let c = sourceMinCol - 1; c >= targetEndCol; c--) {
          const filled = generateFilledCell(sourceCells, step, c - sourceMinCol, 0);
          const targetId = coordsToCellId(c, r);
          updates[targetId] = filled;
          step++;
        }
      }
      setSelection({
        start: { col: targetEndCol, row: sourceMinRow },
        end: { col: sourceMaxCol, row: sourceMaxRow }
      });
    }

    if (Object.keys(updates).length > 0) {
      batchSetCells(updates);
    }
  }, [currentSheet.data, batchSetCells, setSelection]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const deltaX = e.clientX - resizingCol.startX;
        setColWidth(resizingCol.col, Math.max(40, resizingCol.startWidth + deltaX));
      } else if (resizingRow) {
        const deltaY = e.clientY - resizingRow.startY;
        setRowHeight(resizingRow.row, Math.max(20, resizingRow.startHeight + deltaY));
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setResizingCol(null);
      setResizingRow(null);

      if (fillDragStateRef.current.isDragging) {
        const end = fillDragStateRef.current.currentEnd;
        fillDragStateRef.current.isDragging = false;
        setIsFillDragging(false);
        setFillEndCell(null);
        if (end) {
          executeFill(end.col, end.row);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizingRow, setColWidth, setRowHeight, executeFill]);

  // Global click to close context menu
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Keyboard navigation & global Excel shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is editing a cell inside an input, handle only Enter, Escape, Tab
      if (editingCell) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitEdit();
          setActiveCell({ col: activeCell.col, row: Math.min(activeCell.row + 1, rowCount - 1) });
          setSelection({ start: { col: activeCell.col, row: Math.min(activeCell.row + 1, rowCount - 1) }, end: { col: activeCell.col, row: Math.min(activeCell.row + 1, rowCount - 1) } });
        } else if (e.key === 'Escape') {
          cancelEdit();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          commitEdit();
          setActiveCell({ col: Math.min(activeCell.col + 1, colCount - 1), row: activeCell.row });
          setSelection({ start: { col: Math.min(activeCell.col + 1, colCount - 1), row: activeCell.row }, end: { col: Math.min(activeCell.col + 1, colCount - 1), row: activeCell.row } });
        }
        return;
      }

      // If user is typing in any other input element (search, modal inputs), don't trigger grid shortcuts
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // --- 1. Excel Action Shortcuts ---

      // Ctrl + / or ? -> Show Keyboard Shortcuts Modal
      if ((ctrlOrMeta && e.key === '/') || (!ctrlOrMeta && e.key === '?')) {
        e.preventDefault();
        const { setIsShortcutsModalOpen, isShortcutsModalOpen } = useSpreadsheetStore.getState();
        setIsShortcutsModalOpen(!isShortcutsModalOpen);
        return;
      }

      // Ctrl + Z -> Undo
      if (ctrlOrMeta && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (isReadOnly) return;
        const { undo } = useSpreadsheetStore.getState();
        undo();
        return;
      }

      // Ctrl + Y or Ctrl + Shift + Z -> Redo
      if ((ctrlOrMeta && (e.key === 'y' || e.key === 'Y')) || (ctrlOrMeta && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
        e.preventDefault();
        if (isReadOnly) return;
        const { redo } = useSpreadsheetStore.getState();
        redo();
        return;
      }

      // Ctrl + B -> Bold
      if (ctrlOrMeta && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (isReadOnly) return;
        const cellId = coordsToCellId(activeCell.col, activeCell.row);
        const currentBold = !!currentSheet.data[cellId]?.style?.bold;
        setSelectionStyle({ bold: !currentBold });
        return;
      }

      // Ctrl + I -> Italic
      if (ctrlOrMeta && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        if (isReadOnly) return;
        const cellId = coordsToCellId(activeCell.col, activeCell.row);
        const currentItalic = !!currentSheet.data[cellId]?.style?.italic;
        setSelectionStyle({ italic: !currentItalic });
        return;
      }

      // Ctrl + U -> Underline
      if (ctrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        if (isReadOnly) return;
        const cellId = coordsToCellId(activeCell.col, activeCell.row);
        const currentUnderline = !!currentSheet.data[cellId]?.style?.underline;
        setSelectionStyle({ underline: !currentUnderline });
        return;
      }

      // Ctrl + F or Ctrl + H -> Find & Replace
      if (ctrlOrMeta && (e.key === 'f' || e.key === 'F' || e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        const { setIsFindReplaceOpen } = useSpreadsheetStore.getState();
        setIsFindReplaceOpen(true);
        return;
      }

      // Ctrl + A -> Select All
      if (ctrlOrMeta && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        selectAll();
        return;
      }

      // Ctrl + C -> Copy
      if (ctrlOrMeta && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        const cellId = coordsToCellId(activeCell.col, activeCell.row);
        const cell = currentSheet.data[cellId];
        setClipboardCell(cell ? { raw: cell.raw, style: cell.style } : { raw: '' });
        return;
      }

      // Ctrl + X -> Cut
      if (ctrlOrMeta && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        if (isReadOnly) return;
        const cellId = coordsToCellId(activeCell.col, activeCell.row);
        const cell = currentSheet.data[cellId];
        setClipboardCell(cell ? { raw: cell.raw, style: cell.style } : { raw: '' });
        setCellValue(cellId, '');
        return;
      }

      // Ctrl + V -> Paste
      if (ctrlOrMeta && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        if (isReadOnly) return;
        const { clipboardCell } = useSpreadsheetStore.getState();
        if (clipboardCell) {
          const cellId = coordsToCellId(activeCell.col, activeCell.row);
          setCellValue(cellId, clipboardCell.raw);
          if (clipboardCell.style) {
            setSelectionStyle(clipboardCell.style);
          }
        }
        return;
      }

      // Ctrl + Home -> Jump to A1
      if (ctrlOrMeta && e.key === 'Home') {
        e.preventDefault();
        setActiveCell({ col: 0, row: 0 });
        setSelection({ start: { col: 0, row: 0 }, end: { col: 0, row: 0 } });
        return;
      }

      // Ctrl + End -> Jump to last data cell
      if (ctrlOrMeta && e.key === 'End') {
        e.preventDefault();
        const keys = Object.keys(currentSheet.data);
        let maxC = 0;
        let maxR = 0;
        for (const k of keys) {
          const c = cellIdToCoords(k);
          if (c) {
            maxC = Math.max(maxC, c.col);
            maxR = Math.max(maxR, c.row);
          }
        }
        setActiveCell({ col: maxC, row: maxR });
        setSelection({ start: { col: maxC, row: maxR }, end: { col: maxC, row: maxR } });
        return;
      }

      // Shift + Space -> Select Entire Row
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        selectRow(activeCell.row);
        return;
      }

      // Ctrl + Space -> Select Entire Column
      if (ctrlOrMeta && e.code === 'Space') {
        e.preventDefault();
        selectColumn(activeCell.col);
        return;
      }

      // Navigation with Shift (Expand selection) or normal movement
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
        e.preventDefault();
        let { col, row } = activeCell;
        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown' || e.key === 'Enter') row = Math.min(rowCount - 1, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight' || e.key === 'Tab') col = Math.min(colCount - 1, col + 1);

        const newCoords = { col, row };

        if (e.shiftKey && !['Tab', 'Enter'].includes(e.key)) {
          // Keep activeCell same, expand selection.end
          setSelection({
            start: selection.start,
            end: newCoords
          });
        } else {
          setActiveCell(newCoords);
          setSelection({ start: newCoords, end: newCoords });
        }
        return;
      }

      // Delete or Backspace -> Clear selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (isReadOnly) return;
        clearSelection('contents');
        return;
      }

      // Direct Typing -> start inline edit
      if (e.key.length === 1 && !ctrlOrMeta && !e.altKey) {
        if (isReadOnly) return;
        const id = coordsToCellId(activeCell.col, activeCell.row);
        startEdit(id, e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCell,
    editingCell,
    selection,
    rowCount,
    colCount,
    currentSheet.data,
    commitEdit,
    cancelEdit,
    startEdit,
    setCellValue,
    setActiveCell,
    setSelection,
    setSelectionStyle,
    selectAll,
    selectRow,
    selectColumn,
    clearSelection,
    setClipboardCell,
    isReadOnly
  ]);

  const minCol = Math.min(selection.start.col, selection.end.col);
  const maxCol = Math.max(selection.start.col, selection.end.col);
  const minRow = Math.min(selection.start.row, selection.end.row);
  const maxRow = Math.max(selection.start.row, selection.end.row);

  // Drag fill bounding box preview
  const fillMinCol = isFillDragging && fillEndCell ? Math.min(minCol, fillEndCell.col) : minCol;
  const fillMaxCol = isFillDragging && fillEndCell ? Math.max(maxCol, fillEndCell.col) : maxCol;
  const fillMinRow = isFillDragging && fillEndCell ? Math.min(minRow, fillEndCell.row) : minRow;
  const fillMaxRow = isFillDragging && fillEndCell ? Math.max(maxRow, fillEndCell.row) : maxRow;

  return (
    <div
      id="tutorial-target-grid"
      ref={gridContainerRef}
      className={
        'flex-1 overflow-auto relative select-none bg-white font-sans ' +
        (theme === 'dark' ? 'bg-zinc-900 text-gray-100' : '')
      }
      style={{ zoom: `${zoomLevel}%` }}
    >
      <div className="inline-block min-w-full">
        {/* Sticky Column Header Row */}
        <div className="sticky top-0 z-20 flex bg-[#f8f9fa] border-b border-gray-300 text-xs font-semibold text-gray-600">
          {/* Top-Left Corner Cell (Select All) */}
          <div
            onClick={selectAll}
            className="sticky left-0 z-30 bg-[#f1f3f4] border-r border-gray-300 flex items-center justify-center font-bold text-gray-400 hover:bg-gray-200 cursor-pointer transition"
            style={{ width: HEADER_COL_WIDTH, height: DEFAULT_ROW_HEIGHT }}
            title="Select All (Ctrl+A)"
          >
            <div className="w-2.5 h-2.5 border-r border-b border-gray-400 transform rotate-45" />
          </div>

          {/* Column letters */}
          {Array.from({ length: colCount }).map((_, c) => {
            const isColActive = activeCell.col === c;
            const isColSelected = c >= minCol && c <= maxCol;
            const colW = getColWidth(c);

            return (
              <div
                key={c}
                onClick={() => selectColumn(c)}
                className={
                  'border-r border-gray-300 flex items-center justify-center relative cursor-pointer select-none transition-colors text-[11px] ' +
                  (isColActive
                    ? 'bg-[#1a73e8] !text-white font-bold'
                    : isColSelected
                    ? 'bg-[#e8f0fe] !text-[#1a73e8] font-bold'
                    : 'bg-[#f8f9fa] !text-gray-700 font-semibold hover:bg-gray-200')
                }
                style={{ 
                  width: colW, 
                  height: DEFAULT_ROW_HEIGHT,
                  backgroundColor: isColActive ? '#1a73e8' : isColSelected ? '#e8f0fe' : '#f8f9fa',
                  color: isColActive ? '#ffffff' : isColSelected ? '#1a73e8' : '#374151'
                }}
              >
                <span 
                  className="leading-none"
                  style={{ color: isColActive ? '#ffffff' : isColSelected ? '#1a73e8' : '#374151' }}
                >
                  {colIndexToLetter(c)}
                </span>

                {/* Column resize draggable divider handle */}
                <div
                  onMouseDown={(e) => handleColResizeMouseDown(c, e)}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#1a73e8] z-10"
                  title="Drag to resize column"
                />
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        {Array.from({ length: rowCount }).map((_, r) => {
          const isRowActive = activeCell.row === r;
          const isRowSelected = r >= minRow && r <= maxRow;
          const rowH = getRowHeight(r);

          return (
            <div key={r} className="flex border-b border-gray-200">
              {/* Sticky Row Number */}
              <div
                onClick={() => selectRow(r)}
                className={
                  'sticky left-0 z-10 border-r border-gray-300 flex items-center justify-center text-[11px] select-none cursor-pointer transition-colors relative ' +
                  (isRowActive
                    ? 'bg-[#1a73e8] !text-white font-bold'
                    : isRowSelected
                    ? 'bg-[#e8f0fe] !text-[#1a73e8] font-bold'
                    : 'bg-[#f8f9fa] !text-gray-700 font-semibold hover:bg-gray-200')
                }
                style={{ 
                  width: HEADER_COL_WIDTH, 
                  height: rowH,
                  backgroundColor: isRowActive ? '#1a73e8' : isRowSelected ? '#e8f0fe' : '#f8f9fa',
                  color: isRowActive ? '#ffffff' : isRowSelected ? '#1a73e8' : '#374151'
                }}
              >
                <span 
                  className="leading-none"
                  style={{ color: isRowActive ? '#ffffff' : isRowSelected ? '#1a73e8' : '#374151' }}
                >
                  {r + 1}
                </span>

                {/* Row resize draggable divider handle */}
                <div
                  onMouseDown={(e) => handleRowResizeMouseDown(r, e)}
                  className="absolute left-0 right-0 bottom-0 h-1.5 cursor-row-resize hover:bg-[#1a73e8] z-10"
                  title="Drag to resize row"
                />
              </div>

              {/* Cells in Row */}
              {Array.from({ length: colCount }).map((_, c) => {
                const cellId = coordsToCellId(c, r);
                const cell = currentSheet.data[cellId];
                const isActive = activeCell.col === c && activeCell.row === r;
                const isSelected = c >= minCol && c <= maxCol && r >= minRow && r <= maxRow;
                const isEditing = editingCell === cellId;
                const colW = getColWidth(c);

                // Format display value
                const style = cell?.style || {};
                let displayVal = cell?.value ?? '';
                const numVal = Number(displayVal);
                const isNumeric = !isNaN(numVal) && displayVal !== '' && typeof displayVal !== 'boolean';

                if (isNumeric) {
                  const dec = typeof style.decimals === 'number' ? style.decimals : undefined;

                  if (style.format === 'currency') {
                    const minDec = dec !== undefined ? dec : 2;
                    displayVal = '$' + numVal.toLocaleString('en-US', { minimumFractionDigits: minDec, maximumFractionDigits: minDec });
                  } else if (style.format === 'percent') {
                    const minDec = dec !== undefined ? dec : 1;
                    displayVal = (numVal * 100).toFixed(minDec) + '%';
                  } else if (style.format === 'number') {
                    const minDec = dec !== undefined ? dec : 2;
                    displayVal = numVal.toLocaleString('en-US', { minimumFractionDigits: minDec, maximumFractionDigits: minDec });
                  } else if (dec !== undefined) {
                    displayVal = numVal.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
                  }
                }
                const effectiveBg = isSelected && !isActive ? undefined : style.bgColor;
                let effectiveTextColor = style.textColor;

                if (effectiveBg) {
                  const isBgDark = isColorDark(effectiveBg);
                  if (isBgDark) {
                    // Dark background -> white font
                    if (!style.textColor || style.textColor === '#000000' || style.textColor === 'black' || isColorDark(style.textColor)) {
                      effectiveTextColor = '#ffffff';
                    }
                  } else {
                    // Light background -> black font
                    if (!style.textColor || style.textColor === '#ffffff' || style.textColor === 'white' || !isColorDark(style.textColor)) {
                      effectiveTextColor = '#000000';
                    }
                  }
                }

                const isFillSelected = isFillDragging && c >= fillMinCol && c <= fillMaxCol && r >= fillMinRow && r <= fillMaxRow;
                const isBottomRightOfSelection = c === maxCol && r === maxRow;

                return (
                  <div
                    key={cellId}
                    onClick={(e) => handleCellClick(c, r, e)}
                    onMouseDown={(e) => handleMouseDown(c, r, e)}
                    onMouseEnter={() => handleMouseEnter(c, r)}
                    onDoubleClick={() => startEdit(cellId)}
                    onContextMenu={(e) => handleContextMenu(c, r, e)}
                    className={
                      'border-r border-gray-200 px-2 flex items-center text-xs relative select-none truncate transition-colors ' +
                      (isActive
                        ? 'outline-2 outline-[#1a73e8] outline-offset-[-2px] z-10 bg-white shadow-2xs '
                        : isSelected
                        ? 'bg-[#e8f0fe]/80 '
                        : 'hover:bg-gray-50/70 ') +
                      (isFillSelected && !isSelected ? 'bg-blue-50/50 ' : '') +
                      (isFillDragging && r === fillMinRow && c >= fillMinCol && c <= fillMaxCol ? 'border-t-2 !border-t-[#1a73e8] ' : '') +
                      (isFillDragging && r === fillMaxRow && c >= fillMinCol && c <= fillMaxCol ? 'border-b-2 !border-b-[#1a73e8] ' : '') +
                      (isFillDragging && c === fillMinCol && r >= fillMinRow && r <= fillMaxRow ? 'border-l-2 !border-l-[#1a73e8] ' : '') +
                      (isFillDragging && c === fillMaxCol && r >= fillMinRow && r <= fillMaxRow ? 'border-r-2 !border-r-[#1a73e8] ' : '')
                    }
                    style={{
                      width: colW,
                      height: rowH,
                      fontWeight: style.bold ? 'bold' : 'normal',
                      fontStyle: style.italic ? 'italic' : 'normal',
                      textDecoration: [
                        style.underline ? 'underline' : '',
                        style.strikethrough ? 'line-through' : ''
                      ].filter(Boolean).join(' ') || 'none',
                      color: effectiveTextColor,
                      backgroundColor: effectiveBg,
                      fontFamily: style.fontFamily || undefined,
                      fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
                      borderTop: style.borderTop || style.borderAll || style.borderBox ? '1.5px solid #000' : undefined,
                      borderBottom: style.borderBottom || style.borderAll || style.borderBox ? '1.5px solid #000' : undefined,
                      borderLeft: style.borderLeft || style.borderAll || style.borderBox ? '1.5px solid #000' : undefined,
                      borderRight: style.borderRight || style.borderAll || style.borderBox ? '1.5px solid #000' : undefined,
                      justifyContent:
                        style.align === 'right'
                          ? 'flex-end'
                          : style.align === 'center'
                          ? 'center'
                          : 'flex-start',
                      alignItems:
                        style.valign === 'top'
                          ? 'flex-start'
                          : style.valign === 'bottom'
                          ? 'flex-end'
                          : 'center',
                      whiteSpace: style.wrapText ? 'normal' : 'nowrap'
                    }}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onBlur={commitEdit}
                        className="w-full h-full bg-white border-0 outline-none font-mono text-xs text-gray-900"
                      />
                    ) : (
                      <span>{displayVal}</span>
                    )}

                    {/* Cell Comment Marker (Red Triangle in Top-Right) */}
                    {cell?.comment && (
                      <div 
                        onMouseEnter={(e) => setHoveredComment({ x: e.clientX, y: e.clientY, cellId })}
                        onMouseLeave={() => setHoveredComment(null)}
                        className="absolute top-0 right-0 w-0 h-0 border-t-6 border-t-red-500 border-l-6 border-l-transparent z-10 cursor-pointer"
                        title="Contains comment"
                      />
                    )}

                    {/* Drag fill handle on bottom right of selected range / active cell (Google Sheets authentic blue dot) */}
                    {isBottomRightOfSelection && (
                      <div 
                        onMouseDown={handleFillHandleMouseDown}
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#1a73e8] border border-white cursor-crosshair z-30 rounded-xs shadow-xs hover:scale-125 transition-transform"
                        title="Drag to auto-fill cells or copy sequence"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs w-52 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { alert('Cut (Ctrl+X)'); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /><span>Cut</span></div>
            <span className="text-[10px] text-gray-400">Ctrl+X</span>
          </button>
          <button
            onClick={() => { alert('Copy (Ctrl+C)'); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2"><Copy className="w-3.5 h-3.5" /><span>Copy</span></div>
            <span className="text-[10px] text-gray-400">Ctrl+C</span>
          </button>
          <button
            onClick={() => { alert('Paste (Ctrl+V)'); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2"><Clipboard className="w-3.5 h-3.5" /><span>Paste</span></div>
            <span className="text-[10px] text-gray-400">Ctrl+V</span>
          </button>

          <div className="h-px bg-gray-200 my-1" />

          <button
            onClick={() => { insertRow(contextMenu.row); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
          >
            <PlusSquare className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Insert 1 row above</span>
          </button>
          <button
            onClick={() => { insertCol(contextMenu.col); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2"
          >
            <PlusSquare className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Insert 1 column left</span>
          </button>
          <button
            onClick={() => { deleteRow(contextMenu.row); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <MinusSquare className="w-3.5 h-3.5" />
            <span>Delete row</span>
          </button>
          <button
            onClick={() => { deleteCol(contextMenu.col); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <MinusSquare className="w-3.5 h-3.5" />
            <span>Delete column</span>
          </button>

          <div className="h-px bg-gray-200 my-1" />

          <button
            onClick={() => { clearSelection('contents'); setContextMenu(null); }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-gray-100 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Clear contents</span>
          </button>
          <button
            onClick={() => {
              const cellId = coordsToCellId(contextMenu.col, contextMenu.row);
              setCommentModal({ cellId, text: currentSheet.data[cellId]?.comment?.text || '' });
              setContextMenu(null);
            }}
            className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 font-medium"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add / Edit Comment</span>
          </button>
        </div>
      )}

      {/* Hover Comment Tooltip Card */}
      {hoveredComment && currentSheet.data[hoveredComment.cellId]?.comment && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-50 text-xs w-64 pointer-events-none animate-in fade-in duration-100"
          style={{ top: hoveredComment.y + 10, left: hoveredComment.x + 10 }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-1 mb-1.5">
            <span className="font-bold text-gray-800">{currentSheet.data[hoveredComment.cellId]?.comment?.author}</span>
            <span className="text-[10px] text-gray-400">{currentSheet.data[hoveredComment.cellId]?.comment?.timestamp}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{currentSheet.data[hoveredComment.cellId]?.comment?.text}</p>
        </div>
      )}

      {/* Comment Input Modal */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-gray-800">Comment on Cell {commentModal.cellId}</h4>
            </div>
            <textarea
              value={commentModal.text}
              onChange={(e) => setCommentModal({ ...commentModal, text: e.target.value })}
              placeholder="Write a comment or note..."
              rows={3}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-emerald-500 mb-3"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setCommentModal(null)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (commentModal.text.trim()) {
                    addComment(commentModal.cellId, commentModal.text.trim());
                  } else {
                    deleteComment(commentModal.cellId);
                  }
                  setCommentModal(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

