let cart = JSON.parse(localStorage.getItem("cart")) || [];
let userItems = JSON.parse(localStorage.getItem("userItems")) || [];
const state = { gender: 'all', category: 'all', query: '' };
let selectedImageFile = null;
let activeTheme = localStorage.getItem('theme') || 'dark';

const appConfig = {
    ownerPasscode: 'owner123',
    currencyLabel: 'Ksh',
    imageFallback: '/uploads/womens_handbag.jpg',
    useBackend: true,
    // Automatically switches between local and production environment
    backendUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:3000' : '' 
};

function normalizeImagePath(src){
    if(!src || typeof src !== 'string') return src;

    const trimmed = src.trim();
    if(trimmed.startsWith('/uploads/')) return trimmed;
    if(trimmed.startsWith('uploads/')) return `/${trimmed}`;
    if(trimmed.startsWith('./uploads/')) return `/${trimmed.replace(/^\.\//,'')}`;

    return trimmed;
}

const feedbackKey = 'customerFeedback';
let isOwner = localStorage.getItem('isOwner') === 'true';

function generateId(name){
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
}

async function backendFetch(path, options = {}){
    try{
        const url = `${appConfig.backendUrl}${path}`;
        const res = await fetch(url, options);
        if(!res.ok) throw new Error(`Backend error ${res.status}`);
        return res.json();
    }catch(error){
        console.warn('Backend request failed:', error);
        return null;
    }
}

async function createBackendProduct(product){
    const created = await backendFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-passcode': appConfig.ownerPasscode },
        body: JSON.stringify(product)
    });
    return created || null;
}

async function updateBackendProduct(productId, product){
    return await backendFetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-owner-passcode': appConfig.ownerPasscode },
        body: JSON.stringify(product)
    });
}

async function deleteBackendProduct(productId){
    return await backendFetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-owner-passcode': appConfig.ownerPasscode }
    });
}

