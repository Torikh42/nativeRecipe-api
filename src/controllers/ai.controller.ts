import { Request, Response } from "express";
import { generateRecipe } from "../services/ai.service";

export const createRecipeFromIngredients = async (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Please provide a list of ingredients." });
    }

    const recipe = await generateRecipe(ingredients);
    res.json(recipe);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: message });
  }
};
