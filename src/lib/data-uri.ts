/**
 * Regular expression for matching data URIs that include a MIME type and base64-encoded data.
 * Example: data:image/png;base64,iVBORw0...
 */
export const DATA_URI_REGEX = /^data:[a-zA-Z0-9]+\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/;
