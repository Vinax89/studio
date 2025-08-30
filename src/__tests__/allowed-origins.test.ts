import { getAllowedOrigins } from '@/lib/allowed-origins';

describe('getAllowedOrigins', () => {
  it('parses strings and regex and ignores malformed entries', () => {
    const input = [
      'http://localhost:6006',
      String.raw`/^https:\/\/.*\.example\.com$/`,
      'not-a-url',
      '/foo(',
    ].join(',');
    const origins = getAllowedOrigins(input);
    expect(origins).toHaveLength(2);
    expect(origins[0]).toBe('http://localhost:6006');
    expect(origins[1]).toBeInstanceOf(RegExp);
  });
});
