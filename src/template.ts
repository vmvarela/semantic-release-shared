import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';

/**
 * Register common Handlebars helpers once.
 */
function ensureHelpers() {
  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('or', (...args: unknown[]) => args.slice(0, -1).some(Boolean));
    Handlebars.registerHelper('lookup', (obj: Record<string, unknown>, key: string) => obj[key]);
  }
}

/**
 * Render a template file with the given data.
 * Template syntax: {{variable}}, {{#if}} {{#each}} helpers.
 */
export function renderFile(templatePath: string, data: Record<string, unknown>): string {
  ensureHelpers();
  const source = readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(source);
  return template(data);
}

/**
 * Render a template string directly.
 */
export function renderString(templateSource: string, data: Record<string, unknown>): string {
  ensureHelpers();
  const template = Handlebars.compile(templateSource);
  return template(data);
}
