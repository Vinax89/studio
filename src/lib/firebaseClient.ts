import { initFirebase } from './firebase';

const { auth } = initFirebase();

export { auth };

export const FUNCTIONS_ORIGIN = process.env.NEXT_PUBLIC_FUNCTIONS_ORIGIN;
