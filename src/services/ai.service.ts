import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamObject } from "ai";
import { z } from "zod";

const googleGenerateRecipe = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_RECIPE_API_KEY,
});

const googleIdentifyFood = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_IDENTIFY_API_KEY,
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
const MODEL_NAME_GENERATE_RECIPE = "gemini-2.5-flash-lite"; 
const MODEL_NAME_IDENTIFY_FOOD = "gemini-2.5-flash";

export const streamRecipe = async (ingredients: string[]) => {
  return streamObject({
    model: googleGenerateRecipe(MODEL_NAME_GENERATE_RECIPE), 
    schema: RecipeSchema,
    system: "You are a professional chef. Use Indonesian language (Bahasa Indonesia).",
    prompt: `Create a delicious recipe using the following ingredients: ${ingredients.join(", ")}. You can add basic pantry items (salt, pepper, oil, water, etc.) if needed.`,
  });
};

export const streamIdentifyFoodFromImage = async (imageBase64: string) => {
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  return streamObject({
    model: googleIdentifyFood(MODEL_NAME_IDENTIFY_FOOD), 
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