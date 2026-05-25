let cart = JSON.parse(localStorage.getItem("cart")) || [];
let userItems = JSON.parse(localStorage.getItem("userItems")) || [];
const state = { gender: 'all', category: 'all', query: '' };
let selectedImageFile = null;

const appConfig = {
    ownerPasscode: 'owner123',
    currencyLabel: 'Ksh',
    imageFallback: 'uploads/womens_handbag.jpg',
    useBackend: true,
    backendUrl: 'http://localhost:3000'
};

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
    { name: 'Elegant Heels', price: 1200, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.svg' },
    { name: 'Flat Sandals', price: 850, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Leather Loafers', price: 1100, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Ballet Flats', price: 900, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.svg' },
    { name: 'Stylish Mules', price: 1050, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Ankle Boots', price: 1700, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Wedge Heels', price: 1300, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_2.svg' },
    { name: 'Designer Pumps', price: 1600, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_3.svg' },
    { name: 'Casual Sneakers', price: 980, gender: 'female', category: 'shoes', image: 'uploads/womens_shoes_1.jpg' },
    { name: 'Luxury Bed Set - King', price: 2200, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.svg' },
    { name: 'Floral Bedding Collection', price: 1450, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Satin Pillowcase Set', price: 950, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.svg' },
    { name: 'Premium Cotton Sheets', price: 1750, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Soft Duvet Cover', price: 1400, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.svg' },
    { name: 'Elegant Comforter Set', price: 1950, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Quilted Bed Spread', price: 1600, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.svg' },
    { name: 'Silk Bed Sheet Set', price: 2200, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_2.svg' },
    { name: 'Egyptian Cotton Sheets', price: 1900, gender: 'female', category: 'beddings', image: 'uploads/womens_bedding_1.svg' },
    { name: 'Leather Handbag - Black', price: 1800, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag.jpg' },
    { name: 'Quilted Shoulder Bag', price: 1700, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_1.svg' },
    { name: 'Luxury Tote Bag', price: 1950, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_2.svg' },
    { name: 'Evening Clutch - Gold', price: 1200, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_1.svg' },
    { name: 'Crossbody Leather Bag', price: 1450, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag.jpg' },
    { name: 'Designer Backpack', price: 2000, gender: 'female', category: 'handbags', image: 'uploads/womens_handbag_2.svg' },
    { name: 'Classic Sneakers - White', price: 1300, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.svg' },
    { name: 'Running Shoes - Black', price: 1500, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_2.svg' },
    { name: 'Leather Loafers - Brown', price: 1600, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.svg' },
    { name: 'Casual Slip-ons', price: 1100, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_2.svg' },
    { name: 'Oxford Dress Shoes', price: 1800, gender: 'male', category: 'shoes', image: 'uploads/mens_shoes_1.svg' },
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

function addToCart(name, price){
    let item = cart.find(p => p.name === name);

    if(item){
        item.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    saveCart();

    // brief visual feedback: highlight cart area
    const cartEl = document.getElementById('cart');
    if(cartEl){
        cartEl.classList.add('highlight');
        setTimeout(() => cartEl.classList.remove('highlight'), 900);
    }
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

function removeFromCart(name){
    cart = cart.filter(item => item.name !== name);
    saveCart();
}

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}


function saveUserItems(){
    localStorage.setItem('userItems', JSON.stringify(userItems));
}

function toggleEditMode(productId, isUserItem, active){
    const list = isUserItem ? userItems : products;
    list.forEach(item => {
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
        statusMessage.style.color = '#b91c1c';
        return;
    }

    if(price < 850 || price > 2200){
        statusMessage.textContent = 'Price must be between 850 and 2200 Ksh.';
        statusMessage.style.color = '#b91c1c';
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
    const imageSources = [...products.map(p => p.image), ...userItems.map(i => i.image)];
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
        status.style.color = '#b91c1c';
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
            status.style.color = '#065f46';
            feedbackInput.value = '';
            return;
        }
    }

    const saved = JSON.parse(localStorage.getItem(feedbackKey)) || [];
    saved.push({ message, submittedAt: new Date().toISOString() });
    localStorage.setItem(feedbackKey, JSON.stringify(saved));

    feedbackInput.value = '';
    status.textContent = 'Thank you! Your feedback has been submitted.';
    status.style.color = '#065f46';
}

function loadFeedbackStatus(){
    const status = document.getElementById('feedback-status');
    if(!status) return;
    status.textContent = '';
}

function updateCart(){
    const cartItems = document.getElementById("cart-items");
    const totalEl = document.getElementById("total");
    const countEl = document.getElementById("cart-count");

    if(!cartItems) return;

    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        let li = document.createElement("li");

        li.innerHTML = `
            <span>${item.name} x${item.quantity} - ${appConfig.currencyLabel} ${item.price * item.quantity}</span>
            <button onclick="removeFromCart('${item.name}')">X</button>
        `;

        cartItems.appendChild(li);

        total += item.price * item.quantity;
        count += item.quantity;
    });

    totalEl.textContent = total;
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
        productsContainer.innerHTML = '<div class="empty">No products found.</div>';
        return;
    }

    filteredProducts.forEach((product) => {
        const isUserItem = userItems.includes(product);
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
                        <button class="upload-btn" onclick="saveProductEdits('${product.id}', ${isUserItem})">Save</button>
                        <button class="remove-item-btn" onclick="cancelEditProduct('${product.id}', ${isUserItem})">Cancel</button>
                    </div>
                    <p id="edit-status-${product.id}" class="edit-status"></p>
                </div>
            ` : `<button class="edit-btn" onclick="toggleEditMode('${product.id}', ${isUserItem}, true)">Edit Product</button>`}
        ` : '';

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="eager" onerror="this.src='${appConfig.imageFallback}'">
            <h3>${product.name}</h3>
            <p>${appConfig.currencyLabel} ${product.price}</p>
            <p class="meta">${capitalize(product.gender)} · ${capitalize(product.category)}</p>
            <button onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>
            <button onclick='viewProduct(${JSON.stringify(product)})'>View</button>
            ${isUserItem ? `<button class="remove-item-btn full-width-btn" onclick="removeUserItem(${userItems.indexOf(product)})">Remove</button>` : isOwner ? `<button class="remove-item-btn full-width-btn" onclick="deleteProduct('${product.id}', ${isUserItem})">Remove</button>` : ''}
            ${editControls}
        `;

        if(!isOwner){
            productCard.classList.add('clickable-card');
            productCard.addEventListener('click', event => {
                if(!event.target.closest('button') && !event.target.closest('input') && !event.target.closest('select')){
                    addToCart(product.name, product.price);
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

function scrollToCart(){
    window.location.href = 'cart.html';
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
        if(statusEl){ statusEl.textContent = 'Owner access required to add a new item.'; statusEl.style.color = '#b91c1c'; }
        return;
    }

    if(!name || !price || !selectedImageFile){
        if(statusEl){ statusEl.textContent = 'Please fill all fields and select an image.'; statusEl.style.color = '#b91c1c'; }
        return;
    }

    if(price < 850 || price > 2200){
        if(statusEl){ statusEl.textContent = 'Price must be between 850 and 2200 Ksh'; statusEl.style.color = '#b91c1c'; }
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
                    statusEl.style.color = '#b91c1c';
                }
            }).catch(e => {
                console.error('Persist product failed', e);
                products.push(newItem);
                saveProducts();
                statusEl.textContent = 'Backend unavailable; saved locally.';
                statusEl.style.color = '#b91c1c';
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
        
        if(statusEl){ statusEl.textContent = 'Item added successfully!'; statusEl.style.color = '#065f46'; }
        renderProducts();
        displayUserItems();
    };
    reader.readAsDataURL(selectedImageFile);
}

function removeUserItem(index, confirmed){
    const ownerArea = document.getElementById('owner-section');
    const existing = document.getElementById('remove-confirm');
    if(confirmed){
        // perform removal but allow undo via toast
        const removed = userItems.splice(index, 1)[0];
        saveUserItems();
        renderProducts();
        displayUserItems();
        if(existing) existing.remove();

        // show undo toast
        const toastContainer = document.getElementById('toast-container');
        if(!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>Removed "${removed.name}"</span>`;
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'dismiss';
        dismissBtn.textContent = '×';
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
            // restore at original index (or push)
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
    confirmBar.innerHTML = `Remove this item from sale? <button id="confirm-yes">Yes</button> <button id="confirm-no">Cancel</button>`;
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
        const index = products.findIndex(p => p.id === productId);
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
            dismissBtn.textContent = '×';
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
    confirmBar.innerHTML = `Remove this item from sale? <button id="confirm-yes">Yes</button> <button id="confirm-no">Cancel</button>`;
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
        if(csvStatus){ csvStatus.textContent = 'Owner access required to import CSV.'; csvStatus.style.color = '#b91c1c'; }
        return;
    }

    const fileInput = document.getElementById('csv-file');
    const csvStatus = document.getElementById('csv-status');
    if(!fileInput || !fileInput.files || fileInput.files.length === 0){
        if(csvStatus){ csvStatus.textContent = 'Select a CSV file first.'; csvStatus.style.color = '#b91c1c'; }
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function(e){
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if(lines.length === 0){ if(csvStatus){ csvStatus.textContent = 'CSV is empty.'; csvStatus.style.color = '#b91c1c'; } return; }

        // assume header row present if contains non-numeric values
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
            csvStatus.style.color = errors.length ? '#b91c1c' : '#065f46';
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
            <button class="remove-item-btn full-width-btn" onclick="removeUserItem(${index})">Remove from Sale</button>
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
    products = await loadProducts();
    preloadImages();
    renderProducts();
    updateCart();
    displayUserItems();
    updateOwnerDisplay();
    loadFeedbackStatus();
})();