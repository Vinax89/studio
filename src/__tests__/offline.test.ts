jest.mock('idb', () => ({
  openDB: jest.fn(),
}));

describe('offline fallback', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('uses in-memory store when persistence fails', async () => {
    const { openDB } = await import('idb');
    (openDB as jest.Mock).mockRejectedValue(new Error('fail'));

    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const offline = await import('../lib/offline');
    const tx = { foo: 'bar' };

    await offline.queueTransaction(tx);
    expect(offline.isPersistenceAvailable()).toBe(false);
    await expect(offline.getQueuedTransactions()).resolves.toEqual([tx]);

    await offline.clearQueuedTransactions();
    await expect(offline.getQueuedTransactions()).resolves.toEqual([]);

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

