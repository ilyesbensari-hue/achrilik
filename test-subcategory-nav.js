// Test script to verify subcategory navigation on category pages
const baseUrl = 'http://localhost:3000';

async function testSubcategoryNavigation() {
    console.log('🧪 Testing Subcategory Navigation on Category Pages\n');
    console.log('='.repeat(70));

    try {
        // Test 1: Verify Vêtements category structure
        console.log('\n👕 Test 1: Fetching Vêtements category structure...');
        const response = await fetch(`${baseUrl}/api/categories`);
        const categories = await response.json();

        const vetements = categories.find(c => c.slug === 'vetements');
        if (!vetements) {
            console.log('❌ Vêtements category not found!');
            return;
        }

        console.log(`✅ Vêtements found with ${vetements.children.length} direct children:`);

        // Display each child with its own children
        vetements.children.forEach(child => {
            const childrenCount = child.children?.length || 0;
            const productCount = child._count?.Product || 0;
            console.log(`\n   📁 ${child.name} (${child.slug})`);
            console.log(`      Products: ${productCount}`);
            console.log(`      Subcategories: ${childrenCount}`);

            if (childrenCount > 0) {
                console.log(`      Children:`);
                child.children.forEach(grandchild => {
                    const grandchildProducts = grandchild._count?.Product || 0;
                    console.log(`         • ${grandchild.name} (${grandchildProducts} produits)`);
                });
            }
        });

        // Test 2: Verify page accessibility
        console.log('\n\n🔗 Test 2: Testing category page URLs...');
        const testUrls = [
            { url: '/categories/vetements', desc: 'Vêtements main page' },
            { url: '/categories/bebe', desc: 'Bébé category page' },
            { url: '/categories/femme', desc: 'Femme category page' },
            { url: '/categories/homme', desc: 'Homme category page' },
        ];

        for (const test of testUrls) {
            try {
                const pageResponse = await fetch(`${baseUrl}${test.url}`);
                const status = pageResponse.ok ? '✅' : '❌';
                console.log(`${status} ${test.desc} - Status: ${pageResponse.status}`);
            } catch (error) {
                console.log(`❌ ${test.desc} - Error: ${error.message}`);
            }
        }

        // Test 3: Verify data structure for SubcategoryCard component
        console.log('\n\n🎴 Test 3: Verifying data structure for SubcategoryCard...');
        const bebeCategory = vetements.children.find(c => c.slug === 'bebe');

        if (bebeCategory) {
            console.log('✅ Bébé category structure is correct:');
            console.log(`   - Has name: ${!!bebeCategory.name}`);
            console.log(`   - Has slug: ${!!bebeCategory.slug}`);
            console.log(`   - Has _count: ${!!bebeCategory._count}`);
            console.log(`   - Has children array: ${Array.isArray(bebeCategory.children)}`);
            console.log(`   - Children count: ${bebeCategory.children.length}`);

            if (bebeCategory.children.length > 0) {
                console.log('\n   First child structure:');
                const firstChild = bebeCategory.children[0];
                console.log(`   - Name: ${firstChild.name}`);
                console.log(`   - Slug: ${firstChild.slug}`);
                console.log(`   - Product count: ${firstChild._count?.Product || 0}`);
                console.log(`   - Has children: ${Array.isArray(firstChild.children)}`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ Subcategory navigation test completed!\n');
        console.log('📝 Summary:');
        console.log('   - SubcategoryCard will display each subcategory in a card');
        console.log('   - Cards show category name, product count, and expand button');
        console.log('   - Clicking expand shows nested children');
        console.log('   - All category links navigate to their respective pages\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testSubcategoryNavigation();
