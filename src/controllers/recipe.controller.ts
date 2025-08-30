import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";
import { AppError } from "../utils/errors";

export const RecipeController = {
  async getAllRecipes(req: Request, res: Response) {
    try {
      const recipes = await RecipeService.getAll();
      res.status(200).json(recipes);
    } catch (error) {
      console.error("Error in getAllRecipes:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  },

  async createRecipe(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new AppError("Authentication error, user not found.", 401);
      }

      const recipeData = {
        ...req.body,
        owner_id: req.user.id,
        image_url: req.file ? req.file.path : undefined,
      };

      const newRecipe = await RecipeService.create(recipeData);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error("Error in createRecipe:", error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  },
};
