import * as dotenv from "dotenv";
import { createAdminClient } from "@/utils/supabase/admin";

dotenv.config();

console.log("Environment variables loaded:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "✗ Missing");

// Seed data
const seedProducts = [
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

const seedProductOptions = {
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

async function runSeed() {
  const supabase = createAdminClient();

  console.log("🌱 Seeding database...");

  // Seed products
  console.log("📦 Seeding products...");
  for (const product of seedProducts) {
    const { error } = await supabase
      .from("products")
      .upsert(product, { onConflict: "code" });
    if (error) {
      console.error(`❌ Error seeding product ${product.code}:`, error.message);
      throw error;
    } else {
      console.log(`✅ Seeded product: ${product.name}`);
    }
  }

  // Seed options
  console.log("⚙️  Seeding product options...");
  for (const [product_code, options] of Object.entries(seedProductOptions)) {
    const { error } = await supabase
      .from("product_options")
      .upsert({ product_code, options }, { onConflict: "product_code" });
    if (error) {
      console.error(`❌ Error seeding options for ${product_code}:`, error.message);
      throw error;
    } else {
      console.log(`✅ Seeded options for product: ${product_code}`);
    }
  }

  console.log("🎉 Database seeded successfully!");
}

runSeed().catch((err) => {
  console.error("Failed to seed data:", err);
  process.exit(1);
});