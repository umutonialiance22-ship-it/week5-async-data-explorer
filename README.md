
# Product Explorer

**Student:** Umutoni Aliance

**Course:** Advanced Frontend Web Development

**Week:** 5 — Async Data Fetching

## About

Product Explorer is a single-page product catalogue built using
HTML, Tailwind CSS v4, Vite, and vanilla JavaScript ES modules.

It retrieves product information from the DummyJSON public API and
allows users to search, filter, sort, and inspect products.

## API Used

- API: [DummyJSON Products API](https://dummyjson.com/products)
- Documentation: [DummyJSON Docs](https://dummyjson.com/docs/products)

## Links

- GitHub repository: ADD_YOUR_REPOSITORY_URL
- Live application: ADD_YOUR_DEPLOYED_APP_URL
- Video demonstration: ADD_YOUR_VIDEO_URL

## Features

- Fetch products on page load using async/await
- Reusable getJSON() helper with HTTP error checking
- Loading skeletons
- Error message and Retry button
- Empty search state
- Responsive product card grid
- Case-insensitive live search
- Category filtering
- Sorting by price, name, and rating
- Individual product details dialog
- Product statistics calculated with reduce()
- Parallel requests using Promise.all()
- Debounced search (bonus feature)

## Application State

The app uses one state object:

```javascript
{
  items: [],
  categories: [],
  status: "loading",
  error: null,
  query: "",
  filter: "all",
  sort: "default"
}
```

The application loads data and stores it in state. User actions
update the search query, selected category, or sorting option.
The render() function then updates the interface using the
current state.

Searching, filtering, and sorting operate on already-loaded data
and do not trigger new product-list requests.

## Example API JSON

A shortened example of a product returned by DummyJSON:

```json
{
  "id": 1,
  "title": "Example Product",
  "description": "Example product description",
  "category": "beauty",
  "price": 9.99,
  "rating": 4.5,
  "brand": "Example Brand"
}
```

This is an illustrative example of the data structure, not a
claim that these exact values belong to product ID 1.

The application transforms the product array with filter()
for searching and category selection, toSorted() for ordering,
map() for rendering cards, and reduce() for statistics.

## Screenshots

Save your own screenshots in the screenshots/ folder.

- Loading state: screenshots/loading.png
- Success state: screenshots/success.png
- Empty state: screenshots/empty.png
- Error state: screenshots/error.png

## What I Learned About Async JavaScript

Write 5–8 sentences in your own words describing what you learned.
Explain how fetch() retrieves data, why async/await is useful,
how response.ok helps handle HTTP errors, and how try/catch/finally
keeps the application responsive when requests fail. Also explain
how Promise.all() runs independent requests concurrently and how
state-driven rendering keeps the interface consistent. Finally,
describe how search, filtering, and sorting work on loaded data
without making unnecessary API requests.

## How to Run Locally

1. Install Node.js.
2. Clone the repository.
3. Open the project folder in a terminal.
4. Run npm install.
5. Run npm run dev.
6. Open the local URL printed by Vite.

## Project Structure

- index.html: application entry point
- src/api.js: API requests
- src/render.js: UI rendering and pure data helpers
- src/main.js: state and event handling
- src/style.css: Tailwind CSS entry point
- vite.config.js: Vite and Tailwind configuration

## Screenshots and Video

Ensure the screenshots show your actual running application.
The demonstration video should explain the implementation and
show the required loading, success, empty, and error states.
