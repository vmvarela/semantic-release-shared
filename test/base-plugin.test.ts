import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { BasePlugin } from '../src/base-plugin.js';
import type { PluginContext } from '../src/types.js';

const TestSchema = z.object({ name: z.string() });
type TestConfig = z.infer<typeof TestSchema>;

class TestPlugin extends BasePlugin {
  readonly name = 'test-plugin';
}

describe('BasePlugin', () => {
  let plugin: TestPlugin;
  let context: PluginContext;

  beforeEach(() => {
    plugin = new TestPlugin();
    context = {
      logger: { log: vi.fn(), error: vi.fn() },
      nextRelease: { version: '1.0.0' },
      branch: { name: 'main' },
      repositoryUrl: 'https://github.com/vmvarela/test',
      env: {},
      cwd: process.cwd(),
    };
  });

  describe('verifyConditions', () => {
    it('validates config against schema', async () => {
      const result = await plugin.verifyConditions(
        { name: 'my-cli' },
        TestSchema,
        context,
      );
      expect(result.name).toBe('my-cli');
    });

    it('throws on invalid config', async () => {
      await expect(
        plugin.verifyConditions({ invalid: true }, TestSchema, context),
      ).rejects.toThrow();
    });
  });

  describe('validateConfig', () => {
    it('returns validated config', () => {
      const result = plugin.validateConfig(TestSchema, { name: 'ok' });
      expect(result.name).toBe('ok');
    });

    it('throws on invalid data', () => {
      expect(() => plugin.validateConfig(TestSchema, {})).toThrow();
    });
  });

  describe('getEnv', () => {
    it('returns env var', () => {
      process.env.TEST_VAR = 'hello';
      expect(plugin.getEnv('TEST_VAR')).toBe('hello');
      delete process.env.TEST_VAR;
    });

    it('throws if required and missing', () => {
      expect(() => plugin.getEnv('NONEXISTENT', true)).toThrow();
    });

    it('returns undefined if not required and missing', () => {
      expect(plugin.getEnv('NONEXISTENT')).toBeUndefined();
    });
  });

  describe('assertRequiredEnvs', () => {
    it('does not throw when all set', () => {
      process.env.A = '1';
      process.env.B = '2';
      expect(() => plugin.assertRequiredEnvs(['A', 'B'])).not.toThrow();
      delete process.env.A;
      delete process.env.B;
    });

    it('throws on missing', () => {
      expect(() => plugin.assertRequiredEnvs(['MISSING_1', 'MISSING_2'])).toThrow();
    });
  });

  describe('prepare', () => {
    it('throws by default', async () => {
      await expect(
        plugin.prepare({ name: 'x' } as TestConfig, context),
      ).rejects.toThrow('test-plugin: prepare not implemented');
    });
  });

  describe('publish', () => {
    it('does not throw by default', async () => {
      await expect(
        plugin.publish({ name: 'x' } as TestConfig, context),
      ).resolves.toBeUndefined();
    });
  });
});
