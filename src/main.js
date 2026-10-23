
import "./style.css";

import {
  getProducts,
  getCategories,
  getProduct,
} from "./api.js";

import {
  render,
  renderProductDetails,
} from "./render.js";

// One state object stores the application's current data and selections.
const state = {
  items: [],
  categories: [],
  status: "loading",
  error: null,
  query: "",
  filter: "all",
  sort: "default",
};

let searchTimer;

// Load the initial product list and categories in parallel.
async function load() {
  state.status = "loading";
  state.error = null;
  render(state);

  try {
    // Both independent requests begin together.
    const [productData, categoryData] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    state.items = productData.products ?? [];

    // Normalize categories into objects with slug and name.
    state.categories = categoryData.map((category) => {
      if (typeof category === "string") {
        return {
          slug: category,
          name: category,
        };
      }

      return {
        slug: category.slug,
        name: category.name ?? category.slug,
      };
    });

    state.status = "success";
  } catch (error) {
    state.status = "error";
    state.error = error.message;
  } finally {
    // Always update the interface after loading finishes.
    render(state);
  }
}

// Fetch the full information for one selected product.
async function openProductDetails(id) {
  const button = document.querySelector(
    `[data-product-id="${CSS.escape(String(id))}"]`
  );

  if (button) {
    button.disabled = true;
    button.textContent = "Loading details...";
  }

  try {
    const product = await getProduct(id);
    renderProductDetails(product);
  } catch (error) {
    window.alert(
      `Could not load product details: ${error.message}`
    );
  } finally {
    // Restore the button if it still exists in the page.
    const currentButton = document.querySelector(
      `[data-product-id="${CSS.escape(String(id))}"]`
    );

    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = "View details";
    }
  }
}

// Use event delegation so buttons still work after re-rendering.
document.querySelector("#app").addEventListener("click", (event) => {
  const retryButton = event.target.closest("#retry-button");

  if (retryButton) {
    load();
    return;
  }

  const productButton = event.target.closest("[data-product-id]");

  if (productButton) {
    openProductDetails(productButton.dataset.productId);
    return;
  }

  const closeButton = event.target.closest("#close-dialog");

  if (closeButton) {
    document.querySelector("#product-dialog")?.close();
  }
});

// Search updates state and waits 300ms after typing stops.
// This is our bonus feature: debounced search.
document.querySelector("#app").addEventListener("input", (event) => {
  if (event.target.id !== "search-input") return;

  state.query = event.target.value;

  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    const input = document.querySelector("#search-input");
    const cursorPosition = input?.selectionStart;

    render(state);

    // Keep focus in the search box after rendering.
    const nextInput = document.querySelector("#search-input");

    if (nextInput) {
      nextInput.focus();

      if (cursorPosition !== null && cursorPosition !== undefined) {
        nextInput.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }, 300);
});

// Category and sorting changes update state and re-render.
// No new API requests are needed.
document.querySelector("#app").addEventListener("change", (event) => {
  if (event.target.id === "category-filter") {
    state.filter = event.target.value;
    render(state);
  }

  if (event.target.id === "sort-select") {
    state.sort = event.target.value;
    render(state);
  }
});

// Start the application automatically.
load();
