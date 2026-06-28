import { describe, it, expect } from 'vitest';
import { renderString } from '../src/template.js';

describe('template', () => {
  it('renders variables', () => {
    const result = renderString('Hello {{name}}', { name: 'World' });
    expect(result).toBe('Hello World');
  });

  it('renders #if helpers', () => {
    const result = renderString('{{#if show}}yes{{/if}}', { show: true });
    expect(result).toBe('yes');
  });

  it('renders #each helpers', () => {
    const result = renderString(
      '{{#each items}}{{.}}\n{{/each}}',
      { items: ['a', 'b', 'c'] },
    );
    expect(result).toBe('a\nb\nc\n');
  });

  it('supports eq helper', () => {
    const result = renderString('{{#if (eq a b)}}equal{{/if}}', {
      a: 1,
      b: 1,
    });
    expect(result).toBe('equal');
  });

  it('supports or helper', () => {
    const result = renderString('{{#if (or a b)}}yes{{/if}}', {
      a: false,
      b: true,
    });
    expect(result).toBe('yes');
  });

  it('supports lookup helper', () => {
    const result = renderString('{{lookup map key}}', {
      map: { foo: 'bar' },
      key: 'foo',
    });
    expect(result).toBe('bar');
  });
});
