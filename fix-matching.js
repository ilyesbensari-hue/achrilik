const fs = require('fs');

const filePath = './src/app/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic matching logic
const oldLogic = `    // Find matching categories (case-insensitive, check both slug and fallback)
    for (const target of targetSubcategories) {
      const category = allCategories.find(cat => 
        cat.slug.toLowerCase() === target.slug.toLowerCase() ||
        cat.slug.toLowerCase().includes(target.slug) ||
        (target.fallback && cat.slug.toLowerCase().includes(target.fallback))
      );

      if (category) {`;

const newLogic = `    // Find matching categories (EXACT match prioritized to avoid wrong matches)
    for (const target of targetSubcategories) {
      // Try exact match first (prevents matching "blazers-femme" instead of "femme")
      let category = allCategories.find(cat => 
        cat.slug.toLowerCase() === target.slug.toLowerCase()
      );

      if (category) {`;

const newContent = content.replace(oldLogic, newLogic);

if (newContent === content) {
    console.error('ERROR: Pattern not found in file!');
    process.exit(1);
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ File updated successfully!');
