// JavaScript for search functionality

document.addEventListener('DOMContentLoaded', function() {
    // The router.js file will handle loading search results

    // Add event listeners for filter options
    setupFilterListeners();
});

// Setup filter listeners for search page
function setupFilterListeners() {
    // Price range filters
    const priceRangeFilters = document.querySelectorAll('#price-range-1, #price-range-2, #price-range-3, #price-range-4');
    priceRangeFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Category filters
    const categoryFilters = document.querySelectorAll('#category-electronics, #category-jewelery, #category-men, #category-women');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });

    // Rating filters
    const ratingFilters = document.querySelectorAll('#rating-4, #rating-3, #rating-2');
    ratingFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
}

// Apply filters to search results
function applyFilters() {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const category = urlParams.get('category');

    updateFilterNotice(); // 🆕 Update the filter notice on filter change

    if (query) {
        searchProducts(query);
    } else if (category) {
        searchProductsByCategory(category);
    }
}

// 🆕 Show a message if any filters are active
function updateFilterNotice() {
    const noticeElement = document.getElementById('filter-notice');
    if (!noticeElement) return;

    const filtersApplied = 
        document.querySelectorAll('#filters input[type="checkbox"]:checked').length > 0;

    if (filtersApplied) {
        noticeElement.innerHTML = `<div class="alert alert-info mb-3">Filters applied. Refine your search above.</div>`;
    } else {
        noticeElement.innerHTML = '';
    }
}

// Search products by category
async function searchProductsByCategory(category) {
    try {
        showLoading('search-results-container');

        const response = await fetch(`${API_BASE_URL}/products/category/${category}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();

        const filteredResults = applyActiveFilters(products);
        displaySearchResults(filteredResults, category);
    } catch (error) {
        console.error('Error searching products by category:', error);
        showError('Failed to search products. Please try again later.');
    }
}

// Search products by query
async function searchProducts(query) {
    try {
        showLoading('search-results-container');

        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        const results = filterProductsByQuery(products, query);

        try {
            const categoryResponse = await fetch(`${API_BASE_URL}/products/category/${query}`);
            if (categoryResponse.ok) {
                const categoryProducts = await categoryResponse.json();
                categoryProducts.forEach(product => {
                    if (!results.some(p => p.id === product.id)) {
                        results.push(product);
                    }
                });
            }
        } catch {
            console.log('Category search failed, using text search results only');
        }

        const filteredResults = applyActiveFilters(results);
        displaySearchResults(filteredResults, query);
    } catch (error) {
        console.error('Error searching products:', error);
        showError('Failed to search products. Please try again later.');
    }
}

// Apply active filters to results
function applyActiveFilters(products) {
    let filteredProducts = [...products];

    const priceUnder25 = document.getElementById('price-range-1')?.checked;
    const price25to50 = document.getElementById('price-range-2')?.checked;
    const price50to100 = document.getElementById('price-range-3')?.checked;
    const priceOver100 = document.getElementById('price-range-4')?.checked;

    if (priceUnder25 || price25to50 || price50to100 || priceOver100) {
        filteredProducts = filteredProducts.filter(product => {
            const price = product.price;
            return (priceUnder25 && price < 25) || 
                   (price25to50 && price >= 25 && price < 50) || 
                   (price50to100 && price >= 50 && price < 100) || 
                   (priceOver100 && price >= 100);
        });
    }

    const electronicsFilter = document.getElementById('category-electronics')?.checked;
    const jeweleryFilter = document.getElementById('category-jewelery')?.checked;
    const menClothingFilter = document.getElementById('category-men')?.checked;
    const womenClothingFilter = document.getElementById('category-women')?.checked;

    if (electronicsFilter || jeweleryFilter || menClothingFilter || womenClothingFilter) {
        filteredProducts = filteredProducts.filter(product => {
            const category = product.category.toLowerCase();
            return (electronicsFilter && category === 'electronics') || 
                   (jeweleryFilter && category === 'jewelery') || 
                   (menClothingFilter && category === "men's clothing") || 
                   (womenClothingFilter && category === "women's clothing");
        });
    }

    const rating4Plus = document.getElementById('rating-4')?.checked;
    const rating3Plus = document.getElementById('rating-3')?.checked;
    const rating2Plus = document.getElementById('rating-2')?.checked;

    if (rating4Plus || rating3Plus || rating2Plus) {
        filteredProducts = filteredProducts.filter(product => {
            const rating = product.rating?.rate || 0;
            return (rating4Plus && rating >= 4) || 
                   (rating3Plus && rating >= 3) || 
                   (rating2Plus && rating >= 2);
        });
    }

    return filteredProducts;
}

// Filter products by query string
function filterProductsByQuery(products, query) {
    query = query.toLowerCase();

    return products.filter(product => {
        return (
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );
    });
}

// Display search results
function displaySearchResults(results, query) {
    const searchResultsContainer = document.getElementById('search-results-container');

    if (!results || results.length === 0) {
        showNoResults(`No results found for "${query}"`);
        return;
    }

    const resultsCountElement = document.getElementById('results-count');
    if (resultsCountElement) {
        resultsCountElement.textContent = results.length;
    }

    let resultsHTML = '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">';

    results.forEach(product => {
        resultsHTML += `
            <div class="col">
                <div class="card h-100 product-card">
                    <div class="card-img-container p-3 text-center">
                        <img src="${product.image}" class="card-img-top product-img" alt="${product.title}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title product-title">${product.title}</h5>
                        <div class="mb-2">
                            ${formatRating(product.rating)}
                        </div>
                        <p class="card-text product-price fw-bold">${formatPrice(product.price)}</p>
                        <div class="d-grid gap-2">
                            <a href="product.html?id=${product.id}" class="btn btn-outline-primary">View Details</a>
                            <button class="btn add-to-cart-btn" style="background-color: #d3d3d3; color: black;" data-product-id="${product.id}">
                                <i class="fas fa-cart-plus me-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    });

    resultsHTML += '</div>';
    searchResultsContainer.innerHTML = resultsHTML;

    // Ensure the filter notice reflects current filter status
    updateFilterNotice(); // 🆕 Also update after search results are displayed

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const product = await response.json();
                addToCart(product);
            } catch (error) {
                console.error('Error adding to cart:', error);
                showError('Failed to add product to cart.');
            }
        });
    });
}

// Show no results message
function showNoResults(message) {
    const searchResultsContainer = document.getElementById('search-results-container');

    searchResultsContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-search fa-4x mb-3 text-muted"></i>
            <h3>${message}</h3>
            <p class="text-muted">Try different keywords or browse our products.</p>
            <a href="index.html" class="btn btn-primary mt-3">Browse All Products</a>
        </div>
    `;

    const resultsCountElement = document.getElementById('results-count');
    if (resultsCountElement) {
        resultsCountElement.textContent = '0';
    }

    updateFilterNotice(); // 🆕 Clear or update notice if necessary
}
