import { Router } from "express";
import { createRecipeFromIngredients, identifyFood } from "../controllers/ai.controller";

const router = Router();

router.post("/generate-recipe", createRecipeFromIngredients);

router.post("/identify-food", identifyFood);

export default router;
