/*==================== MOBILE MENU TOGGLE ====================*/
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav_link");

if (mobileMenuBtn && navMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpened = navMenu.classList.toggle("show-menu");
    mobileMenuBtn.classList.toggle("opened", isOpened);
    mobileMenuBtn.setAttribute("aria-expanded", String(isOpened));
  });
}

function closeMobileMenu() {
  if (navMenu && mobileMenuBtn) {
    navMenu.classList.remove("show-menu");
    mobileMenuBtn.classList.remove("opened");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  }
}

navLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));

/*==================== SCROLL SECTIONS ACTIVE LINK & HEADER ====================*/
const sections = document.querySelectorAll("section[id]");
const headerEl = document.getElementById("header");
const scrollTopEl = document.getElementById("scroll-top");

function onScrollUpdate() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 96;
    const sectionId = current.getAttribute("id");
    const matchingLink = document.querySelector(
      `.nav_menu a[href*="${sectionId}"]`
    );

    if (matchingLink) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        matchingLink.classList.add("active-link");
      } else {
        matchingLink.classList.remove("active-link");
      }
    }
  });

  if (headerEl) {
    headerEl.classList.toggle("scroll-header", scrollY >= 80);
  }

  if (scrollTopEl) {
    scrollTopEl.classList.toggle("show-scroll", scrollY >= 480);
  }
}

window.addEventListener("scroll", onScrollUpdate, { passive: true });
if (scrollTopEl) {
  scrollTopEl.addEventListener("click", closeMobileMenu);
}

/*==================== DARK / LIGHT THEME ====================*/
const themeButton = document.getElementById("theme-button");
const themeIcon = document.getElementById("theme-icon");
const darkThemeClass = "dark-theme";

const savedTheme = localStorage.getItem("selected-theme");
if (savedTheme === "dark") {
  document.body.classList.add(darkThemeClass);
  if (themeIcon) {
    themeIcon.classList.remove("bx-moon");
    themeIcon.classList.add("bx-sun");
  }
}

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const isDark = document.body.classList.toggle(darkThemeClass);
    if (themeIcon) {
      themeIcon.classList.toggle("bx-sun", isDark);
      themeIcon.classList.toggle("bx-moon", !isDark);
    }
    localStorage.setItem("selected-theme", isDark ? "dark" : "light");
  });
}

/*==================== TOAST HELPER ====================*/
const toastBanner = document.getElementById("toast-banner");
const toastText = document.getElementById("toast-text");
let toastTimer = null;

function showToast(message) {
  if (!toastBanner || !toastText) return;
  toastText.textContent = message;
  toastBanner.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastBanner.hidden = true;
  }, 2800);
}

/*==================== DELIVERY REGION SELECTOR ====================*/
const regionSelect = document.getElementById("region-select");
const heroEtaLabel = document.getElementById("hero-eta-label");
const cartRegionDisplay = document.getElementById("cart-region-display");

if (regionSelect) {
  regionSelect.addEventListener("change", () => {
    const val = regionSelect.value;
    if (heroEtaLabel) {
      heroEtaLabel.textContent = val;
    }
    if (cartRegionDisplay) {
      cartRegionDisplay.textContent = `Entrega em ${val}`;
    }
    showToast(`Região de entrega atualizada: ${val}`);
  });
}

/*==================== MENU FILTER TABS & SEARCH ====================*/
const filterTabs = document.querySelectorAll(".filter_tab");
const searchInput = document.getElementById("menu-search");
const foodCards = document.querySelectorAll(".foods_card");
const foodsEmpty = document.getElementById("foods-empty");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

let activeCategory = "all";
let searchQuery = "";

