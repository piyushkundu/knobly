import type { StyleCourseId, StyleDraft } from './style-course-types';

export function workspaceHtml(html: string, course: StyleCourseId) {
    const links = '<link rel="stylesheet" href="style.css">' + (course === 'w3css' ? '\n<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">' : '');
    const clean = html.replace(/<link\b[^>]*href\s*=\s*["'](?:\.\/)?style(?:s)?\.css["'][^>]*>/gi, '');
    if (/<\/head\s*>/i.test(clean)) return clean.replace(/<\/head\s*>/i, links + '\n</head>');
    if (/<html\b[^>]*>/i.test(clean)) return clean.replace(/<html\b[^>]*>/i, match => match + '\n<head><meta charset="UTF-8">' + links + '</head>');
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + links + '\n</head>\n<body>\n' + clean + '\n</body>\n</html>';
}

function crc32(bytes: Uint8Array) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// A standard, uncompressed ZIP containing two UTF-8 source files. No network or dependencies.
export function workspaceZip(draft: StyleDraft, course: StyleCourseId): Uint8Array<ArrayBuffer> {
    const encoder = new TextEncoder();
    const files = [
        { name: encoder.encode('index.html'), data: encoder.encode(workspaceHtml(draft.html, course)) },
        { name: encoder.encode('style.css'), data: encoder.encode(draft.css) },
    ];
    const localLength = files.reduce((size, file) => size + 30 + file.name.length + file.data.length, 0);
    const centralLength = files.reduce((size, file) => size + 46 + file.name.length, 0);
    const bytes = new Uint8Array(localLength + centralLength + 22);
    const view = new DataView(bytes.buffer);
    let offset = 0, central = localLength;
    for (const file of files) {
        const crc = crc32(file.data);
        view.setUint32(offset, 0x04034b50, true);
        view.setUint16(offset + 4, 20, true);
        view.setUint16(offset + 6, 0x0800, true);
        view.setUint16(offset + 12, 33, true); // 1980-01-01, valid ZIP date.
        view.setUint32(offset + 14, crc, true);
        view.setUint32(offset + 18, file.data.length, true);
        view.setUint32(offset + 22, file.data.length, true);
        view.setUint16(offset + 26, file.name.length, true);
        bytes.set(file.name, offset + 30);
        bytes.set(file.data, offset + 30 + file.name.length);
        view.setUint32(central, 0x02014b50, true);
        view.setUint16(central + 4, 20, true);
        view.setUint16(central + 6, 20, true);
        view.setUint16(central + 8, 0x0800, true);
        view.setUint16(central + 14, 33, true);
        view.setUint32(central + 16, crc, true);
        view.setUint32(central + 20, file.data.length, true);
        view.setUint32(central + 24, file.data.length, true);
        view.setUint16(central + 28, file.name.length, true);
        view.setUint32(central + 42, offset, true);
        bytes.set(file.name, central + 46);
        central += 46 + file.name.length;
        offset += 30 + file.name.length + file.data.length;
    }
    view.setUint32(central, 0x06054b50, true);
    view.setUint16(central + 8, files.length, true);
    view.setUint16(central + 10, files.length, true);
    view.setUint32(central + 12, centralLength, true);
    view.setUint32(central + 16, localLength, true);
    return bytes;
}
