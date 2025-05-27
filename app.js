document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
    const loadingElement = document.getElementById('loading');
    const productModal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const modalContent = document.getElementById('modalContent');
    const categoryFilter = document.getElementById('categoryFilter');
    let allProducts = [];

    // Fetch products from FakeStore API
    async function fetchProducts() {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            allProducts = await response.json();
            loadingElement.style.display = 'none';
            setupCategoryFilters(allProducts);
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            loadingElement.style.display = 'none';
            productsContainer.innerHTML = '<p class="text-red-500 text-center text-lg font-semibold col-span-full">Failed to load products. Please try again later.</p>';
        }
    }

    // Setup category filters
    function setupCategoryFilters(products) {
        const categories = ['All', ...new Set(products.map(product => product.category))];
        categoryFilter.innerHTML = categories.map(category => `
            <button class="category-button px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium ${category === 'All' ? 'active' : ''}" data-category="${category}">
                ${formatCategoryName(category)}
            </button>
        `).join('');

        categoryFilter.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', () => {
                categoryFilter.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const selectedCategory = button.dataset.category;
                const filteredProducts = selectedCategory === 'All' 
                    ? allProducts 
                    : allProducts.filter(product => product.category === selectedCategory);
                displayProducts(filteredProducts);
            });
        });
    }

    // Format category names for better display
    function formatCategoryName(category) {
        if (category === 'All') return 'All';
        return category.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Display products in cards
    function displayProducts(products) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card bg-white rounded-lg shadow-md p-6 cursor-pointer" data-id="${product.id}">
                <div class="flex items-center justify-center h-56 mb-4">
                    <img src="${product.image}" alt="${escapeHtml(product.title)}" class="product-image">
                </div>
                <h3 class="text-xl font-semibold mt-4 text-gray-900 line-clamp-2" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
                <p class="text-gray-500 mt-2 capitalize text-sm">${formatCategoryName(product.category)}</p>
                <p class="text-green-600 font-bold mt-2 text-lg">$${product.price.toFixed(2)}</p>
                <div class="star-rating mt-3 flex items-center">
                    ${generateStars(product.rating.rate)}
                    <span class="text-gray-500 text-sm ml-2">(${product.rating.count})</span>
                </div>
                <button class="view-details-btn mt-4 w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium" onclick="event.stopPropagation(); showProductDetails(${product.id})">View Details</button>
            </div>
        `).join('');

        // Add click event listeners to cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('view-details-btn')) {
                    showProductDetails(parseInt(card.dataset.id));
                }
            });
        });
    }

    // Generate star rating
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Show product details in modal
    function showProductDetails(id) {
        const product = allProducts.find(p => p.id === id);
        if (!product) {
            console.error('Product not found:', id);
            return;
        }

        modalContent.innerHTML = `
            <div class="modal-content-wrapper">
                <div class="modal-image-container">
                    <img src="${product.image}" alt="${escapeHtml(product.title)}" class="modal-image">
                </div>
                <div class="modal-details">
                    <h2 class="modal-title">${escapeHtml(product.title)}</h2>
                    <p class="text-gray-500 mt-1 capitalize text-sm font-medium">${formatCategoryName(product.category)}</p>
                    <p class="text-green-600 font-bold mt-3 text-3xl">$${product.price.toFixed(2)}</p>
                    <div class="star-rating mt-3 flex items-center">
                        ${generateStars(product.rating.rate)}
                        <span class="text-gray-600 text-sm ml-2">${product.rating.rate}/5.0 (${product.rating.count} reviews)</span>
                    </div>
                    <p class="modal-description">${escapeHtml(product.description)}</p>
                    <button class="add-to-cart-btn bg-gray-800 text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        `;

        productModal.classList.remove('hidden');
        productModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close modal function
    function closeModalFunction() {
        productModal.classList.add('hidden');
        productModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore background scrolling
    }

    // Close modal event listeners
    closeModal.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModalFunction();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !productModal.classList.contains('hidden')) {
            closeModalFunction();
        }
    });

    // Make showProductDetails globally accessible
    window.showProductDetails = showProductDetails;

    // Fetch products on page load
    fetchProducts();
});