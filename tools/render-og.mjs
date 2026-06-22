// Renders the Open Graph share cards (PNG) from og-render.html using the
// installed Google Chrome via puppeteer-core. Deterministic: animations are
// frozen and we wait for fonts + the ocean/mascot paint before capturing.
//
// Run: `cd tools && npm install && npm run og`
// Outputs ../public/og-card.png (1200x630) and og-card-square.png (1200x1200).

import puppeteer from 'puppeteer-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUB = join(HERE, '..', 'public');
const PAGE = pathToFileURL(join(HERE, 'og-render.html')).href;

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const CARDS = [
  { file: 'og-card.png', card: 'landscape', w: 1200, h: 630 },
  { file: 'og-card-square.png', card: 'square', w: 1200, h: 1200 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
});

try {
  for (const c of CARDS) {
    const page = await browser.newPage();
    await page.setViewport({ width: c.w, height: c.h, deviceScaleFactor: 1 });
    await page.goto(`${PAGE}?card=${c.card}&w=${c.w}&h=${c.h}`, {
      waitUntil: 'networkidle0',
    });
    await page.waitForSelector('body[data-ready="1"]', { timeout: 20000 });
    const stage = await page.$('#stage');
    await stage.screenshot({ path: join(PUB, c.file) });
    await page.close();
    console.log(`✓ ${c.file} (${c.w}x${c.h})`);
  }
} finally {
  await browser.close();
}
console.log('✓ Share cards regenerated in public/.');
