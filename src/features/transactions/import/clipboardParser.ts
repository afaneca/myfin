type Delimiter = '\t' | ',' | ';' | null;

export type ParsedClipboard = {
  rows: string[][];
  delimiter: Delimiter;
};

const DATE_RE = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/;
const MONEY_RE =
  /^[+-]?\s*(?:\d{1,3}(?:[.,\s]\d{3})+|\d+)(?:[.,]\d{1,4})?\s*(?:[A-Z]{3}|€)?$/i;

const countCells = (rows: string[][]): number[] =>
  rows.map((row) => row.length).filter((length) => length > 1);

const parseDelimitedLine = (line: string, delimiter: Delimiter): string[] => {
  if (!delimiter) return [line.trim()];

  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseLines = (lines: string[], delimiter: Delimiter): string[][] =>
  lines.map((line) => parseDelimitedLine(line, delimiter));

const getMode = (values: number[]): number => {
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  let mode = 0;
  let modeCount = 0;
  counts.forEach((count, value) => {
    if (count > modeCount) {
      mode = value;
      modeCount = count;
    }
  });

  return mode;
};

const scoreDelimitedRows = (rows: string[][]): number => {
  const lengths = countCells(rows);
  if (lengths.length === 0) return 0;

  const mode = getMode(lengths);
  if (mode < 3) return 0;

  const matchingRows = lengths.filter((length) => length === mode).length;
  const consistency = matchingRows / lengths.length;
  return mode * consistency * matchingRows;
};

const detectDelimiter = (lines: string[]): Delimiter => {
  if (lines.some((line) => line.includes('\t'))) return '\t';

  const commaScore = scoreDelimitedRows(parseLines(lines, ','));
  const semicolonScore = scoreDelimitedRows(parseLines(lines, ';'));

  if (semicolonScore > 0 && semicolonScore >= commaScore) return ';';
  if (commaScore > 0) return ',';

  return null;
};

const isEmptyCell = (cell: string): boolean => cell.trim().length === 0;

const trimRows = (rows: string[][]): string[][] =>
  rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => !isEmptyCell(cell)));

const shouldCompactEmptyCells = (rows: string[][], delimiter: Delimiter) => {
  if (delimiter !== '\t') return false;

  const allCells = rows.flat();
  if (allCells.length === 0) return false;

  const emptyRatio =
    allCells.filter((cell) => isEmptyCell(cell)).length / allCells.length;
  const firstContentIndexes = rows.map((row) =>
    row.findIndex((cell) => !isEmptyCell(cell)),
  );
  const shiftedRows = new Set(firstContentIndexes).size > 1;

  return emptyRatio >= 0.25 || shiftedRows;
};

const compactEmptyCells = (rows: string[][]): string[][] =>
  rows
    .map((row) => row.filter((cell) => !isEmptyCell(cell)))
    .filter((row) => row.length > 0);

const fallbackTokenizeRows = (rows: string[][]): string[][] =>
  rows.map((row) => {
    const line = row.join(' ').trim();
    const looseCells = line.split(/\s{2,}/).filter(Boolean);
    if (looseCells.length > 1) return looseCells;

    const tokens = line.split(/\s+/).filter(Boolean);
    const moneyIndex = tokens.findIndex((token) => MONEY_RE.test(token));
    const dates = tokens.filter((token) => DATE_RE.test(token));

    if (dates.length === 0 || moneyIndex < 0) return looseCells;

    const descriptionStart = tokens.findIndex(
      (token, index) => index > 0 && !DATE_RE.test(token),
    );

    if (descriptionStart < 0) return looseCells;

    return [
      ...dates,
      tokens.slice(descriptionStart, moneyIndex).join(' '),
      tokens[moneyIndex],
      ...tokens.slice(moneyIndex + 1),
    ].filter(Boolean);
  });

const maybeRecoverLooseStatementRows = (
  rows: string[][],
  delimiter: Delimiter,
): string[][] => {
  if (delimiter) return rows;

  const recoveredRows = fallbackTokenizeRows(rows);
  const recoveredCellCounts = recoveredRows.filter((row) => row.length > 1);

  return recoveredCellCounts.length > 0 ? recoveredRows : rows;
};

const normalizeRows = (rows: string[][], delimiter: Delimiter): string[][] => {
  const trimmedRows = trimRows(rows);
  const compactedRows = shouldCompactEmptyCells(trimmedRows, delimiter)
    ? compactEmptyCells(trimmedRows)
    : trimmedRows;

  return maybeRecoverLooseStatementRows(compactedRows, delimiter);
};

export const parseClipboardText = (data: string): ParsedClipboard => {
  const lines = data
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], delimiter: null };
  }

  const delimiter = detectDelimiter(lines);
  const rows = normalizeRows(parseLines(lines, delimiter), delimiter);

  return { rows, delimiter };
};
