// Génère les icônes PNG (iPhone, Android, PC) à partir du dessin vectoriel
// du fronton — sans dépendance externe. Usage : node scripts/make-icons.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const BG = [0x13, 0x1a, 0x3a];
const FG = [0x2d, 0xd4, 0xbf];

function inRoundRect(x, y, rx, ry, w, h, r) {
  if (x < rx || y < ry || x > rx + w || y > ry + h) return false;
  const cx = Math.min(Math.max(x, rx + r), rx + w - r);
  const cy = Math.min(Math.max(y, ry + r), ry + h - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
// distance d'un point à un segment : sert à tracer le chevron « > »
function nearSeg(x, y, x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2 <= w * w;
}
// Invite de commande « >_ » : le terminal, point de départ de tous les métiers visés
function shape(x, y) {
  return (
    nearSeg(x, y, 130, 150, 250, 256, 30) ||
    nearSeg(x, y, 250, 256, 130, 362, 30) ||
    inRoundRect(x, y, 276, 334, 120, 56, 14)
  );
}

function render(size, { rounded, scale = 1 }) {
  const px = Buffer.alloc(size * size * 4);
  const ss = 4;
  for (let j = 0; j < size; j++)
    for (let i = 0; i < size; i++) {
      let fg = 0, inside = 0;
      for (let a = 0; a < ss; a++)
        for (let b = 0; b < ss; b++) {
          const X = ((i + (a + 0.5) / ss) / size) * 512;
          const Y = ((j + (b + 0.5) / ss) / size) * 512;
          const inBg = rounded ? inRoundRect(X, Y, 0, 0, 512, 512, 112) : true;
          if (!inBg) continue;
          inside++;
          const sx = 256 + (X - 256) / scale, sy = 256 + (Y - 256) / scale;
          if (shape(sx, sy)) fg++;
        }
      const n = ss * ss, k = (j * size + i) * 4;
      const f = inside ? fg / inside : 0;
      for (let c = 0; c < 3; c++) px[k + c] = Math.round(BG[c] * (1 - f) + FG[c] * f);
      px[k + 3] = Math.round((inside / n) * 255);
    }
  return png(size, px);
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 4 + 1)] = 0; rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const out = "public/icons/";
writeFileSync(out + "icon-192.png", render(192, { rounded: true }));
writeFileSync(out + "icon-512.png", render(512, { rounded: true }));
writeFileSync(out + "icon-maskable-512.png", render(512, { rounded: false, scale: 0.78 }));
writeFileSync(out + "apple-touch-icon.png", render(180, { rounded: false, scale: 0.86 }));
console.log("Icônes générées.");
