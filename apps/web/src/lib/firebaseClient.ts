import { auth } from '../../../../src/lib/firebase';

export const FUNCTIONS_ORIGIN = process.env.NEXT_PUBLIC_FUNCTIONS_ORIGIN || '';

export { auth };
