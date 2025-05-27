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
            productsContainer.innerHTML = '<p class="text-red-500 text-center text-lg font-semibold">Failed to load products. Please try again later.</p>';
        }
    }

    // Setup category filters
    function setupCategoryFilters(products) {
        const categories = ['All', ...new Set(products.map(product => product.category))];
        categoryFilter.innerHTML = categories.map(category => `
            <button class="category-button px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium ${category === 'All' ? 'active' : ''}" data-category="${category}">
                ${category.charAt(0).toUpperCase() + category.slice(1)}
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

    // Display products in cards
    function displayProducts(products) {
        productsContainer.innerHTML = products.map(product => `
            <div class="product-card bg-white rounded-lg shadow-md p-6 cursor-pointer" data-id="${product.id}">
                <img src="${product.image}" alt="${product.title}" class="product-image mx-auto">
                <h3 class="text-xl font-semibold mt-4 text-gray-900 truncate">${product.title}</h3>
                <p class="text-gray-500 mt-2 capitalize text-sm">${product.category}</p>
                <p class="text-green-600 font-bold mt-2 text-lg">$${product.price.toFixed(2)}</p>
                <div class="star-rating mt-3">${generateStars(product.rating.rate)}</div>
                <button class="view-details-btn mt-4 w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium">View Details</button>
            </div>
        `).join('');

        // Add click event listeners to cards and buttons
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-details-btn')) {
                    showProductDetails(card.dataset.id);
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

    // Show product details in modal
    function showProductDetails(id) {
        const product = allProducts.find(p => p.id == id);
        if (!product) return;

        modalContent.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="modal-image mx-auto md:mx-0">
            <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-900">${product.title}</h2>
                <p class="text-gray-500 mt-2 capitalize text-sm">${product.category}</p>
                <p class="text-green-600 font-bold mt-2 text-2xl">$${product.price.toFixed(2)}</p>
                <div class="star-rating mt-3">${generateStars(product.rating.rate)}</div>
                <p class="text-gray-700 mt-4 text-base leading-relaxed">${product.description}</p>
                <p class="text-gray-500 mt-3 text-sm">Rating: ${product.rating.rate} (${product.rating.count} reviews)</p>
                <button class="mt-6 bg-gray-800 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-gray-900 transition">Add to Cart</button>
            </div>
        `;

        productModal.classList.remove('hidden');
        productModal.classList.add('show');
    }

    // Close modal
    closeModal.addEventListener('click', () => {
        productModal.classList.add('hidden');
        productModal.classList.remove('show');
    });

    // Close modal when clicking outside
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.add('hidden');
            productModal.classList.remove('show');
        }
    });

    // Fetch products on page load
    fetchProducts();
});