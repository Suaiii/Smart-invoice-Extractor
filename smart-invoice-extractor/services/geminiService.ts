import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InvoiceItem } from "../types";

const ITEM_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "Category of the item (Use '物料' or '茶歇')" },
    name: { type: Type.STRING, description: "Name of the item (Must exactly match the provided filename)" },
    quantity: { type: Type.NUMBER, description: "Quantity of items (1 if mixed or unspecified)" },
    unitPrice: { type: Type.NUMBER, description: "Price per unit" },
    totalAmount: { type: Type.NUMBER, description: "Total cost for this line item" },
    remarks: { type: Type.STRING, description: "Must be an empty string" },
  },
  required: ["name", "quantity", "unitPrice", "totalAmount"],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A title for the group" },
    items: {
      type: Type.ARRAY,
      items: ITEM_SCHEMA,
    },
  },
};

export const processInvoice = async (
  base64Data: string, 
  mimeType: string, 
  filename: string
): Promise<{ title: string; items: InvoiceItem[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType === 'application/pdf' ? 'image/jpeg' : mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analyze this invoice/receipt.
            
            TASK: Create a SINGLE expense line item for this document.
            
            STRICT RULES:
            1. **Name**: MUST be exactly "${filename}". Do NOT use the product name from the receipt text.
            2. **Total Amount**: Extract the final total sum of the invoice.
            3. **Quantity**: 
               - If the receipt is for multiple identical units (e.g., 5 trophies), extract that count (5).
               - If the receipt contains mixed items or a service, set Quantity to 1.
            4. **Unit Price**: Calculate as (Total Amount / Quantity).
            5. **Category**: Classify broadly into one of these two categories:
               - "物料" (Materials): For physical items, prizes, trophies, decorations, office supplies, equipment, hardware, gifts, etc.
               - "茶歇" (Tea Break): For all food, drinks, snacks, meals, catering, fruits, etc.
               - If it doesn't fit "茶歇", default to "物料".
            6. **Remarks**: Return an empty string ("").

            Return the result as JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Double-check enforcement in post-processing to be 100% sure
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map((item: any) => ({
        ...item,
        name: filename,
        remarks: ''
      }));
    }

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};