import { getAllowedOrigins, isAllowedOrigin } from '@/lib/allowed-origins';

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

describe('isAllowedOrigin', () => {
  it('allows exact string matches', () => {
    const origins = getAllowedOrigins('https://example.com')
    expect(isAllowedOrigin('https://example.com', origins)).toBe(true)
    expect(isAllowedOrigin('https://evil.com', origins)).toBe(false)
  })

  it('matches regex patterns', () => {
    const origins = getAllowedOrigins(String.raw`/^https:\/\/.*\.example\.com$/`)
    expect(isAllowedOrigin('https://foo.example.com', origins)).toBe(true)
    expect(isAllowedOrigin('https://bar.test.com', origins)).toBe(false)
  })
})
