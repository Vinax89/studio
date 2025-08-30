import {copyFileSync, mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const script = join(__dirname, '..', 'check-placeholders.mjs');

describe('check-placeholders script', () => {
  it('passes when no placeholders are present', () => {
    const dir = mkdtempSync(join(tmpdir(), 'place-ok-'));
    writeFileSync(join(dir, 'index.js'), 'const a = 1;\n');
    const result = spawnSync('node', [script, dir]);
    expect(result.status).toBe(0);
  });

  it('fails on TODO markers', () => {
    const dir = mkdtempSync(join(tmpdir(), 'place-todo-'));
    writeFileSync(join(dir, 'index.js'), '// TODO: fix\n');
    const result = spawnSync('node', [script, dir]);
    expect(result.status).toBe(1);
    expect(result.stderr.toString()).toContain('TODO');
  });

  it('fails on stand-alone ellipses', () => {
    const dir = mkdtempSync(join(tmpdir(), 'place-dots-'));
    writeFileSync(join(dir, 'index.js'), '...\n');
    const result = spawnSync('node', [script, dir]);
    expect(result.status).toBe(1);
    expect(result.stderr.toString()).toContain('...');
  });

  it('ignores the checker script itself', () => {
    const dir = mkdtempSync(join(tmpdir(), 'place-self-'));
    const scriptsDir = join(dir, 'scripts');
    mkdirSync(scriptsDir);
    const target = join(scriptsDir, 'check-placeholders.mjs');
    copyFileSync(script, target);
    const result = spawnSync('node', [script, dir]);
    expect(result.status).toBe(0);
  });
});
