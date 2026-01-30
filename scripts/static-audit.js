const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../src');
const REPORT = {
    unsecuredRoutes: [],
    consoleLogs: [],
    envVars: new Set(),
    todos: []
};

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            analyzeFile(fullPath);
        }
    });
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);

    // 1. Check API Security
    if (relativePath.includes('app/api') && relativePath.endsWith('route.ts')) {
        // Skip public routes (auth login/register/upload ideally public or handled differently)
        if (!relativePath.includes('auth/login') && !relativePath.includes('auth/register') && !relativePath.includes('upload')) {
            const hasAuth = content.includes('verifyToken') ||
                content.includes('next-auth') ||
                content.includes('userId') // Heuristic: checking userId from query often implies *some* logic, but verifyToken is better
                || content.includes('headers.get("authorization")');

            if (!hasAuth && !content.includes('verifyToken')) {
                REPORT.unsecuredRoutes.push(relativePath);
            }
        }
    }

    // 2. Console Logs (excluding errors)
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('console.log')) {
            REPORT.consoleLogs.push(`${relativePath}:${index + 1}`);
        }
        if (line.includes('TODO') || line.includes('FIXME')) {
            REPORT.todos.push(`${relativePath}:${index + 1} - ${line.trim()}`);
        }
    });

    // 3. Env Vars
    const envMatches = content.match(/process\.env\.([A-Z_0-9]+)/g);
    if (envMatches) {
        envMatches.forEach(match => REPORT.envVars.add(match.replace('process.env.', '')));
    }
}

console.log('🔍 Starting Static Code Audit...');
scanDir(ROOT_DIR);

console.log('\n--- 🚨 POTENTIALLY UNSECURED API ROUTES ---');
if (REPORT.unsecuredRoutes.length === 0) console.log('✅ None found.');
REPORT.unsecuredRoutes.forEach(route => console.log(`❌ ${route}`));

console.log('\n--- 📝 ENV VARIABLES USED ---');
console.log(Array.from(REPORT.envVars).join(', '));

console.log(`\n--- ⚠️  CONSOLE LOGS FOUND: ${REPORT.consoleLogs.length} ---`);
// Only show first 5
REPORT.consoleLogs.slice(0, 5).forEach(log => console.log(log));
if (REPORT.consoleLogs.length > 5) console.log(`...and ${REPORT.consoleLogs.length - 5} more.`);

console.log(`\n--- 📌 TODOS/FIXMES FOUND: ${REPORT.todos.length} ---`);
REPORT.todos.slice(0, 5).forEach(todo => console.log(todo));

