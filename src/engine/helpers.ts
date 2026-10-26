import { CellCoords } from '../types/spreadsheet';

export function colIndexToLetter(col: number): string {
  let temp = col;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function letterToColIndex(letters: string): number {
  let col = 0;
  const upper = letters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function cellIdToCoords(cellId: string): CellCoords | null {
  const match = cellId.toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const col = letterToColIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { col, row };
}

export function coordsToCellId(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

export function parseRange(rangeStr: string): { start: CellCoords; end: CellCoords } | null {
  const parts = rangeStr.toUpperCase().split(':');
  if (parts.length === 1) {
    const coords = cellIdToCoords(parts[0]);
    if (!coords) return null;
    return { start: coords, end: coords };
  }
  if (parts.length === 2) {
    const c1 = cellIdToCoords(parts[0]);
    const c2 = cellIdToCoords(parts[1]);
    if (!c1 || !c2) return null;
    return {
      start: { col: Math.min(c1.col, c2.col), row: Math.min(c1.row, c2.row) },
      end: { col: Math.max(c1.col, c2.col), row: Math.max(c1.row, c2.row) }
    };
  }
  return null;
}

export function isColorDark(color?: string): boolean {
  if (!color) return false;
  let c = color.trim().toLowerCase();
  if (c === 'transparent') return false;

  // Handle hex #rgb or #rrggbb
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Relative luminance formula
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance < 140;
    }
  }

  // Handle rgb / rgba
  const rgbMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 140;
  }

  // Named dark colors
  const darkNames = ['black', 'navy', 'darkblue', 'indigo', 'maroon', 'purple', 'darkgreen', 'darkred', 'darkgray', 'darkgrey', 'midnightblue'];
  return darkNames.includes(c);
}

// Security signature generator for signed share tokens
export function generateShareSignature(docId: string, mode: string): string {
  const secret = 'libre_excel_sig_salt_987654';
  const str = `${docId}_${mode}_${secret}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export function verifyShareSignature(docId: string, mode: string, token: string): boolean {
  return generateShareSignature(docId, mode) === token;
}

/**
 * Adjusts relative formula cell coordinates when drag-filling across rows/columns.
 * E.g., =A1+B1 dragged 1 row down becomes =A2+B2, dragged 1 col right becomes =B1+C1.
 * Supports $ absolute anchors like $A$1, $A1, A$1.
 */
export function adjustFormulaReferences(formula: string, deltaCol: number, deltaRow: number): string {
  if (!formula.startsWith('=')) return formula;
  
  // Regex to match cell references with optional dollar signs: ($?)([A-Z]+)($?)([0-9]+)
  return formula.replace(/(\$?)([A-Z]+)(\$?)([0-9]+)/gi, (match, colLock, colLetters, rowLock, rowStr) => {
    let col = letterToColIndex(colLetters);
    let row = parseInt(rowStr, 10) - 1;

    if (!colLock) {
      col = Math.max(0, col + deltaCol);
    }
    if (!rowLock) {
      row = Math.max(0, row + deltaRow);
    }

    const colPart = (colLock ? '$' : '') + colIndexToLetter(col);
    const rowPart = (rowLock ? '$' : '') + (row + 1);
    return `${colPart}${rowPart}`;
  });
}

/**
 * Generates smart filled value/formula based on sequence or repeated values.
 * - Formulas: adjust cell references
 * - Numbers: sequence detection if >= 2 source cells, or +1 increment if 1 number, or repetition
 * - Text with numbers (Item 1, Day 1, Q1): increments trailing number
 * - Dates / Days of week / Months: increments appropriately
 * - Plain strings: repeats values cyclically
 */
export function generateFilledCell(
  sourceCells: Array<{ raw: string; value: any; style?: any }>,
  stepIndex: number,
  deltaCol: number,
  deltaRow: number
): { raw: string; style?: any } {
  if (sourceCells.length === 0) return { raw: '' };

  const sourceIndex = stepIndex % sourceCells.length;
  const cycleCount = Math.floor(stepIndex / sourceCells.length) + 1;
  const targetSource = sourceCells[sourceIndex];
  const raw = targetSource.raw;

  // 1. Formula auto-fill with reference adjustment
  if (raw.startsWith('=')) {
    return {
      raw: adjustFormulaReferences(raw, deltaCol, deltaRow),
      style: targetSource.style ? { ...targetSource.style } : undefined
    };
  }

  // 2. Numeric sequence fill
  // If multiple numbers are selected in sequence, detect slope/step
  const numericSources = sourceCells.map(c => Number(c.raw));
  const allNumeric = numericSources.every(n => !isNaN(n) && typeof n === 'number');

  if (allNumeric) {
    if (sourceCells.length === 1) {
      // Single number: repeat or increment
      const baseNum = numericSources[0];
      const nextNum = baseNum + (stepIndex + 1);
      return {
        raw: String(nextNum),
        style: targetSource.style ? { ...targetSource.style } : undefined
      };
    } else {
      // Linear extrapolation from source sequence
      const step = (numericSources[numericSources.length - 1] - numericSources[0]) / (sourceCells.length - 1);
      const nextNum = numericSources[numericSources.length - 1] + step * (stepIndex + 1);
      return {
        raw: String(Number(nextNum.toFixed(4))),
        style: targetSource.style ? { ...targetSource.style } : undefined
      };
    }
  }

  // 3. String ending with numbers (e.g. "Item 1", "Product 10", "Q1", "Test-1")
  const trailingNumMatch = raw.match(/^(.*?)(\d+)$/);
  if (trailingNumMatch) {
    const prefix = trailingNumMatch[1];
    const baseNum = parseInt(trailingNumMatch[2], 10);
    const nextNum = baseNum + cycleCount * (sourceCells.length === 1 ? (stepIndex + 1) : 1);
    return {
      raw: `${prefix}${nextNum}`,
      style: targetSource.style ? { ...targetSource.style } : undefined
    };
  }

  // 4. Days of week / Month names
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayIdx = daysOfWeek.findIndex(d => d.toLowerCase() === raw.trim().toLowerCase());
  if (dayIdx !== -1) {
    const nextDay = daysOfWeek[(dayIdx + stepIndex + 1) % 7];
    return {
      raw: nextDay,
      style: targetSource.style ? { ...targetSource.style } : undefined
    };
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIdx = months.findIndex(m => m.toLowerCase() === raw.trim().toLowerCase());
  if (monthIdx !== -1) {
    const nextMonth = months[(monthIdx + stepIndex + 1) % 12];
    return {
      raw: nextMonth,
      style: targetSource.style ? { ...targetSource.style } : undefined
    };
  }

  // 5. Default: Repeat/Copy source value & styling
  return {
    raw,
    style: targetSource.style ? { ...targetSource.style } : undefined
  };
}