function applyMenuFilters() {
  let visibleCount = 0;
  const query = searchQuery.trim().toLowerCase();

  foodCards.forEach((card) => {
    const category = card.getAttribute("data-category") || "";
    const name = (card.getAttribute("data-name") || "").toLowerCase();
    const desc = (card.getAttribute("data-desc") || "").toLowerCase();

    const matchesCategory =
      activeCategory === "all" || category === activeCategory;
    const matchesQuery =
      !query || name.includes(query) || desc.includes(query);

    const shouldShow = matchesCategory && matchesQuery;
    card.hidden = !shouldShow;
    if (shouldShow) visibleCount++;
  });

  if (foodsEmpty) {
    foodsEmpty.hidden = visibleCount > 0;
  }
}

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    activeCategory = tab.getAttribute("data-filter") || "all";
    applyMenuFilters();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value || "";
    applyMenuFilters();
  });
}

if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", () => {
    activeCategory = "all";
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    filterTabs.forEach((t) => {
      const isAll = t.getAttribute("data-filter") === "all";
      t.classList.toggle("active", isAll);
      t.setAttribute("aria-selected", String(isAll));
    });
    applyMenuFilters();
  });
}

/*==================== CART & CHECKOUT DRAWER ====================*/
const FREE_DELIVERY_THRESHOLD = 60.0;
const STANDARD_DELIVERY_FEE = 5.9;

let cart = [];
try {
  const savedCart = localStorage.getItem("ubereats-cart");
  if (savedCart) cart = JSON.parse(savedCart);
} catch {
  cart = [];
}

const cartOpenBtn = document.getElementById("cart-open-btn");
const cartCloseBtn = document.getElementById("cart-close-btn");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartDrawer = document.getElementById("cart-drawer");
const cartCountEl = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items-list");
const cartEmptyState = document.getElementById("cart-empty-state");
const checkoutForm = document.getElementById("checkout-form");
const cartFooter = document.getElementById("cart-footer");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartDeliveryEl = document.getElementById("cart-delivery");
const cartTotalEl = document.getElementById("cart-total");
const freeShippingMsg = document.getElementById("free-shipping-msg");
const freeShippingFill = document.getElementById("free-shipping-fill");
const checkoutSubmitBtn = document.getElementById("checkout-submit-btn");
const checkoutErrorEl = document.getElementById("checkout-error");
const orderConfirmedBox = document.getElementById("order-confirmed-box");
const confirmedOrderNumber = document.getElementById("confirmed-order-number");
const confirmedOrderSummary = document.getElementById("confirmed-order-summary");
const newOrderBtn = document.getElementById("new-order-btn");

function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function saveCart() {
  try {
    localStorage.setItem("ubereats-cart", JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
}

function openCartDrawer() {
  if (!cartDrawer || !cartBackdrop) return;
  cartBackdrop.hidden = false;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  if (!cartDrawer || !cartBackdrop) return;
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartBackdrop.hidden = true;
}

if (cartOpenBtn) cartOpenBtn.addEventListener("click", openCartDrawer);
if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartCountEl) cartCountEl.textContent = String(totalItems);

  // Update free delivery progress
  const progressPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  if (freeShippingFill) {
    freeShippingFill.style.width = `${progressPct}%`;
  }
  if (freeShippingMsg) {
    if (subtotal === 0) {
      freeShippingMsg.textContent = `Frete grátis em pedidos acima de ${formatBRL(FREE_DELIVERY_THRESHOLD)}`;
    } else if (subtotal < FREE_DELIVERY_THRESHOLD) {
      const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
      freeShippingMsg.textContent = `Faltam ${formatBRL(remaining)} para ganhar entrega grátis`;
    } else {
      freeShippingMsg.textContent = "Você ganhou Entrega Grátis neste pedido!";
    }
  }

  if (cart.length === 0) {
    if (cartItemsList) cartItemsList.innerHTML = "";
    if (cartEmptyState) cartEmptyState.hidden = false;
    if (checkoutForm) checkoutForm.hidden = true;
    if (cartFooter) cartFooter.hidden = true;
    return;
  }

  if (cartEmptyState) cartEmptyState.hidden = true;
  if (orderConfirmedBox && !orderConfirmedBox.hidden) {
    // Keep confirmation visible until user starts a new order
    return;
  }
  if (checkoutForm) checkoutForm.hidden = false;
  if (cartFooter) cartFooter.hidden = false;

  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const finalTotal = subtotal + deliveryFee;

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatBRL(subtotal);
  if (cartDeliveryEl) {
    cartDeliveryEl.textContent =
      deliveryFee === 0 ? "Grátis" : formatBRL(deliveryFee);
  }
  if (cartTotalEl) cartTotalEl.textContent = formatBRL(finalTotal);

  if (cartItemsList) {
    cartItemsList.innerHTML = cart
      .map(
        (item, index) => `
      <li class="cart_item">
        <div class="cart_item_info">
          <img src="${item.img}" alt="${item.name}" class="cart_item_img" />
          <div>
            <p class="cart_item_name">${item.name}</p>
            <span class="cart_item_price">${formatBRL(item.price)} cada</span>
            ${item.note ? `<span class="cart_item_Note">Obs.: ${item.note}</span>` : ""}
          </div>
        </div>
        <div class="qty_controls">
          <button type="button" class="qty_btn" data-action="dec" data-index="${index}" aria-label="Diminuir quantidade">−</button>
          <span class="qty_val">${item.qty}</span>
          <button type="button" class="qty_btn" data-action="inc" data-index="${index}" aria-label="Aumentar quantidade">+</button>
        </div>
      </li>
    `
      )
      .join("");
  }
}

