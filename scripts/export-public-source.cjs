// Export the reviewed working tree without history or ignored local files.
// Existing exports are never overwritten. This does not publish a repository.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public-release', 'source');
if (fs.existsSync(output)) throw new Error('Export already exists; use a new reviewed snapshot instead of overwriting it.');
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
  { cwd: root }).toString().split('\0').filter(Boolean);
let count = 0;
for (const file of new Set(files)) {
  const source = path.resolve(root, file);
  const target = path.resolve(output, file);
  if (!source.startsWith(root + path.sep) || !target.startsWith(output + path.sep)) throw new Error('Path outside export boundary');
  if (!fs.existsSync(source)) continue;
  if (!fs.lstatSync(source).isFile()) throw new Error('Only regular files may be exported');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  count++;
}
console.log(`Exported ${count} files without Git history to ${output}`);
