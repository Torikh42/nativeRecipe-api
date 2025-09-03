import { AppError } from "../utils/errors";
import { supabase } from "../config/supabase";
import { Ingredient, Recipe } from "../types";

type IngredientInput = Omit<Ingredient, "id" | "created_at" | "recipe_id">;

type CreateRecipePayload = Omit<Recipe, "id" | "created_at"> & {
  ingredients?: IngredientInput[];
};

export const RecipeService = {
  async getAll(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("Recipe")
      .select("*, User(full_name, email)");
    if (error) throw new AppError(error.message, 500);
    return data || [];
  },

  /**
   * Creates a new recipe along with its ingredients.
   * @param payload - The recipe data and an array of ingredients.
   * @returns The newly created recipe.
   */
  async create(payload: CreateRecipePayload): Promise<Recipe> {
    const { ingredients, ...recipeData } = payload;

    const { data: newRecipe, error: recipeError } = await supabase
      .from("Recipe")
      .insert(recipeData)
      .select()
      .single();

    if (recipeError) {
      console.error("Error creating recipe:", recipeError);
      throw new AppError(
        `Failed to create recipe: ${recipeError.message}`,
        500
      );
    }

    if (ingredients && ingredients.length > 0) {
      const ingredientsToInsert = ingredients.map((ingredient) => ({
        ...ingredient,
        recipe_id: newRecipe.id,
      }));

      const { error: ingredientsError } = await supabase
        .from("Ingredients")
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error("Error adding ingredients:", ingredientsError);
        await supabase.from("Recipe").delete().match({ id: newRecipe.id });
        throw new AppError(
          `Failed to add ingredients: ${ingredientsError.message}`,
          500
        );
      }
    }

    return newRecipe;
  },

  async getById(id: string): Promise<Recipe & { ingredients: Ingredient[] }> {
    const { data, error } = await supabase
      .from("Recipe")
      .select("*, ingredients:Ingredients(*), User(full_name, email)")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching recipe with id ${id}:`, error);
      throw new AppError(`Recipe with id ${id} not found.`, 404);
    }

    return data as Recipe & { ingredients: Ingredient[] };
  },

  async getMyRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("Recipe")
      .select("*")
      .eq("owner_id", userId);

    if (error) {
      console.error(`Error fetching recipes for user ${userId}:`, error);
      throw new AppError("Failed to fetch user's recipes.", 500);
    }

    return data || [];
  },
};
