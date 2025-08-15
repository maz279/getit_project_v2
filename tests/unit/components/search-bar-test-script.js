// COMPREHENSIVE SEARCH BAR TEST SCRIPT
// Run this in the browser console to test all search capabilities

console.log("🔍 STARTING COMPREHENSIVE SEARCH BAR TEST SUITE");

// Test 1: AI Search
async function testAISearch() {
    console.log("=== Testing AI Search ===");
    try {
        const response = await fetch('/api/search/ai-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "smartphone",
                type: "ai",
                language: "en",
                aiFeatures: { nlp: true, sentiment: true }
            })
        });
        const data = await response.json();
        console.log("✅ AI Search SUCCESS:", data.success, "Results:", data.data?.results?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ AI Search FAILED:", error.message);
        return false;
    }
}

// Test 2: Image Search 
async function testImageSearch() {
    console.log("=== Testing Image Search ===");
    try {
        const response = await fetch('/api/search/image-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: "mock-image-data",
                language: "en"
            })
        });
        const data = await response.json();
        console.log("✅ Image Search SUCCESS:", data.success, "Results:", data.data?.results?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ Image Search FAILED:", error.message);
        return false;
    }
}

// Test 3: QR Code Search
async function testQRSearch() {
    console.log("=== Testing QR Code Search ===");
    try {
        const response = await fetch('/api/search/qr-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                qrData: "https://getit.com/product/smartphone-123",
                language: "en"
            })
        });
        const data = await response.json();
        console.log("✅ QR Search SUCCESS:", data.success, "Results:", data.data?.results?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ QR Search FAILED:", error.message);
        return false;
    }
}

// Test 4: Navigation Search
async function testNavigationSearch() {
    console.log("=== Testing Navigation Search ===");
    try {
        const response = await fetch('/api/search/navigation-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "login",
                language: "en"
            })
        });
        const data = await response.json();
        console.log("✅ Navigation Search SUCCESS:", data.success, "Results:", data.data?.navigationResults?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ Navigation Search FAILED:", error.message);
        return false;
    }
}

// Test 5: Search Suggestions
async function testSearchSuggestions() {
    console.log("=== Testing Search Suggestions ===");
    try {
        const response = await fetch('/api/search/suggestions?query=phone&limit=5');
        const data = await response.json();
        console.log("✅ Search Suggestions SUCCESS:", data.success, "Suggestions:", data.data?.suggestions?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ Search Suggestions FAILED:", error.message);
        return false;
    }
}

// Test 6: Trending Search
async function testTrendingSearch() {
    console.log("=== Testing Trending Search ===");
    try {
        const response = await fetch('/api/search/trending');
        const data = await response.json();
        console.log("✅ Trending Search SUCCESS:", data.success, "Trends:", data.data?.trends?.length || 0);
        return data.success;
    } catch (error) {
        console.log("❌ Trending Search FAILED:", error.message);
        return false;
    }
}

// Test 7: Voice Search (Web Speech API)
function testVoiceSearch() {
    console.log("=== Testing Voice Search (Web Speech API) ===");
    try {
        if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
            console.log("✅ Voice Search API AVAILABLE");
            return true;
        } else {
            console.log("❌ Voice Search API NOT AVAILABLE in this browser");
            return false;
        }
    } catch (error) {
        console.log("❌ Voice Search TEST FAILED:", error.message);
        return false;
    }
}

// Test 8: Search Bar Icons Visibility
function testSearchBarIcons() {
    console.log("=== Testing Search Bar Icons Visibility ===");
    try {
        const searchBar = document.querySelector('[data-testid="ai-search-bar"]') || 
                         document.querySelector('input[placeholder*="Search"]') ||
                         document.querySelector('.search-input');
        
        if (!searchBar) {
            console.log("❌ Search Bar NOT FOUND");
            return false;
        }

        const voiceIcon = document.querySelector('[title*="Voice"]') || 
                         document.querySelector('.mic-icon');
        const imageIcon = document.querySelector('[title*="Image"]') || 
                         document.querySelector('.camera-icon');
        const aiIcon = document.querySelector('[title*="AI"]') || 
                      document.querySelector('.brain-icon');
        const qrIcon = document.querySelector('[title*="QR"]') || 
                      document.querySelector('.qr-icon');

        console.log("✅ Search Bar FOUND");
        console.log("Voice Icon:", !!voiceIcon ? "✅ FOUND" : "❌ MISSING");
        console.log("Image Icon:", !!imageIcon ? "✅ FOUND" : "❌ MISSING");
        console.log("AI Icon:", !!aiIcon ? "✅ FOUND" : "❌ MISSING");
        console.log("QR Icon:", !!qrIcon ? "✅ FOUND" : "❌ MISSING");

        return !!(voiceIcon && imageIcon && aiIcon && qrIcon);
    } catch (error) {
        console.log("❌ Search Bar Icons TEST FAILED:", error.message);
        return false;
    }
}

// Run All Tests
async function runAllTests() {
    console.log("🚀 RUNNING COMPREHENSIVE SEARCH BAR TEST SUITE...\n");
    
    const results = {
        aiSearch: await testAISearch(),
        imageSearch: await testImageSearch(),
        qrSearch: await testQRSearch(),
        navigationSearch: await testNavigationSearch(),
        searchSuggestions: await testSearchSuggestions(),
        trendingSearch: await testTrendingSearch(),
        voiceSearchAPI: testVoiceSearch(),
        searchBarIcons: testSearchBarIcons()
    };

    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    const successRate = Math.round((passed / total) * 100);

    console.log("\n📊 COMPREHENSIVE TEST RESULTS:");
    console.log("=".repeat(50));
    Object.entries(results).forEach(([test, result]) => {
        console.log(`${result ? "✅" : "❌"} ${test}: ${result ? "PASS" : "FAIL"}`);
    });
    console.log("=".repeat(50));
    console.log(`🎯 SUCCESS RATE: ${successRate}% (${passed}/${total} tests passed)`);
    console.log("🔍 SEARCH BAR INVESTIGATION COMPLETE");

    return { results, successRate, passed, total };
}

// Auto-run tests
runAllTests();