if (cartItemsList) {
  cartItemsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty_btn");
    if (!btn) return;
    const index = Number(btn.getAttribute("data-index"));
    const action = btn.getAttribute("data-action");
    if (!cart[index]) return;

    if (action === "inc") {
      cart[index].qty += 1;
    } else if (action === "dec") {
      cart[index].qty -= 1;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
    }
    saveCart();
    renderCart();
  });
}

function addItemToCart(itemData, note = "") {
  if (orderConfirmedBox) {
    orderConfirmedBox.hidden = true;
  }
  const existing = cart.find(
    (c) => c.id === itemData.id && (c.note || "") === note
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: itemData.id,
      name: itemData.name,
      price: Number(itemData.price),
      img: itemData.img,
      note,
      qty: 1,
    });
  }
  saveCart();
  renderCart();
  showToast(`${itemData.name} adicionado à sacola`);
}

document.querySelectorAll(".js-add-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".foods_card");
    if (!card) return;
    addItemToCart({
      id: card.getAttribute("data-id"),
      name: card.getAttribute("data-name"),
      price: card.getAttribute("data-price"),
      img: card.getAttribute("data-img"),
    });
  });
});

/*==================== CHECKOUT SUBMISSION ====================*/
if (checkoutSubmitBtn) {
  checkoutSubmitBtn.addEventListener("click", () => {
    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const cepInput = document.getElementById("cust-cep");
    const addressInput = document.getElementById("cust-address");
    const paymentSelect = document.getElementById("cust-payment");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const cep = cepInput ? cepInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const payment = paymentSelect ? paymentSelect.value : "Pix Instantâneo";

    if (!name || !phone || !cep || !address) {
      if (checkoutErrorEl) {
        checkoutErrorEl.textContent =
          "Preencha nome, telefone, CEP e endereço completo para confirmar a entrega.";
        checkoutErrorEl.className = "form_feedback is-error";
      }
      return;
    }

    if (checkoutErrorEl) {
      checkoutErrorEl.textContent = "";
    }

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryFee =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const orderNum = Math.floor(1000 + Math.random() * 9000);

    if (confirmedOrderNumber) {
      confirmedOrderNumber.textContent = `Pedido #${orderNum} Confirmado`;
    }

    if (confirmedOrderSummary) {
      const itemsSummary = cart
        .map((i) => `${i.qty}x ${i.name} (${formatBRL(i.price * i.qty)})`)
        .join("<br/>");
      confirmedOrderSummary.innerHTML = `
        <strong>Cliente:</strong> ${name}<br/>
        <strong>Endereço:</strong> ${address} · CEP ${cep}<br/>
        <strong>Pagamento:</strong> ${payment}<br/>
        <strong>Itens:</strong><br/>${itemsSummary}<br/>
        <strong>Total cobrado:</strong> ${formatBRL(total)}
      `;
    }

    cart = [];
    saveCart();
    if (cartItemsList) cartItemsList.innerHTML = "";
    if (checkoutForm) checkoutForm.hidden = true;
    if (cartFooter) cartFooter.hidden = true;
    if (cartEmptyState) cartEmptyState.hidden = true;
    if (orderConfirmedBox) orderConfirmedBox.hidden = false;
    if (cartCountEl) cartCountEl.textContent = "0";
  });
}

