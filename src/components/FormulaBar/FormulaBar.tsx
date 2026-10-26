import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSpreadsheetStore } from '../../store/useSpreadsheetStore';
import { coordsToCellId, cellIdToCoords } from '../../engine/helpers';

const FORMULA_LIST = [
  { name: 'SUM', syntax: 'SUM(number1, [number2], ...)', desc: 'Adds all numbers in a range of cells.' },
  { name: 'AVERAGE', syntax: 'AVERAGE(number1, [number2], ...)', desc: 'Returns the average (arithmetic mean) of arguments.' },
  { name: 'COUNT', syntax: 'COUNT(value1, [value2], ...)', desc: 'Counts the number of cells that contain numbers.' },
  { name: 'COUNTA', syntax: 'COUNTA(value1, [value2], ...)', desc: 'Counts the number of non-empty cells.' },
  { name: 'IF', syntax: 'IF(logical_test, value_if_true, [value_if_false])', desc: 'Checks whether a condition is met, and returns one value if TRUE, and another if FALSE.' },
  { name: 'VLOOKUP', syntax: 'VLOOKUP(lookup_value, table_array, col_index, [range_lookup])', desc: 'Looks for a value in the leftmost column of a table.' },
  { name: 'MAX', syntax: 'MAX(number1, [number2], ...)', desc: 'Returns the largest value in a set of values.' },
  { name: 'MIN', syntax: 'MIN(number1, [number2], ...)', desc: 'Returns the smallest number in a set of values.' },
  { name: 'PRODUCT', syntax: 'PRODUCT(number1, [number2], ...)', desc: 'Multiplies all the numbers given as arguments.' },
  { name: 'ROUND', syntax: 'ROUND(number, num_digits)', desc: 'Rounds a number to a specified number of digits.' },
  { name: 'CONCAT', syntax: 'CONCAT(text1, [text2], ...)', desc: 'Combines the text from multiple ranges and/or strings.' },
  { name: 'UPPER', syntax: 'UPPER(text)', desc: 'Converts text to uppercase.' },
  { name: 'LOWER', syntax: 'LOWER(text)', desc: 'Converts text to lowercase.' },
  { name: 'TRIM', syntax: 'TRIM(text)', desc: 'Removes all spaces from text except for single spaces between words.' },
  { name: 'LEN', syntax: 'LEN(text)', desc: 'Returns the number of characters in a text string.' },
  { name: 'NOW', syntax: 'NOW()', desc: 'Returns the current date and time.' },
  { name: 'TODAY', syntax: 'TODAY()', desc: 'Returns the current date.' },
  { name: 'SQRT', syntax: 'SQRT(number)', desc: 'Returns the square root of a number.' }
];

