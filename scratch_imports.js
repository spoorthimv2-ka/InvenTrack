const fs = require('fs');
const path = require('path');

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for named imports
  const namedMatches = [...content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)];
  for (const match of namedMatches) {
    const imports = match[1].split(',').map(s => s.trim().split(' as ')[0].trim()).filter(Boolean);
    const mod = match[2];
    // Only check local imports
    if (!mod.startsWith('@/') && !mod.startsWith('./') && !mod.startsWith('../')) continue;
    // Resolve path
    let resolved = mod;
    if (mod.startsWith('@/')) resolved = mod.replace('@/', 'src/');
    else resolved = path.resolve(path.dirname(file), mod);
    
    // Try common extensions
    const exts = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
    let found = false;
    let fileContent = '';
    for (const ext of exts) {
      const full = resolved.startsWith('src/') ? path.join(process.cwd(), resolved + ext) : resolved + ext;
      if (fs.existsSync(full)) {
        fileContent = fs.readFileSync(full, 'utf8');
        found = true;
        break;
      }
    }
    if (!found) continue;
    
    for (const imp of imports) {
      if (imp === 'type' || imp.startsWith('type ')) continue;
      // Check if exported
      const exportPatterns = [
        new RegExp(`export\\s+(default\\s+)?(function|class|const|let|var|async\\s+function)\\s+${imp}\\b`),
        new RegExp(`export\\s+\\{[^}]*\\b${imp}\\b[^}]*\\}`),
        new RegExp(`export\\s+type\\s+(\\{[^}]*\\b${imp}\\b[^}]*\\}|${imp}\\b)`),
      ];
      const isExported = exportPatterns.some(p => p.test(fileContent));
      if (!isExported) {
        console.log(`MISSING EXPORT: "${imp}" imported from "${mod}" in ${file}`);
      }
    }
  }
  
  // Check for default imports
  const defaultMatches = [...content.matchAll(/import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g)];
  for (const match of defaultMatches) {
    const name = match[1];
    const mod = match[2];
    if (!mod.startsWith('@/') && !mod.startsWith('./') && !mod.startsWith('../')) continue;
    let resolved = mod;
    if (mod.startsWith('@/')) resolved = mod.replace('@/', 'src/');
    else resolved = path.resolve(path.dirname(file), mod);
    
    const exts = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
    let found = false;
    let fileContent = '';
    for (const ext of exts) {
      const full = resolved.startsWith('src/') ? path.join(process.cwd(), resolved + ext) : resolved + ext;
      if (fs.existsSync(full)) {
        fileContent = fs.readFileSync(full, 'utf8');
        found = true;
        break;
      }
    }
    if (!found) continue;
    
    const hasDefault = /export\s+default\b/.test(fileContent);
    if (!hasDefault) {
      console.log(`MISSING DEFAULT EXPORT in "${mod}" — imported as "${name}" in ${file}`);
    }
  }
}

function walk(dir) {
  try {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      try {
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.tsx') || p.endsWith('.ts')) checkFile(p);
      } catch(e) { /* ignore */ }
    });
  } catch(e) { /* ignore */ }
}

walk('src');
console.log('Done checking imports.');
