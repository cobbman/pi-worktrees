import { mkdtempSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { git } from '../../src/services/git.ts';

const tmpPaths: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'pi-worktrees-git-'));
  tmpPaths.push(dir);
  return dir;
}

afterEach(() => {
  for (const path of tmpPaths.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe('git subprocess execution', () => {
  it('passes arguments without shell interpolation', () => {
    const cwd = makeTempDir();
    const marker = join(cwd, 'shell-injection-marker');

    expect(() => {
      git(['check-ref-format', '--branch', `feature/safe; touch ${marker}`], cwd);
    }).toThrow(/git check-ref-format failed/);

    expect(existsSync(marker)).toBe(false);
  });
});
