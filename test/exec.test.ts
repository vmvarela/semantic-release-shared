import { describe, it, expect } from 'vitest';
import { exec } from '../src/exec.js';

describe('exec', () => {
  it('runs a command and returns output', async () => {
    const result = await exec('echo', ['hello world']);
    expect(result.stdout.trim()).toBe('hello world');
    expect(result.exitCode).toBe(0);
  });

  it('captures stderr', async () => {
    const result = await exec('bash', ['-c', 'echo error >&2']);
    expect(result.stderr.trim()).toBe('error');
  });

  it('reports non-zero exit code', async () => {
    const result = await exec('bash', ['-c', 'exit 42']);
    expect(result.exitCode).toBe(42);
  });

  it('runs shell commands when metacharacters present', async () => {
    const result = await exec('echo hello && echo world');
    expect(result.stdout.trim()).toBe('hello\nworld');
  });

  it('honors timeout', async () => {
    await expect(
      exec('sleep', ['10'], { timeoutMs: 100 }),
    ).rejects.toThrow();
  });
});
