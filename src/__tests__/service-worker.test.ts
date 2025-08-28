// @jest-environment node

describe('service worker', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('queues raw payload when JSON parsing fails', async () => {
    const addMock = jest.fn().mockResolvedValue(undefined);
    (global as any).idb = { openDB: jest.fn().mockResolvedValue({ add: addMock }) };
    (global as any).importScripts = jest.fn();

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    (global as any).self = { addEventListener: jest.fn() } as any;
    require('../../public/sw.js');

    const request = {
      clone: () => ({
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: () => Promise.resolve('not json'),
      }),
    } as any;

    await (global as any).self.__queueRequest(request);

    expect(addMock).toHaveBeenCalledWith('transactions', { raw: 'not json' });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
