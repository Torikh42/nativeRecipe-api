import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadStorage } from "../utils/storage";

const router = Router();

router.get("/", RecipeController.getAllRecipes);
router.get("/mine", authMiddleware, RecipeController.getMyRecipes);
router.get("/:id", RecipeController.getRecipeById);
router.post(
  "/",
  authMiddleware,
  uploadStorage.single("image"),
  RecipeController.createRecipe
);

router.put(
  "/:id",
  authMiddleware,
  uploadStorage.single("image"),
  RecipeController.updateRecipe
);

router.delete("/:id", authMiddleware, RecipeController.deleteRecipe);

export default router;
