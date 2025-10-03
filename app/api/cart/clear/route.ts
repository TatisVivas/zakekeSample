import { clearCart } from "@/lib/db";

export async function POST() {
  try {
    await clearCart();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return Response.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
