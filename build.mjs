import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
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
await cp('source/public', 'dist', { recursive: true });
console.log('Built complete portfolio: 9 pages and original Framer motion runtime.');
