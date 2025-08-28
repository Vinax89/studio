import { z } from 'genkit';

export const MAX_DATA_URI_SIZE = 10 * 1024 * 1024; // 10MB

export const dataUriSchema = z
  .string()
  .regex(
    /^data:[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/,
    "Invalid data URI format. Expected 'data:<mimetype>;base64,<encoded_data>'",
  )
  .refine(
    value => {
      const base64 = value.split(',')[1];
      if (!base64) {
        return false;
      }
      // Ensure the decoded content does not exceed the maximum allowed size.
      return Buffer.from(base64, 'base64').byteLength <= MAX_DATA_URI_SIZE;
    },
    {
      message: `Data URI exceeds ${MAX_DATA_URI_SIZE} bytes`,
    },
  );
