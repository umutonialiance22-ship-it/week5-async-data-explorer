
const app = document.querySelector("#app");

// Escape API values before inserting them into HTML.
export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

// Pure helper: calculate visible products from the current state.
export function getVisibleItems({ items, query, filter, sort }) {
  const searchTerm = query.trim().toLowerCase();

  const filtered = items
    .filter(({ title, category, brand }) => {
      const searchableText = [
        title,
        category,
        brand ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    })
    .filter(({ category }) => {
      return filter === "all" || category === filter;
    });

  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.title.localeCompare(b.title),
    "rating-desc": (a, b) => b.rating - a.rating,
  };

  // toSorted returns a new array without mutating the original.
  return sorters[sort]
    ? filtered.toSorted(sorters[sort])
    : filtered;
}

// Create a card for each product.


function productCard(product) {
  const {
    id,
    title,
    category,
    price,
    rating,
    brand,
    thumbnail,
    images,
  } = product;

  const image = product.thumbnail || product.images?.[0] || "";

  return `
    <article class="group overflow-hidden rounded-2xl border border-[#F0E2E7] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100/70">

      <div class="relative flex h-64 items-center justify-center overflow-hidden bg-[#FFF7FA] p-5">
        ${
          image
            ? `
              <img
  src="${escapeHTML(image)}"
  alt="${escapeHTML(title)}"
  loading="lazy"
  class="h-full w-full object-contain"
/>
            `
            : `
              <p class="text-sm text-[#9A7C88]">Photo coming soon</p>
            `
        }

        <span class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#9B5974]">
          ${escapeHTML(category || "New find")}
        </span>
      </div>

      <div class="p-4 sm:p-5">
        <p class="mb-2 text-xs uppercase tracking-wider text-[#A47D8D]">
          ${escapeHTML(brand || "Pink Muse collection")}
        </p>

        <h3 class="min-h-12 text-base font-semibold leading-6 text-[#49313B]">
          ${escapeHTML(title)}
        </h3>

        <div class="mt-4 flex items-center justify-between gap-3">
          <p class="text-xl font-bold text-[#C76E91]">
            $${escapeHTML(Number(price).toFixed(2))}
          </p>

          <span class="text-sm text-[#936F7D]">
            ★ ${escapeHTML(rating ?? "N/A")}
          </span>
        </div>

        <button
          type="button"
          data-product-id="${escapeHTML(id)}"
          aria-label="View details for ${escapeHTML(title)}"
          class="mt-5 w-full rounded-full border border-[#D987A4] bg-[#F8DDE5] px-4 py-3 text-sm font-semibold text-[#653B4D] transition hover:bg-[#D987A4] hover:text-white"
        >
          Take a closer look
        </button>
      </div>
    </article>
  `;
}



