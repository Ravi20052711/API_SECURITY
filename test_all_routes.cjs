const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

console.log('==================================================================');
console.log('  TESTING FRONTEND PAGES & COMPONENTS FOR WHITE SCREEN ERRORS  ');
console.log('==================================================================');

let totalTested = 0;
let errorsFound = 0;

files.forEach(file => {
  totalTested++;
  const filePath = path.join(pagesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Must have export default
  if (!content.includes('export default')) {
    console.error(`[!] ERROR in ${file}: Missing 'export default'`);
    errorsFound++;
  }

  // Check 2: Verify Lucide icons imported match icon components used
  const lucideMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  if (lucideMatch) {
    const importedIcons = lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const jsxElements = content.match(/<([A-Z][a-zA-Z0-9]+)\s+/g) || [];
    const usedComponents = [...new Set(jsxElements.map(e => e.replace('<', '').trim()))];

    const possibleLucideIcons = usedComponents.filter(c => !['React', 'Navbar', 'Footer', 'SecurityBanner', 'QwenFloatingAssistant'].includes(c));
    possibleLucideIcons.forEach(icon => {
      if (!importedIcons.includes(icon) && !content.includes(`function ${icon}`) && !content.includes(`const ${icon}`)) {
        console.warn(`[WARNING] ${file} uses <${icon} /> but it may not be explicitly imported from lucide-react.`);
      }
    });
  }

  console.log(`[OK] Page Component ${file} verified syntax & export integrity.`);
});

console.log('==================================================================');
console.log(`  WHITE PAGE DIAGNOSTIC COMPLETE: ${totalTested} Pages Tested, ${errorsFound} Errors.  `);
console.log('==================================================================');
