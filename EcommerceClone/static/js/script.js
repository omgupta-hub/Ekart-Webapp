document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let allProducts = [];
  let filteredProducts = [];
  let categories = [];
  const cart = loadCart();

  // DOM elements
  const productsContainer = document.getElementById('products-container');
  const featuredProductsContainer = document.getElementById('featured-products');
  const loadingIndicator = document.getElementById('loading-indicator');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const categorySelect = document.getElementById('category-select');
  const sortSelect = document.getElementById('sort-select');
  const cartCountElement = document.getElementById('cart-count');

  // Initialize
  init();

  // Functions
  async function init() {
    updateCartCount();
    await fetchCategories();
    await fetchProducts();
    setupEventListeners();
  }

  // Fetch categories from FakeStore API directly
  async function fetchCategories() {
    try {
      const response = await fetch('https://fakestoreapi.com/products/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      categories = await response.json();
      populateCategoryDropdown();
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Populate category dropdown with fetched categories
  function populateCategoryDropdown() {
    categorySelect.innerHTML = '<option value="all">All</option>';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = capitalizeFirstLetter(category);
      categorySelect.appendChild(option);
    });
  }

  // Fetch products from FakeStore API directly
  async function fetchProducts() {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      allProducts = await response.json();
      filteredProducts = [...allProducts];
      
      loadingIndicator.remove();
      renderProducts(allProducts);
      renderFeaturedProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      loadingIndicator.innerHTML = `
        <div class="text-center py-10">
          <p class="text-red-500">Error loading products. Please try again later.</p>
        </div>
      `;
    }
  }

  // Render products to the grid with animation
  function renderProducts(products) {
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
      productsContainer.innerHTML = `
        <div class="col-span-full text-center py-10 animate-fadeIn">
          <p>No products found matching your criteria. Try a different search or category.</p>
        </div>
      `;
      return;
    }
    
    // Using setTimeout to stagger the animations
    products.forEach((product, index) => {
      setTimeout(() => {
        const productCard = createProductCard(product);
        productCard.classList.add('animate-fadeInUp');
        productCard.style.animationDelay = `${index * 50}ms`;
        productsContainer.appendChild(productCard);
      }, 10); // Small delay to allow for staggered animations
    });
  }

  // Render featured products in the carousel with animation
  function renderFeaturedProducts() {
    featuredProductsContainer.innerHTML = '';
    
    // Get 5 random products for the featured section
    const randomProducts = getRandomProducts(allProducts, 5);
    
    randomProducts.forEach((product, index) => {
      const featuredItem = document.createElement('div');
      featuredItem.className = 'flex-shrink-0 w-48 animate-fadeIn';
      featuredItem.style.animationDelay = `${index * 100}ms`;
      featuredItem.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain mb-2">
        <div class="text-amazon-accent font-bold">${getRandomDeal()}</div>
        <div class="text-sm">${product.title.length > 25 ? product.title.substring(0, 25) + '...' : product.title}</div>
      `;
      featuredProductsContainer.appendChild(featuredItem);
    });
  }

  // Create a product card element
  function createProductCard(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200';
    productDiv.dataset.productId = product.id;
    
    const ratingStars = createRatingStars(product.rating.rate);
    
    productDiv.innerHTML = `
      <div class="p-4">
        <div class="h-48 flex items-center justify-center mb-4">
          <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
        </div>
        <h3 class="text-lg font-medium mb-1 line-clamp-2 h-14">${product.title}</h3>
        <div class="flex items-center mb-2">
          <div class="flex text-amazon-accent">
            ${ratingStars}
          </div>
          <span class="text-xs text-gray-500 ml-1">${product.rating.count}</span>
        </div>
        <div class="mb-2">
          <span class="text-amazon-success font-medium">$${product.price.toFixed(2)}</span>
        </div>
        <div class="text-xs text-gray-500 mb-3">
          <span class="text-amazon-success">✓</span> FREE delivery: <strong>Tomorrow</strong>
        </div>
        <div class="flex space-x-2">
          <a href="product.html?id=${product.id}" class="text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-1 flex-grow text-center">View Details</a>
          <button class="add-to-cart-btn text-sm bg-amazon-light hover:bg-amazon-accent text-amazon-primary rounded px-3 py-1 flex-grow font-medium" data-product-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
    
    const addToCartBtn = productDiv.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => addToCart(product));
    
    return productDiv;
  }

  // Create rating stars HTML based on rating value
  function createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      `;
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      starsHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="currentColor" stroke-width="1"/>
          <path d="M12 2L9.19 8.63 2 9.24l5.45 4.73L5.82 21 12 17.27z" fill="currentColor"/>
        </svg>
      `;
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      `;
    }
    
    return starsHTML;
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search functionality
    searchButton.addEventListener('click', filterProducts);
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        filterProducts();
      }
    });
    
    // Category filter
    categorySelect.addEventListener('change', filterProducts);
    
    // Sort functionality
    sortSelect.addEventListener('change', sortProducts);
  }

  // Filter products based on search input and category selection
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
    
    filteredProducts = allProducts.filter(product => {
      // Filter by category if not "all"
      const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
      
      // Filter by search term if not empty
      const searchMatch = 
        searchTerm === '' || 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm);
      
      return categoryMatch && searchMatch;
    });
    
    sortProducts(); // Apply current sort to filtered results
  }

  // Sort the filtered products based on sort selection
  function sortProducts() {
    const sortValue = sortSelect.value;
    let sortedProducts = [...filteredProducts];
    
    switch (sortValue) {
      case 'price-asc':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        // Default sorting (featured)
        break;
    }
    
    renderProducts(sortedProducts);
  }

  // Add a product to the cart
  function addToCart(product, quantity = 1) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    // Save cart to localStorage
    saveCart(cart);
    
    // Update cart count
    updateCartCount();
    
    // Show confirmation
    showAddToCartConfirmation(product.title);
  }

  // Show a confirmation message when a product is added to cart
  function showAddToCartConfirmation(productTitle) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50';
    confirmationDiv.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <p><strong>${productTitle}</strong> has been added to your cart.</p>
      </div>
    `;
    
    document.body.appendChild(confirmationDiv);
    
    // Remove confirmation after 3 seconds
    setTimeout(() => {
      confirmationDiv.remove();
    }, 3000);
  }

  // Load cart from localStorage
  function loadCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  }

  // Save cart to localStorage
  function saveCart(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
  }

  // Update cart count in navbar
  function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
  }

  // Helper function to get random products for featured section
  function getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Helper function to generate random deal text for featured products
  function getRandomDeal() {
    const deals = [
      'Up to 25% off',
      'Deal of the day',
      'Lightning Deal',
      'Save 30%',
      'Best Seller'
    ];
    return deals[Math.floor(Math.random() * deals.length)];
  }

  // Helper function to capitalize first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});