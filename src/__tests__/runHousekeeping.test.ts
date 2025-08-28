process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'bucket';

const deleteOld = jest.fn().mockResolvedValue(undefined);
const deleteNew = jest.fn().mockResolvedValue(undefined);

const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
const newDate = new Date().toISOString();

const files = [
  {
    getMetadata: jest.fn().mockResolvedValue([{ updated: oldDate }]),
    delete: deleteOld,
  },
  {
    getMetadata: jest.fn().mockResolvedValue([{ updated: newDate }]),
    delete: deleteNew,
  },
];

const getFiles = jest.fn().mockResolvedValue([files]);

jest.mock('firebase/auth', () => ({ getAuth: jest.fn() }));

jest.mock('@google-cloud/storage', () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnValue({ getFiles }),
  })),
}));

import { runHousekeeping } from '@/lib/housekeeping';

describe('runHousekeeping', () => {
  beforeEach(() => {
    delete process.env.RETENTION_DAYS;
    deleteOld.mockClear();
    deleteNew.mockClear();
  });

  test('deletes files older than retention days', async () => {
    await runHousekeeping();
    expect(deleteOld).toHaveBeenCalledTimes(1);
    expect(deleteNew).not.toHaveBeenCalled();
  });
});

