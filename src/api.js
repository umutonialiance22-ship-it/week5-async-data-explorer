
const BASE_URL = "https://dummyjson.com";

// Reusable helper for fetching JSON data.
export async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// Fetch the product list.
export async function getProducts() {
  return getJSON(`${BASE_URL}/products?limit=100`);
}

// Fetch all available product categories.
export async function getCategories() {
  return getJSON(`${BASE_URL}/products/categories`);
}

// Fetch one product by its ID.
export async function getProduct(id) {
  return getJSON(`${BASE_URL}/products/${id}`);
}
