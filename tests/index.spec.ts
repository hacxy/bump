import { describe, expect, it } from 'vitest';
import { bootstrap } from '../src/index.js';

describe('cli template', () => {
  it('bootstrap', async () => {
    expect(bootstrap).toBeDefined();
  });
});
