const listeners: Record<string, (e: any) => void> = {}
;(globalThis as any).self = { addEventListener: (type: string, cb: any) => { listeners[type] = cb } }
;(globalThis as any).importScripts = jest.fn()

const addMock = jest.fn()
;(globalThis as any).idb = { openDB: jest.fn(async () => ({ add: addMock })) }

require('../../public/sw.js')

describe('service worker invalid payload', () => {
  it('logs warning and stores raw text when JSON parsing fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    ;(globalThis as any).fetch = jest.fn(() => Promise.reject(new Error('offline')))

    const request = {
      method: 'POST',
      url: 'https://example.com/api/transactions',
      headers: { get: () => 'application/json' },
      clone: () => ({
        json: () => Promise.reject(new Error('invalid')),
        text: () => Promise.resolve('not-json'),
      }),
    }

    let responsePromise: Promise<Response> | undefined
    const event = {
      request,
      respondWith: (p: Promise<Response>) => {
        responsePromise = p
      },
    }

    listeners.fetch(event)
    await responsePromise
    expect(addMock).toHaveBeenCalledWith('transactions', 'not-json')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
