// Consolidated toast replacement utility
// Use this to check which admin files need toast  replacements

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const adminDir = 'src/app/admin';

function findAlertUsage(dir: string): { file: string; count: number }[] {
    const results: { file: string; count: number }[] = [];

    function scan(directory: string) {
        const items = readdirSync(directory);
        items.forEach(item => {
            const fullPath = join(directory, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory() && !item.startsWith('.')) {
                scan(fullPath);
            } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                const content = readFileSync(fullPath, 'utf-8');
                const matches = content.match(/alert\(/g);
                if (matches && matches.length > 0) {
                    results.push({
                        file: fullPath,
                        count: matches.length
                    });
                }
            }
        });
    }

    scan(dir);
    return results.sort((a, b) => b.count - a.count);
}

const usage = findAlertUsage(adminDir);
console.log('📊 Alert Usage in Admin Files:\n');
usage.forEach(({ file, count }) => {
    console.log(`${count.toString().padStart(2)} alerts → ${file.replace('src/app/admin/', '')}`);
});
console.log(`\n✅ Total: ${usage.reduce((sum, { count }) => sum + count, 0)} alerts in ${usage.length} files`);