export const FormulaBar: React.FC = () => {
  const { activeCell, setActiveCell, setSelection, sheets, activeSheetId, setCellValue, permissionMode } = useSpreadsheetStore();
  const currentSheet = sheets.find(s => s.id === activeSheetId);
  const cellId = coordsToCellId(activeCell.col, activeCell.row);
  const cell = currentSheet?.data[cellId];
  const isReadOnly = permissionMode === 'view';

  const [formulaValue, setFormulaValue] = useState('');
  const [nameBoxInput, setNameBoxInput] = useState(cellId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchingFormulas, setMatchingFormulas] = useState<typeof FORMULA_LIST>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const originalValueRef = useRef<string>('');

  useEffect(() => {
    const rawVal = cell?.raw ?? '';
    originalValueRef.current = rawVal;
    setFormulaValue(rawVal);
    setNameBoxInput(cellId);
    setShowSuggestions(false);
  }, [cellId]);

  // Keep formula bar in sync if cell value was changed externally (e.g. from grid editing)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      const rawVal = cell?.raw ?? '';
      originalValueRef.current = rawVal;
      setFormulaValue(rawVal);
    }
  }, [cell?.raw]);

  const handleCommit = () => {
    if (isReadOnly) return;
    setCellValue(cellId, formulaValue);
    originalValueRef.current = formulaValue;
    setShowSuggestions(false);
  };

  const handleCancel = () => {
    if (isReadOnly) return;
    const prev = originalValueRef.current;
    setFormulaValue(prev);
    setCellValue(cellId, prev);
    setShowSuggestions(false);
  };

  const handleNameBoxKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const coords = cellIdToCoords(nameBoxInput.trim());
      if (coords) {
        setActiveCell(coords);
        setSelection({ start: coords, end: coords });
      } else {
        setNameBoxInput(cellId);
      }
    }
  };

  const handleFormulaChange = (val: string) => {
    setFormulaValue(val);
    // Real-time live update into cell as user types (Excel 365 behavior)
    setCellValue(cellId, val, true);

    if (val.startsWith('=')) {
      const query = val.slice(1).toUpperCase();
      if (query.length > 0 && !query.includes('(')) {
        const matches = FORMULA_LIST.filter(f => f.name.startsWith(query));
        setMatchingFormulas(matches);
        setShowSuggestions(matches.length > 0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const selectSuggestion = (fnName: string) => {
    const newVal = '=' + fnName + '(';
    setFormulaValue(newVal);
    setCellValue(cellId, newVal, true);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Tab' && showSuggestions && matchingFormulas.length > 0) {
      e.preventDefault();
      selectSuggestion(matchingFormulas[0].name);
    }
  };

  return (
    <div 
      id="tutorial-target-formulabar"
      className={`flex items-center px-3 bg-white border-b border-gray-200 text-xs select-none relative z-10 transition-all ${
      isExpanded ? 'h-16' : 'h-7'
    }`}>
      {/* Name Box (Jump to cell address) */}
      <div className="flex items-center border border-gray-300 rounded bg-white hover:border-gray-400 focus-within:border-[#0b57d0] h-5 px-1.5 w-20 shrink-0">
        <input
          type="text"
          value={nameBoxInput}
          onChange={(e) => setNameBoxInput(e.target.value.toUpperCase())}
          onKeyDown={handleNameBoxKeyDown}
          className="w-full font-mono font-semibold text-gray-700 outline-none text-[11px] uppercase bg-transparent"
        />
        <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0 cursor-pointer">arrow_drop_down</span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200 mx-2" />

      {/* Cancel, Commit & fx Buttons */}
      <div className="flex items-center gap-0.5 text-gray-400">
        <button
          onClick={handleCancel}
          disabled={isReadOnly}
          title="Cancel"
          className="p-1 hover:text-red-500 hover:bg-gray-100 rounded transition flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
        <button
          onClick={handleCommit}
          disabled={isReadOnly}
          title="Enter"
          className="p-1 hover:text-[#0b57d0] hover:bg-gray-100 rounded transition flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-[16px]">check</span>
        </button>
        <button
          onClick={() => {
            if (isReadOnly) return;
            if (!formulaValue.startsWith('=')) {
              setFormulaValue('=');
              setCellValue(cellId, '=', true);
            }
            setShowSuggestions(true);
            setMatchingFormulas(FORMULA_LIST);
            inputRef.current?.focus();
          }}
          disabled={isReadOnly}
          title="Insert Function"
          className="px-1.5 py-0.5 text-gray-600 hover:text-[#0b57d0] hover:bg-blue-50 rounded font-serif italic font-bold text-xs disabled:opacity-30 disabled:pointer-events-none"
        >
          fx
        </button>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-gray-200 mx-2" />

      {/* Formula Input Box */}
      <div className="flex-1 relative flex items-center h-full">
        <input
          ref={inputRef}
          type="text"
          value={formulaValue}
          readOnly={isReadOnly}
          onChange={(e) => !isReadOnly && handleFormulaChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => !isReadOnly && setTimeout(handleCommit, 200)}
          placeholder={isReadOnly ? "View only mode (Editing disabled)" : "Enter a value or formula"}
          className={`w-full h-full font-mono text-xs outline-none bg-transparent px-1 font-normal ${
            isReadOnly ? 'text-gray-500 cursor-default placeholder-gray-400 italic' : 'text-gray-800 placeholder-gray-400'
          }`}
        />

        {/* Live Formula Autocomplete Popover */}
        {showSuggestions && matchingFormulas.length > 0 && (
          <div className="absolute left-0 top-7 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              Functions (Press Tab to select)
            </div>
            <div className="max-h-56 overflow-y-auto">
              {matchingFormulas.map((f) => (
                <div
                  key={f.name}
                  onMouseDown={() => selectSuggestion(f.name)}
                  className="px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-800">{f.name}</span>
                    <span className="text-[10px] font-mono text-gray-400">{f.syntax}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expand / Collapse Button on Far Right */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse formula bar' : 'Expand formula bar'}
        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition ml-2 flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[17px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
    </div>
  );
};

