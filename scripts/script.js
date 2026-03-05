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

// Grid setup for 3 columns (HTML e jodi grid na thake tahole eita kaj korbe)
treesContainer.className = "grid grid-cols-1 md:grid-cols-3 gap-6";

function showLoading() {
  loadingSpinner.classList.remove("hidden");
  treesContainer.innerHTML = "";
}
function hideLoading() {
  loadingSpinner.classList.add("hidden");
}

// All Trees Button Style
allTreesbtn.className = "btn w-full rounded-xl bg-[#15803D] text-white border-none font-bold hover:bg-gray-200 hover:text-black";

// 1. Categories load 
async function loadCategories() {
  const res = await fetch("https://openapi.programming-hero.com/api/categories");
  const data = await res.json();
  
  data.categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline w-full rounded-xl border-gray-400 text-gray-800 font-bold hover:bg-gray-100 hover:text-black hover:border-gray-400"; 
    btn.textContent = category.category_name;
    btn.onclick = () => selectCategory(category.id, btn);
    categoriesContainer.appendChild(btn);
  });
}

// 2. Select Category logic
async function selectCategory(categoryId, btn) {
  showLoading();
  const allButtons = document.querySelectorAll("#CategoriesContainer button, #allTreesBtn");
  allButtons.forEach((b) => {
    b.classList.remove("bg-[#15803D]", "text-white", "border-none");
    b.classList.add("btn-outline", "border-gray-400", "text-gray-800");
  });
  btn.classList.add("bg-[#15803D]", "text-white", "border-none");
  btn.classList.remove("btn-outline", "border-gray-400", "text-gray-800");

  const res = await fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`);
  const data = await res.json();
  displayTrees(data.plants);
  hideLoading();
}

allTreesbtn.addEventListener("click", () => {
  const allButtons = document.querySelectorAll("#CategoriesContainer button, #allTreesBtn");
  allButtons.forEach((b) => {
    b.classList.remove("bg-[#15803D]", "text-white", "border-none");
    b.classList.add("btn-outline", "border-gray-400", "text-gray-800");
  });
  allTreesbtn.classList.add("bg-[#15803D]", "text-white", "border-none");
  allTreesbtn.classList.remove("btn-outline", "border-gray-400", "text-gray-800");
  loadTrees();
});

// 3. Trees Display (Ek line-e 3 ta card hobe ekhon)
async function loadTrees() {
  showLoading();
  const res = await fetch("https://openapi.programming-hero.com/api/plants");
  const data = await res.json();
  hideLoading();
  displayTrees(data.plants);
}

function displayTrees(trees) {
  let treeHTML = ""; 
  trees.forEach((tree) => {
    const borderColor = tree.price > 500 ? "border-red-500" : "border-[#15803D]";
    
    // col-span soriye dewa hoyeche jate 3 ta kore boste pare
    treeHTML += `
      <div class="card bg-white shadow-md border-b-4 ${borderColor} rounded-2xl overflow-hidden h-full">
        <figure>
          <img src="${tree.image}" class="h-48 w-full object-cover cursor-pointer" onclick="openTreeModal(${tree.id})" />
        </figure>
        <div class="card-body p-4 flex flex-col justify-between">
          <div>
            <h2 class="card-title text-lg cursor-pointer hover:text-[#15803D]" onclick="openTreeModal(${tree.id})">${tree.name}</h2>
            <p class="line-clamp-2 text-sm text-gray-500">${tree.description}</p>
            <div class="badge bg-green-50 text-[#15803D] border-none mt-2 font-semibold">${tree.category}</div>
          </div>
          <div class="flex justify-between items-center mt-4">
            <h2 class="font-bold text-xl text-gray-900">$${tree.price}</h2>
            <button class="btn btn-sm bg-[#15803D] text-white border-none rounded-lg px-4 hover:bg-[#126631]" onclick="addToCart(${tree.id}, '${tree.name.replace(/'/g, "\\'")}', ${tree.price})">Cart</button>
          </div>
        </div>
      </div>`;
  });
  treesContainer.innerHTML = treeHTML;
}

// 4. Modal
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

// 5. Cart Logic
function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCart();
}

function updateCart() {
  let cartHTML = "";
  let total = 0;
  if (cart.length === 0) {
    cartContainer.innerHTML = "";
    emptyCartMessage.classList.remove("hidden");
    totalPrice.textContent = `$0`;
    return;
  }
  emptyCartMessage.classList.add("hidden");
  cart.forEach((item) => {
    total += item.price * item.quantity;
    cartHTML += `
      <div class="card card-body bg-slate-100 p-4 rounded-2xl mb-3 border-none shadow-none">
        <div class="flex justify-between items-center">
          <div class="space-y-1">
            <h2 class="font-bold text-[#111827] text-lg">${item.name}</h2>
            <p class="text-gray-800 font-medium">$${item.price} × ${item.quantity}</p>
          </div>
          <div class="flex flex-col items-end">
            <button class="text-gray-700 hover:text-black mb-4" onclick="removeFromCart(${item.id})">
              <span class="text-xl font-bold">✕</span>
            </button>
            <p class="font-bold text-3xl text-gray-900">$${item.price * item.quantity}</p>
          </div>
        </div>
      </div>`;
  });
  cartContainer.innerHTML = cartHTML;
  totalPrice.innerText = `$${total}`;
}

function removeFromCart(treeId) {
  cart = cart.filter((item) => item.id != treeId);
  updateCart();
}

loadCategories();
loadTrees();