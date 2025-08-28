import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
// Polyfill TextEncoder/Decoder for node
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as any;
