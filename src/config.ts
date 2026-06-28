import { z } from 'zod';

// ─── Reusable base types ────────────────────────────────────────────────

export const TargetSchema = z.object({
  target: z.string(),
  asset: z.string(),
  ext: z.string().optional(),
});
export type Target = z.infer<typeof TargetSchema>;

export const GoTargetSchema = z.object({
  goos: z.string(),
  goarch: z.string(),
  asset: z.string(),
  ext: z.string().optional(),
});
export type GoTarget = z.infer<typeof GoTargetSchema>;

// ─── Build-Plugin configs ───────────────────────────────────────────────

export const BuildZigConfigSchema = z.object({
  targets: z.array(TargetSchema).min(1),
  zig_version: z.string(),
  bundle_sqlite: z.boolean().optional(),
  version_from: z.enum(['build.zig.zon', 'git-tag']).optional(),
});
export type BuildZigConfig = z.infer<typeof BuildZigConfigSchema>;

export const BuildGoConfigSchema = z.object({
  targets: z.array(GoTargetSchema).min(1),
  go_version: z.string(),
  ldflags: z.string().optional(),
  version_from: z.enum(['go.mod', 'git-tag']).optional(),
});
export type BuildGoConfig = z.infer<typeof BuildGoConfigSchema>;

export const BuildBunConfigSchema = z.object({
  targets: z.array(TargetSchema).min(1),
  bun_version: z.string(),
  entry: z.string(),
  version_from: z.enum(['package.json', 'git-tag']).optional(),
});
export type BuildBunConfig = z.infer<typeof BuildBunConfigSchema>;

export const ManPageConfigSchema = z.object({
  source: z.string(),
});
export type ManPageConfig = z.infer<typeof ManPageConfigSchema>;

// ─── Package-Plugin configs ──────────────────────────────────────────────

export const NfpmConfigSchema = z.object({
  config: z.string(),
  formats: z.array(z.enum(['deb', 'rpm', 'apk'])).min(1),
  arch_map: z.record(
    z.object({
      deb: z.string().optional(),
      rpm: z.string().optional(),
      apk: z.string().optional(),
    }),
  ),
});
export type NfpmConfig = z.infer<typeof NfpmConfigSchema>;

export const ChocolateyConfigSchema = z.object({
  nuspec_template: z.string(),
  install_template: z.string(),
  assets: z.array(z.string()).min(1),
});
export type ChocolateyConfig = z.infer<typeof ChocolateyConfigSchema>;

// ─── Publish-Plugin configs ──────────────────────────────────────────────

export const HomebrewConfigSchema = z.object({
  tap_repo: z.string(),
  formula_template: z.string(),
  assets: z.array(z.string()).min(1),
  man_asset: z.string().optional(),
});
export type HomebrewConfig = z.infer<typeof HomebrewConfigSchema>;

export const AurConfigSchema = z.object({
  pkgname: z.string(),
  pkgbuild_template: z.string(),
});
export type AurConfig = z.infer<typeof AurConfigSchema>;

export const ScoopConfigSchema = z.object({
  bucket_repo: z.string(),
  assets: z.array(z.string()).min(1),
});
export type ScoopConfig = z.infer<typeof ScoopConfigSchema>;

export const NixConfigSchema = z.object({
  repo: z.string(),
  assets: z.array(z.string()).min(1),
});
export type NixConfig = z.infer<typeof NixConfigSchema>;

export const WingetConfigSchema = z.object({
  identifier: z.string(),
});
export type WingetConfig = z.infer<typeof WingetConfigSchema>;

export const DispatchConfigSchema = z.object({
  repo: z.string(),
  event_type: z.string(),
});
export type DispatchConfig = z.infer<typeof DispatchConfigSchema>;
