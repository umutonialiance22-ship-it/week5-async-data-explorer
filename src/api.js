
const BASE_URL = "https://dummyjson.com";

export async function getJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getProducts() {
  const data = await getJSON(`${BASE_URL}/products?limit=100&skip=0`);
  return data.products;
}

export async function getCategories() {
  return getJSON(`${BASE_URL}/products/categories`);
}

export async function getProduct(id) {
  return getJSON(`${BASE_URL}/products/${id}`);
}
