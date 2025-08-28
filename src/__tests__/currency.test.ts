import { getFxRate } from '@/lib/currency'

describe('getFxRate validation', () => {
  beforeEach(() => {
    ;(global as any).fetch = jest.fn()
  })

  it('rejects invalid currency codes', async () => {
    await expect(getFxRate('US', 'EUR')).rejects.toThrow('Invalid currency code')
    await expect(getFxRate('USD', 'EURO')).rejects.toThrow('Invalid currency code')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches rate for valid currency codes', async () => {
    ;(global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.9 } }),
    })
    const rate = await getFxRate('usd', 'eur')
    expect(rate).toBe(0.9)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.exchangerate.host/latest?base=USD&symbols=EUR',
    )
  })
})
