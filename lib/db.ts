import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateVisitor } from "@/lib/visitor";

export type Product = {
  code: string;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  currency: string;
  customizable: boolean;
  configurable?: boolean;
  zakeke_model_code?: string;
};

export type CartItem = {
  id: string;
  sku: string;
  quantity: number;
  design_id?: string;
};

export type ProductOptionValue = {
  code: string;
  name: string;
};

export type ProductOption = {
  code: string;
  name: string;
  values: ProductOptionValue[];
};

// Seed data
const seedProducts: Product[] = [
  {
    code: "4424614346797",
    name: "Tshirt",
    description: "T-shirt personalizable",
    image_url: "/products/small.png",
    base_price: 35000,
    currency: process.env.DEFAULT_CURRENCY || "COP",
    customizable: true,
    configurable: false,
    zakeke_model_code: "4424614346797",
  },
  {
    code: "1001",
    name: "Tote-bag",
    description: "Totebag personalizable",
    image_url: "/products/totebag.png",
    base_price: 50000,
    currency: process.env.DEFAULT_CURRENCY || "COP",
    customizable: true,
    configurable: false,
    zakeke_model_code: "1001",
  }
];

const seedProductOptions: Record<string, ProductOption[]> = {
  "4424614346797": [
    {
      code: "1",
      name: "Talla",
      values: [
        { code: "11", name: "S" },
        { code: "12", name: "M" },
        { code: "13", name: "L" },
        { code: "14", name: "XL" },
      ],
    },
    {
      code: "2",
      name: "Color",
      values: [
        { code: "21", name: "Blanco" },
        { code: "22", name: "Negro" },
        { code: "23", name: "Gris" },
      ],
    },
  ],
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function seedData() {
  const supabase = await getSupabase();

  // Seed products
  for (const product of seedProducts) {
    const { error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "code" });
    if (error) throw new Error(`Error seeding product ${product.code}: ${error.message}`);
  }

  // Seed options
  for (const [product_code, options] of Object.entries(seedProductOptions)) {
    const { error } = await supabase
      .from("product_options")
      .upsert({ product_code, options }, { onConflict: "product_code" });
    if (error) throw new Error(`Error seeding options for ${product_code}: ${error.message}`);
  }

  console.log("Seed completed successfully");
}

export async function getProducts(page = 1, pageSize = 20, search?: string) {
  const supabase = await getSupabase();
  let query = supabase.from("products").select("*", { count: "exact" });
  if (search) query = query.ilike("name", `%${search}%`);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error(`Error getting products: ${error.message}`);
  return { items: data as Product[], total: count || 0, page, pageSize };
}

export async function getProductByCode(code: string): Promise<Product | undefined> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("products").select("*").eq("code", code).single();
  if (error) throw new Error(`Error getting product ${code}: ${error.message}`);
  return data as Product | undefined;
}

export async function getZakekeModelCode(productCode: string): Promise<string | undefined> {
  const product = await getProductByCode(productCode);
  return product?.zakeke_model_code;
}

export async function upsertProduct(product: Partial<Product> & { code: string }): Promise<Product> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("products")
    .upsert(product, { onConflict: "code" })
    .select()
    .single();
  if (error) throw new Error(`Error upserting product ${product.code}: ${error.message}`);
  return data as Product;
}

export async function setProductCustomizable(code: string, customizable: boolean): Promise<Product | undefined> {
  const p = await getProductByCode(code);
  if (!p) return undefined;
  return upsertProduct({ ...p, customizable });
}

export async function setProductConfigurable(code: string, configurable: boolean): Promise<Product | undefined> {
  const p = await getProductByCode(code);
  if (!p) return undefined;
  return upsertProduct({ ...p, configurable });
}

export async function getProductOptionsByCode(code: string): Promise<ProductOption[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("product_options").select("options").eq("product_code", code).single();
  if (error) throw new Error(`Error getting options for ${code}: ${error.message}`);
  return (data?.options as ProductOption[]) || [];
}

export async function upsertProductOptionsByCode(code: string, options: ProductOption[]): Promise<ProductOption[]> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("product_options")
    .upsert({ product_code: code, options }, { onConflict: "product_code" });
  if (error) throw new Error(`Error upserting options for ${code}: ${error.message}`);
  return options;
}

export async function clearCart() {
  const supabase = await getSupabase();
  const visitor = await getOrCreateVisitor();
  const { error } = await supabase.from("cart_items").delete().eq("visitor_id", visitor);
  if (error) throw new Error(`Error clearing cart: ${error.message}`);
}

export async function getCartItems(): Promise<CartItem[]> {
  const supabase = await getSupabase();
  const visitor = await getOrCreateVisitor();
  const { data, error } = await supabase.from("cart_items").select("*").eq("visitor_id", visitor);
  if (error) throw new Error(`Error getting cart items: ${error.message}`);
  return data as CartItem[];
}

export async function addCartItem(item: Omit<CartItem, "id"> & { id?: string }): Promise<CartItem> {
  const supabase = await getSupabase();
  const visitor = await getOrCreateVisitor();

  const toInsert = { ...item, visitor_id: visitor };
  const { data, error } = await supabase.from("cart_items").insert(toInsert).select().single();

  if (error) throw new Error(`Error adding cart item: ${error.message}`);
  return data as CartItem;
}

export async function updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined> {
  const supabase = await getSupabase();
  const visitor = await getOrCreateVisitor();
  const { data, error } = await supabase
    .from("cart_items")
    .update(updates)
    .eq("id", id)
    .eq("visitor_id", visitor)
    .select()
    .single();
  if (error) throw new Error(`Error updating cart item ${id}: ${error.message}`);
  return data as CartItem | undefined;
}

export async function upsertCartItemBySku(sku: string, updates: Partial<CartItem> & { quantity?: number }): Promise<CartItem> {
  const items = await getCartItems();
  const existing = items.find((c) => c.sku === sku);
  if (!existing) {
    return addCartItem({ sku, quantity: updates.quantity || 1, design_id: updates.design_id });
  }
  return (await updateCartItem(existing.id, updates))!;
}

export async function removeCartItem(id: string): Promise<boolean> {
  const supabase = await getSupabase();
  const visitor = await getOrCreateVisitor();
  const { error } = await supabase.from("cart_items").delete().eq("id", id).eq("visitor_id", visitor);
  if (error) throw new Error(`Error removing cart item ${id}: ${error.message}`);
  return true;
}
