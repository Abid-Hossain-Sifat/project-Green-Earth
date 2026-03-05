const categoriesContainer = document.getElementById("CategoriesContainer");
const treesContainer = document.getElementById("TreesContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const allTreesbtn = document.getElementById("allTreesBtn");
const treeDetailsModal = document.getElementById("treeDetailsModal");
const modalImage = document.getElementById("modalimg");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalTitle = document.getElementById("modalTitle");
const cartContainer = document.getElementById("cartContainer");
const totalPrice = document.getElementById("totalPrice");
const emptyCartMessage = document.getElementById("emptyCartMessage");

let cart = [];

/**
 * 1. DYNAMIC STYLING VIA JS
 * CSS file-e hat na diye eikhan thekei scrollbar hide ar layout thik kora hoyeche.
 */
function applyStyles() {
    // Hide Scrollbar Logic
    const style = document.createElement('style');
    style.textContent = `
        #TreesContainer::-webkit-scrollbar, #cartContainer::-webkit-scrollbar, #CategoriesContainer::-webkit-scrollbar { display: none; }
        #TreesContainer, #cartContainer, #CategoriesContainer { -ms-overflow-style: none; scrollbar-width: none; }
        .card { transition: all 0.3s ease; transform: translateZ(0); }
        .card:hover { transform: translateY(-5px); }
    `;
    document.head.appendChild(style);

    // Responsive Grid Setup
    treesContainer.className = "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-[850px] pr-0";
    treesContainer.style.scrollBehavior = "smooth";
}
applyStyles();

// 2. Loading Logic
function showLoading() {
    loadingSpinner.classList.remove("hidden");
    treesContainer.innerHTML = "";
}
function hideLoading() {
    loadingSpinner.classList.add("hidden");
}

// 3. Load Categories
async function loadCategories() {
    const res = await fetch("https://openapi.programming-hero.com/api/categories");
    const data = await res.json();
    data.categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline border-gray-200 text-gray-600 min-w-[130px] lg:w-full rounded-xl font-bold hover:bg-gray-100 transition-all";
        btn.textContent = category.category_name;
        btn.onclick = () => selectCategory(category.id, btn);
        categoriesContainer.appendChild(btn);
    });
}

// 4. Select Category
async function selectCategory(categoryId, btn) {
    showLoading();
    const allButtons = document.querySelectorAll("#CategoriesContainer button, #allTreesBtn");
    allButtons.forEach(b => {
        b.className = "btn btn-outline border-gray-200 text-gray-600 min-w-[130px] lg:w-full rounded-xl font-bold hover:bg-gray-100 transition-all";
    });
    btn.className = "btn bg-[#15803D] text-white border-none min-w-[130px] lg:w-full rounded-xl font-bold shadow-md";

    const res = await fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`);
    const data = await res.json();
    displayTrees(data.plants);
    hideLoading();
}

// All Trees Button Event
allTreesbtn.addEventListener("click", () => {
    const allButtons = document.querySelectorAll("#CategoriesContainer button, #allTreesBtn");
    allButtons.forEach(b => {
        b.className = "btn btn-outline border-gray-200 text-gray-600 min-w-[130px] lg:w-full rounded-xl font-bold hover:bg-gray-100 transition-all";
    });
    allTreesbtn.className = "btn bg-[#15803D] text-white border-none min-w-[130px] lg:w-full rounded-xl font-bold shadow-md";
    loadTrees();
});

// 5. Display Trees (Lag Free)
async function loadTrees() {
    showLoading();
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    displayTrees(data.plants);
    hideLoading();
}

function displayTrees(trees) {
    let treeHTML = "";
    if (!trees || trees.length === 0) {
        treesContainer.innerHTML = "<p class='col-span-full text-center py-20 text-gray-400'>No trees found.</p>";
        return;
    }

    trees.forEach((tree) => {
        const borderColor = tree.price > 500 ? "border-red-500" : "border-[#15803D]";
        
        treeHTML += `
        <div class="card bg-white shadow-md border-b-4 ${borderColor} rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-xl">
            <figure class="overflow-hidden">
                <img src="${tree.image}" loading="lazy" class="h-48 w-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500" onclick="openTreeModal(${tree.id})" />
            </figure>
            <div class="card-body p-4 flex flex-col justify-between flex-grow">
                <div>
                    <h2 class="card-title text-base font-bold cursor-pointer hover:text-[#15803D] line-clamp-1" onclick="openTreeModal(${tree.id})">${tree.name}</h2>
                    <p class="text-[11px] text-gray-500 line-clamp-2 mb-3">${tree.description}</p>
                    <div class="badge bg-green-50 text-[#15803D] border-none font-bold text-[9px] uppercase px-2">${tree.category}</div>
                </div>
                <div class="flex justify-between items-center mt-5">
                    <h2 class="font-black text-xl text-gray-900">$${tree.price}</h2>
                    <button class="btn btn-sm bg-[#15803D] text-white border-none rounded-lg px-4 hover:bg-[#116a32] active:scale-90" 
                        onclick="addToCart(${tree.id}, '${tree.name.replace(/'/g, "\\'")}', ${tree.price})">Cart</button>
                </div>
            </div>
        </div>`;
    });

    requestAnimationFrame(() => {
        treesContainer.innerHTML = treeHTML;
        treesContainer.scrollTop = 0;
    });
}

// 6. Modal & 7. Cart (Remaining Logic)
async function openTreeModal(treeId) {
    const res = await fetch(`https://openapi.programming-hero.com/api/plant/${treeId}`);
    const data = await res.json();
    const plant = data.plants;
    modalTitle.textContent = plant.name;
    modalImage.src = plant.image;
    modalCategory.textContent = plant.category;
    modalDescription.textContent = plant.description;
    modalPrice.textContent = plant.price;
    treeDetailsModal.showModal();
}

function addToCart(id, name, price) {
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.quantity++; } 
    else { cart.push({ id, name, price, quantity: 1 }); }
    updateCart();
}

function updateCart() {
    cartContainer.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
        emptyCartMessage.classList.remove("hidden");
        totalPrice.innerText = "$0";
        return;
    }
    emptyCartMessage.classList.add("hidden");
    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement("div");
        div.className = "bg-gray-50 p-3 rounded-xl shadow-sm flex justify-between items-center border border-gray-200 mb-2";
        div.innerHTML = `
            <div>
                <h4 class="font-bold text-gray-800 text-xs">${item.name}</h4>
                <p class="text-[10px] text-gray-500">$${item.price} x ${item.quantity}</p>
            </div>
            <div class="flex flex-col items-end">
                <button onclick="removeFromCart(${item.id})" class="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                <span class="font-bold text-gray-900 text-sm">$${item.price * item.quantity}</span>
            </div>
        `;
        cartContainer.appendChild(div);
    });
    totalPrice.innerText = `$${total.toLocaleString()}`;
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

loadCategories();
loadTrees();