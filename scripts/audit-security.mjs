import fs from 'node:fs';
import path from 'node:path';

function walk(dir, exts = ['.ts', '.js', '.mjs', '.json', '.html', '.md']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.wrangler') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

const targetFiles = [
  ...walk('src'),
  ...walk('worker/src'),
  ...walk('.', ['.json']).filter(f => !f.includes('node_modules'))
];

console.log(`Auditing ${targetFiles.length} files in ScatterLeaf for DevSecOps Sentinel compliance...\n`);

const findings = [];

// 1. Secret Scanning Patterns
const secretPatterns = [
  { name: 'Private Key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'GitHub Personal Token', regex: /ghp_[0-9a-zA-Z]{36}/ },
  { name: 'Google API Key', regex: /AIzaSy[0-9a-zA-Z\\-_]{33}/ },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Hardcoded Secret/Password', regex: /(client_secret|api_key|password)\s*[:=]\s*["'][^"']{8,}["']/i }
];

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');

  for (const pat of secretPatterns) {
    const match = content.match(pat.regex);
    if (match) {
      if (/\$\{?[A-Z0-9_]+\}?/.test(match[0]) || /<[a-zA-Z0-9_-]+>/.test(match[0]) || /example|dummy|placeholder/i.test(match[0])) {
        continue;
      }
      findings.push({ severity: 'HIGH', category: 'Secret Leak', file: rel, detail: `Pattern ${pat.name} matched: "${match[0].slice(0, 50)}"` });
    }
  }
}

console.log('=============================================');
console.log('       DEVSECOPS SENTINEL AUDIT REPORT       ');
console.log('=============================================');
console.log(`Source Files Audited:   ${targetFiles.length}`);
console.log(`Security Findings:      ${findings.length}`);
console.log('=============================================\n');

if (findings.length > 0) {
  console.log('Findings:');
  findings.forEach((f, idx) => {
    console.log(`[${idx + 1}] [${f.severity}] [${f.category}] in ${f.file}:`);
    console.log(`    ${f.detail}`);
  });
  process.exit(1);
} else {
  console.log('🎉 100% SECURE: Zero credential leaks across ScatterLeaf Web Component and Worker!');
}
