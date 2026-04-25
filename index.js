document.addEventListener("DOMContentLoaded", () => {

  /* ================= CARROSSEL ================= */
  const slides = document.querySelector('.carousel-container');
  const totalSlides = document.querySelectorAll('.slide').length;
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dots = document.querySelectorAll('.dot');
  let index = 0;

  function updateSlide() {
    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  nextBtn?.addEventListener('click', () => { index = (index + 1) % totalSlides; updateSlide(); });
  prevBtn?.addEventListener('click', () => { index = (index - 1 + totalSlides) % totalSlides; updateSlide(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { index = i; updateSlide(); }));

  setInterval(() => { index = (index + 1) % totalSlides; updateSlide(); }, 5000);

  /* ================= FILTROS ================= */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? 'flex' : 'none';
      });
    });
  });

  /* ================= SACOLA ================= */
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  document.getElementById("cart-icon")?.addEventListener("click", openCart);
  document.getElementById("close-cart")?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  function openCart() {
    renderCart();
    cartDrawer.classList.add("active");
    cartOverlay.style.display = "block";
  }

  function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.style.display = "none";
  }

  /* ================= QUANTIDADE ================= */
  document.querySelectorAll(".product-card").forEach(card => {
    const minus = card.querySelector(".qty-minus");
    const plus = card.querySelector(".qty-plus");
    const input = card.querySelector(".qty-input");
    if (!minus || !plus || !input) return;
    minus.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); let v = parseInt(input.value); if (v > 1) input.value = v - 1; });
    plus.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); input.value = parseInt(input.value) + 1; });
    input.addEventListener("click", e => e.stopPropagation());
  });

  /* ================= ADICIONAR ================= */
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const card = e.target.closest(".product-card");
      const nameEl = card.querySelector("h3");
      const priceEl = card.querySelector("p");
      const imgEl = card.querySelector("img");
      if (!nameEl || !priceEl || !imgEl) return;

      const name = nameEl.innerText;
      const price = parseFloat(priceEl.innerText.replace("R$", "").replace(",", ".").trim());
      const image = imgEl.src;
      const qtyInput = card.querySelector(".qty-input");
      const colorSelect = card.querySelector(".color-select");
      const qty = qtyInput ? parseInt(qtyInput.value) : 1;
      const color = colorSelect ? colorSelect.value : "Padrão";

      const existing = cart.find(item => item.name === name && item.color === color);
      if (existing) { existing.qty += qty; } else { cart.push({ name, price, image, qty, color }); }

      localStorage.setItem("cart", JSON.stringify(cart));
      if (qtyInput) qtyInput.value = 1;
      if (colorSelect) colorSelect.selectedIndex = 0;
      openCart();
    });
  });

  /* ================= REMOVER ================= */
  window.removeItem = idx => {
    cart.splice(idx, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  /* ================= RENDER SACOLA ================= */
  function renderCart() {
    cartItemsEl.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p style="color:var(--text-muted);text-align:center;margin-top:40px;font-size:14px">Sua sacola está vazia 🛍️</p>`;
    }
    cart.forEach((item, i) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      cartItemsEl.innerHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div style="flex:1">
            <h4>${item.name}</h4>
            <small>Cor: ${item.color} &nbsp;|&nbsp; Qtd: ${item.qty}</small>
            <p>R$ ${subtotal.toFixed(2).replace(".", ",")}</p>
            <button onclick="removeItem(${i})" style="margin-top:6px;background:none;border:none;color:var(--rose);cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;padding:0">Remover</button>
          </div>
        </div>
      `;
    });
    cartTotal.innerText = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
  }

  /* ================= CHECKOUT ================= */
  const checkoutBtn = document.querySelector(".checkout-btn");
  const modal = document.getElementById("checkout-modal");
  const cancelBtn = document.getElementById("cancel-checkout");
  const confirmBtn = document.getElementById("confirm-checkout");

  checkoutBtn?.addEventListener("click", () => {
    if (cart.length === 0) { alert("Sua sacola está vazia."); return; }
    modal.style.display = "flex";
  });

  cancelBtn?.addEventListener("click", () => { modal.style.display = "none"; });

  confirmBtn?.addEventListener("click", () => {
    const name = document.getElementById("client-name").value.trim();
    const address = document.getElementById("client-address").value.trim();
    if (!name || !address) { alert("Por favor, preencha nome e endereço."); return; }

    let message = `NOVO PEDIDO - CHERRY PINK BY MARI\n\nCLIENTE:\n${name}\n\nENDEREÇO:\n${address}\n\nITENS DO PEDIDO:\n`;
    let total = 0;

    cart.forEach(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      message += `\n- ${item.name}\n  Quantidade: ${item.qty}\n`;
      if (item.color && item.color !== "Padrão") message += `  Cor: ${item.color}\n`;
      message += `  Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n`;
    });

    message += `\n\nTOTAL DO PEDIDO:\nR$ ${total.toFixed(2).replace(".", ",")}\n\nAguardando confirmação do pedido.`;

    window.open(`https://wa.me/5551994119090?text=${encodeURIComponent(message)}`, "_blank");
    modal.style.display = "none";
  });

});
// =================== BUSCA ===================
(function () {
  const input = document.querySelector('.search-box input');
  if (!input) return;

  // Cria dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'search-dropdown';
  dropdown.style.cssText = `
    position: absolute; top: calc(100% + 8px); left: 0; right: 0;
    background: #fff; border: 1.5px solid #f4b8c8;
    border-radius: 16px; box-shadow: 0 8px 30px rgba(224,96,122,0.15);
    overflow: hidden; z-index: 200; max-height: 320px; overflow-y: auto; display: none;
  `;

  // Envolve o .search-box em um wrapper posicionado
  const searchBox = document.querySelector('.search-box');
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position: relative; flex: 1;';
  searchBox.parentNode.insertBefore(wrapper, searchBox);
  wrapper.appendChild(searchBox);
  wrapper.appendChild(dropdown);

  // Coleta todos os kits
  function getKits() {
    return Array.from(document.querySelectorAll('.kit-card, .product-card')).map(card => ({
      name: card.querySelector('h3')?.textContent || '',
      price: card.querySelector('.kit-price')?.textContent || '',
      el: card,
    }));
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';

    if (!q) {
      dropdown.style.display = 'none';
      getKits().forEach(k => k.el.style.display = '');
      return;
    }

    const matches = getKits().filter(k => k.name.toLowerCase().includes(q));

    // Filtra os cards na página
    getKits().forEach(k => {
      k.el.style.display = k.name.toLowerCase().includes(q) ? '' : 'none';
    });

    // Monta dropdown de sugestões
    if (matches.length === 0) {
      dropdown.innerHTML = '<div style="padding:20px;text-align:center;color:#aaa;font-size:14px;">Nenhum produto encontrado 😢</div>';
    } else {
      matches.forEach(k => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid #fce8ef;transition:background 0.15s;';
        item.innerHTML = `
          <div>
            <div style="font-weight:600;font-size:14px;color:#c0436a;">${k.name}</div>
            <div style="font-size:13px;color:#888;margin-top:2px;">${k.price}</div>
          </div>`;
        item.onmouseenter = () => item.style.background = '#fff5f7';
        item.onmouseleave = () => item.style.background = '';
        item.addEventListener('click', () => {
          input.value = '';
          dropdown.style.display = 'none';
          getKits().forEach(k => k.el.style.display = '');
          k.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          k.el.style.outline = '3px solid #e0607a88';
          setTimeout(() => k.el.style.outline = '', 1500);
        });
        dropdown.appendChild(item);
      });
    }

    dropdown.style.display = 'block';
  });

  // Fecha ao clicar fora
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) dropdown.style.display = 'none';
  });
})();
