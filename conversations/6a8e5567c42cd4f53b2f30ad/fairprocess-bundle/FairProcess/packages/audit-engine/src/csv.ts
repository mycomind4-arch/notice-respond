export interface CsvRow {
  [column: string]: string;
}

function parseRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length !== 0) {
        throw new Error("Unexpected quote inside an unquoted CSV field");
      }
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("Unclosed quoted CSV field");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
    rows.push(row);
  }

  return rows.filter((candidate) => candidate.some((value) => value.length > 0));
}

export function parseCsv(input: string): CsvRow[] {
  const rows = parseRows(input);
  const headers = rows.shift();
  if (!headers) {
    throw new Error("Recorder CSV must contain a header row");
  }

  const normalizedHeaders = headers.map((header) => header.trim());
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) {
    throw new Error("Recorder CSV headers must be unique");
  }

  return rows.map((values, rowIndex) => {
    if (values.length !== normalizedHeaders.length) {
      throw new Error(
        `Recorder CSV row ${rowIndex + 2} has ${values.length} columns; expected ${normalizedHeaders.length}`,
      );
    }

    return Object.fromEntries(
      normalizedHeaders.map((header, columnIndex) => [header, values[columnIndex] ?? ""]),
    );
  });
}

