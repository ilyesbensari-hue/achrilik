// Test script to verify all category navigation paths
const baseUrl = 'http://localhost:3000';

async function testCategories() {
    console.log('🧪 Testing Category Navigation System\n');
    console.log('=' .repeat(60));

    try {
        // Test 1: Fetch all categories
        console.log('\n📋 Test 1: Fetching all categories from API...');
        const response = await fetch(`${baseUrl}/api/categories`);
        const categories = await response.json();
        
        console.log(`✅ Found ${categories.length} top-level categories:`);
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.slug})`);
            console.log(`     Children: ${cat.children?.length || 0}`);
        });

        // Test 2: Verify Vêtements category structure
        console.log('\n👕 Test 2: Verifying Vêtements category structure...');
        const vetements = categories.find(c => c.slug === 'vetements');
        if (vetements) {
            console.log(`✅ Vêtements category found with ${vetements.children.length} children:`);
            vetements.children.forEach(child => {
                const childCount = child.children?.length || 0;
                console.log(`   - ${child.name} (${child.slug}) - ${childCount} subcategories`);
            });
        } else {
            console.log('❌ Vêtements category not found!');
        }

        // Test 3: Verify Bébé subcategories
        console.log('\n👶 Test 3: Verifying Bébé subcategories...');
        const bebe = vetements?.children.find(c => c.slug === 'bebe');
        if (bebe) {
            console.log(`✅ Bébé category found with ${bebe.children.length} subcategories:`);
            bebe.children.forEach(sub => {
                console.log(`   - ${sub.name} (${sub.slug})`);
            });
            
            // Verify expected subcategories
            const expectedSubs = ['Bodies', 'Ensembles', 'Pyjamas'];
            const foundSubs = bebe.children.map(c => c.name);
            const allFound = expectedSubs.every(name => foundSubs.includes(name));
            
            if (allFound) {
                console.log('✅ All expected Bébé subcategories found!');
            } else {
                console.log('⚠️  Some expected subcategories missing');
                console.log(`   Expected: ${expectedSubs.join(', ')}`);
                console.log(`   Found: ${foundSubs.join(', ')}`);
            }
        } else {
            console.log('❌ Bébé category not found!');
        }

        // Test 4: Verify all categories with children
        console.log('\n🌳 Test 4: Category hierarchy overview...');
        let totalCategories = 0;
        let totalWithChildren = 0;
        
        function countCategories(cats, depth = 0) {
            cats.forEach(cat => {
                totalCategories++;
                const indent = '  '.repeat(depth);
                const childInfo = cat.children?.length > 0 ? ` (${cat.children.length} children)` : '';
                console.log(`${indent}${cat.name}${childInfo}`);
                
                if (cat.children?.length > 0) {
                    totalWithChildren++;
                    countCategories(cat.children, depth + 1);
                }
            });
        }
        
        countCategories(categories);
        console.log(`\n📊 Total categories: ${totalCategories}`);
        console.log(`📊 Categories with children: ${totalWithChildren}`);

        // Test 5: Test specific category pages
        console.log('\n🔗 Test 5: Testing category page URLs...');
        const testUrls = [
            '/categories',
            '/categories/vetements',
            '/categories/bebe',
            '/categories/bodies-bebe',
            '/categories/ensembles-bebe',
            '/categories/pyjamas-bebe'
        ];

        for (const url of testUrls) {
            try {
                const pageResponse = await fetch(`${baseUrl}${url}`);
                const status = pageResponse.ok ? '✅' : '❌';
                console.log(`${status} ${url} - Status: ${pageResponse.status}`);
            } catch (error) {
                console.log(`❌ ${url} - Error: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Category navigation test completed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testCategories();
