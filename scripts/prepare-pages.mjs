import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const scripts = ['map-data.js', 'room-contract.js', 'room-identification.js',
  'schedule-engine.js', 'schedule-fixture.js', 'map-semantics.js', 'schematic-layout.js',
  'timetable-room-policy.js', 'timetable-adapter.js', 'timetable-api.js', 'timetable-ui.js'];

export function runtimeFiles(source) {
  const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
  const actual = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(m => m[1]);
  if (JSON.stringify(actual) !== JSON.stringify(scripts) &&
      JSON.stringify(actual) !== JSON.stringify(scripts.slice(0, 7))) {
    throw new Error('Unexpected runtime script paths or loading order');
  }
  if (/<(?:link|img)\b[^>]*(?:href|src)=["'](?!data:)[^"']+/i.test(html)) {
    throw new Error('Unreviewed linked runtime asset');
  }
  return ['index.html', ...actual];
}

export function preparePages(source, output) {
  source = fs.realpathSync(source);
  output = path.resolve(output);
  if (source === output || source.startsWith(output + path.sep)) throw new Error('Output must not contain source');
  if (fs.existsSync(output) && fs.readdirSync(output).length) throw new Error('Output must be new or empty');
  const files = runtimeFiles(source);
  for (const name of files) {
    const file = path.join(source, name);
    if (fs.lstatSync(file).isSymbolicLink() || !fs.statSync(file).isFile()) throw new Error('Runtime must be a regular file: ' + name);
    if (!fs.readdirSync(source).includes(name)) throw new Error('Filename case mismatch: ' + name);
    const text = fs.readFileSync(file, 'utf8');
    if (/C:[\\/]Users[\\/]|sourceMappingURL\s*=|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/i.test(text)) {
      throw new Error('Unreviewed local path, source map or credential in runtime: ' + name);
    }
  }
  fs.mkdirSync(output, { recursive: true });
  for (const name of files) fs.copyFileSync(path.join(source, name), path.join(output, name));
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  return [...files, '.nojekyll'];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error('Usage: node scripts/prepare-pages.mjs SOURCE_DIR EMPTY_OUTPUT_DIR');
  console.log(JSON.stringify({ files: preparePages(process.argv[2], process.argv[3]) }, null, 2));
}
