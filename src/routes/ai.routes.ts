import { Router } from "express";
import { createRecipeFromIngredients } from "../controllers/ai.controller";
// Optional: Add authMiddleware if you want to protect this route
// import { authMiddleware } from "../middleware/auth.middleware"; 

const router = Router();

// POST /api/ai/generate-recipe
router.post("/generate-recipe", createRecipeFromIngredients);

export default router;
