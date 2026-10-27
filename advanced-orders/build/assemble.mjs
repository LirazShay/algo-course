#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ADVANCED_ORDERS_ROOT = resolve(HERE, '..');
const MANIFEST_PATH = resolve(ADVANCED_ORDERS_ROOT, 'source', 'manifest.json');
const REPO_ROOT = resolve(ADVANCED_ORDERS_ROOT, '..');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function normalizeSource(text) {
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trimEnd();
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

async function readUtf8(path) {
  return readFile(path, 'utf8');
}

async function buildCourse() {
  const manifest = JSON.parse(await readUtf8(MANIFEST_PATH));

  if (!Array.isArray(manifest.entries) || manifest.entries.length === 0) {
    throw new Error('manifest.entries must be a non-empty array');
  }

  if (manifest.buildPolicy?.requireAllEntriesReady !== true) {
    throw new Error('manifest buildPolicy.requireAllEntriesReady must be true');
  }

  if (manifest.buildPolicy?.preserveManifestOrder !== true) {
    throw new Error('manifest buildPolicy.preserveManifestOrder must be true');
  }

  const ids = new Set();
  const sources = new Set();
  const chunks = [];

  for (const [index, entry] of manifest.entries.entries()) {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`entry ${index} is not an object`);
    }

    const { id, source, status } = entry;
    if (!id || !source) {
      throw new Error(`entry ${index} must contain id and source`);
    }
    if (status !== 'ready') {
      throw new Error(`entry ${id} is not ready: ${status ?? 'missing status'}`);
    }
    if (ids.has(id)) {
      throw new Error(`duplicate manifest id: ${id}`);
    }
    if (sources.has(source)) {
      throw new Error(`duplicate manifest source: ${source}`);
    }

    ids.add(id);
    sources.add(source);

    const absoluteSource = resolve(REPO_ROOT, source);
    const normalized = normalizeSource(await readUtf8(absoluteSource));
    if (!normalized.trim()) {
      throw new Error(`source is empty: ${source}`);
    }
    chunks.push(normalized);
  }

  const separator = manifest.buildPolicy?.insertSingleBlankLineBetweenEntries === true
    ? '\n\n'
    : '\n';

  const output = `${chunks.join(separator)}\n`;
  const outputRelativePath = manifest.generatedMaster?.path;
  if (!outputRelativePath) {
    throw new Error('manifest.generatedMaster.path is required');
  }

  return {
    manifest,
    output,
    outputPath: resolve(REPO_ROOT, outputRelativePath),
    sourceCount: chunks.length,
    hash: sha256(output),
  };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const write = args.has('--write');
  const check = args.has('--check') || !write;

  if (args.has('--help') || args.has('-h')) {
    console.log(`Usage:\n  node advanced-orders/build/assemble.mjs --check\n  node advanced-orders/build/assemble.mjs --write\n\n--check  Build in memory and compare with generatedMaster.path.\n--write  Deterministically replace generatedMaster.path from manifest sources.`);
    return;
  }

  const built = await buildCourse();

  console.log(`sources=${built.sourceCount}`);
  console.log(`sha256=${built.hash}`);
  console.log(`output=${built.manifest.generatedMaster.path}`);

  if (write) {
    if (built.manifest.generatedMaster?.buildAllowed !== true) {
      throw new Error('write blocked: manifest.generatedMaster.buildAllowed must be true');
    }
    await writeFile(built.outputPath, built.output, 'utf8');
    console.log('WRITE_OK');
    return;
  }

  if (check) {
    let current;
    try {
      current = normalizeSource(await readUtf8(built.outputPath)) + '\n';
    } catch (error) {
      fail(`generated master cannot be read: ${error.message}`);
      return;
    }

    if (current !== built.output) {
      console.error(`expected_sha256=${built.hash}`);
      console.error(`actual_sha256=${sha256(current)}`);
      fail('generated master is stale; run with --write');
      return;
    }

    console.log('CHECK_OK');
  }
}

main().catch((error) => {
  fail(error?.stack || String(error));
});
