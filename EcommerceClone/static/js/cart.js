document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartSummary = document.getElementById('cart-summary');
  const cartItemCountElement = document.getElementById('cart-item-count');
  const cartTotalElement = document.getElementById('cart-total');
  const cartCountElement = document.getElementById('cart-count');
  const checkoutButton = document.getElementById('checkout-button');
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');

  // State variables
  let cart = loadCart();
  let categories = [];

  // Initialize
  init();

  // Functions
  async function init() {
    updateCartCount();
    await fetchCategories();
    renderCart();
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

  // Render cart items with animations
  function renderCart() {
    // Check if cart is empty
    if (cart.length === 0) {
      emptyCartMessage.classList.remove('hidden');
      emptyCartMessage.classList.add('animate-fadeIn');
      cartItemsContainer.classList.add('hidden');
      cartSummary.classList.add('hidden');
      return;
    }
    
    // Show cart items and summary
    emptyCartMessage.classList.add('hidden');
    cartItemsContainer.classList.remove('hidden');
    cartSummary.classList.remove('hidden');
    
    // Add animation to the cart summary
    cartSummary.classList.add('animate-fadeIn');
    cartSummary.style.animationDelay = '300ms';
    
    // Clear existing cart items
    cartItemsContainer.innerHTML = '';
    
    // Render each cart item with staggered animation
    cart.forEach((item, index) => {
      const cartItemElement = createCartItemElement(item);
      cartItemElement.classList.add('animate-fadeInUp');
      cartItemElement.style.animationDelay = `${index * 100}ms`;
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update cart summary
    updateCartSummary();
  }

  // Create a cart item element
  function createCartItemElement(item) {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'cart-item flex py-4 border-b';
    cartItemDiv.dataset.productId = item.id;
    
    cartItemDiv.innerHTML = `
      <div class="flex-shrink-0 w-32 h-32">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
      </div>
      <div class="ml-4 flex-grow">
        <div class="flex justify-between">
          <h3 class="text-lg font-medium">${item.title}</h3>
          <div class="text-lg font-bold">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="text-amazon-success text-sm mb-2">In Stock</div>
        <div class="text-sm text-gray-500 mb-2">Eligible for FREE Shipping</div>
        <div class="flex items-center">
          <select class="cart-item-quantity border rounded mr-2 p-1" data-product-id="${item.id}">
            ${createQuantityOptions(item.quantity)}
          </select>
          <button class="cart-delete-btn text-blue-600 hover:text-blue-800 hover:underline mr-4" data-product-id="${item.id}">Delete</button>
          <button class="text-blue-600 hover:text-blue-800 hover:underline">Save for later</button>
        </div>
      </div>
    `;
    
    // Add event listeners to the quantity select and delete button
    const quantitySelect = cartItemDiv.querySelector('.cart-item-quantity');
    quantitySelect.addEventListener('change', () => {
      updateCartItemQuantity(item.id, parseInt(quantitySelect.value, 10));
    });
    
    const deleteButton = cartItemDiv.querySelector('.cart-delete-btn');
    deleteButton.addEventListener('click', () => {
      removeFromCart(item.id);
    });
    
    return cartItemDiv;
  }

  // Create quantity options for the dropdown
  function createQuantityOptions(selectedQuantity) {
    let options = '';
    for (let i = 1; i <= 10; i++) {
      options += `<option value="${i}" ${i === selectedQuantity ? 'selected' : ''}>${i}</option>`;
    }
    return options;
  }

  // Update the quantity of a cart item
  function updateCartItemQuantity(productId, quantity) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;
      saveCart(cart);
      renderCart();
      updateCartCount();
    }
  }

  // Remove an item from the cart
  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCart();
    updateCartCount();
  }

  // Update the cart summary (item count and total)
  function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    cartItemCountElement.textContent = totalItems;
    cartTotalElement.textContent = totalPrice.toFixed(2);
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

  // Setup event listeners
  function setupEventListeners() {
    // Checkout button
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
        alert('Checkout functionality would be implemented here in a real application.');
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

  // Helper function to capitalize first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});