'use client';

import { auth, initFirebase } from '../../../../src/lib/firebase';

initFirebase();

export { auth };

export const FUNCTIONS_ORIGIN = process.env.NEXT_PUBLIC_FUNCTIONS_ORIGIN || '';
