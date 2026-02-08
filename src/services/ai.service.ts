import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const RecipeSchema = z.object({
  title: z.string().describe("Creative Recipe Name"),
  description: z.string().describe("A short, appetizing description (max 2 sentences)."),
  ingredients: z.array(
    z.object({
      name: z.string().describe("Ingredient Name"),
      quantity: z.string().describe("Quantity (e.g., 200g, 1 tbsp)")
    })
  ),
  instructions: z.string().describe("Step-by-step cooking instructions. Use newlines (\n) to separate steps.")
});

export type AiRecipeResponse = z.infer<typeof RecipeSchema>;

export const generateRecipe = async (ingredients: string[]): Promise<AiRecipeResponse> => {
  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: RecipeSchema,
      system: "You are a professional chef. Use Indonesian language (Bahasa Indonesia).",
      prompt: `Create a delicious recipe using the following ingredients: ${ingredients.join(", ")}. You can add basic pantry items (salt, pepper, oil, water, etc.) if needed.`,
    });

    return object;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};

export const streamRecipe = async (ingredients: string[]) => {
  return streamObject({
    model: google("gemini-2.0-flash-001"),
    schema: RecipeSchema,
    system: "You are a professional chef. Use Indonesian language (Bahasa Indonesia).",
    prompt: `Create a delicious recipe using the following ingredients: ${ingredients.join(", ")}. You can add basic pantry items (salt, pepper, oil, water, etc.) if needed.`,
  });
};

export const identifyFoodFromImage = async (imageBase64: string): Promise<AiRecipeResponse> => {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: RecipeSchema,
      system: "You are a professional chef. Use Indonesian language (Bahasa Indonesia).",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the food in this image and provide a recipe for it." },
            { type: "image", image: cleanBase64 },
          ],
        },
      ],
    });

    return object;
  } catch (error) {
    console.error("Error identifying food:", error);
    throw new Error("Failed to identify food from image.");
  }
};

export const streamIdentifyFoodFromImage = async (imageBase64: string) => {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  return streamObject({
    model: google("gemini-2.0-flash-001"),
    schema: RecipeSchema,
    system: "You are a professional chef. Use Indonesian language (Bahasa Indonesia).",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Identify the food in this image and provide a recipe for it." },
          { type: "image", image: cleanBase64 },
        ],
      },
    ],
  });
};



