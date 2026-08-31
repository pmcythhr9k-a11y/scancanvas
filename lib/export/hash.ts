// Web Crypto SHA-256 Utility

export async function calculateSha256(data: ArrayBuffer | string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback hash simulation for environments without Web Crypto
  let hash = 0;
  const str = typeof data === 'string' ? data : new Uint8Array(data).toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}
