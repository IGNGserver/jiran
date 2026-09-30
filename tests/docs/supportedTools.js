'use strict';

// Shared parser for the supported-tools matrix in docs/supported-tools.md.
//
// The matrix used to live in README.md, which is why the guards pinned an exact upstream
// sentence in five locales: the counts had nowhere else to be asserted. They now read the
// matrix once and the READMEs only have to agree with it, so rewording a README cannot break
// documentation and a stale count cannot survive either.

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..', '..');
const MATRIX_FILE = 'docs/supported-tools.md';

const readMatrix = () => fs.readFileSync(path.join(rootDir, MATRIX_FILE), 'utf8');

// A row is `| <img … /> | Name | path | usage | limits | sessions |` — 8 cells once split.
const matrixRows = (text) => text.split('\n').filter((line) => line.startsWith('| <img'));

const cells = (row) => row.split('|').map((cell) => cell.trim());

const matrixStats = (text = readMatrix()) => {
  const rows = matrixRows(text);
  if (rows.length === 0) throw new Error(`${MATRIX_FILE}: no supported-tools rows found`);
  for (const row of rows) {
    if (cells(row).length !== 8) throw new Error(`${MATRIX_FILE}: unexpected column count in row: ${row}`);
  }
  const checked = (index) => rows.filter((row) => cells(row)[index] === '✅').length;
  return {
    rows,
    names: rows.map((row) => cells(row)[2]),
    iconIds: rows.map((row) => {
      const id = row.match(/tools-icon\/([^".]+)\.[a-z]+"/i)?.[1];
      if (!id) throw new Error(`${MATRIX_FILE}: no tool icon id found in row: ${row}`);
      return id;
    }),
    // [matrix rows, token-usage rows, quota-provider rows, session-detail rows]
    counts: [rows.length, checked(4), checked(5), checked(6)]
  };
};

// The rows whose limits column is ✅, as the icon id that stands for the provider(s).
const limitProviderIcons = (text = readMatrix()) => matrixStats(text).rows
  .filter((row) => cells(row)[5] === '✅')
  .map((row) => row.match(/tools-icon\/([^".]+)\.[a-z]+"/i)[1]);

// The four numbers a README must publish next to its link to the matrix. Parsed from whichever
// section links the matrix, so the surrounding prose is free to change.
const summaryCounts = (text, file) => {
  const link = text.indexOf(MATRIX_FILE);
  if (link < 0) throw new Error(`${file}: nothing links to ${MATRIX_FILE}`);
  const start = text.lastIndexOf('\n## ', link);
  const end = text.indexOf('\n## ', link);
  const section = text.slice(start, end < 0 ? undefined : end);
  const numbers = section
    .split('\n')
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean).pop())
    .filter((value) => value && /^\d+$/.test(value))
    .map(Number);
  if (numbers.length !== 4) {
    throw new Error(`${file}: expected 4 counts beside the ${MATRIX_FILE} link, found ${numbers.length} (${numbers.join(', ')})`);
  }
  return numbers;
};

module.exports = { MATRIX_FILE, MATRIX_ROOT: rootDir, readMatrix, matrixStats, limitProviderIcons, summaryCounts };
