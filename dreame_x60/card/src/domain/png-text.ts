// PNG-Textchunks lesen (Bauplan 4.3b, Heidi-Karte): camera.heidi_map_data liefert ein Platzhalter-PNG, in dessen
// zTXt-Chunk „ValetudoMap“ das Kartenpaket (JSON, zlib-komprimiert) steckt. Reine Funktion über ArrayBuffer;
// Dekompression über die Web-Plattform (DecompressionStream, „deflate“ = zlib-Format), keine Bibliothek.

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  void writer.write(data as unknown as BufferSource);
  void writer.close();
  const out = new Uint8Array(await new Response(ds.readable).arrayBuffer());
  return out;
}

/** Text des Chunks mit diesem Schlüssel (tEXt, zTXt oder iTXt); null, wenn kein PNG oder Schlüssel nicht vorhanden. */
export async function pngText(buf: ArrayBuffer, key: string): Promise<string | null> {
  const b = new Uint8Array(buf);
  if (b.length < 8 || SIGNATURE.some((v, i) => b[i] !== v)) return null;
  const view = new DataView(buf);
  const dec = new TextDecoder('latin1');
  let p = 8;
  while (p + 8 <= b.length) {
    const len = view.getUint32(p);
    const type = dec.decode(b.subarray(p + 4, p + 8));
    const data = b.subarray(p + 8, p + 8 + len);
    if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
      const nul = data.indexOf(0);
      if (nul > 0 && dec.decode(data.subarray(0, nul)) === key) {
        if (type === 'tEXt') return dec.decode(data.subarray(nul + 1));
        if (type === 'zTXt') return new TextDecoder('utf-8').decode(await inflate(data.subarray(nul + 2)));
        // iTXt: Kompressionsflag, Methode, Sprache\0, übersetzter Schlüssel\0, Text (UTF-8)
        const compressed = data[nul + 1] === 1;
        let q = data.indexOf(0, nul + 3) + 1;
        q = data.indexOf(0, q) + 1;
        const body = data.subarray(q);
        return new TextDecoder('utf-8').decode(compressed ? await inflate(body) : body);
      }
    }
    if (type === 'IEND') break;
    p += 12 + len;
  }
  return null;
}
