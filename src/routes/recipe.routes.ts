import { Router } from "express";
import { RecipeController } from "../controllers/recipe.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../config/cloudinary";

const router = Router();

router.get("/", RecipeController.getAllRecipes);
router.get("/:id", RecipeController.getRecipeById);
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  RecipeController.createRecipe
);

export default router;