// Display the initial loading state.
function renderLoading() {
  return `
    <section aria-label="Loading products">
      <p class="mb-4 text-sm text-slate-600" role="status">
        Loading products...
      </p>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        ${Array.from({ length: 8 }, () => `
          <div class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
            <div class="mb-5 h-5 w-24 rounded bg-slate-200"></div>
            <div class="mb-3 h-6 rounded bg-slate-200"></div>
            <div class="mb-6 h-4 w-2/3 rounded bg-slate-200"></div>
            <div class="mb-5 h-8 w-1/2 rounded bg-slate-200"></div>
            <div class="h-11 rounded-xl bg-slate-200"></div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

// Display the error state and retry button.
function renderError(state) {
  return `
    <section class="rounded-2xl border border-red-200 bg-red-50 p-6"
      aria-labelledby="error-title">
      <h2 id="error-title" class="mb-2 text-xl font-bold text-red-800">
        We couldn't load the products
      </h2>

      <p class="mb-4 text-sm text-red-700">
        ${escapeHTML(state.error || "Please check your connection and try again.")}
      </p>

      <button
        type="button"
        id="retry-button"
        class="rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
      >
        Retry
      </button>
    </section>
  `;
}

// Display statistics calculated from the loaded products.
function renderStats(items, visibleItems) {
  const totalValue = items.reduce((total, { price }) => {
    return total + (Number(price) || 0);
  }, 0);

  const averagePrice = items.length
    ? totalValue / items.length
    : 0;

  return `
    <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      aria-label="Product statistics">

      <article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-sm text-slate-500">Total products loaded</p>
        <p class="mt-2 text-3xl font-bold">${items.length}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-sm text-slate-500">Average product price</p>
        <p class="mt-2 text-3xl font-bold">$${averagePrice.toFixed(2)}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-sm text-slate-500">Matching products</p>
        <p class="mt-2 text-3xl font-bold">${visibleItems.length}</p>
      </article>
    </section>
  `;
}

// Display the loaded products.
function renderProducts(state) {
  const visibleItems = getVisibleItems(state);

  const categoryOptions = state.categories
    .map((category) => `
      <option
        value="${escapeHTML(category.slug)}"
        ${state.filter === category.slug ? "selected" : ""}
      >
        ${escapeHTML(category.name)}
      </option>
    `)
    .join("");

  const cards = visibleItems
    .map((product) => productCard(product))
    .join("");

  return `
    <section id="catalogue" class="w-full rounded-xl border border-[#E8D5DD] bg-white px-4 py-3 text-sm text-[#49313B] outline-none placeholder:text-[#B69AA6] focus:border-[#D987A4] focus:ring-2 focus:ring-pink-100">

    
      <header class="mb-10">
        <div class="mb-6 flex items-center justify-between gap-4">
          <a href="#" class="text-2xl font-bold tracking-tight text-[#49313B]">
            pink muse<span class="text-[#D987A4]">.</span>
          </a>

          <a
            href="#catalogue"
            class="rounded-full border border-[#E8C9D5] bg-white px-5 py-2.5 text-sm font-semibold text-[#75465A] transition hover:bg-[#F8DDE5]"
          >
            Shop the edit
          </a>
        </div>

        <div class="overflow-hidden rounded-3xl bg-[#F8DDE5] px-6 py-10 sm:px-10 sm:py-14">
          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A75C7B]">
            A little treat for you
          </p>

          <h1 class="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[#49313B] sm:text-6xl">
            Cute things. Pretty finds. All yours.
          </h1>

          <p class="mt-5 max-w-lg text-base leading-7 text-[#765766]">
            Your little corner for beauty favourites, everyday outfits
            and things that make you smile.
          </p>

          <a
            href="#catalogue"
            class="mt-7 inline-block rounded-full bg-[#49313B] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#75465A]"
          >
            Find your favourite
          </a>

          <p class="mt-5 text-xs text-[#8E6476]">
            A little pink, a little confidence, a lot of you.
          </p>
        </div>
      </header>

      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label for="search-input"
            class="mb-2 block text-sm font-semibold">
            Search products
          </label>

          <input
            id="search-input"
            type="search"
            placeholder="Try a product or brand..."
            value="${escapeHTML(state.query)}"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          />
        </div>

        <div>
          <label for="category-filter"
            class="mb-2 block text-sm font-semibold">
            Filter by category
          </label>

          <select id="category-filter"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
            <option value="all" ${state.filter === "all" ? "selected" : ""}>
              All categories
            </option>
            ${categoryOptions}
          </select>
        </div>

        <div>
          <label for="sort-select"
            class="mb-2 block text-sm font-semibold">
            Sort products
          </label>

          <select id="sort-select"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
            <option value="default" ${state.sort === "default" ? "selected" : ""}>
              Default order
            </option>
            <option value="price-asc" ${state.sort === "price-asc" ? "selected" : ""}>
              Price: low to high
            </option>
            <option value="price-desc" ${state.sort === "price-desc" ? "selected" : ""}>
              Price: high to low
            </option>
            <option value="name" ${state.sort === "name" ? "selected" : ""}>
              Name: A–Z
            </option>
            <option value="rating-desc" ${state.sort === "rating-desc" ? "selected" : ""}>
              Highest rating
            </option>
          </select>
        </div>
      </div>

      ${renderStats(state.items, visibleItems)}

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-bold">Browse catalogue</h2>

        <p class="text-sm text-slate-500" aria-live="polite">
          ${visibleItems.length} product(s) shown
        </p>
      </div>

      ${visibleItems.length === 0
        ? `
          <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 class="text-xl font-bold">No products found</h3>
            <p class="mt-2 text-slate-600">
              Try another search or select a different category.
            </p>
          </div>
        `
        : `
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            ${cards}
          </div>
        `
      }
    </section>
  `;
}


// Render the whole application based on its current state.
export function render(state) {
  if (state.status === "loading") {
    app.innerHTML = `
      <main class="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        ${renderLoading()}
      </main>
    `;
    return;
  }

  if (state.status === "error") {
    app.innerHTML = `
      <main class="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        ${renderError(state)}
      </main>
    `;
    return;
  }

  app.innerHTML = `
    <main class="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      ${renderProducts(state)}

      <footer class="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Built with vanilla JavaScript, Fetch API and Tailwind CSS v4.
      </footer>

      <dialog id="product-dialog"
        class="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl p-0 shadow-2xl backdrop:bg-slate-950/60">
        <div id="dialog-content" class="p-6"></div>
      </dialog>
    </main>
  `;
}

// Fill the dialog after a single product has been fetched.
export function renderProductDetails(product) {
  const dialog = document.querySelector("#product-dialog");
  const content = document.querySelector("#dialog-content");

  if (!dialog || !content) return;

  const {
  title,
  description,
  category,
  price,
  rating,
  brand,
  stock,
  warrantyInformation,
  shippingInformation,
  availabilityStatus,
  thumbnail,
  images,
} = product;

const image = thumbnail || images?.[0] || "";

  content.innerHTML = `
    <div class="flex items-start justify-between gap-4">
    ${
  image
    ? `
      <div class="my-5 flex h-64 items-center justify-center rounded-2xl bg-slate-100 p-5">
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(title)}"
          class="h-full w-full object-contain"
        />
      </div>
    `
    : ""
}
      <div>
        <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
          ${escapeHTML(category)}
        </p>

        <h2 class="text-2xl font-black">
          ${escapeHTML(title)}
        </h2>
      </div>

      <button type="button" id="close-dialog"
        class="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100"
        aria-label="Close product details">
        Close
      </button>
    </div>

    <p class="mt-4 leading-7 text-slate-600">
      ${escapeHTML(description)}
    </p>

    <dl class="mt-6 grid grid-cols-2 gap-4">
      <div class="rounded-xl bg-slate-50 p-4">
        <dt class="text-sm text-slate-500">Price</dt>
        <dd class="mt-1 text-xl font-bold">$${escapeHTML(Number(price).toFixed(2))}</dd>
      </div>

      <div class="rounded-xl bg-slate-50 p-4">
        <dt class="text-sm text-slate-500">Rating</dt>
        <dd class="mt-1 text-xl font-bold">${escapeHTML(rating ?? "N/A")}</dd>
      </div>

      <div class="rounded-xl bg-slate-50 p-4">
        <dt class="text-sm text-slate-500">Brand</dt>
        <dd class="mt-1 font-semibold">${escapeHTML(brand || "Not listed")}</dd>
      </div>

      <div class="rounded-xl bg-slate-50 p-4">
        <dt class="text-sm text-slate-500">Stock</dt>
        <dd class="mt-1 font-semibold">${escapeHTML(stock ?? "Unknown")}</dd>
      </div>
    </dl>

    <div class="mt-5 space-y-2 text-sm text-slate-600">
      <p><strong>Availability:</strong> ${escapeHTML(availabilityStatus ?? "Unknown")}</p>
      <p><strong>Shipping:</strong> ${escapeHTML(shippingInformation ?? "Not provided")}</p>
      <p><strong>Warranty:</strong> ${escapeHTML(warrantyInformation ?? "Not provided")}</p>
    </div>
  `;

  if (!dialog.open) {
    dialog.showModal();
  }
}
