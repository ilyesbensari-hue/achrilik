const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Files to remove (unused placeholders)
const UNUSED_FILES = [
    'placeholder-watch.png',
    'placeholder-shoe.png',
    'placeholder-headset.png',
    'placeholder-cream.png',
    'placeholder-blender.png',
    'placeholder-bag.png',
    'uploads/products/tech-hero.png'
];

// Files to optimize (keep as PNG but compress)
const OPTIMIZE_FILES = [
    'logo-achrilik-transparent.png',
    'logo-achrilik.png',
    'achrilik-logo-final.png',
    'og-image.jpg'
];

async function optimizeImages() {
    console.log('🚀 Starting image optimization...\n');

    let totalSaved = 0;

    // Step 1: Remove unused files
    console.log('📦 Step 1: Removing unused placeholder files...');
    for (const file of UNUSED_FILES) {
        const filePath = path.join(PUBLIC_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            fs.unlinkSync(filePath);
            totalSaved += stats.size;
            console.log(`   ✅ Deleted ${file} (${(stats.size / 1024).toFixed(0)}KB)`);
        }
    }

    console.log(`\n💾 Freed ${(totalSaved / 1024 / 1024).toFixed(2)}MB\n`);

    // Step 2: Optimize remaining images
    console.log('🖼️  Step 2: Optimizing images...');

    for (const file of OPTIMIZE_FILES) {
        const filePath = path.join(PUBLIC_DIR, file);
        if (fs.existsSync(filePath)) {
            const originalStats = fs.statSync(filePath);
            const originalSize = originalStats.size;

            try {
                const ext = path.extname(file).toLowerCase();
                const tempPath = filePath + '.tmp';

                if (ext === '.png') {
                    // Compress PNG
                    await sharp(filePath)
                        .png({
                            quality: 85,
                            compressionLevel: 9,
                            adaptiveFiltering: true
                        })
                        .toFile(tempPath);
                } else if (ext === '.jpg' || ext === '.jpeg') {
                    // Compress JPEG
                    await sharp(filePath)
                        .jpeg({ quality: 85, progressive: true })
                        .toFile(tempPath);
                }

                const newStats = fs.statSync(tempPath);
                const newSize = newStats.size;
                const saved = originalSize - newSize;
                const savedPercent = ((saved / originalSize) * 100).toFixed(1);

                // Replace original with optimized
                fs.unlinkSync(filePath);
                fs.renameSync(tempPath, filePath);

                totalSaved += saved;
                console.log(`   ✅ ${file}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${savedPercent}% saved)`);
            } catch (error) {
                console.log(`   ⚠️  ${file}: Failed to optimize (${error.message})`);
            }
        }
    }

    console.log(`\n✨ Total bandwidth saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
    console.log('🎉 Optimization complete!\n');
}

optimizeImages().catch(console.error);
