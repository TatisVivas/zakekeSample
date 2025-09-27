/**
 * Simple in-memory "database" for demo purposes only.
 * NOTE: Data resets on server restart. Do not use in production.
 */

export type Product = {
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number; // base price in minor units or float for simplicity
  currency: string;
  customizable: boolean;
};

export type CartItem = {
  id: string; // uuid
  sku: string; // product code
  quantity: number;
  designId?: string;
};

/**
 * Product options model for Zakeke Catalog API.
 * Codes should be numeric strings, as per Zakeke docs.
 */
export type ProductOptionValue = {
  code: string; // numeric string identifier of the option value
  name: string;
};

export type ProductOption = {
  code: string; // numeric string identifier of the product option
  name: string;
  values: ProductOptionValue[];
};

/**
 * Seed products
 */
let products: Product[] = [
  {
    code: "1001",
    name: "Tote Bag Blanca",
    description: "Tote bag de algodón lista para personalizar.",
    imageUrl: "/totebag-sample.png",
    basePrice: 45000,
    currency: process.env.DEFAULT_CURRENCY || "COP",
    customizable: true,
  },
  {
    code: "1002",
    name: "Tote Bag Negra",
    description: "Tote bag de algodón color negro.",
    imageUrl: "/totebag-sample.jpg",
    basePrice: 48000,
    currency: process.env.DEFAULT_CURRENCY || "COP",
    customizable: false,
  },
  {
    code: "1003",
    name: "Camiseta Unisex Blanca",
    description: "Camiseta básica lista para personalizar.",
    imageUrl: "/totebag-sample.png",
    basePrice: 35000,
    currency: process.env.DEFAULT_CURRENCY || "COP",
    customizable: false,
  },
];

/**
 * Seed options per product (codes as numeric strings)
 * Match Zakeke Product Catalog API format.
 */
const productOptionsByCode: Record<string, ProductOption[]> = {
  // 1001: Tote Bag Blanca - options: Color
  "1001": [
    {
      code: "10",
      name: "Color",
      values: [
        { code: "101", name: "Blanco" },
        { code: "102", name: "Negro" },
        { code: "103", name: "Rojo" },
      ],
    },
  ],

  // 1002: Tote Bag Negra - options: Color, Talla
  "1002": [
    {
      code: "20",
      name: "Color",
      values: [
        { code: "201", name: "Negro" },
        { code: "202", name: "Azul" },
      ],
    },
    {
      code: "21",
      name: "Talla",
      values: [
        { code: "211", name: "S" },
        { code: "212", name: "M" },
        { code: "213", name: "L" },
      ],
    },
  ],

  // 1003: Camiseta Unisex Blanca - options: Talla, Color
  "1003": [
    {
      code: "30",
      name: "Talla",
      values: [
        { code: "301", name: "S" },
        { code: "302", name: "M" },
        { code: "303", name: "L" },
        { code: "304", name: "XL" },
      ],
    },
    {
      code: "31",
      name: "Color",
      values: [
        { code: "311", name: "Blanco" },
        { code: "312", name: "Gris" },
      ],
    },
  ],
};

let cartItems: CartItem[] = [];

/**
 * Products
 */
export function getProducts(page = 1, pageSize = 20, search?: string) {
  let list = products;
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) =>
      [p.code, p.name, p.description || ""].some((s) =>
        s.toLowerCase().includes(q)
      )
    );
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { items: list.slice(start, end), total, page, pageSize };
}

export function getProductByCode(code: string): Product | undefined {
  return products.find((p) => p.code === code);
}

export function upsertProduct(product: Partial<Product> & { code: string }) {
  const existing = getProductByCode(product.code);
  if (existing) {
    const updated = { ...existing, ...product } as Product;
    products = products.map((p) => (p.code === product.code ? updated : p));
    return updated;
  }
  const created: Product = {
    code: product.code,
    name: product.name || product.code,
    basePrice: product.basePrice ?? 0,
    currency: product.currency || process.env.DEFAULT_CURRENCY || "COP",
    customizable: product.customizable ?? false,
    description: product.description,
    imageUrl: product.imageUrl,
  };
    products.push(created);
  return created;
}

export function setProductCustomizable(code: string, customizable: boolean) {
  const p = getProductByCode(code);
  if (!p) return undefined;
  p.customizable = customizable;
  return p;
}

/**
 * Product Options
 */
export function getProductOptionsByCode(code: string): ProductOption[] {
  return productOptionsByCode[code] ? [...productOptionsByCode[code]] : [];
}

export function upsertProductOptionsByCode(
  code: string,
  options: ProductOption[]
): ProductOption[] {
  // sanitize: ensure codes are strings
  productOptionsByCode[code] = options.map((opt) => ({
    code: String(opt.code),
    name: opt.name,
    values: (opt.values || []).map((v) => ({
      code: String(v.code),
      name: v.name,
    })),
  }));
  return getProductOptionsByCode(code);
}

/**
 * Cart
 */
export function clearCart() {
  cartItems = [];
}

export function getCartItems() {
  return cartItems;
}

export function addCartItem(item: Omit<CartItem, "id"> & { id?: string }) {
  const id = item.id || crypto.randomUUID();
  const created: CartItem = {
    id,
    sku: item.sku,
    quantity: item.quantity,
    designId: item.designId,
  };
  cartItems.push(created);
  return created;
}

export function updateCartItem(id: string, updates: Partial<CartItem>) {
  const idx = cartItems.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  cartItems[idx] = { ...cartItems[idx], ...updates };
  return cartItems[idx];
}

export function upsertCartItemBySku(
  sku: string,
  updates: Partial<CartItem> & { quantity?: number }
) {
  const existing = cartItems.find((c) => c.sku === sku);
  if (!existing) {
    return addCartItem({
      sku,
      quantity: updates.quantity || 1,
      designId: updates.designId,
    });
  }
  return updateCartItem(existing.id, updates);
}

export function removeCartItem(id: string) {
  const before = cartItems.length;
  cartItems = cartItems.filter((c) => c.id !== id);
  return cartItems.length < before;
}
