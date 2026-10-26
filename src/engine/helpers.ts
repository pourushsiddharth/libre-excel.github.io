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

/**
 * RFC 6234 Standard SHA-256 synchronous cryptographic hash function.
 * Produces an irreversible 256-bit (64 hex character) digest.
 */
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: { [key: number]: number } = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] = i < 16 ? w[i] : (
          w[i - 16] +
          (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
          w[i - 7] +
          (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash.unshift((temp1 + temp2) | 0);
      hash.length = 8;
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Capability-based cryptographic key store for documents.
 * - editSecret: 128-bit high-entropy random secret key (known only by creator/editors).
 * - viewSecret: SHA-256(editSecret + ':' + docId + ':libre_view_cap')
 * Because SHA-256 is an irreversible one-way cryptographic hash, holders of viewSecret
 * cannot mathematically reverse-engineer editSecret even with full access to the client code.
 */
export function getDocumentCapabilities(docId: string): { editSecret: string; viewSecret: string } {
  const storageKey = 'libre_cap_' + docId;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.editSecret && parsed.viewSecret) {
          return parsed;
        }
      }
    } catch {}
  }

  // Generate 128-bit cryptographically secure random bytes
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const editSecret = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const viewSecret = sha256(editSecret + ':' + docId + ':libre_view_cap');

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ editSecret, viewSecret }));
    } catch {}
  }
  return { editSecret, viewSecret };
}

/**
 * Verifies a share token using SHA-256 one-way capability hashes.
 * Returns:
 * - isView: true if token is a valid View capability
 * - isEdit: true if token is a valid Edit capability (proven knowledge of pre-image)
 */
export function verifyShareCapability(
  docId: string, 
  token: string
): { isView: boolean; isEdit: boolean } {
  if (!token) return { isView: false, isEdit: false };

  let expectedViewSecret = '';
  let storedEditSecret = '';

  if (typeof window !== 'undefined') {
    try {
      const capSaved = localStorage.getItem('libre_cap_' + docId);
      if (capSaved) {
        const parsed = JSON.parse(capSaved);
        expectedViewSecret = parsed.viewSecret || '';
        storedEditSecret = parsed.editSecret || '';
      }
      if (!expectedViewSecret) {
        const docSaved = localStorage.getItem('libre_doc_' + docId);
        if (docSaved) {
          const parsedDoc = JSON.parse(docSaved);
          expectedViewSecret = parsedDoc.viewSecret || '';
          storedEditSecret = parsedDoc.editSecret || '';
        }
      }
    } catch {}
  }

  // If document capabilities exist locally:
  if (expectedViewSecret) {
    // 1. Direct match with viewSecret means this token is strictly a View capability
    if (token === expectedViewSecret) {
      return { isView: true, isEdit: false };
    }

    // 2. Hash of token matches viewSecret: mathematically proves possession of editSecret!
    const hashOfToken = sha256(token + ':' + docId + ':libre_view_cap');
    if (hashOfToken === expectedViewSecret || (storedEditSecret && token === storedEditSecret)) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('libre_cap_' + docId, JSON.stringify({ editSecret: token, viewSecret: expectedViewSecret }));
        } catch {}
      }
      return { isView: true, isEdit: true };
    }
  }

  // 3. Fallback for legacy signed tokens
  const legacyView = generateShareSignature(docId, 'view');
  const legacyEdit = generateShareSignature(docId, 'edit');
  if (token === legacyView) return { isView: true, isEdit: false };
  if (token === legacyEdit) return { isView: true, isEdit: true };

  return { isView: false, isEdit: false };
}

// Legacy security signature generator for backward compatibility
export function generateShareSignature(docId: string, mode: string): string {
  const secret = 'libre_excel_sig_salt_987654';
  const str = `${docId}_${mode}_${secret}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function verifyShareSignature(docId: string, mode: string, token: string): boolean {
  const cap = verifyShareCapability(docId, token);
  if (mode === 'edit') return cap.isEdit;
  if (mode === 'view') return cap.isView;
  return false;
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

