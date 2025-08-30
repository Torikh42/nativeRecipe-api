import { AppError } from "../utils/errors";
import { supabase } from "../config/supabase";
import { Recipe } from "../types";

// Tipe data untuk resep baru, tanpa field yang otomatis dibuat oleh DB
// Omit<Recipe, 'id' | 'created_at'> -> membuat tipe baru dari Recipe tanpa id dan created_at
type NewRecipe = Omit<Recipe, "id" | "created_at">;

export const RecipeService = {
  async getAll(): Promise<Recipe[]> {
    const { data, error } = await supabase.from("Recipe").select("*");
    if (error) throw new AppError(error.message, 500);
    return data || [];
  },

  async create(recipeData: NewRecipe): Promise<Recipe> {
    const { data, error } = await supabase
      .from("Recipe")
      .insert(recipeData)
      .select()
      .single(); // .single() untuk mendapatkan objek yang baru dibuat, bukan array

    if (error) throw new AppError(error.message, 500);
    return data;
  },
};
