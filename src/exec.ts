import { execa, type Options as ExecaOptions } from 'execa';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export type { ExecaOptions };

/**
 * Run a command.
 *
 * If `command` contains shell metacharacters (|, >, <, &&, etc.) it is
 * run via `sh -c`.  Otherwise the process is spawned directly.
 */
export async function exec(
  command: string,
  args: string[] = [],
  opts: ExecaOptions & { timeoutMs?: number } = {},
): Promise<ExecResult> {
  const { timeoutMs, ...execaOpts } = opts;
  const runOpts = { ...execaOpts, reject: false };

  const child = shellNeeded(command)
    ? execa(command, { ...runOpts, shell: true })
    : execa(command, args, runOpts);

  if (timeoutMs !== undefined) {
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, timeoutMs);

    const result = await child;
    clearTimeout(timer);

    if (result.exitCode === undefined) {
      throw new Error(`exec timed out after ${timeoutMs}ms`);
    }
    return {
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
      exitCode: result.exitCode ?? 0,
    };
  }

  const result = await child;
  return {
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
    exitCode: result.exitCode ?? 0,
  };
}

function shellNeeded(cmd: string): boolean {
  return /[|><&;`$(){}\n]/.test(cmd) || cmd.includes(' && ') || cmd.includes(' || ');
}
