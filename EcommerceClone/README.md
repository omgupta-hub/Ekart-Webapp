# AmaClone - Amazon Clone Frontend

This project is a simple Amazon clone built with vanilla HTML, CSS, and JavaScript. It uses the FakeStore API directly from the frontend to display products, product details, and manage a shopping cart.

## Features

- Product listing with filter and sort capabilities
- Product details page
- Shopping cart
- Search functionality
- Responsive design with Tailwind CSS

## No Backend Required

This project has been refactored to work entirely in the browser with no backend required. All API calls are made directly to the FakeStore API from the frontend.

## How to Use

Simply open the `index.html` file in your browser to start using the application. No server setup required!

```
# Just open index.html in any browser
```

Alternatively, if you'd like to use a local server, you can run:

```
node server.js
```

This will start a simple HTTP server on port 3000, but it's completely optional.

## Technologies Used

- HTML5
- CSS3 with Tailwind CSS
- Vanilla JavaScript
- FakeStore API (https://fakestoreapi.com/)
- LocalStorage for cart data

## Project Structure

- `index.html` - Main product listing page
- `product.html` - Product details page
- `cart.html` - Shopping cart page
- `static/js/` - JavaScript files for each page
- `static/css/` - CSS styles
- `server.js` - Optional simple HTTP server for local development

## Note

This is a demonstration project and not intended for production use. It doesn't include features like user authentication, actual payment processing, etc.