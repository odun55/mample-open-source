// Read one GIF cycle from its frame delays, ignoring any repeat count.
export function gifDuration(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 13 || String.fromCharCode(...bytes.slice(0, 3)) !== 'GIF') return 8000;
  let offset = 13;
  if (bytes[10] & 128) offset += 3 * (1 << ((bytes[10] & 7) + 1));
  let delay = 100, total = 0;
  function skipBlocks() {
    while (offset < bytes.length) {
      const size = bytes[offset++];
      if (!size) return;
      offset += size;
    }
  }
  while (offset < bytes.length) {
    const marker = bytes[offset++];
    if (marker === 59) break;
    if (marker === 33) {
      const label = bytes[offset++];
      if (label === 249) {
        if (offset + 5 >= bytes.length || bytes[offset] !== 4) return total || 8000;
        delay = (bytes[offset + 2] | (bytes[offset + 3] << 8)) * 10;
        // Browsers commonly clamp zero or very short frame delays.
        if (delay < 20) delay = 100;
      }
      skipBlocks();
    } else if (marker === 44) {
      if (offset + 9 > bytes.length) return total || 8000;
      const packed = bytes[offset + 8];
      offset += 9;
      if (packed & 128) offset += 3 * (1 << ((packed & 7) + 1));
      offset++; // LZW minimum code size.
      skipBlocks();
      total += delay;
      delay = 100;
    } else break;
  }
  return total || 8000;
}