const defaultProducts = [
    { name: 'White Sneakers', price: 950, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Elegant Heels', price: 1200, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.png' },
    { name: 'Flat Sandals', price: 850, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Leather Loafers', price: 1100, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Ballet Flats', price: 900, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.png' },
    { name: 'Stylish Mules', price: 1050, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Ankle Boots', price: 1700, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Wedge Heels', price: 1300, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.png' },
    { name: 'Designer Pumps', price: 1600, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Casual Sneakers', price: 980, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Luxury Bed Set - King', price: 2200, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.png' },
    { name: 'Floral Bedding Collection', price: 1450, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Satin Pillowcase Set', price: 950, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.png' },
    { name: 'Premium Cotton Sheets', price: 1750, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Soft Duvet Cover', price: 1400, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.png' },
    { name: 'Elegant Comforter Set', price: 1950, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Quilted Bed Spread', price: 1600, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.png' },
    { name: 'Silk Bed Sheet Set', price: 2200, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Egyptian Cotton Sheets', price: 1900, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.png' },
    { name: 'Leather Handbag - Black', price: 1800, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag.jpg' },
    { name: 'Quilted Shoulder Bag', price: 1700, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_1.svg' },
    { name: 'Luxury Tote Bag', price: 1950, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_2.svg' },
    { name: 'Evening Clutch - Gold', price: 1200, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_1.svg' },
    { name: 'Crossbody Leather Bag', price: 1450, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag.jpg' },
    { name: 'Designer Backpack', price: 2000, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_2.svg' },
    { name: 'Classic Sneakers - White', price: 1300, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.png' },
    { name: 'Running Shoes - Black', price: 1500, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_2.svg' },
    { name: 'Leather Loafers - Brown', price: 1600, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.png' },
    { name: 'Casual Slip-ons', price: 1100, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_2.svg' },
    { name: 'Oxford Dress Shoes', price: 1800, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.png' },
    { name: 'Sporty Boots', price: 2100, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_2.svg' }
];

async function loadProducts(){
    if(appConfig.useBackend){
        try{
            const res = await fetch(`${appConfig.backendUrl}/api/products`);
            if(res.ok){
                const data = await res.json();
                if(Array.isArray(data) && data.length > 0){
                    return data.map(p => ({ ...p, id: p.id || generateId(p.name) }));
                }
                console.warn('Backend returned no products; falling back to local/default samples');
            }
        }catch(e){
            console.error('Failed to fetch from backend, falling back to local products', e);
        }
    }

    const stored = JSON.parse(localStorage.getItem('products')) || [];
    if(stored.length === 0){
        return defaultProducts.map(product => ({ ...product, id: generateId(product.name) }));
    }
    return stored.map(product => ({ ...product, id: product.id || generateId(product.name) }));
}

async function saveProducts(){
    localStorage.setItem('products', JSON.stringify(products));
}

let products = [];

// Dark/Light Theme Switching
function applyTheme() {
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    if (activeTheme === 'light') {
        body.classList.add('light-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        body.classList.remove('light-theme');
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function toggleTheme() {
    activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', activeTheme);
    applyTheme();
}

// Slide-out Drawer Cart Controls
function toggleCart(isOpen) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
        if (isOpen) {
            drawer.classList.add('open');
            overlay.classList.add('open');
        } else {
            drawer.classList.remove('open');
            overlay.classList.remove('open');
        }
    }
}

function addToCart(name, price){
    let item = cart.find(p => p.name === name);

    if(item){
        item.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    saveCart();
    
    // Automatically open the side drawer cart for seamless visual feedback
    toggleCart(true);
}

function changeQuantity(name, amount) {
    let item = cart.find(p => p.name === name);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(p => p.name !== name);
    }
    saveCart();
}

function removeFromCart(name){
    cart = cart.filter(item => item.name !== name);
    saveCart();
}

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}

function checkoutCart() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart = [];
    saveCart();
    toggleCart(false);
    
    showToast(`Order processed successfully! Thank you for purchasing Ksh ${total}.`);
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if(!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span><button class="dismiss" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 5000);
}

// Quick View Modal Controls
function toggleQuickView(isOpen) {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
        if (isOpen) {
            modal.classList.add('open');
        } else {
            modal.classList.remove('open');
        }
    }
}

function closeQuickView(event) {
    if (event.target.id === 'quickview-modal') {
        toggleQuickView(false);
    }
}

function openQuickView(product) {
    const imgEl = document.getElementById('qv-image');
    const nameEl = document.getElementById('qv-name');
    const priceEl = document.getElementById('qv-price');
    const descEl = document.getElementById('qv-desc');
    const catBadge = document.getElementById('qv-category-badge');
    const genderBadge = document.getElementById('qv-gender-badge');
    const ratingEl = document.getElementById('qv-rating');
    const addBtn = document.getElementById('qv-add-btn');

    if (imgEl) imgEl.src = normalizeImagePath(product.image);
    if (nameEl) nameEl.textContent = product.name;
    if (priceEl) priceEl.textContent = `${appConfig.currencyLabel} ${product.price}`;
    if (descEl) descEl.textContent = getProductDescription(product.name, product.category, product.gender);
    if (catBadge) catBadge.innerHTML = `<i class="fa-solid fa-tags"></i> ${capitalize(product.category)}`;
    if (genderBadge) genderBadge.innerHTML = `<i class="fa-solid fa-person"></i> ${capitalize(product.gender)}`;
    if (ratingEl) ratingEl.innerHTML = getStarsHtml(product.id || product.name);
    
    if (addBtn) {
        addBtn.onclick = () => {
            addToCart(product.name, product.price);
            toggleQuickView(false);
        };
    }

    // Save product to selects for backward compatibility
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    toggleQuickView(true);
}

function getProductDescription(name, category, gender) {
    if (category === 'shoes') {
        return `Step out in style with these premium ${gender} shoes. Engineered for comfort and crafted with high-quality materials, they offer the perfect blend of durability and contemporary fashion.`;
    } else if (category === 'beddings') {
        return `Transform your bedroom into a sanctuary of relaxation. This premium bedding collection is crafted from ultra-soft fabrics, ensuring exceptional breathability and comfort for a perfect night's sleep.`;
    } else if (category === 'handbags') {
        return `A statement piece that combines sophistication and utility. This designer handbag offers spacious compartments, premium stitching, and an elegant silhouette suitable for any occasion.`;
    } else {
        return `Elevate your everyday lifestyle with this premium selection. Meticulously inspected for quality, it offers top-tier performance, aesthetic appeal, and outstanding value.`;
    }
}

// Star rating math
function getStarsHtml(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rating = 4 + (Math.abs(hash) % 11) / 10;
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalf) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return `${stars} <span>(${rating.toFixed(1)})</span>`;
}

// Inventory Dashboard Tabs Switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Toggle active if the button click targets this tab
        const clickAttr = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', clickAttr.includes(tabId));
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function authenticateOwner(){
    const passwordInput = document.getElementById('owner-password');
    const status = document.getElementById('owner-status');

    if(!passwordInput) return;
    const attempt = passwordInput.value.trim();

    if(attempt === appConfig.ownerPasscode){
        isOwner = true;
        localStorage.setItem('isOwner', 'true');
        status.textContent = 'Authenticated as owner. You may manage listings.';
        status.classList.add('owner-status-active');
        passwordInput.value = '';
    } else {
        isOwner = false;
        localStorage.removeItem('isOwner');
        status.textContent = 'Invalid passcode. Owner access required.';
        status.classList.remove('owner-status-active');
    }

    updateOwnerDisplay();
    renderProducts();
}

function signOutOwner(){
    isOwner = false;
    localStorage.removeItem('isOwner');
    const status = document.getElementById('owner-status');
    if(status){
        status.textContent = 'Signed out.';
        status.classList.remove('owner-status-active');
    }
    updateOwnerDisplay();
    renderProducts();
}

function updateOwnerDisplay(){
    const ownerSection = document.getElementById('owner-section');
    const status = document.getElementById('owner-status');
    const signoutBtn = document.getElementById('owner-signout');

    if(ownerSection){
        ownerSection.style.display = isOwner ? 'block' : 'none';
    }

    if(status && !isOwner){
        status.textContent = 'Not authenticated. Only the owner may add listings.';
        status.classList.remove('owner-status-active');
    }
    if(signoutBtn){
        signoutBtn.style.display = isOwner ? 'inline-block' : 'none';
        signoutBtn.onclick = isOwner ? signOutOwner : null;
    }
}

function saveUserItems(){
    localStorage.setItem('userItems', JSON.stringify(userItems));
}

function toggleEditMode(productId, isUserItem, active){
    const list = isUserItem ? userItems : products;
    list.forEach(item => {
        if(!item) return;
        item.editing = item.id === productId ? active : false;
    });
}

function saveProductEdits(productId, isUserItem){
    const nameInput = document.getElementById(`edit-name-${productId}`);
    const priceInput = document.getElementById(`edit-price-${productId}`);
    const categoryInput = document.getElementById(`edit-category-${productId}`);
    const imageInput = document.getElementById(`edit-image-${productId}`);
    const statusMessage = document.getElementById(`edit-status-${productId}`);

    if(!nameInput || !priceInput || !categoryInput || !imageInput || !statusMessage) return;

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const category = categoryInput.value;
    const image = imageInput.value.trim();

    if(!name || !price || !category){
        statusMessage.textContent = 'Name, price, and category are required.';
        statusMessage.style.color = '#ef4444';
        return;
    }

    if(price < 850 || price > 2200){
        statusMessage.textContent = 'Price must be between 850 and 2200 Ksh.';
        statusMessage.style.color = '#ef4444';
        return;
    }

    const list = isUserItem ? userItems : products;
    const item = list.find(entry => entry.id === productId);
    if(!item) return;

    item.name = name;
    item.price = price;
    item.category = category;
    if(image){
        item.image = image;
    }

    if(isUserItem){
        saveUserItems();
    } else {
        if(appConfig.useBackend){
            updateBackendProduct(productId, { name, price, category, image }).then(response => {
                if(response){
                    const existing = products.find(p => p.id === productId);
                    if(existing){ Object.assign(existing, response); }
                }
                saveProducts();
            }).catch(e => { console.error(e); saveProducts(); });
        } else {
            saveProducts();
        }
    }

    toggleEditMode(productId, isUserItem, false);
    statusMessage.textContent = '';
    renderProducts();
    displayUserItems();
}

function cancelEditProduct(productId, isUserItem){
    toggleEditMode(productId, isUserItem, false);
    renderProducts();
}

function preloadImages(){
    const imageSources = [...products.map(p => normalizeImagePath(p.image)), ...userItems.map(i => normalizeImagePath(i.image))];
    imageSources.forEach(src => {
        const img = new Image();
        img.onload = () => {};
        img.onerror = () => {
            img.onerror = null;
            img.src = appConfig.imageFallback;
        };
        img.src = src;
    });
}

async function submitFeedback(){
    const feedbackInput = document.getElementById('feedback-message');
    const status = document.getElementById('feedback-status');

    if(!feedbackInput || !status) return;

    const message = feedbackInput.value.trim();
    if(!message){
        status.textContent = 'Please enter feedback before submitting.';
        status.style.color = '#ef4444';
        return;
    }

    const payload = { message };
    if(appConfig.useBackend){
        const created = await backendFetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(created){
            status.textContent = 'Thank you! Your feedback has been submitted.';
            status.style.color = '#10b981';
            feedbackInput.value = '';
            return;
        }
    }

    const saved = JSON.parse(localStorage.getItem(feedbackKey)) || [];
    saved.push({ message, submittedAt: new Date().toISOString() });
    localStorage.setItem(feedbackKey, JSON.stringify(saved));

    feedbackInput.value = '';
    status.textContent = 'Thank you! Your feedback has been submitted.';
    status.style.color = '#10b981';
}

function loadFeedbackStatus(){
    const status = document.getElementById('feedback-status');
    if(!status) return;
    status.textContent = '';
}

function updateCart(){
    const cartItems = document.getElementById("cart-drawer-items");
    const totalEl = document.getElementById("cart-drawer-total");
    const countEl = document.getElementById("cart-count");
    const emptyEl = document.getElementById("cart-drawer-empty");

    if(!cartItems) return;

    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    if(cart.length === 0){
        if(emptyEl) emptyEl.style.display = "block";
    } else {
        if(emptyEl) emptyEl.style.display = "none";
    }

    cart.forEach(item => {
        let li = document.createElement("li");

        li.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${appConfig.currencyLabel} ${item.price}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                </div>
            </div>
            <button class="remove-cart-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" aria-label="Remove item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        cartItems.appendChild(li);

        total += item.price * item.quantity;
        count += item.quantity;
    });

    if(totalEl) totalEl.textContent = total;
    if(countEl) countEl.textContent = count;

    const cartButton = document.getElementById('cart-button');
    if(cartButton){
        cartButton.setAttribute('aria-label', `View cart, ${count} item${count === 1 ? '' : 's'}`);
    }
}

function renderProducts(){
    const productsContainer = document.getElementById("products");
    if(!productsContainer) return;

    const allProducts = [...products, ...userItems];
    
    const filteredProducts = allProducts.filter(product => {
        const matchesGender = state.gender === 'all' || product.gender === state.gender;
        const matchesCategory = state.category === 'all' || product.category === state.category;
        const matchesQuery = product.name.toLowerCase().includes(state.query.toLowerCase());
        return matchesGender && matchesCategory && matchesQuery;
    });

    productsContainer.innerHTML = '';

    if(filteredProducts.length === 0){
        productsContainer.innerHTML = '<div class="empty"><i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px; display: block;"></i>No products found.</div>';
        return;
    }

    filteredProducts.forEach((product) => {
        const isUserItem = userItems.some(u => u && u.id === product.id);
        const productCard = document.createElement('div');
        productCard.className = isUserItem ? 'product user-item badge' : 'product';

        const editControls = isOwner ? `
            ${product.editing ? `
                <div class="edit-fields">
                    <label>Name</label>
                    <input id="edit-name-${product.id}" type="text" value="${product.name}" class="input-field">
                    <label>Price (Ksh)</label>
                    <input id="edit-price-${product.id}" type="number" value="${product.price}" class="input-field">
                    <label>Category</label>
                    <select id="edit-category-${product.id}" class="input-field">
                        <option value="shoes" ${product.category === 'shoes' ? 'selected' : ''}>Shoes</option>
                        <option value="beddings" ${product.category === 'beddings' ? 'selected' : ''}>Beddings</option>
                        <option value="handbags" ${product.category === 'handbags' ? 'selected' : ''}>Handbags</option>
                        <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                    <label>Image URL</label>
                    <input id="edit-image-${product.id}" type="text" value="${product.image}" class="input-field">
                    <div class="edit-actions">
                        <button class="owner-btn" onclick="saveProductEdits('${product.id}', ${isUserItem})">Save</button>
                        <button class="remove-item-btn" onclick="cancelEditProduct('${product.id}', ${isUserItem})">Cancel</button>
                    </div>
                    <p id="edit-status-${product.id}" class="edit-status"></p>
                </div>
            ` : `<button class="edit-btn" onclick="toggleEditMode('${product.id}', ${isUserItem}, true)"><i class="fa-regular fa-pen-to-square"></i> Edit Product</button>`}
        ` : '';

        const ratingHtml = getStarsHtml(product.id || product.name);
        const productEscaped = JSON.stringify(product).replace(/'/g, "\\'");

        productCard.innerHTML = `
            <div class="product-image-container">
                <span class="badge-gender">${product.gender}</span>
                ${product.price > 1800 ? '<span class="badge-premium"><i class="fa-solid fa-crown"></i> Premium</span>' : ''}
                <img src="${normalizeImagePath(product.image)}" alt="${product.name}" loading="eager" onerror="this.src='${appConfig.imageFallback}'">
            </div>
            <h3>${product.name}</h3>
            <div class="rating-stars">${ratingHtml}</div>
            <div class="product-meta">
                <div class="product-price"><span>Ksh</span> ${product.price}</div>
                <span class="product-category">${capitalize(product.category)}</span>
            </div>
            <div class="product-actions">
                <button class="add-btn" onclick="addToCart('${product.name.replace(/'/g, "\\'")}', ${product.price})"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                <button class="view-btn" onclick="openQuickView(${productEscaped})" aria-label="View Details"><i class="fa-solid fa-eye"></i></button>
            </div>
            ${isUserItem ? `<button class="remove-item-btn full-width-btn" style="margin-top:12px;" onclick="removeUserItem(${userItems.indexOf(product)})"><i class="fa-solid fa-trash-can"></i> Remove</button>` : isOwner ? `<div class="admin-card-controls"><button class="remove-item-btn full-width-btn" onclick="deleteProduct('${product.id}', false)"><i class="fa-solid fa-trash-can"></i> Remove</button></div>` : ''}
            ${editControls}
        `;

        if(!isOwner){
            productCard.classList.add('clickable-card');
            productCard.addEventListener('click', event => {
                if(!event.target.closest('button') && !event.target.closest('input') && !event.target.closest('select')){
                    openQuickView(product);
                }
            });
        }

        productsContainer.appendChild(productCard);
        const productImg = productCard.querySelector('img');
        if(productImg){
            productImg.onerror = () => {
                productImg.onerror = null;
                productImg.src = appConfig.imageFallback;
            };
        }
    });
}

function searchProducts(query){
    state.query = query;
    renderProducts();
}

function filterProducts(gender, category){
    state.gender = gender;
    state.category = category;
    setActiveButtons();
    renderProducts();
}

function setActiveButtons(){
    document.querySelectorAll('.filter-btn, .category-btn').forEach(btn => {
        const gender = btn.dataset.gender;
        const category = btn.dataset.category;
        btn.classList.toggle('active', gender === state.gender && category === state.category);
    });
}

function viewProduct(product){
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "product.html";
}

function capitalize(text){
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Upload functionality
document.getElementById('upload-image')?.addEventListener('change', function(e) {
    selectedImageFile = e.target.files[0];
    document.getElementById('file-name').textContent = selectedImageFile ? `✓ ${selectedImageFile.name}` : '';
});

function uploadItem(){
    const name = document.getElementById('upload-name').value.trim();
    const price = parseFloat(document.getElementById('upload-price').value);
    const gender = document.getElementById('upload-gender').value;
    const category = document.getElementById('upload-category').value;
    const statusEl = document.getElementById('upload-status');

    if(!isOwner){
        if(statusEl){ statusEl.textContent = 'Owner access required to add a new item.'; statusEl.style.color = '#ef4444'; }
        return;
    }

    if(!name || !price || !selectedImageFile){
        if(statusEl){ statusEl.textContent = 'Please fill all fields and select an image.'; statusEl.style.color = '#ef4444'; }
        return;
    }

    if(price < 850 || price > 2200){
        if(statusEl){ statusEl.textContent = 'Price must be between 850 and 2200 Ksh'; statusEl.style.color = '#ef4444'; }
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const newItem = {
            id: `${generateId(name)}-${Date.now()}`,
            name,
            price,
            gender,
            category,
            image: event.target.result
        };

        if(appConfig.useBackend){
            createBackendProduct({ name, price, gender, category, image: newItem.image }).then(created => {
                if(created){
                    products.push(created);
                    saveProducts();
                    renderProducts();
                } else {
                    products.push(newItem);
                    saveProducts();
                    statusEl.textContent = 'Could not persist to backend; saved locally.';
                    statusEl.style.color = '#ef4444';
                }
            }).catch(e => {
                console.error('Persist product failed', e);
                products.push(newItem);
                saveProducts();
                statusEl.textContent = 'Backend unavailable; saved locally.';
                statusEl.style.color = '#ef4444';
            });
        } else {
            userItems.push(newItem);
            saveUserItems();
        }
        
        // Clear form
        document.getElementById('upload-name').value = '';
        document.getElementById('upload-price').value = '';
        document.getElementById('upload-image').value = '';
        document.getElementById('file-name').textContent = '';
        selectedImageFile = null;
        
        if(statusEl){ statusEl.textContent = 'Item added successfully!'; statusEl.style.color = '#10b981'; }
        renderProducts();
        displayUserItems();
    };
    reader.readAsDataURL(selectedImageFile);
}

function removeUserItem(index, confirmed){
    const ownerArea = document.getElementById('owner-section');
    const existing = document.getElementById('remove-confirm');
    if(confirmed){
        const removed = userItems.splice(index, 1)[0];
        saveUserItems();
        renderProducts();
        displayUserItems();
        if(existing) existing.remove();

        const toastContainer = document.getElementById('toast-container');
        if(!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>Removed "${removed.name}"</span>`;
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'dismiss';
        dismissBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        toast.appendChild(undoBtn);
        toast.appendChild(dismissBtn);
        toastContainer.appendChild(toast);

        let done = false;
        const timeout = setTimeout(() => {
            if(!done){
                toast.remove();
            }
        }, 6000);

        undoBtn.onclick = () => {
            done = true;
            clearTimeout(timeout);
            userItems.splice(index, 0, removed);
            saveUserItems();
            renderProducts();
            displayUserItems();
            toast.remove();
        };

        dismissBtn.onclick = () => { done = true; clearTimeout(timeout); toast.remove(); };

        return;
    }

    if(existing) existing.remove();

    const confirmBar = document.createElement('div');
    confirmBar.id = 'remove-confirm';
    confirmBar.className = 'upload-status';
    confirmBar.innerHTML = `Remove this item from sale? <button id="confirm-yes" class="owner-btn" style="padding:6px 14px; font-size:0.8rem; margin:0 6px;">Yes</button> <button id="confirm-no" class="remove-item-btn" style="padding:6px 14px; font-size:0.8rem; margin:0 6px;">Cancel</button>`;
    if(ownerArea){
        ownerArea.prepend(confirmBar);
    } else {
        document.body.prepend(confirmBar);
    }

    document.getElementById('confirm-yes').onclick = () => removeUserItem(index, true);
    document.getElementById('confirm-no').onclick = () => { confirmBar.remove(); };
}

function deleteProduct(productId, confirmed){
    const ownerArea = document.getElementById('owner-section');
    const existing = document.getElementById('remove-confirm');
    if(confirmed){
        const index = products.findIndex(p => p && p.id === productId);
        if(index === -1) return;
        const removed = products.splice(index, 1)[0];
        const undoRestoration = async () => {
            if(appConfig.useBackend){
                const restored = await createBackendProduct({ name: removed.name, price: removed.price, gender: removed.gender, category: removed.category, image: removed.image });
                if(restored){
                    products.push(restored);
                } else {
                    products.push(removed);
                }
            } else {
                products.push(removed);
            }
            saveProducts();
            renderProducts();
        };

        const finalizeDelete = async () => {
            if(appConfig.useBackend){
                const result = await deleteBackendProduct(productId);
                if(!result || result.deleted === 0){
                    products.splice(index, 0, removed);
                    saveProducts();
                    renderProducts();
                    return;
                }
            }
            saveProducts();
            renderProducts();

            const toastContainer = document.getElementById('toast-container');
            if(!toastContainer) return;
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<span>Removed "${removed.name}"</span>`;
            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo';
            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'dismiss';
            dismissBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            toast.appendChild(undoBtn);
            toast.appendChild(dismissBtn);
            toastContainer.appendChild(toast);

            let done = false;
            const timeout = setTimeout(() => {
                if(!done){
                    toast.remove();
                }
            }, 6000);

            undoBtn.onclick = () => {
                done = true;
                clearTimeout(timeout);
                undoRestoration();
                toast.remove();
            };

            dismissBtn.onclick = () => { done = true; clearTimeout(timeout); toast.remove(); };
        };

        if(existing) existing.remove();
        finalizeDelete();
        return;
    }

    if(existing) existing.remove();

    const confirmBar = document.createElement('div');
    confirmBar.id = 'remove-confirm';
    confirmBar.className = 'upload-status';
    confirmBar.innerHTML = `Remove this item from sale? <button id="confirm-yes" class="owner-btn" style="padding:6px 14px; font-size:0.8rem; margin:0 6px;">Yes</button> <button id="confirm-no" class="remove-item-btn" style="padding:6px 14px; font-size:0.8rem; margin:0 6px;">Cancel</button>`;
    if(ownerArea){
        ownerArea.prepend(confirmBar);
    } else {
        document.body.prepend(confirmBar);
    }

    document.getElementById('confirm-yes').onclick = () => deleteProduct(productId, true);
    document.getElementById('confirm-no').onclick = () => { confirmBar.remove(); };
}

// Bulk CSV import (owner only)
async function importCSV(){
    if(!isOwner){
        const csvStatus = document.getElementById('csv-status');
        if(csvStatus){ csvStatus.textContent = 'Owner access required to import CSV.'; csvStatus.style.color = '#ef4444'; }
        return;
    }

    const fileInput = document.getElementById('csv-file');
    const csvStatus = document.getElementById('csv-status');
    if(!fileInput || !fileInput.files || fileInput.files.length === 0){
        if(csvStatus){ csvStatus.textContent = 'Select a CSV file first.'; csvStatus.style.color = '#ef4444'; }
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function(e){
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if(lines.length === 0){ if(csvStatus){ csvStatus.textContent = 'CSV is empty.'; csvStatus.style.color = '#ef4444'; } return; }

        let start = 0;
        const headerCells = lines[0].split(',').map(h => h.trim().toLowerCase());
        const hasHeader = headerCells.includes('name');
        if(hasHeader) start = 1;

        let added = 0;
        const errors = [];
        for(let i = start; i < lines.length; i++){
            const cols = lines[i].split(',').map(c => c.trim());
            const [name, priceRaw, gender = 'female', category = 'other', image = ''] = cols;
            const price = parseFloat(priceRaw);
            if(!name || isNaN(price)){
                errors.push(`Line ${i+1}: invalid name or price`);
                continue;
            }
            if(price < 850 || price > 2200){
                errors.push(`Line ${i+1}: price out of range (${price})`);
                continue;
            }

            const product = {
                id: `${generateId(name)}-${Date.now()}-${i}`,
                name,
                price,
                gender,
                category,
                image: image || appConfig.imageFallback
            };
            if(appConfig.useBackend){
                const created = await createBackendProduct({ name: product.name, price: product.price, gender: product.gender, category: product.category, image: product.image });
                if(created){
                    products.push(created);
                } else {
                    products.push(product);
                    errors.push(`Line ${i+1}: backend unavailable, saved locally`);
                }
            } else {
                products.push(product);
            }
            added++;
        }

        saveProducts();
        renderProducts();
        if(csvStatus){
            csvStatus.style.color = errors.length ? '#ef4444' : '#10b981';
            csvStatus.textContent = `Imported ${added} rows` + (errors.length ? ` — ${errors.length} errors` : '');
        }
    };
    reader.readAsText(file);
}

function displayUserItems(){
    const userItemsContainer = document.getElementById('user-items');
    const userItemsTitle = document.getElementById('user-items-title');
    
    if(!userItemsContainer) return;
    
    if(userItems.length === 0){
        userItemsContainer.innerHTML = '';
        userItemsTitle.classList.remove('show-title');
        return;
    }
    
    userItemsTitle.classList.add('show-title');
    userItemsContainer.innerHTML = '';
    
    userItems.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'user-item badge';
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="eager" onerror="this.src='${appConfig.imageFallback}'">
            <h3>${item.name}</h3>
            <p>${appConfig.currencyLabel} ${item.price}</p>
            <p class="meta">${capitalize(item.gender)} · ${capitalize(item.category)}</p>
            <button class="remove-item-btn full-width-btn" onclick="removeUserItem(${index})"><i class="fa-solid fa-trash-can"></i> Remove from Sale</button>
        `;
        userItemsContainer.appendChild(itemCard);
        const userImg = itemCard.querySelector('img');
        if(userImg){
            userImg.onerror = () => {
                userImg.onerror = null;
                userImg.src = appConfig.imageFallback;
            };
        }
    });
}

// Initialize asynchronously (load backend products if configured)
(async function init(){
    applyTheme();
    products = await loadProducts();
    preloadImages();
    renderProducts();
    updateCart();
    displayUserItems();
    updateOwnerDisplay();
    loadFeedbackStatus();
})();