const fs = require('fs');
const path = require('path');
const lucide = require('lucide-react');

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  // Handle multiline imports
  const matches = [...content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g)];
  for (const match of matches) {
    const imports = match[1].split(',').map(s => s.trim().split(' as ')[0]).filter(Boolean);
    imports.forEach(imp => {
      if(!lucide[imp]) console.log('UNDEFINED ICON:', imp, 'in', file);
    });
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) checkFile(p);
  });
}

walk('src');
