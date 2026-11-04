export function parseFrom(input: string): { name?: string; address: string } {
  const match = input.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match && match[2]) {
    const name = decodeDisplayName(match[1]);
    return { name: name || undefined, address: match[2].trim() };
  }
  return { address: input.trim() };
}

/**
 * Inverse of `encodeDisplayName`: turns a header display-name back into the
 * plain name, so a provider that encodes the name itself (mimetext emits an
 * RFC 2047 encoded-word) doesn't carry the quoting into the visible name.
 *
 * Trim before unquoting: with the trailing space still attached, the closing
 * quote isn't at the end and survives, so `"Jant (via Admin)"` showed up in
 * mail clients as `Jant (via Admin)"`.
 */
function decodeDisplayName(raw: string): string {
  const name = raw.trim();
  if (name.length >= 2 && name.startsWith('"') && name.endsWith('"')) {
    return name.slice(1, -1).replace(/\\(.)/g, "$1");
  }
  return name;
}

export function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // btoa expects a binary string; chunk to avoid call-stack overflow on
  // large buffers.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(u8.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}
