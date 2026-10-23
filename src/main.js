
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

async function load() {
  state.status = "loading";
  state.error = null;
  render(state);

  try {
    const [products, apiCategories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    if (!Array.isArray(products)) {
      throw new Error("The product API returned invalid data.");
    }

    state.items = products.slice(0, 100);

    state.categories = [
      ...new Set(
        state.items
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    state.status = state.items.length ? "success" : "empty";
    state.error = null;

    console.log("Products loaded:", state.items.length);
    console.log("API categories:", apiCategories.length);
  } catch (error) {
    state.status = "error";
    state.error = error.message || "Unable to load products.";
  } finally {
    render(state);
  }
}

async function openProductDetails(id) {
  const button = document.querySelector(
    `[data-product-id="${CSS.escape(String(id))}"]`
  );

  const originalText = button?.textContent;

  if (button) {
    button.disabled = true;
    button.textContent = "Loading...";
  }

  try {
    const product = await getProduct(id);
    renderProductDetails(product);
  } catch (error) {
    window.alert(`Could not load product: ${error.message}`);
  } finally {
    const currentButton = document.querySelector(
      `[data-product-id="${CSS.escape(String(id))}"]`
    );

    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent = originalText || "View details";
    }
  }
}

document.querySelector("#app").addEventListener("click", (event) => {
  if (event.target.closest("#retry-button")) {
    load();
    return;
  }

  if (event.target.closest("#close-dialog")) {
    document.querySelector("#product-dialog")?.close();
    return;
  }

  const productButton = event.target.closest("[data-product-id]");

  if (productButton) {
    openProductDetails(productButton.dataset.productId);
  }
});

document.querySelector("#app").addEventListener("input", (event) => {
  if (event.target.id !== "search-input") return;

  state.query = event.target.value;

  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    const input = document.querySelector("#search-input");
    const position = input?.selectionStart;

    render(state);

    const nextInput = document.querySelector("#search-input");

    if (nextInput) {
      nextInput.focus();

      if (position !== null && position !== undefined) {
        nextInput.setSelectionRange(position, position);
      }
    }
  }, 300);
});

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

load();
