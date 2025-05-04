/**
 * AmaClone Page Transition System
 * 
 * This script handles smooth page transitions between HTML pages.
 * It adds a fade-out effect when navigating away from a page and
 * a fade-in effect when a new page loads.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Add the 'page-transition' class to the body element
  document.body.classList.add('page-loaded');
  
  // Get all links that point to pages within our site
  const internalLinks = document.querySelectorAll('a[href^="index.html"], a[href^="product.html"], a[href^="cart.html"]');
  
  // Add click event listeners to internal links
  internalLinks.forEach(link => {
    link.addEventListener('click', handleLinkClick);
  });
  
  // Handle category selection transitions
  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      const selectedCategory = categorySelect.value;
      if (selectedCategory !== 'all') {
        handlePageTransition(`index.html?category=${selectedCategory}`);
      } else {
        handlePageTransition('index.html');
      }
      return false;
    });
  }
  
  // Handle search form submission transitions
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', handleSearchTransition);
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        handleSearchTransition();
      }
    });
  }
  
  // Handle the back/forward browser buttons
  window.addEventListener('popstate', () => {
    // We don't trigger a transition animation for back/forward navigation
    // Just ensure we're not in a transitioning state
    document.body.classList.remove('page-transitioning');
  });
});

/**
 * Handle clicks on internal links to trigger page transitions
 */
function handleLinkClick(event) {
  // Get the href attribute
  const href = this.getAttribute('href');
  
  // Only handle internal links (not external or anchor links)
  if (href.startsWith('index.html') || href.startsWith('product.html') || href.startsWith('cart.html')) {
    event.preventDefault();
    handlePageTransition(href);
  }
}

/**
 * Handle search form submission with transition
 */
function handleSearchTransition() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    handlePageTransition(`index.html?search=${encodeURIComponent(searchTerm)}`);
  }
}

/**
 * Trigger page transition and navigate to new URL
 */
function handlePageTransition(url) {
  // Add the transitioning class to trigger the fade out animation
  document.body.classList.add('page-transitioning');
  
  // Wait for the transition to complete before navigating
  setTimeout(() => {
    window.location.href = url;
  }, 400); // This should match the CSS transition duration
}

// When page is unloading, add the transitioning class (for page refresh and direct URL entry)
window.addEventListener('beforeunload', () => {
  document.body.classList.add('page-transitioning');
});