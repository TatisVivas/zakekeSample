import { NextRequest } from "next/server";
import { getZakekeModelCode } from "@/lib/db";
import { getClientToken, validateModelCode } from "@/lib/zakeke";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { productCode } = await req.json();
    
    if (!productCode) {
      return Response.json({ error: "Product code is required" }, { status: 400 });
    }

    // Get the Zakeke Model Code for this product
    const modelCode = getZakekeModelCode(productCode);
    if (!modelCode) {
      return Response.json({ 
        error: "No Zakeke Model Code found for this product",
        productCode 
      }, { status: 404 });
    }

    // Get token for validation
    const token = await getClientToken({ accessType: "S2S" });
    
    // Validate the model code exists in Zakeke
    const isValid = await validateModelCode(modelCode, token.access_token);
    
    if (!isValid) {
      return Response.json({ 
        error: "Model code not found in Zakeke",
        productCode,
        modelCode 
      }, { status: 404 });
    }

    return Response.json({ 
      valid: true,
      productCode,
      modelCode 
    });

  } catch (error) {
    console.error("[VALIDATE-MODEL] Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ 
      error: "Validation failed", 
      details: errorMsg 
    }, { status: 500 });
  }
}
