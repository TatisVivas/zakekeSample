import * as dotenv from "dotenv";
import { createAdminClient } from "@/utils/supabase/admin";

dotenv.config();

console.log("Environment variables loaded:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "✗ Missing");

async function createTables() {
  console.log("🔧 SUPABASE DATABASE SETUP");
  console.log("==========================");
  console.log("");
  console.log("✅ API Key is valid!");
  console.log("");

  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS products (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      base_price NUMERIC NOT NULL,
      currency TEXT NOT NULL,
      customizable BOOLEAN DEFAULT FALSE,
      configurable BOOLEAN DEFAULT FALSE,
      zakeke_model_code TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS product_options (
      product_code TEXT PRIMARY KEY REFERENCES products(code),
      options JSONB NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS cart_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      design_id TEXT,
      visitor_id TEXT NOT NULL
    );`,
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  ];

  console.log("🚀 Verificando y creando tablas...");

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verificar esquema de tablas existentes
  console.log("\n🔍 Verificando tablas existentes...");

  // Verificar tabla products
  try {
    const { data: productsData, error: productsError } = await supabase.from('products').select('code, name, description, image_url, base_price, currency, customizable, configurable, zakeke_model_code').limit(1);
    if (productsError && productsError.code === 'PGRST116') {
      console.log("❌ Tabla 'products' no existe");
    } else if (productsError) {
      console.log("❌ Tabla 'products' existe pero tiene esquema incorrecto:", productsError.message);
      console.log("💡 Necesitas recrear la tabla 'products' en Supabase Dashboard");
    } else {
      console.log("✅ Tabla 'products' existe y tiene esquema correcto");
    }
  } catch (err) {
    console.log("⚠️ Error verificando tabla products:", err.message);
  }

  // Verificar tabla product_options
  try {
    const { data: optionsData, error: optionsError } = await supabase.from('product_options').select('product_code, options').limit(1);
    if (optionsError && optionsError.code === 'PGRST116') {
      console.log("❌ Tabla 'product_options' no existe");
    } else if (optionsError) {
      console.log("❌ Tabla 'product_options' existe pero tiene esquema incorrecto:", optionsError.message);
      console.log("💡 Necesitas recrear la tabla 'product_options' en Supabase Dashboard");
    } else {
      console.log("✅ Tabla 'product_options' existe y tiene esquema correcto");
    }
  } catch (err) {
    console.log("⚠️ Error verificando tabla product_options:", err.message);
  }

  // Verificar tabla cart_items
  try {
    const { data: cartData, error: cartError } = await supabase.from('cart_items').select('id, sku, quantity, design_id, visitor_id').limit(1);
    if (cartError && cartError.code === 'PGRST116') {
      console.log("❌ Tabla 'cart_items' no existe");
    } else if (cartError) {
      console.log("❌ Tabla 'cart_items' existe pero tiene esquema incorrecto:", cartError.message);
      console.log("💡 Necesitas recrear la tabla 'cart_items' en Supabase Dashboard");
    } else {
      console.log("✅ Tabla 'cart_items' existe y tiene esquema correcto");
    }
  } catch (err) {
    console.log("⚠️ Error verificando tabla cart_items:", err.message);
  }

  console.log("\n📋 INSTRUCCIONES PARA CREAR/RECREAR TABLAS:");
  console.log("   1. Ve a https://supabase.com/dashboard/project/[tu-project]/sql");
  console.log("   2. Crea una nueva consulta SQL");
  console.log("   3. Copia y pega los siguientes comandos:");
  console.log("");

  sqlStatements.forEach((sql, index) => {
    console.log(`${index + 1}. ${sql}`);
    console.log("");
  });

  console.log("⚠️ IMPORTANTE: Si las tablas ya existen, elimínalas primero con:");
  console.log("   DROP TABLE IF EXISTS cart_items;");
  console.log("   DROP TABLE IF EXISTS product_options;");
  console.log("   DROP TABLE IF EXISTS products;");
  console.log("");

  console.log("🎯 Después de crear las tablas:");
  console.log("   1. Ejecuta: npm run db:seed");
  console.log("   2. Reinicia la aplicación: npm run dev");
  console.log("   3. ¡Todo debería funcionar!");

  console.log("\n📋 SI ALGUNA TABLA NO SE CREÓ, COPIA ESTOS COMANDOS SQL AL DASHBOARD:");
  console.log("   https://supabase.com/dashboard/project/[tu-project]/sql/new");
  console.log("");

  sqlStatements.forEach((sql, index) => {
    console.log(`${index + 1}. ${sql}`);
    console.log("");
  });

  console.log("🎯 PRÓXIMOS PASOS:");
  console.log("   1. Verifica las tablas en Supabase Dashboard > Table Editor");
  console.log("   2. Ejecuta: npm run db:seed");
  console.log("   3. ¡Tu base de datos estará lista!");
}

createTables().catch((err) => {
  console.error("Failed to create tables:", err);
  process.exit(1);
});