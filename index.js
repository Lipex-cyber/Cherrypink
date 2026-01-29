document.addEventListener("DOMContentLoaded", () => {

  /* ================= CARROSSEL ================= */
  const slides = document.querySelector('.carousel-container');
  const totalSlides = document.querySelectorAll('.slide').length;
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  let index = 0;

  function updateSlide() {
    slides.style.transform = `translateX(-${index * 100}vw)`;
  }

  next?.addEventListener('click', () => {
    index = (index + 1) % totalSlides;
    updateSlide();
  });

  prev?.addEventListener('click', () => {
    index = (index - 1 + totalSlides) % totalSlides;
    updateSlide();
  });

  setInterval(() => {
    index = (index + 1) % totalSlides;
    updateSlide();
  }, 5000);

  /* ================= FILTROS ================= */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        card.style.display =
          filter === 'all' || card.dataset.category === filter
            ? 'block'
            : 'none';
      });
    });
  });

  /* ================= SACOLA ================= */
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItems = document.getElementById("cart-items");
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

    minus.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      let v = parseInt(input.value);
      if (v > 1) input.value = v - 1;
    });

    plus.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      input.value = parseInt(input.value) + 1;
    });

    input.addEventListener("click", e => {
      e.stopPropagation();
    });
  });

  /* ================= ADICIONAR À SACOLA ================= */
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const card = e.target.closest(".product-card");

      const name = card.querySelector("h3").innerText;
      const price = parseFloat(
        card.querySelector("p").innerText.replace("R$", "").replace(",", ".")
      );
      const image = card.querySelector("img").src;

      const qtyInput = card.querySelector(".qty-input");
      const colorSelect = card.querySelector(".color-select");

      const qty = qtyInput ? parseInt(qtyInput.value) : 1;
      const color = colorSelect ? colorSelect.value : "Padrão";

      const existing = cart.find(item =>
        item.name === name && item.color === color
      );

      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ name, price, image, qty, color });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      if (qtyInput) qtyInput.value = 1;
      if (colorSelect) colorSelect.selectedIndex = 0;

      openCart();
    });
  });

  /* ================= REMOVER ITEM ================= */
  window.removeItem = index => {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  /* ================= RENDER SACOLA ================= */
  function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const subtotal = item.price * item.qty;
      total += subtotal;

      cartItems.innerHTML += `
        <div class="cart-item">
          <img src="${item.image}">
          <div>
            <h4>${item.name}</h4>
            <small>Cor: ${item.color}</small><br>
            <small>Qtd: ${item.qty}</small>
            <p>R$ ${subtotal.toFixed(2).replace(".", ",")}</p>
            <button onclick="removeItem(${index})"
              style="margin-top:6px;background:none;border:none;color:#ff3399;cursor:pointer">
              Remover
            </button>
          </div>
        </div>
      `;
    });

    cartTotal.innerText = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
  }
/* ================= FINALIZAR COM DADOS CLIENTE ================= */
const checkoutBtn = document.querySelector(".checkout-btn");
const modal = document.getElementById("checkout-modal");
const cancelBtn = document.getElementById("cancel-checkout");
const confirmBtn = document.getElementById("confirm-checkout");

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Sua sacola está vazia.");
    return;
  }
  modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

confirmBtn.addEventListener("click", () => {
  const name = document.getElementById("client-name").value.trim();
  const address = document.getElementById("client-address").value.trim();

  if (!name || !address) {
    alert("Por favor, preencha nome e endereço.");
    return;
  }

  let message = 
`NOVO PEDIDO - CHERRY PINK BY MARI

CLIENTE:
${name}

ENDEREÇO:
${address}

ITENS DO PEDIDO:
`;

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    message += `
- ${item.name}
  Quantidade: ${item.qty}
`;

    if (item.color && item.color !== "Padrão") {
      message += `  Cor: ${item.color}
`;
    }

    message += `  Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}
`;
  });

  message += `

TOTAL DO PEDIDO:
R$ ${total.toFixed(2).replace(".", ",")}

Aguardando confirmacao do pedido.
`;

  const phone = "5551994119090";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  modal.style.display = "none";
});
});