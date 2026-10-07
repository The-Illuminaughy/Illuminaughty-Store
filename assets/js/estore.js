(() => {
  'use strict';
  const API = 'https://script.google.com/macros/s/AKfycbyxRmCCI8oBUcRClGjbV9tL9uPNzd5E3TJWK49GVrKLC_qdbJ4sxlnMlu30b10_-wwk/exec';
  const grid = document.querySelector('#product-grid');
  const status = document.querySelector('#store-status');

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(products) {
    grid.innerHTML = products.map(product => {
      const image = product.image_url
        ? `<div class="product-media"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy"></div>`
        : `<div class="product-media product-media--empty" aria-label="Product image pending">Image coming soon</div>`;
      const price = product.price ? `$${escapeHtml(product.price)}` : 'See Amazon for current price';
      const updated = product.last_updated ? `Price last updated: ${escapeHtml(product.last_updated)}` : '';
      return `
        <article class="product-card">
          ${image}
          <div class="product-body">
            <div class="product-category">${escapeHtml(product.category)}</div>
            <h2 class="product-name">${escapeHtml(product.name)}</h2>
            <div class="product-price">${price}</div>
            <div class="product-updated">${updated}</div>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <a class="amazon-button" href="${escapeHtml(product.amazon_url)}" target="_blank" rel="sponsored noopener noreferrer">Shop on Amazon</a>
          </div>
        </article>`;
    }).join('');
  }

  async function loadProducts() {
    try {
      const response = await fetch(`${API}?action=products`, { cache: 'no-store', redirect: 'follow' });
      const result = await response.json();
      if (!result.ok || !Array.isArray(result.products)) throw new Error('Product feed unavailable.');
      render(result.products);
      status.textContent = result.products.length ? '' : 'No products are currently available.';
    } catch (error) {
      console.error(error);
      status.textContent = 'The product catalog is temporarily unavailable. Please check back shortly.';
    }
  }

  loadProducts();
})();
