const encoder = new TextEncoder();
const xml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const crc32 = bytes => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
const u16 = value => [value & 255, (value >>> 8) & 255];
const u32 = value => [...u16(value & 0xffff), ...u16(value >>> 16)];
const concat = parts => {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
};
function zipStore(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, content] of entries) {
    const filename = encoder.encode(name), data = encoder.encode(content), crc = crc32(data);
    const header = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(filename.length), ...u16(0)]);
    local.push(header, filename, data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(filename.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), filename);
    offset += header.length + filename.length + data.length;
  }
  const centralBytes = concat(central);
  return concat([...local, centralBytes, new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(centralBytes.length), ...u32(offset), ...u16(0)])]);
}

export function docxBytes(title, paragraphs = []) {
  if (!Array.isArray(paragraphs)) throw new TypeError('paragraphs must be an array');
  const body = [`<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${xml(title)}</w:t></w:r></w:p>`, ...paragraphs.map(value => `<w:p><w:r><w:t xml:space="preserve">${xml(value)}</w:t></w:r></w:p>`)].join('');
  return zipStore([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`],
    ['word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style></w:styles>'],
  ]);
}

export function printHtml(title, paragraphs = []) {
  if (!Array.isArray(paragraphs)) throw new TypeError('paragraphs must be an array');
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${xml(title)}</title><style>body{font:16px/1.65 system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#202124}h1{font-size:24px;border-bottom:1px solid #bbb;padding-bottom:12px}p{white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{max-width:none;margin:0;padding:0}h1{break-after:avoid}p{orphans:3;widows:3}}</style></head><body><h1>${xml(title)}</h1>${paragraphs.map(value => `<p>${xml(value)}</p>`).join('')}</body></html>`;
}
