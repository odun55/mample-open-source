// Read-only release check. Never prints matched credential values.
// This targeted scan supplements, rather than replaces, a dedicated secret scanner.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const git = (...args) => execFileSync('git', args, { maxBuffer: 128 * 1024 * 1024 });
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]{30,}?-----END/],
  ['github-token', /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})/],
  ['oauth-token', /ya29\.[A-Za-z0-9_-]{30,}/],
  ['jwt', /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/],
  ['fcm-token', /[A-Za-z0-9_-]{15,}:APA91[A-Za-z0-9_-]{40,}/],
  ['service-account', /"type"\s*:\s*"service_account"/],
  ['credential-in-url', /https?:\/\/[^\s/:]{2,}:[^\s/@]{8,}@/],
];
const unsafePath = /(?:^|\/)(?:key\.properties|[^/]+\.(?:jks|keystore|pem)|\.env(?:\.(?!example$)[^/]+)?|logcat[^/]*\.txt|deploy\.log|scratch\.txt)$|(?:^|\/)[^/]*service[-_]account[^/]*\.json$/i;
function scan(data, where) {
  if (data.includes(0)) return;
  const content = data.toString('utf8');
  for (const [rule, pattern] of patterns) {
    const match = pattern.exec(content);
    if (match) {
      const line = content.slice(0, match.index).split('\n').length;
      findings.push({ ...where, rule, line });
    }
  }
}
const findings = [];
const history = process.argv.includes('--history');
if (history) {
  const objects = git('rev-list', '--objects', '--all').toString().trim().split('\n');
  const metadata = execFileSync('git', ['cat-file', '--batch-check=%(objectname) %(objecttype)'],
    { input: objects.map(line => line.split(' ')[0]).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024 }).toString().trim().split('\n');
  let blobs = 0;
  objects.forEach((entry, index) => {
    if (!metadata[index].endsWith(' blob')) return;
    const space = entry.indexOf(' ');
    const object = entry.slice(0, space);
    const file = entry.slice(space + 1);
    blobs++;
    if (unsafePath.test(file)) findings.push({ file, object, rule: 'private-artifact-path' });
    scan(git('cat-file', 'blob', object), { file, object });
  });
  console.log(JSON.stringify({ scope: 'all-local-git-refs', blobs, findings }, null, 2));
} else {
  const files = git('ls-files', '-z', '--cached', '--others', '--exclude-standard').toString().split('\0').filter(Boolean);
  for (const file of new Set(files)) {
    if (!fs.existsSync(file)) continue;
    if (unsafePath.test(file)) findings.push({ file, rule: 'private-artifact-path' });
    scan(fs.readFileSync(file), { file });
  }
  console.log(JSON.stringify({ scope: 'working-tree', findings }, null, 2));
}
process.exitCode = findings.length ? 1 : 0;
