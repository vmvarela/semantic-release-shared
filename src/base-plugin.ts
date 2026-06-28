import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { exec as execCmd } from './exec.js';
import type { PluginContext, Artifact, PrepareResult } from './types.js';

export type { PluginContext, Artifact, PrepareResult };

export abstract class BasePlugin {
  abstract readonly name: string;

  // ─── Lifecycle hooks ──────────────────────────────────────────────

  async verifyConditions<T>(
    config: unknown,
    schema: z.ZodSchema<T>,
    _context: PluginContext,
  ): Promise<T> {
    return schema.parse(config) as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async prepare<T>(_config: T, _context: PluginContext): Promise<PrepareResult> {
    throw new Error(`${this.name}: prepare not implemented`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish<T>(_config: T, _context: PluginContext): Promise<void> {
    // no-op default
  }

  // ─── Shared utilities ──────────────────────────────────────────────

  protected validateConfig<T>(schema: z.ZodSchema<T>, config: unknown): T {
    return schema.parse(config);
  }

  /**
   * Discover files matching one or more glob patterns inside a directory.
   * Each pattern can be a filename (exact match) or a simple glob.
   */
  protected getArtifacts(dir: string, patterns: string[]): Artifact[] {
    const files: Artifact[] = [];
    for (const pattern of patterns) {
      // simple glob: * matches anything
      const regex = new RegExp(
        '^' + pattern.replace(/\//g, '\\/').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$',
      );
      for (const entry of readdirSync(resolve(dir))) {
        const full = resolve(dir, entry);
        if (statSync(full).isFile() && regex.test(entry)) {
          files.push({ path: full, name: entry, type: 'binary' });
        }
      }
    }
    return files;
  }

  /**
   * Compute SHA-256 checksums for a list of files.
   * Returns a Map<filename, hex-digest>.
   */
  protected computeChecksums(files: string[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const file of files) {
      const hash = createHash('sha256');
      hash.update(readFileSync(file));
      map.set(file, hash.digest('hex'));
    }
    return map;
  }

  /**
   * Run a shell command.
   */
  protected async exec(
    command: string,
    argsOrOpts?: string[] | Record<string, unknown>,
    opts?: Record<string, unknown>,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const args = Array.isArray(argsOrOpts) ? argsOrOpts : [];
    const options = { ...((!Array.isArray(argsOrOpts) && argsOrOpts) || opts) };
    return execCmd(command, args, options as Parameters<typeof execCmd>[2]);
  }

  /**
   * Render a Handlebars template file.
   */
  protected renderTemplate(path: string, data: Record<string, unknown>): string {
    return '';
    // This is a stub — for now plugins use template.renderFile directly.
  }

  /**
   * Get an environment variable, optionally required.
   */
  protected getEnv(key: string, required?: boolean): string | undefined {
    const val = process.env[key];
    if (required && !val) throw new Error(`Required env var ${key} is not set`);
    return val;
  }

  /**
   * Assert multiple required environment variables are set.
   */
  protected assertRequiredEnvs(keys: string[]): void {
    const missing = keys.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    }
  }

  /**
   * Log a message via the semantic-release logger.
   */
  protected log(context: PluginContext, message: string): void {
    context.logger.log(`[${this.name}] ${message}`);
  }

  /**
   * Log an error via the semantic-release logger.
   */
  protected logError(context: PluginContext, message: string): void {
    context.logger.error(`[${this.name}] ${message}`);
  }
}
