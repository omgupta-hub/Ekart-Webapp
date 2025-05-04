// Router.js - Handles client-side routing for the Amazon clone

document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            
            if (query) {
                // Redirect to search page with query
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Set up event listeners for category links
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                window.location.href = `search.html?category=${encodeURIComponent(category)}`;
            }
        });
    });

    // Check if we're on the product detail page and need to load a specific product
    if (window.location.pathname.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            loadProductDetail(productId);
        } else {
            showError('Product ID not found. Please go back to the homepage.');
        }
    }

    // Check if we're on the search page and need to perform a search
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        const category = urlParams.get('category');
        
        if (query) {
            // Update search input with query
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = query;
            }
            
            // Display search query in results heading
            const searchQueryElement = document.getElementById('search-query');
            if (searchQueryElement) {
                searchQueryElement.textContent = query;
            }
            
            // Perform search
            searchProducts(query);
        } else if (category) {
            // Display category in results heading
            const searchQueryElement = document.getElementById('search-query');
            if (searchQueryElement) {
                searchQueryElement.textContent = category;
            }
            
            // Perform category search
            searchProductsByCategory(category);
        } else {
            // No search query or category provided
            showNoResults('Please enter a search term or select a category');
        }
    }

    // Initialize cart count on all pages
    updateCartCount();
});

// === API + UI Handling ===

async function searchProducts(query) {
    try {
        const res = await fetch('https://fakestoreapi.com/products');
        const products = await res.json();

        const filtered = products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );

        displaySearchResults(filtered);
    } catch (err) {
        console.error(err);
        showNoResults('Error loading search results. Please try again.');
    }
}

async function searchProductsByCategory(category) {
    try {
        const res = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`);
        const products = await res.json();

        displaySearchResults(products);
    } catch (err) {
        console.error(err);
        showNoResults('Error loading category results. Please try again.');
    }
}

function displaySearchResults(products) {
    const container = document.getElementById('search-results');
    const message = document.getElementById('no-results-message');

    container.innerHTML = '';
    message.textContent = '';

    if (!products || products.length === 0) {
        showNoResults('No products found.');
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white shadow rounded-lg p-4';

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain mb-4">
            <h3 class="text-md font-semibold mb-2">${product.title}</h3>
            <p class="text-sm text-gray-600 mb-2">$${product.price}</p>
            <a href="product.html?id=${product.id}" class="text-blue-600 hover:underline">View Details</a>
        `;

        container.appendChild(card);
    });
}

function showNoResults(msg) {
    const container = document.getElementById('search-results');
    const message = document.getElementById('no-results-message');

    container.innerHTML = '';
    message.textContent = msg;
}
