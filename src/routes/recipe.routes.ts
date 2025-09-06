import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../config/cloudinary";

const router = Router();

router.get("/", RecipeController.getAllRecipes);
router.get("/mine", authMiddleware, RecipeController.getMyRecipes);
router.get("/:id", RecipeController.getRecipeById);
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  RecipeController.createRecipe
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  RecipeController.updateRecipe
);

router.delete("/:id", authMiddleware, RecipeController.deleteRecipe);

export default router;
