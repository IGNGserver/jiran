'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseProjectVersion, compareProjectVersions } = require('../src/shared/versioning');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const VERSION_FILE_PATH = path.join(PROJECT_ROOT, 'VERSION');
const VERSION_FILES = [
  ['package.json', ['version']],
  ['package-lock.json', ['version']],
  ['package-lock.json', ['packages', '', 'version']]
];

function readJson(relativePath) {
  const absolutePath = path.join(PROJECT_ROOT, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function valueAtPath(value, pathParts) {
  return pathParts.reduce((current, part) => current?.[part], value);
}

function normalizeVersion(value) {
  const raw = typeof value === 'string' ? value.trim().replace(/^v/i, '') : '';
  return parseProjectVersion(raw)?.version || null;
}

function readRootVersion() {
  if (fs.existsSync(VERSION_FILE_PATH)) {
    const raw = fs.readFileSync(VERSION_FILE_PATH, 'utf8').trim();
    const normalized = normalizeVersion(raw);
    if (!normalized) {
      throw new Error(`VERSION contains an invalid project version: ${raw}`);
    }
    return normalized;
  }
  return normalizeVersion(readJson('package.json').version);
}

function versionFromArgs(argv) {
  const index = argv.indexOf('--version');
  if (index >= 0) return argv[index + 1] || '';
  const inline = argv.find((arg) => arg.startsWith('--version='));
  return inline ? inline.slice('--version='.length) : '';
}

function verifyAgainstLatestGitTag(expectedVersion) {
  try {
    const stdout = execFileSync('git', ['tag', '--list', 'v*'], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const tags = stdout
      .split(/\r?\n/)
      .map((t) => t.trim().replace(/^v/i, ''))
      .filter((v) => parseProjectVersion(v) && v !== expectedVersion);

    if (tags.length > 0) {
      tags.sort((a, b) => compareProjectVersions(b, a));
      const latestTag = tags[0];
      const comparison = compareProjectVersions(expectedVersion, latestTag);
      if (comparison <= 0) {
        throw new Error(
          `Project version must be greater than latest tag v${latestTag}; got ${expectedVersion}`
        );
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT' && !String(error?.message ?? '').includes('must be greater than latest tag')) {
      // Ignore git failures if git is missing or repo has no tags
    } else if (String(error?.message ?? '').includes('must be greater than latest tag')) {
      throw error;
    }
  }
}

function verifyReleaseVersion(expectedValue = '', options = {}) {
  const rootVersion = readRootVersion();
  const expected = normalizeVersion(expectedValue || rootVersion);
  if (!expected) {
    throw new Error(`Invalid project release version: ${String(expectedValue || rootVersion)}`);
  }

  if (fs.existsSync(VERSION_FILE_PATH)) {
    const raw = fs.readFileSync(VERSION_FILE_PATH, 'utf8').trim();
    const actual = normalizeVersion(raw);
    if (!actual) throw new Error(`VERSION contains an invalid project version: ${raw}`);
    if (actual !== expected) {
      throw new Error(`VERSION ${actual} does not match expected ${expected}`);
    }
  }

  for (const [relativePath, valuePath] of VERSION_FILES) {
    const actualValue = valueAtPath(readJson(relativePath), valuePath);
    const actual = normalizeVersion(actualValue);
    if (!actual) throw new Error(`${relativePath} contains an invalid project version: ${String(actualValue)}`);
    if (actual !== expected) {
      throw new Error(`${relativePath} version ${actual} does not match expected ${expected}`);
    }
  }

  if (options.checkGitTag ?? true) {
    verifyAgainstLatestGitTag(expected);
  }

  return expected;
}

if (require.main === module) {
  try {
    const version = verifyReleaseVersion(versionFromArgs(process.argv.slice(2)));
    console.log(`Release version verified: ${version}`);
  } catch (error) {
    console.error(error.message || String(error));
    process.exitCode = 1;
  }
}

module.exports = {
  normalizeVersion,
  verifyReleaseVersion
};
