import { describe, it, expect } from 'vitest';
import {
  BuildZigConfigSchema,
  BuildGoConfigSchema,
  BuildBunConfigSchema,
  NfpmConfigSchema,
  HomebrewConfigSchema,
  AurConfigSchema,
  ScoopConfigSchema,
  NixConfigSchema,
  ChocolateyConfigSchema,
  WingetConfigSchema,
  DispatchConfigSchema,
  ManPageConfigSchema,
} from '../src/config.js';

describe('BuildZigConfigSchema', () => {
  it('accepts valid config', () => {
    const result = BuildZigConfigSchema.parse({
      targets: [{ target: 'x86_64-linux-musl', asset: 'my-cli', ext: '' }],
      zig_version: '0.16.0',
    });
    expect(result.targets).toHaveLength(1);
    expect(result.zig_version).toBe('0.16.0');
  });

  it('rejects empty targets', () => {
    expect(() =>
      BuildZigConfigSchema.parse({ targets: [], zig_version: '0.16.0' }),
    ).toThrow();
  });

  it('accepts optional fields', () => {
    const result = BuildZigConfigSchema.parse({
      targets: [{ target: 'x86_64-linux-musl', asset: 'my-cli' }],
      zig_version: '0.16.0',
      bundle_sqlite: true,
    });
    expect(result.bundle_sqlite).toBe(true);
  });
});

describe('BuildGoConfigSchema', () => {
  it('accepts valid config with goos/goarch', () => {
    const result = BuildGoConfigSchema.parse({
      targets: [{ goos: 'linux', goarch: 'amd64', asset: 'my-cli' }],
      go_version: '1.23',
    });
    expect(result.targets[0].goos).toBe('linux');
  });
});

describe('BuildBunConfigSchema', () => {
  it('accepts valid config with entry point', () => {
    const result = BuildBunConfigSchema.parse({
      targets: [{ target: 'x86_64-linux-musl', asset: 'my-cli' }],
      bun_version: '1.1',
      entry: 'src/index.ts',
    });
    expect(result.entry).toBe('src/index.ts');
  });
});

describe('NfpmConfigSchema', () => {
  it('accepts valid nfpm config', () => {
    const result = NfpmConfigSchema.parse({
      config: 'packaging/nfpm.yaml',
      formats: ['deb', 'rpm'],
      arch_map: {
        'x86_64-linux-musl': { deb: 'amd64', rpm: 'x86_64' },
      },
    });
    expect(result.formats).toEqual(['deb', 'rpm']);
  });

  it('accepts partial arch_map (subset of formats)', () => {
    const result = NfpmConfigSchema.parse({
      config: 'packaging/nfpm.yaml',
      formats: ['deb', 'rpm', 'apk'],
      arch_map: {
        'x86_64-linux-musl': { deb: 'amd64' },
      },
    });
    expect(result.arch_map['x86_64-linux-musl'].deb).toBe('amd64');
    expect(result.arch_map['x86_64-linux-musl'].rpm).toBeUndefined();
  });

  it('rejects empty formats', () => {
    expect(() =>
      NfpmConfigSchema.parse({
        config: 'packaging/nfpm.yaml',
        formats: [],
        arch_map: {},
      }),
    ).toThrow();
  });
});

describe('HomebrewConfigSchema', () => {
  it('accepts valid config', () => {
    const result = HomebrewConfigSchema.parse({
      tap_repo: 'vmvarela/homebrew-tap',
      formula_template: 'formula.rb.hbs',
      assets: ['my-cli-x86_64-macos', 'my-cli-aarch64-macos'],
    });
    expect(result.tap_repo).toBe('vmvarela/homebrew-tap');
  });

  it('accepts optional man_asset', () => {
    const result = HomebrewConfigSchema.parse({
      tap_repo: 'vmvarela/homebrew-tap',
      formula_template: 'formula.rb.hbs',
      assets: ['my-cli-x86_64-macos'],
      man_asset: 'my-cli.1.gz',
    });
    expect(result.man_asset).toBe('my-cli.1.gz');
  });
});

describe('AurConfigSchema', () => {
  it('accepts valid config', () => {
    const result = AurConfigSchema.parse({
      pkgname: 'my-cli',
      pkgbuild_template: 'PKGBUILD.hbs',
    });
    expect(result.pkgname).toBe('my-cli');
  });
});

describe('ScoopConfigSchema', () => {
  it('accepts valid config', () => {
    const result = ScoopConfigSchema.parse({
      bucket_repo: 'vmvarela/scoop-bucket',
      assets: ['my-cli-x86_64-windows.exe'],
    });
    expect(result.bucket_repo).toBe('vmvarela/scoop-bucket');
  });
});

describe('NixConfigSchema', () => {
  it('accepts valid config', () => {
    const result = NixConfigSchema.parse({
      repo: 'vmvarela/nix-packages',
      assets: ['my-cli-x86_64-linux'],
    });
    expect(result.repo).toBe('vmvarela/nix-packages');
  });
});

describe('ChocolateyConfigSchema', () => {
  it('accepts valid config', () => {
    const result = ChocolateyConfigSchema.parse({
      nuspec_template: 'package.nuspec.hbs',
      install_template: 'chocolateyInstall.ps1.hbs',
      assets: ['my-cli-x86_64-windows.exe'],
    });
    expect(result.assets).toHaveLength(1);
  });
});

describe('WingetConfigSchema', () => {
  it('accepts valid config', () => {
    const result = WingetConfigSchema.parse({ identifier: 'vmvarela.my-cli' });
    expect(result.identifier).toBe('vmvarela.my-cli');
  });
});

describe('DispatchConfigSchema', () => {
  it('accepts valid config', () => {
    const result = DispatchConfigSchema.parse({
      repo: 'vmvarela/apt-packages',
      event_type: 'update-my-cli',
    });
    expect(result.event_type).toBe('update-my-cli');
  });
});

describe('ManPageConfigSchema', () => {
  it('accepts valid config', () => {
    const result = ManPageConfigSchema.parse({
      source: 'docs/manpage.scd',
    });
    expect(result.source).toBe('docs/manpage.scd');
  });
});
