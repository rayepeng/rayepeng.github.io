const sharp = require('sharp');
async function go() {
  const items = [
    { name: 'small', w: 200, h: 100, r: 74, g: 144, b: 217 },
    { name: 'medium', w: 800, h: 400, r: 80, g: 200, b: 120 },
    { name: 'wide', w: 1600, h: 600, r: 230, g: 126, b: 34 },
  ];
  for (const it of items) {
    const svg = `<svg width="${it.w}" height="${it.h}">
      <rect fill="rgb(${it.r},${it.g},${it.b})" width="${it.w}" height="${it.h}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="white" font-size="${Math.floor(it.w / 12)}">${it.name} ${it.w}x${it.h}</text>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(`public/test-images/${it.name}.png`);
    console.log(`Created ${it.name}.png ${it.w}x${it.h}`);
  }
}
go().catch(e => { console.error(e); process.exit(1); });
