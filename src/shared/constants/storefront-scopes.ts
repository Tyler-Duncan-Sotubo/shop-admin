export const STOREFRONT_API_SCOPES = [
  // 🛍 Products & catalog
  "catalog.products.read",
  "catalog.categories.read",
  "catalog.collections.read",

  // ⭐ Reviews
  "reviews.read",
  "reviews.create",

  // 🛒 Cart
  "carts.create",
  "carts.read",
  "carts.update",

  // 💳 Checkout
  "checkout.create",
  "checkout.shipping.read",
  "checkout.payment.read",

  // 📦 Orders
  "orders.create",
  "orders.read",

  // 💬 Quotes
  "quotes.create",
  "quotes.read",
  "quotes.update",
  "quotes.delete",
];
