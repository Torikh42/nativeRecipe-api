import { Router } from "express";
import { createRecipeFromIngredients, identifyFood } from "../controllers/ai.controller";
// import { authMiddleware } from "../middleware/auth.middleware"; 

const router = Router();

// POST /api/ai/generate-recipe
router.post("/generate-recipe", createRecipeFromIngredients);

// POST /api/ai/identify-food
router.post("/identify-food", identifyFood);

export default router;
