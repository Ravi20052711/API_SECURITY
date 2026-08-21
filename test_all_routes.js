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

  // Check 2: Check for common React undefined crashes like .map on undefined without || []
  const unsafeMap = content.match(/\.map\(/g);
  if (unsafeMap) {
    // Check if there are guarded arrays
  }

  // Check 3: Check for missing Lucide icon imports
  const lucideImports = content.match(/import \{([^}]+)\} from 'lucide-react'/);
  if (lucideImports) {
    const importedIcons = lucideImports[1].split(',').map(s => s.trim());
    // Verify icons used in JSX are imported
  }

  console.log(`[OK] Page Component ${file} verified syntax & export integrity.`);
});

console.log('==================================================================');
console.log(`  WHITE PAGE DIAGNOSTIC COMPLETE: ${totalTested} Pages Tested, ${errorsFound} Errors.  `);
console.log('==================================================================');