if (newOrderBtn) {
  newOrderBtn.addEventListener("click", () => {
    if (orderConfirmedBox) orderConfirmedBox.hidden = true;
    renderCart();
    closeCartDrawer();
  });
}

/*==================== DISH QUICK-VIEW MODAL ====================*/
const modalBackdrop = document.getElementById("dish-modal-backdrop");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalDishImg = document.getElementById("modal-dish-img");
const modalDishMeta = document.getElementById("modal-dish-meta");
const modalDishTitle = document.getElementById("modal-dish-title");
const modalDishDesc = document.getElementById("modal-dish-desc");
const modalDishPrice = document.getElementById("modal-dish-price");
const modalDishNote = document.getElementById("modal-dish-note");
const modalAddBtn = document.getElementById("modal-add-btn");

let currentModalItem = null;

document.querySelectorAll(".js-quick-view").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".foods_card");
    if (!card || !modalBackdrop) return;

    currentModalItem = {
      id: card.getAttribute("data-id"),
      name: card.getAttribute("data-name"),
      price: Number(card.getAttribute("data-price")),
      img: card.getAttribute("data-img"),
      calories: card.getAttribute("data-calories"),
      time: card.getAttribute("data-time"),
      desc: card.getAttribute("data-desc"),
    };

    if (modalDishImg) {
      modalDishImg.src = currentModalItem.img;
      modalDishImg.alt = currentModalItem.name;
    }
    if (modalDishMeta) {
      modalDishMeta.textContent = `Preparo em ${currentModalItem.time} · ${currentModalItem.calories}`;
    }
    if (modalDishTitle) modalDishTitle.textContent = currentModalItem.name;
    if (modalDishDesc) modalDishDesc.textContent = currentModalItem.desc;
    if (modalDishPrice) {
      modalDishPrice.textContent = formatBRL(currentModalItem.price);
    }
    if (modalDishNote) modalDishNote.value = "";

    modalBackdrop.hidden = false;
  });
});

function closeDishModal() {
  if (modalBackdrop) modalBackdrop.hidden = true;
  currentModalItem = null;
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeDishModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeDishModal();
  });
}

if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    if (!currentModalItem) return;
    const note = modalDishNote ? modalDishNote.value.trim() : "";
    addItemToCart(currentModalItem, note);
    closeDishModal();
    openCartDrawer();
  });
}

/*==================== STORE DOWNLOAD BUTTONS ====================*/
document.querySelectorAll(".js-store-download").forEach((btn) => {
  btn.addEventListener("click", () => {
    const storeName = btn.getAttribute("data-store") || "Loja";
    showToast(`Redirecionando para o aplicativo Uber Eats na ${storeName}...`);
  });
});

/*==================== CONTACT FORM VALIDATION & HANDLER ====================*/
const contactForm = document.getElementById("contact-form");
const contactFeedback = document.getElementById("contact-feedback");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name")?.value.trim() || "";
    const email = document.getElementById("contact-email")?.value.trim() || "";
    const topic = document.getElementById("contact-topic")?.value || "";
    const message =
      document.getElementById("contact-message")?.value.trim() || "";

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !emailValid || !message) {
      if (contactFeedback) {
        contactFeedback.textContent =
          "Por favor, informe seu nome, um e-mail válido e sua mensagem.";
        contactFeedback.className = "form_feedback is-error";
      }
      return;
    }

    if (contactFeedback) {
      contactFeedback.textContent = `Mensagem recebida (${topic}). Responderemos para ${email} em até 5 minutos.`;
      contactFeedback.className = "form_feedback is-success";
    }
    contactForm.reset();
  });
}

/*==================== INITIAL RENDER ====================*/
renderCart();
