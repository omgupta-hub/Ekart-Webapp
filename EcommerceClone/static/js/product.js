document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const loadingIndicator = document.getElementById('loading-indicator');
  const productContent = document.getElementById('product-content');
  const cartCountElement = document.getElementById('cart-count');
  const detailAddToCartBtn = document.getElementById('detail-add-to-cart');
  const productQuantitySelect = document.getElementById('product-quantity');
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');

  // State variables
  let product = null;
  const cart = loadCart();
  let categories = [];

  // Initialize
  init();

  // Functions
  async function init() {
    updateCartCount();
    await fetchCategories();
    
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
      showError('No product ID provided. Redirecting to home page...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    await fetchProductDetails(productId);
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

  // Fetch product details from FakeStore API directly
  async function fetchProductDetails(productId) {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      product = await response.json();
      displayProductDetails();
    } catch (error) {
      console.error('Error fetching product details:', error);
      showError('Failed to load product details. Please try again later.');
    }
  }

  // Display product details on the page with animations
  function displayProductDetails() {
    if (!product) return;
    
    // Update page title
    document.title = `${product.title} - AmaClone`;
    
    // Update product elements
    document.getElementById('product-breadcrumb-title').textContent = product.title;
    document.getElementById('product-category').textContent = capitalizeFirstLetter(product.category);
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-price').textContent = product.price.toFixed(2);
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = product.title;
    
    // Update rating stars
    const ratingStarsContainer = document.getElementById('product-rating-stars');
    ratingStarsContainer.innerHTML = createRatingStars(product.rating.rate);
    
    // Update rating count
    document.getElementById('product-rating-count').textContent = `${product.rating.count} ratings`;
    
    // Hide loading indicator and show product content with animation
    loadingIndicator.classList.add('hidden');
    
    // Add animation classes to product elements
    productContent.classList.remove('hidden');
    productContent.classList.add('animate-fadeIn');
    
    // Add staggered animations to different sections of the product page
    const productImage = document.getElementById('product-image').parentElement;
    const productTitle = document.getElementById('product-title');
    const productDescription = document.getElementById('product-description');
    const productActions = document.getElementById('detail-add-to-cart').parentElement;
    
    // Add animation classes with delays
    if (productImage) {
      productImage.classList.add('animate-fadeIn');
      productImage.style.animationDelay = '100ms';
    }
    
    if (productTitle) {
      productTitle.classList.add('animate-fadeInUp');
      productTitle.style.animationDelay = '200ms';
    }
    
    if (productDescription) {
      productDescription.classList.add('animate-fadeInUp');
      productDescription.style.animationDelay = '300ms';
    }
    
    if (productActions) {
      productActions.classList.add('animate-fadeInUp');
      productActions.style.animationDelay = '400ms';
    }
  }

  // Show error message
  function showError(message) {
    loadingIndicator.innerHTML = `
      <div class="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-500 font-medium">${message}</p>
      </div>
    `;
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
    if (detailAddToCartBtn) {
      detailAddToCartBtn.addEventListener('click', () => {
        if (product) {
          const quantity = parseInt(productQuantitySelect.value, 10);
          addToCart(product, quantity);
        }
      });
    }
    
    // Search functionality (redirect to home page with search params)
    if (searchButton && searchInput) {
      searchButton.addEventListener('click', handleSearch);
      searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          handleSearch();
        }
      });
    }
    
    // Category selection (redirect to home page with category filter)
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        if (selectedCategory !== 'all') {
          window.location.href = `index.html?category=${selectedCategory}`;
        } else {
          window.location.href = 'index.html';
        }
      });
    }
  }

  // Handle search (redirect to home page with search query)
  function handleSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
    }
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
    showAddToCartConfirmation(product.title, quantity);
  }

  // Show a confirmation message when a product is added to cart
  function showAddToCartConfirmation(productTitle, quantity) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50';
    confirmationDiv.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <p><strong>${quantity}x ${productTitle}</strong> ${quantity === 1 ? 'has' : 'have'} been added to your cart.</p>
      </div>
      <div class="mt-2 text-right">
        <a href="cart.html" class="text-blue-700 underline">View Cart</a>
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

  // Helper function to capitalize first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});