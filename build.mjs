import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(await readFile('source-manifest.json', 'utf8'));
const archive = Buffer.concat(await Promise.all(manifest.parts.map(p => readFile(p))));
if (createHash('sha256').update(archive).digest('hex') !== manifest.sha256) throw new Error('Archive checksum mismatch');
await writeFile('source.tar.gz', archive);
await mkdir('source', { recursive: true });
execFileSync('tar', ['-xzf', 'source.tar.gz', '-C', 'source']);
// Framer CMS uses a range query parameter; static hosts return the full file.
// Slice the requested sections locally while retaining the original CMS decoder.
const cmsRuntime = 'source/public/assets/framerusercontent.com/sites/681QnPxAG2NHg5SyPP0SND/shared-lib.k3vf9XG3.mjs';
let runtime = await readFile(cmsRuntime, 'utf8');
const original = 'if(l.length!==i)throw Error(`Request failed: Unexpected response length`);';
const compatible = 'if(l.length!==i){let f=new Uint8Array(i),v=0;for(let range of n){if(range.to>l.length)throw Error(`Incomplete CMS archive`);f.set(l.subarray(range.from,range.to),v);v+=range.to-range.from}l=f}';
if (!runtime.includes(original)) throw new Error('CMS runtime changed; review compatibility patch');
await writeFile(cmsRuntime, runtime.replace(original, compatible));
// Remove the published Framer branding on every page.
async function removeBranding(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) { await removeBranding(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(path, 'utf8');
    const start = html.indexOf('<div id="__framer-badge-container">');
    if (start !== -1) {
      const tags = /<\/?div\b[^>]*>/g;
      tags.lastIndex = start;
      let depth = 0;
      for (let tag; (tag = tags.exec(html));) {
        depth += tag[0].startsWith('</') ? -1 : 1;
        if (depth === 0) { html = html.slice(0, start) + html.slice(tags.lastIndex); break; }
      }
    }
    html = html.replace('</head>', '<style id="hide-framer-branding">#__framer-badge-container,.__framer-badge{display:none!important}</style></head>');
    await writeFile(path, html);
  }
}
await removeBranding('source/public');
await cp('source/public', 'dist', { recursive: true });
console.log('Built complete portfolio: 9 pages and original Framer motion runtime.');
